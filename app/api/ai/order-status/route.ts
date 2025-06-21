// 查询AI生成订单状态API
import { respData, respErr } from "@/lib/resp";
import { findAIGenerationOrderById, findAIGenerationOrderByBizNo } from "@/models/ai-generation-record";
import { getUserUuid } from "@/services/user";

export async function GET(req: Request) {
  try {
    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("user not authenticated");
    }

    const url = new URL(req.url);
    const orderId = url.searchParams.get('orderId');
    const bizNo = url.searchParams.get('bizNo');

    if (!orderId && !bizNo) {
      return respErr("orderId or bizNo is required");
    }

    let order;
    if (orderId) {
      order = await findAIGenerationOrderById(parseInt(orderId));
    } else if (bizNo) {
      order = await findAIGenerationOrderByBizNo(userUuid, bizNo);
    }

    if (!order) {
      return respErr("order not found");
    }

    // 验证订单属于当前用户
    if (order.user_uuid !== userUuid) {
      return respErr("access denied");
    }

    return respData(order);
  } catch (error) {
    console.error("查询订单状态失败:", error);
    return respErr("查询订单状态失败");
  }
}

export async function POST(req: Request) {
  try {
    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("user not authenticated");
    }

    const { orderId, bizNo } = await req.json();

    if (!orderId && !bizNo) {
      return respErr("orderId or bizNo is required");
    }

    let order;
    if (orderId) {
      order = await findAIGenerationOrderById(orderId);
    } else if (bizNo) {
      order = await findAIGenerationOrderByBizNo(userUuid, bizNo);
    }

    if (!order) {
      return respErr("order not found");
    }

    // 验证订单属于当前用户
    if (order.user_uuid !== userUuid) {
      return respErr("access denied");
    }

    return respData(order);
  } catch (error) {
    console.error("查询订单状态失败:", error);
    return respErr("查询订单状态失败");
  }
}
