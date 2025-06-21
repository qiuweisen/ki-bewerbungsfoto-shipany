import type { ImageModelV1, ImageModelV1CallWarning } from "@ai-sdk/provider";
import type { TuziProviderSettings } from "./tuzi-provider";
import type { TuziImageSettings } from "./tuzi-image-settings";

export class TuziImageModel implements ImageModelV1 {
  readonly specificationVersion = "v1" as const;

  constructor(
    public readonly modelId: string,
    private settings: TuziProviderSettings
  ) {}

  get provider(): string {
    return "tuzi";
  }

  get maxImagesPerCall(): number {
    return 1;
  }

  async doGenerate({
    prompt,
    n = 1,
    providerOptions,
    headers,
    abortSignal,
  }: Parameters<ImageModelV1["doGenerate"]>[0]): Promise<
    Awaited<ReturnType<ImageModelV1["doGenerate"]>>
  > {
    const warnings: Array<ImageModelV1CallWarning> = [];
    let images: Array<Uint8Array> = [];
    const currentDate = new Date();

    try {
      if (!this.settings.apiKey) {
        throw new Error("Tuzi API key is required");
      }

      // 获取兔子 API 特定的设置
      const tuziSettings = (providerOptions?.tuzi as TuziImageSettings) || {};

      // 构建请求体（基于实际API测试结果）
      const requestBody = {
        model: this.modelId,
        prompt: prompt,
        aspectRatio: tuziSettings.aspectRatio || "1:1",
        outputFormat: tuziSettings.outputFormat || "png",
        safetyTolerance: tuziSettings.safetyTolerance || 2,
        promptUpsampling: tuziSettings.promptUpsampling || false,
        ...(tuziSettings.seed && { seed: tuziSettings.seed }),
        ...(tuziSettings.inputImage && { inputImage: tuziSettings.inputImage }),
        ...(tuziSettings.webhookUrl && { webhookUrl: tuziSettings.webhookUrl }),
        ...(tuziSettings.webhookSecret && { webhookSecret: tuziSettings.webhookSecret }),
      };

      const baseURL = this.settings.baseURL || "https://api.tu-zi.com";

      const response = await fetch(`${baseURL}/v1/images/generations`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${this.settings.apiKey}`,
          "Content-Type": "application/json; charset=utf-8",
          ...headers,
        },
        body: JSON.stringify(requestBody),
        signal: abortSignal,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Tuzi API error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();

      // 兔子API实际返回格式：{data: [{url: "..."}], created: number}
      if (!data.data || !Array.isArray(data.data)) {
        throw new Error(`Tuzi API unexpected response format`);
      }

      // 下载图片并转换为 Uint8Array 以适配AI SDK框架
      for (const item of data.data) {
        if (item.url) {
          try {
            const imageResponse = await fetch(item.url);
            if (imageResponse.ok) {
              const arrayBuffer = await imageResponse.arrayBuffer();
              images.push(new Uint8Array(arrayBuffer));
            } else {
              throw new Error(`Failed to download image: ${imageResponse.status}`);
            }
          } catch (error) {
            console.error(`Error downloading image from ${item.url}:`, error);
            warnings.push({
              type: "other",
              message: `Failed to download image: ${error instanceof Error ? error.message : 'Unknown error'}`,
            });
          }
        }
      }

      if (images.length === 0) {
        warnings.push({
          type: "other",
          message: "No valid images returned from Tuzi API",
        });
      }

    } catch (error: any) {
      warnings.push({
        type: "other",
        message: error.message || "Tuzi API request failed",
      });
    }

    return {
      images,
      warnings,
      response: {
        timestamp: currentDate,
        modelId: this.modelId,
        headers: undefined,
      },
    };
  }
}
