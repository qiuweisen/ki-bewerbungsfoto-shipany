import { respData, respErr } from "@/lib/resp";
import { getAIGenerationOrdersByUser } from "@/models/ai-generation-record";
import { getUserUuid } from "@/services/user";

export async function GET(req: Request) {
  try {
    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("no auth");
    }

    const url = new URL(req.url);
    const type = url.searchParams.get('type') as 'image' | 'video' | 'text' | null;
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '20');

    const orders = await getAIGenerationOrdersByUser(
      userUuid,
      type || undefined,
      page,
      limit
    );

    return respData(orders);
  } catch (error) {
    console.error("获取AI生成订单失败:", error);
    return respErr("获取订单失败");
  }
}

export async function POST(req: Request) {
  try {
    const userUuid = await getUserUuid();
    if (!userUuid) {
      return respErr("no auth");
    }

    const { type, page = 1, limit = 20 } = await req.json();

    const orders = await getAIGenerationOrdersByUser(
      userUuid,
      type,
      page,
      limit
    );

    return respData(orders);
  } catch (error) {
    console.error("获取AI生成订单失败:", error);
    return respErr("获取订单失败");
  }
}
