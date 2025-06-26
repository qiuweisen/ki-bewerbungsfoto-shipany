/**
 * 图片处理统一接口定义
 */

export interface ImageDimensions {
  width?: number;
  height?: number;
}

export interface WatermarkOptions {
  url?: string;
  text?: string;
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
  opacity?: number;
  size?: number;
}

export interface ImageQualityOptions {
  quality?: number; // 1-100
  format?: 'jpeg' | 'png' | 'webp' | 'avif' | 'auto';
}

export interface ImageTransformOptions {
  // 基础变换
  width?: number;
  height?: number;
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'outside';
  
  // 质量和格式
  quality?: number;
  format?: 'jpeg' | 'png' | 'webp' | 'avif' | 'auto';
  
  // 水印
  watermark?: WatermarkOptions;
  
  // 高级选项
  blur?: number;
  sharpen?: boolean;
  grayscale?: boolean;
  rotate?: number;
  
  // 裁剪
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

export interface ImageVariant {
  name: string;
  description: string;
  options: ImageTransformOptions;
}

export interface ProcessedImage {
  url: string;
  width: number;
  height: number;
  format: string;
  size: number; // bytes
  provider: string;
}

export interface BatchProcessResult {
  success: ProcessedImage[];
  failed: Array<{
    originalUrl: string;
    error: string;
  }>;
}

/**
 * 图片处理服务接口
 */
export interface ImageProcessingService {
  // 服务信息
  readonly name: string;
  readonly version: string;
  readonly capabilities: string[];

  // 基础功能
  transform(imageUrl: string, options: ImageTransformOptions): Promise<ProcessedImage>;
  
  // 预设变体
  generateThumbnail(imageUrl: string, size: number): Promise<ProcessedImage>;
  generateHD(imageUrl: string): Promise<ProcessedImage>;
  generate4K(imageUrl: string): Promise<ProcessedImage>;
  
  // 水印功能
  addWatermark(imageUrl: string, watermarkOptions: WatermarkOptions): Promise<ProcessedImage>;
  
  // 批量处理
  batchTransform(images: string[], options: ImageTransformOptions): Promise<BatchProcessResult>;
  
  // 预设变体处理
  applyVariant(imageUrl: string, variantName: string): Promise<ProcessedImage>;
  
  // 获取支持的变体
  getSupportedVariants(): ImageVariant[];
  
  // 健康检查
  healthCheck(): Promise<boolean>;
}

/**
 * 图片处理配置
 */
export interface ImageProcessingConfig {
  // 服务提供商
  provider: 'cloudflare' | 'self-hosted';
  
  // Cloudflare配置
  cloudflare?: {
    accountId: string;
    apiToken: string;
    imageDeliveryUrl: string;
    enabledFeatures: string[];
  };
  
  // 自实现配置
  selfHosted?: {
    endpoint: string;
    apiKey?: string;
    maxConcurrency: number;
    cacheEnabled: boolean;
    cacheTTL: number;
  };
  
  // 通用配置
  defaultQuality: number;
  defaultFormat: 'auto' | 'jpeg' | 'webp' | 'avif';
  maxImageSize: number; // bytes
  allowedFormats: string[];
  
  // 预设变体
  variants: ImageVariant[];
}

/**
 * 图片处理错误类型
 */
export class ImageProcessingError extends Error {
  constructor(
    message: string,
    public code: string,
    public provider: string,
    public originalError?: Error
  ) {
    super(message);
    this.name = 'ImageProcessingError';
  }
}

/**
 * 图片处理统计信息
 */
export interface ImageProcessingStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageProcessingTime: number;
  cacheHitRate: number;
  provider: string;
  lastUpdated: Date;
}
