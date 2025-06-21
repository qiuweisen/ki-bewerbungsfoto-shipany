// AI生成服务 - 业务逻辑层（包装现有API）
import { AIGenerationRequest, AIGenerationResult, AIGenerationRecord } from "@/types/ai-generation-record";
import { insertAIGenerationRecord } from "@/models/ai-generation-record";
import { decreaseCredits, getUserCredits } from "./credit";
import { getUuid } from "@/lib/hash";
import { getIsoTimestr } from "@/lib/time";
import { CreditsTransType } from "./credit";

/**
 * 处理积分消耗
 */
async function handleCreditsConsumption(userUuid: string, creditsRequired: number): Promise<void> {
  // 检查积分余额
  const userCredits = await getUserCredits(userUuid);
  if (userCredits.left_credits < creditsRequired) {
    throw new Error(`积分不足，当前余额: ${userCredits.left_credits}，需要: ${creditsRequired}`);
  }

  // 扣减积分
  await decreaseCredits({
    user_uuid: userUuid,
    trans_type: CreditsTransType.AIGeneration,
    credits: creditsRequired,
  });
}

/**
 * 保存生成记录
 */
async function saveGenerationRecord(
  request: AIGenerationRequest,
  result: any,
  recordUuid: string,
  status: 'success' | 'failed' = 'success',
  errorMessage?: string
): Promise<void> {
  const record: AIGenerationRecord = {
    uuid: recordUuid,
    user_uuid: request.userUuid!,
    type: request.type!,
    provider: request.provider,
    model: request.model,
    prompt: request.prompt,
    options: request.options,
    credits_cost: request.creditsRequired || 0,
    status,
    created_at: getIsoTimestr(),
    completed_at: status === 'success' ? getIsoTimestr() : undefined,
    error_message: errorMessage,
  };

  if (status === 'success' && result) {
    // 提取结果URLs或数据
    if (Array.isArray(result) && result.length > 0) {
      // 如果结果是数组，提取URL
      record.result_urls = result
        .map(item => item.url || item.location)
        .filter(Boolean);
      record.result_data = result;
    } else if (result.url || result.location) {
      // 单个结果
      record.result_urls = [result.url || result.location];
      record.result_data = result;
    } else {
      // 其他类型的结果（如文本）
      record.result_data = result;
    }
  }

  await insertAIGenerationRecord(record);
}

/**
 * 图像生成业务包装函数
 * 包装现有的 /api/demo/gen-image API，添加业务逻辑
 */
export async function generateImageWithBusiness(request: AIGenerationRequest): Promise<AIGenerationResult> {
  const recordUuid = getUuid();
  let creditsConsumed = 0;

  try {
    // 1. 用户认证检查
    if ((request.consumeCredits || request.saveRecord) && !request.userUuid) {
      throw new Error("用户未认证");
    }

    // 2. 积分检查和扣减（如果需要）
    if (request.consumeCredits && request.userUuid && request.creditsRequired) {
      await handleCreditsConsumption(request.userUuid, request.creditsRequired);
      creditsConsumed = request.creditsRequired;
    }

    // 3. 调用底层API（保持原有逻辑不变）
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

    // 4. 保存记录（如果需要）
    if (request.saveRecord && request.userUuid) {
      await saveGenerationRecord(request, result, recordUuid, 'success');
    }

    return {
      success: true,
      data: result,
      recordUuid: request.saveRecord ? recordUuid : undefined,
      creditsConsumed,
    };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : '未知错误';

    // 保存失败记录（如果需要）
    if (request.saveRecord && request.userUuid) {
      try {
        await saveGenerationRecord(request, null, recordUuid, 'failed', errorMessage);
      } catch (recordError) {
        console.error('保存失败记录时出错:', recordError);
      }
    }

    return {
      success: false,
      error: errorMessage,
      recordUuid: request.saveRecord ? recordUuid : undefined,
      creditsConsumed,
    };
  }
}
