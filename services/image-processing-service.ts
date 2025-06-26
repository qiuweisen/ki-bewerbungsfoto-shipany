/**
 * 统一的图片处理服务
 * 提供统一的接口，内部根据配置选择具体的实现
 */

import {
  ImageProcessingService,
  ImageTransformOptions,
  ProcessedImage,
  BatchProcessResult,
  WatermarkOptions,
  ImageVariant,
  ImageProcessingStats,
  ImageProcessingError
} from "@/types/image-processing";
import { createImageProcessingService, getImageProcessingConfig } from "./image-processing/image-processing-factory";

class UnifiedImageProcessingService {
  private service: ImageProcessingService;
  private stats: ImageProcessingStats;

  constructor() {
    this.service = createImageProcessingService();
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageProcessingTime: 0,
      cacheHitRate: 0,
      provider: this.service.name,
      lastUpdated: new Date()
    };
  }

  /**
   * 图片变换
   */
  async transform(imageUrl: string, options: ImageTransformOptions): Promise<ProcessedImage> {
    const startTime = Date.now();
    this.stats.totalRequests++;

    try {
      // 验证输入
      this.validateImageUrl(imageUrl);
      this.validateTransformOptions(options);

      // 应用默认配置
      const config = getImageProcessingConfig();
      const finalOptions = this.applyDefaults(options, config);

      // 执行变换
      const result = await this.service.transform(imageUrl, finalOptions);

      // 更新统计
      this.updateStats(startTime, true);
      
      return result;
    } catch (error) {
      this.updateStats(startTime, false);
      throw error;
    }
  }

  /**
   * 生成缩略图
   */
  async generateThumbnail(imageUrl: string, size: number = 200): Promise<ProcessedImage> {
    return this.transform(imageUrl, {
      width: size,
      height: size,
      fit: 'cover',
      quality: 80,
      format: 'webp'
    });
  }

  /**
   * 生成高清版本
   */
  async generateHD(imageUrl: string): Promise<ProcessedImage> {
    return this.service.generateHD(imageUrl);
  }

  /**
   * 生成4K版本
   */
  async generate4K(imageUrl: string): Promise<ProcessedImage> {
    return this.service.generate4K(imageUrl);
  }

  /**
   * 添加水印
   */
  async addWatermark(imageUrl: string, watermarkOptions: WatermarkOptions): Promise<ProcessedImage> {
    return this.service.addWatermark(imageUrl, watermarkOptions);
  }

  /**
   * 批量处理
   */
  async batchTransform(images: string[], options: ImageTransformOptions): Promise<BatchProcessResult> {
    const startTime = Date.now();
    this.stats.totalRequests += images.length;

    try {
      const config = getImageProcessingConfig();
      const finalOptions = this.applyDefaults(options, config);

      const result = await this.service.batchTransform(images, finalOptions);

      // 更新统计
      this.stats.successfulRequests += result.success.length;
      this.stats.failedRequests += result.failed.length;
      this.updateStats(startTime, true);

      return result;
    } catch (error) {
      this.stats.failedRequests += images.length;
      this.updateStats(startTime, false);
      throw error;
    }
  }

  /**
   * 应用预设变体
   */
  async applyVariant(imageUrl: string, variantName: string): Promise<ProcessedImage> {
    return this.service.applyVariant(imageUrl, variantName);
  }

  /**
   * 获取支持的变体
   */
  getSupportedVariants(): ImageVariant[] {
    return this.service.getSupportedVariants();
  }

  /**
   * 获取服务信息
   */
  getServiceInfo() {
    return {
      name: this.service.name,
      version: this.service.version,
      capabilities: this.service.capabilities,
      provider: getImageProcessingConfig().provider
    };
  }

  /**
   * 获取统计信息
   */
  getStats(): ImageProcessingStats {
    return { ...this.stats };
  }

  /**
   * 健康检查
   */
  async healthCheck(): Promise<boolean> {
    try {
      return await this.service.healthCheck();
    } catch {
      return false;
    }
  }

  /**
   * 重置统计信息
   */
  resetStats(): void {
    this.stats = {
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0,
      averageProcessingTime: 0,
      cacheHitRate: 0,
      provider: this.service.name,
      lastUpdated: new Date()
    };
  }

  /**
   * 验证图片URL
   */
  private validateImageUrl(imageUrl: string): void {
    if (!imageUrl || typeof imageUrl !== 'string') {
      throw new ImageProcessingError(
        'Image URL is required and must be a string',
        'INVALID_URL',
        this.service.name
      );
    }

    // 基础URL格式验证
    try {
      new URL(imageUrl);
    } catch {
      // 如果不是完整URL，检查是否是相对路径
      if (!imageUrl.startsWith('/') && !imageUrl.includes('.')) {
        throw new ImageProcessingError(
          'Invalid image URL format',
          'INVALID_URL',
          this.service.name
        );
      }
    }
  }

  /**
   * 验证变换选项
   */
  private validateTransformOptions(options: ImageTransformOptions): void {
    const config = getImageProcessingConfig();

    // 验证尺寸
    if (options.width && (options.width < 1 || options.width > 8192)) {
      throw new ImageProcessingError(
        'Width must be between 1 and 8192 pixels',
        'INVALID_DIMENSIONS',
        this.service.name
      );
    }

    if (options.height && (options.height < 1 || options.height > 8192)) {
      throw new ImageProcessingError(
        'Height must be between 1 and 8192 pixels',
        'INVALID_DIMENSIONS',
        this.service.name
      );
    }

    // 验证质量
    if (options.quality && (options.quality < 1 || options.quality > 100)) {
      throw new ImageProcessingError(
        'Quality must be between 1 and 100',
        'INVALID_QUALITY',
        this.service.name
      );
    }

    // 验证格式
    if (options.format && options.format !== 'auto' && !config.allowedFormats.includes(options.format)) {
      throw new ImageProcessingError(
        `Format ${options.format} is not allowed. Allowed formats: ${config.allowedFormats.join(', ')}`,
        'INVALID_FORMAT',
        this.service.name
      );
    }
  }

  /**
   * 应用默认配置
   */
  private applyDefaults(options: ImageTransformOptions, config: any): ImageTransformOptions {
    return {
      quality: config.defaultQuality,
      format: config.defaultFormat,
      ...options
    };
  }

  /**
   * 更新统计信息
   */
  private updateStats(startTime: number, success: boolean): void {
    const processingTime = Date.now() - startTime;
    
    if (success) {
      this.stats.successfulRequests++;
    } else {
      this.stats.failedRequests++;
    }

    // 更新平均处理时间
    const totalProcessedRequests = this.stats.successfulRequests + this.stats.failedRequests;
    this.stats.averageProcessingTime = 
      (this.stats.averageProcessingTime * (totalProcessedRequests - 1) + processingTime) / totalProcessedRequests;

    this.stats.lastUpdated = new Date();
  }
}

// 创建单例实例
let imageProcessingService: UnifiedImageProcessingService | null = null;

/**
 * 获取图片处理服务实例
 */
export function getImageProcessingService(): UnifiedImageProcessingService {
  if (!imageProcessingService) {
    imageProcessingService = new UnifiedImageProcessingService();
  }
  return imageProcessingService;
}

/**
 * 重新初始化服务 (用于切换提供商后)
 */
export function reinitializeImageProcessingService(): void {
  imageProcessingService = null;
  imageProcessingService = new UnifiedImageProcessingService();
}
