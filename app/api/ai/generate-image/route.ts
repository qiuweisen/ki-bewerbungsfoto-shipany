// 业务层图像生成API - 包含积分、记录等业务逻辑
import { respData, respErr } from "@/lib/resp";
import { getAIGenerationConfig } from "@/config/ai-generation";
import { generateImageWithBusiness } from "@/services/ai-generation-service";
import { getUserUuid } from "@/services/user";
import { AIGenerationRequest } from "@/types/ai-generation-record";

export async function POST(req: Request) {
  try {
    const { prompt, provider, model, options = {} } = await req.json();
    if (!prompt || !provider || !model) {
      return respErr("invalid params");
    }

    // 从配置获取业务参数
    const config = getAIGenerationConfig('image');
    const userUuid = await getUserUuid();

    // 构建AI生成请求
    const request: AIGenerationRequest = {
      prompt,
      provider,
      model,
      options,
      userUuid,
      type: 'image',
      saveRecord: config.saveRecord,
      consumeCredits: config.consumeCredits,
      creditsRequired: config.creditsPerGeneration,
    };

    // 调用业务包装服务
    const result = await generateImageWithBusiness(request);

    if (result.success) {
      return respData({
        images: result.data,
        recordUuid: result.recordUuid,
        creditsConsumed: result.creditsConsumed,
      });
    } else {
      return respErr(result.error || "generation failed");
    }

  } catch (err) {
    console.log("business gen image failed:", err);
    return respErr("generation failed");
  }
}
