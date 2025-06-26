import { respData, respErr } from "@/lib/resp";
import { findAIGenerationOrderById, deleteAIGenerationOrder } from "@/models/ai-generation-record";
import { getUserInfo } from "@/services/user";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 检查管理员权限
    const userInfo = await getUserInfo();
    if (!userInfo || !userInfo.email) {
      return respErr("no auth");
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",");
    if (!adminEmails?.includes(userInfo.email)) {
      return respErr("access denied");
    }

    const { id } = await params;
    const orderId = parseInt(id);
    if (isNaN(orderId)) {
      return respErr("invalid order id");
    }

    const order = await findAIGenerationOrderById(orderId);
    if (!order) {
      return respErr("order not found");
    }

    // 删除订单记录
    const success = await deleteAIGenerationOrder(orderId);
    if (!success) {
      return respErr("删除失败");
    }

    return respData({ message: "删除成功" });
  } catch (error) {
    console.error("管理员删除AI生成订单失败:", error);
    return respErr("删除失败");
  }
}
