// AI生成服务 - 业务逻辑层（严谨的幂等性处理）
import {
  AIGenerationRequest,
  AIGenerationResult,
  AIGenerationOrder,
  OrderStatus
} from "@/types/ai-generation-record";
import {
  createAIGenerationOrder,
  updateAIGenerationOrderStatus,
  findAIGenerationOrderByBizNo
} from "@/models/ai-generation-record";
import { decreaseCredits, getUserCredits } from "./credit";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { CreditsTransType } from "./credit";

/**
 * 处理积分消耗（带事务号返回）
 */
async function handleCreditsConsumption(userUuid: string, creditsRequired: number): Promise<string> {
  // 检查积分余额
  const userCredits = await getUserCredits(userUuid);
  if (userCredits.left_credits < creditsRequired) {
    throw new Error(`积分不足，当前余额: ${userCredits.left_credits}，需要: ${creditsRequired}`);
  }

  // 扣减积分并返回交易号
  const transNo = getUuid();
  await decreaseCredits({
    user_uuid: userUuid,
    trans_type: CreditsTransType.AIGeneration,
    credits: creditsRequired,
  });

  return transNo;
}

/**
 * 严谨的AI图像生成业务处理函数
 * 实现完整的幂等性和状态管理
 */
export async function generateImageWithBusiness(request: AIGenerationRequest): Promise<AIGenerationResult> {
  let orderId: number | undefined;
  let creditsConsumed = 0;
  let isRetry = false;

  try {
    // 1. 用户认证检查
    if ((request.consumeCredits || request.saveRecord) && !request.userUuid) {
      throw new Error("用户未认证");
    }

    // 2. 创建订单（幂等性保证）
    const orderData: AIGenerationOrder = {
      user_uuid: request.userUuid!,
      biz_no: request.bizNo,
      type: request.type!,
      provider: request.provider,
      model: request.model,
      prompt: request.prompt,
      options: request.options,
      credits_cost: request.creditsRequired || 0,
      status: OrderStatus.CREATED,
      created_at: getIsoTimestr(),
      updated_at: getIsoTimestr(),
      retry_count: 0,
    };

    const { isNewOrder, order } = await createAIGenerationOrder(orderData);
    isRetry = !isNewOrder;
    orderId = order.id;

    // 3. 处理重复请求
    if (!isNewOrder) {
      // 检查订单状态
      if (order.status === OrderStatus.SUCCESS) {
        // 已经成功，直接返回结果
        return {
          success: true,
          data: order.result_data,
          orderId: order.id,
          creditsConsumed: order.credits_cost,
          isRetry: true,
        };
      } else if (order.status === OrderStatus.PROCESSING) {
        // 正在处理中，继续等待处理完成（幂等性保证）
        console.log(`订单 ${order.id} 正在处理中，继续等待完成`);
        // 使用现有订单继续处理，跳过积分扣减步骤
        orderId = order.id;
        creditsConsumed = order.credits_cost; // 已经扣减过的积分
      } else if (order.status === OrderStatus.FAILED) {
        // 之前失败了，允许重试（只有在FAILED状态才能重置为CREATED）
        const updateResult = await updateAIGenerationOrderStatus(
          order.id!,
          OrderStatus.CREATED,
          OrderStatus.FAILED,
          { retry_count: order.retry_count + 1 }
        );

        if (!updateResult.success) {
          // 状态更新失败，说明订单状态已经被其他请求修改
          console.log(`订单 ${order.id} 状态已变更，跳过重试`);
          // 重新查询最新状态
          const latestOrder = await findAIGenerationOrderByBizNo(request.userUuid!, request.bizNo);
          if (latestOrder?.status === OrderStatus.SUCCESS) {
            return {
              success: true,
              data: latestOrder.result_data,
              orderId: latestOrder.id,
              creditsConsumed: latestOrder.credits_cost,
              isRetry: true,
            };
          }
        }
        orderId = order.id;
      } else {
        // 其他状态（CREATED, CREDITS_DEDUCTED），继续处理
        orderId = order.id;
      }
    }

    // 4. 积分检查和扣减（如果需要且未扣减过）
    let creditsTransNo: string | undefined;
    if (request.consumeCredits && request.userUuid && request.creditsRequired) {
      const currentOrder = isNewOrder ? order : await findAIGenerationOrderByBizNo(request.userUuid, request.bizNo);

      if (!currentOrder || currentOrder.status === OrderStatus.CREATED) {
        // 未扣减过积分，进行扣减
        creditsTransNo = await handleCreditsConsumption(request.userUuid, request.creditsRequired);
        creditsConsumed = request.creditsRequired;

        // 更新订单状态为已扣减积分（只有CREATED状态才能变为CREDITS_DEDUCTED）
        const updateResult = await updateAIGenerationOrderStatus(
          orderId!,
          OrderStatus.CREDITS_DEDUCTED,
          OrderStatus.CREATED,
          { credits_trans_no: creditsTransNo }
        );

        if (!updateResult.success) {
          console.log(`订单 ${orderId} 状态更新失败，可能已被其他请求处理`);
        }
      } else if (currentOrder.status === OrderStatus.PROCESSING) {
        // 正在处理中的订单，积分已扣减，无需重复扣减
        creditsConsumed = currentOrder.credits_cost;
        creditsTransNo = currentOrder.credits_trans_no;
        console.log(`订单 ${orderId} 积分已扣减，跳过积分扣减步骤`);
      } else {
        // 其他状态，积分已扣减过
        creditsConsumed = currentOrder.credits_cost;
        creditsTransNo = currentOrder.credits_trans_no;
      }
    }

    // 5. 更新订单状态为处理中（只有CREDITS_DEDUCTED状态才能变为PROCESSING）
    const currentOrder = await findAIGenerationOrderByBizNo(request.userUuid!, request.bizNo);
    if (currentOrder && currentOrder.status === OrderStatus.CREDITS_DEDUCTED) {
      const updateResult = await updateAIGenerationOrderStatus(
        orderId!,
        OrderStatus.PROCESSING,
        OrderStatus.CREDITS_DEDUCTED
      );

      if (!updateResult.success) {
        console.log(`订单 ${orderId} 状态更新失败，可能已被其他请求处理`);
        // 重新查询最新状态，如果已经成功则直接返回
        const latestOrder = await findAIGenerationOrderByBizNo(request.userUuid!, request.bizNo);
        if (latestOrder?.status === OrderStatus.SUCCESS) {
          return {
            success: true,
            data: latestOrder.result_data,
            orderId: latestOrder.id,
            creditsConsumed: latestOrder.credits_cost,
            isRetry: true,
          };
        }
      }
    }

    // 6. 调用底层API（保持原有逻辑不变）
    const response = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/demo/gen-image`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt: request.prompt,
        provider: request.provider,
        model: request.model,
        options: request.options,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.details || errorData.error || '生成失败');
    }

    const responseData = await response.json();
    const result = responseData.success ? responseData.data : responseData;

    // 7. 更新订单状态为成功（只有PROCESSING状态才能变为SUCCESS）
    const resultUrls = Array.isArray(result)
      ? result.map(item => item.url || item.location).filter(Boolean)
      : (result.url || result.location) ? [result.url || result.location] : [];

    const updateResult = await updateAIGenerationOrderStatus(
      orderId!,
      OrderStatus.SUCCESS,
      OrderStatus.PROCESSING,
      {
        result_urls: resultUrls,
        result_data: result,
        completed_at: getIsoTimestr(),
      }
    );

    if (!updateResult.success) {
      console.log(`订单 ${orderId} 成功状态更新失败，可能已被其他请求处理`);
    }

    return {
      success: true,
      data: result,
      orderId,
      creditsConsumed,
      isRetry,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';

    // 更新订单状态为失败（PROCESSING状态才能变为FAILED）
    try {
      const updateResult = await updateAIGenerationOrderStatus(
        orderId!,
        OrderStatus.FAILED,
        OrderStatus.PROCESSING,
        {
          error_message: errorMessage,
          completed_at: getIsoTimestr(),
        }
      );

      if (!updateResult.success) {
        console.log(`订单 ${orderId} 失败状态更新失败，可能已被其他请求处理`);
      }
    } catch (updateError) {
      console.error('更新订单状态失败:', updateError);
    }

    return {
      success: false,
      error: errorMessage,
      orderId,
      creditsConsumed,
      isRetry,
    };
  }
}
