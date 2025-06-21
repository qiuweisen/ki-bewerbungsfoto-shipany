import { AIGenerationRecord } from "@/types/ai-generation-record";
import { getSupabaseClient } from "./db";

export async function insertAIGenerationRecord(record: AIGenerationRecord) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase.from("ai_generations").insert({
    uuid: record.uuid,
    user_uuid: record.user_uuid,
    type: record.type,
    provider: record.provider,
    model: record.model,
    prompt: record.prompt,
    options: record.options,
    result_urls: record.result_urls,
    result_data: record.result_data,
    credits_cost: record.credits_cost,
    status: record.status,
    created_at: record.created_at,
    completed_at: record.completed_at,
    error_message: record.error_message,
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function updateAIGenerationRecord(
  uuid: string, 
  updates: Partial<AIGenerationRecord>
) {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ai_generations")
    .update(updates)
    .eq("uuid", uuid);

  if (error) {
    throw error;
  }

  return data;
}

export async function findAIGenerationRecordByUuid(
  uuid: string
): Promise<AIGenerationRecord | undefined> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from("ai_generations")
    .select("*")
    .eq("uuid", uuid)
    .single();

  if (error) {
    return undefined;
  }

  return data;
}

export async function getAIGenerationRecordsByUser(
  userUuid: string,
  type?: 'image' | 'video' | 'text',
  page: number = 1,
  limit: number = 20
): Promise<AIGenerationRecord[]> {
  if (page < 1) page = 1;
  if (limit <= 0) limit = 20;

  const offset = (page - 1) * limit;
  const supabase = getSupabaseClient();

  let query = supabase
    .from("ai_generations")
    .select("*")
    .eq("user_uuid", userUuid)
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (type) {
    query = query.eq("type", type);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching AI generation records:", error);
    return [];
  }

  return data || [];
}
