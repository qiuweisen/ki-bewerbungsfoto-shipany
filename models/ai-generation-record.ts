import { AIGenerationOrder, OrderStatus } from "@/types/ai-generation-record";
import { getSupabaseClient } from "./db";
import { getIsoTimestr } from "@/lib/time";

/**
 * 创建AI生成订单（幂等性保证）
 * 使用 INSERT ... ON CONFLICT DO NOTHING 确保幂等性
 */
export async function createAIGenerationOrder(order: AIGenerationOrder): Promise<{
  isNewOrder: boolean;
  order: AIGenerationOrder;
}> {
  const supabase = getSupabaseClient();

  // 先尝试插入新订单
  const { data: insertData, error: insertError } = await supabase
    .from("ai_generation_orders")
    .insert({
      user_uuid: order.user_uuid,
      biz_no: order.biz_no,
      type: order.type,
      provider: order.provider,
      model: order.model,
      prompt: order.prompt,
      options: order.options,
      credits_cost: order.credits_cost,
      status: order.status,
      created_at: order.created_at,
      updated_at: order.updated_at,
    })
    .select()
    .single();

  if (!insertError && insertData) {
    // 插入成功，说明是新订单
    return {
      isNewOrder: true,
      order: insertData
    };
  }

  // 插入失败，可能是重复订单，查询现有订单
  if (insertError?.code === '23505') { // 唯一约束冲突
    const { data: existingOrder, error: selectError } = await supabase
      .from("ai_generation_orders")
      .select("*")
      .eq("user_uuid", order.user_uuid)
      .eq("biz_no", order.biz_no)
      .single();

    if (selectError) {
      throw selectError;
    }

    return {
      isNewOrder: false,
      order: existingOrder
    };
  }

  // 其他错误
  throw insertError;
}

/**
 * 更新订单状态（带前置状态检查）
 */
export async function updateAIGenerationOrderStatus(
  orderId: number,
  newStatus: OrderStatus,
  expectedOldStatus: OrderStatus | OrderStatus[],
  updates?: Partial<AIGenerationOrder>
): Promise<{ success: boolean; order?: AIGenerationOrder }> {
  const supabase = getSupabaseClient();

  const updateData = {
    status: newStatus,
    updated_at: getIsoTimestr(),
    ...updates
  };

  // 构建查询条件：检查当前状态是否符合预期
  let query = supabase
    .from("ai_generation_orders")
    .update(updateData)
    .eq("id", orderId);

  // 添加状态前置条件
  if (Array.isArray(expectedOldStatus)) {
    query = query.in("status", expectedOldStatus);
  } else {
    query = query.eq("status", expectedOldStatus);
  }

  const { data, error } = await query.select().single();

  if (error) {
    // 如果是没有匹配的记录，说明状态不符合预期
    if (error.code === 'PGRST116') {
      return { success: false };
    }
    throw error;
  }

  return { success: true, order: data };
}

/**
 * 兼容性函数：不检查前置状态的更新（谨慎使用）
 */
export async function updateAIGenerationOrderStatusUnsafe(
  orderUuid: string,
  status: OrderStatus,
  updates?: Partial<AIGenerationOrder>
): Promise<AIGenerationOrder> {
  const supabase = getSupabaseClient();

  const updateData = {
    status,
    updated_at: getIsoTimestr(),
    ...updates
  };

  const { data, error } = await supabase
    .from("ai_generation_orders")
    .update(updateData)
    .eq("order_uuid", orderUuid)
    .select()
    .single();

  if (error) {
    throw error;
  }

  return data;
}

/**
 * 根据订单ID查询订单
 */
export async function findAIGenerationOrderById(
  orderId: number
): Promise<AIGenerationOrder | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ai_generation_orders")
    .select("*")
    .eq("id", orderId)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * 根据用户UUID和业务号查询订单
 */
export async function findAIGenerationOrderByBizNo(
  userUuid: string,
  bizNo: string
): Promise<AIGenerationOrder | null> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ai_generation_orders")
    .select("*")
    .eq("user_uuid", userUuid)
    .eq("biz_no", bizNo)
    .single();

  if (error) {
    return null;
  }

  return data;
}

/**
 * 获取用户的AI生成订单列表
 */
export async function getAIGenerationOrdersByUser(
  userUuid: string,
  type?: 'image' | 'video' | 'text',
  page: number = 1,
  limit: number = 20
): Promise<AIGenerationOrder[]> {
  if (page < 1) page = 1;
  if (limit <= 0) limit = 20;

  const offset = (page - 1) * limit;
  const supabase = getSupabaseClient();

  let query = supabase
    .from("ai_generation_orders")
    .select("*")
    .eq("user_uuid", userUuid)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching AI generation orders:", error);
    return [];
  }

  return data || [];
}
