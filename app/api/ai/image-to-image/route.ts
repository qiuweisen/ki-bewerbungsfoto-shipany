import { respData, respErr } from "@/lib/resp";
import { generateImageWithBusiness } from "@/services/ai-generation-service";
import { getUserUuid } from "@/services/user";
import { getAIGenerationConfig } from "@/config/ai-generation";
import { AIGenerationRequest } from "@/types/ai-generation-record";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { prompt, provider, model, bizNo, options = {}, inputImage, inputImageUrl, inputImageUrls } = body;

    // 验证必需参数
    if (!prompt || !provider || !model || !bizNo) {
      return respErr("invalid params: prompt, provider, model, bizNo are required");
    }

    // 验证输入图片参数 - 支持单图、多图、base64等方式
    const hasInputImage = inputImage;
    const hasSingleUrl = inputImageUrl;
    const hasMultipleUrls = inputImageUrls && Array.isArray(inputImageUrls) && inputImageUrls.length > 0;

    if (!hasInputImage && !hasSingleUrl && !hasMultipleUrls) {
      return respErr("invalid params: must provide inputImage, inputImageUrl, or inputImageUrls");
    }

    // 确保不同输入方式不冲突
    const inputCount = [hasInputImage, hasSingleUrl, hasMultipleUrls].filter(Boolean).length;
    if (inputCount > 1) {
      return respErr("invalid params: provide only one of inputImage, inputImageUrl, or inputImageUrls");
    }

    // 验证base64格式（如果提供）
    if (inputImage && !inputImage.startsWith('data:image/')) {
      return respErr("invalid inputImage format: must be base64 data URL (data:image/...)");
    }

    // 验证单个URL格式（如果提供）
    if (inputImageUrl) {
      try {
        new URL(inputImageUrl);
      } catch {
        return respErr("invalid inputImageUrl format: must be a valid URL");
      }
    }

    // 验证多个URL格式（如果提供）
    if (hasMultipleUrls) {
      for (const url of inputImageUrls) {
        try {
          new URL(url);
        } catch {
          return respErr(`invalid URL in inputImageUrls: ${url}`);
        }
      }
    }

    // 从配置获取业务参数
    const config = getAIGenerationConfig('image');
    const userUuid = await getUserUuid();

    if (!userUuid) {
      return respErr("user not authenticated");
    }

    // 构建图生图选项，根据输入类型处理
    const imageToImageOptions = {
      ...options,
      // 根据不同输入类型设置对应参数
      ...(inputImage && { inputImage: inputImage }),
      ...(inputImageUrl && { inputImageUrl: inputImageUrl }),
      ...(hasMultipleUrls && { inputImageUrls: inputImageUrls }),
    };

    // 构建AI生成请求
    const request: AIGenerationRequest = {
      prompt,
      provider,
      model,
      options: imageToImageOptions,
      bizNo, // 前端传入的业务号（时间戳）
      userUuid,
      type: 'image',
      saveRecord: config.saveRecord,
      consumeCredits: config.consumeCredits,
      creditsRequired: config.creditsPerGeneration, // 使用配置文件中的积分设置
    };

    // 调用业务层生成服务
    const result = await generateImageWithBusiness(request);

    if (result.success) {
      return respData(result.data);
    } else {
      return respErr(result.error || "generation failed");
    }
  } catch (error) {
    console.error("Image-to-image generation error:", error);
    return respErr("generation failed");
  }
}
