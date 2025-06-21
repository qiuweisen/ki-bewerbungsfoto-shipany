// AI图像生成相关类型定义

export interface ImageGenerationRequest {
  prompt: string;
  provider: string;
  model: string;
  options?: Record<string, any>;
}

export interface ImageGenerationResponse {
  success: boolean;
  images?: Array<{
    url?: string;
    base64?: string;
    mimeType?: string;
  }>;
  provider: string;
  created?: number;
  error?: string;
}
