/**
 * 自实现图片处理服务
 * 基于 Sharp.js 的高性能图片处理
 */

import {
  ImageProcessingService,
  ImageTransformOptions,
  ProcessedImage,
  BatchProcessResult,
  WatermarkOptions,
  ImageVariant,
  ImageProcessingError
} from "@/types/image-processing";

export class SelfHostedImageService implements ImageProcessingService {
  readonly name = "Self-Hosted Image Service";
  readonly version = "1.0.0";
  readonly capabilities = [
    "resize", "watermark", "format-conversion", "quality-adjustment",
    "advanced-filters", "batch-processing", "ai-enhancement", "smart-crop"
  ];

  private endpoint: string;
  private apiKey?: string;
  private maxConcurrency: number;

  constructor(config: {
    endpoint: string;
    apiKey?: string;
    maxConcurrency?: number;
  }) {
    this.endpoint = config.endpoint;
    this.apiKey = config.apiKey;
    this.maxConcurrency = config.maxConcurrency || 5;
  }

  async transform(imageUrl: string, options: ImageTransformOptions): Promise<ProcessedImage> {
    try {
      const response = await this.makeRequest('/transform', {
        imageUrl,
        options
      });

      if (!response.success) {
        throw new Error(response.error || 'Transform failed');
      }

      return {
        url: response.data.url,
        width: response.data.width,
        height: response.data.height,
        format: response.data.format,
        size: response.data.size,
        provider: this.name
      };
    } catch (error) {
      throw new ImageProcessingError(
        `Self-hosted transform failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TRANSFORM_FAILED',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  async generateThumbnail(imageUrl: string, size: number): Promise<ProcessedImage> {
    return this.transform(imageUrl, {
      width: size,
      height: size,
      fit: 'cover',
      quality: 80,
      format: 'webp',
      sharpen: true // 缩略图启用锐化
    });
  }

  async generateHD(imageUrl: string): Promise<ProcessedImage> {
    return this.transform(imageUrl, {
      width: 1920,
      height: 1080,
      fit: 'inside',
      quality: 90,
      format: 'webp'
    });
  }

  async generate4K(imageUrl: string): Promise<ProcessedImage> {
    return this.transform(imageUrl, {
      width: 3840,
      height: 2160,
      fit: 'inside',
      quality: 95,
      format: 'webp'
    });
  }

  async addWatermark(imageUrl: string, watermarkOptions: WatermarkOptions): Promise<ProcessedImage> {
    const options: ImageTransformOptions = {
      watermark: watermarkOptions,
      quality: 85,
      format: 'webp'
    };
    
    return this.transform(imageUrl, options);
  }

  async batchTransform(images: string[], options: ImageTransformOptions): Promise<BatchProcessResult> {
    try {
      const response = await this.makeRequest('/batch-transform', {
        images,
        options,
        maxConcurrency: this.maxConcurrency
      });

      if (!response.success) {
        throw new Error(response.error || 'Batch transform failed');
      }

      return response.data;
    } catch (error) {
      throw new ImageProcessingError(
        `Batch transform failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'BATCH_TRANSFORM_FAILED',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  async applyVariant(imageUrl: string, variantName: string): Promise<ProcessedImage> {
    const variant = this.getSupportedVariants().find(v => v.name === variantName);
    if (!variant) {
      throw new ImageProcessingError(
        `Variant ${variantName} not found`,
        'VARIANT_NOT_FOUND',
        this.name
      );
    }

    return this.transform(imageUrl, variant.options);
  }

  getSupportedVariants(): ImageVariant[] {
    return [
      {
        name: 'thumbnail',
        description: '缩略图 (200x200)',
        options: { width: 200, height: 200, fit: 'cover', quality: 80, format: 'webp', sharpen: true }
      },
      {
        name: 'small',
        description: '小图 (400x400)',
        options: { width: 400, height: 400, fit: 'cover', quality: 85, format: 'webp' }
      },
      {
        name: 'medium',
        description: '中图 (800x600)',
        options: { width: 800, height: 600, fit: 'cover', quality: 85, format: 'webp' }
      },
      {
        name: 'large',
        description: '大图 (1200x900)',
        options: { width: 1200, height: 900, fit: 'cover', quality: 90, format: 'webp' }
      },
      {
        name: 'hd',
        description: '高清 (1920x1080)',
        options: { width: 1920, height: 1080, fit: 'inside', quality: 90, format: 'webp' }
      },
      {
        name: '4k',
        description: '4K (3840x2160)',
        options: { width: 3840, height: 2160, fit: 'inside', quality: 95, format: 'webp' }
      },
      {
        name: 'ai-enhanced',
        description: 'AI增强版本',
        options: { quality: 95, format: 'webp', sharpen: true }
      },
      {
        name: 'print-quality',
        description: '打印质量 (300 DPI)',
        options: { quality: 100, format: 'png' }
      }
    ];
  }

  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.makeRequest('/health', {}, 'GET');
      return response.success;
    } catch {
      return false;
    }
  }

  // 高级功能 (仅自实现支持)
  async aiUpscale(imageUrl: string, scale: number = 2): Promise<ProcessedImage> {
    try {
      const response = await this.makeRequest('/ai-upscale', {
        imageUrl,
        scale
      });

      if (!response.success) {
        throw new Error(response.error || 'AI upscale failed');
      }

      return response.data;
    } catch (error) {
      throw new ImageProcessingError(
        `AI upscale failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'AI_UPSCALE_FAILED',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  async smartCrop(imageUrl: string, targetRatio: number): Promise<ProcessedImage> {
    try {
      const response = await this.makeRequest('/smart-crop', {
        imageUrl,
        targetRatio
      });

      if (!response.success) {
        throw new Error(response.error || 'Smart crop failed');
      }

      return response.data;
    } catch (error) {
      throw new ImageProcessingError(
        `Smart crop failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'SMART_CROP_FAILED',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  async applyFilter(imageUrl: string, filterType: string, intensity: number = 1): Promise<ProcessedImage> {
    try {
      const response = await this.makeRequest('/apply-filter', {
        imageUrl,
        filterType,
        intensity
      });

      if (!response.success) {
        throw new Error(response.error || 'Filter application failed');
      }

      return response.data;
    } catch (error) {
      throw new ImageProcessingError(
        `Filter application failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'FILTER_FAILED',
        this.name,
        error instanceof Error ? error : undefined
      );
    }
  }

  private async makeRequest(endpoint: string, data: any, method: string = 'POST'): Promise<any> {
    const url = `${this.endpoint}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }

    const config: RequestInit = {
      method,
      headers
    };

    if (method !== 'GET' && data) {
      config.body = JSON.stringify(data);
    }

    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return await response.json();
  }
}
