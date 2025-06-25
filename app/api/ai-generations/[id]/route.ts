import { respData, respErr } from "@/lib/resp";
import { findAIGenerationOrderById, deleteAIGenerationOrder } from "@/models/ai-generation-record";
import { getUserUuid } from "@/services/user";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("no auth");
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return respErr("invalid order id");
    }

    const order = await findAIGenerationOrderById(orderId);
    if (!order) {
      return respErr("order not found");
    }

    // 检查订单是否属于当前用户
    if (order.user_uuid !== userUuid) {
      return respErr("access denied");
    }

    return respData(order);
  } catch (error) {
    console.error("获取AI生成订单失败:", error);
    return respErr("获取订单失败");
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("no auth");
    }

    const orderId = parseInt(params.id);
    if (isNaN(orderId)) {
      return respErr("invalid order id");
    }

    const order = await findAIGenerationOrderById(orderId);
    if (!order) {
      return respErr("order not found");
    }

    // 检查订单是否属于当前用户
    if (order.user_uuid !== userUuid) {
      return respErr("access denied");
    }

    // 删除订单记录
    const success = await deleteAIGenerationOrder(orderId);
    if (!success) {
      return respErr("删除失败");
    }

    return respData({ message: "删除成功" });
  } catch (error) {
    console.error("删除AI生成订单失败:", error);
    return respErr("删除失败");
  }
}
