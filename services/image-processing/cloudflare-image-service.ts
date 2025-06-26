/**
 * Cloudflare Images 实现
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

export class CloudflareImageService implements ImageProcessingService {
  readonly name = "Cloudflare Images";
  readonly version = "1.0.0";
  readonly capabilities = [
    "resize", "watermark", "format-conversion", 
    "quality-adjustment", "auto-optimization", "cdn-delivery"
  ];

  private baseUrl: string;
  private accountId: string;
  private apiToken: string;

  constructor(config: {
    accountId: string;
    apiToken: string;
    imageDeliveryUrl: string;
  }) {
    this.accountId = config.accountId;
    this.apiToken = config.apiToken;
    this.baseUrl = config.imageDeliveryUrl;
  }

  async transform(imageUrl: string, options: ImageTransformOptions): Promise<ProcessedImage> {
    try {
      const transformUrl = this.buildTransformUrl(imageUrl, options);
      
      // 验证图片是否可访问
      const response = await fetch(transformUrl, { method: 'HEAD' });
      if (!response.ok) {
        throw new Error(`Failed to transform image: ${response.status}`);
      }

      // 获取图片信息
      const contentLength = response.headers.get('content-length');
      const contentType = response.headers.get('content-type');

      return {
        url: transformUrl,
        width: options.width || 0,
        height: options.height || 0,
        format: this.extractFormatFromContentType(contentType || ''),
        size: parseInt(contentLength || '0'),
        provider: this.name
      };
    } catch (error) {
      throw new ImageProcessingError(
        `Cloudflare transform failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
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
      format: 'webp'
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
    const results: BatchProcessResult = {
      success: [],
      failed: []
    };

    // Cloudflare不支持真正的批量处理，需要逐个处理
    const promises = images.map(async (imageUrl) => {
      try {
        const result = await this.transform(imageUrl, options);
        results.success.push(result);
      } catch (error) {
        results.failed.push({
          originalUrl: imageUrl,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    });

    await Promise.allSettled(promises);
    return results;
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
        options: { width: 200, height: 200, fit: 'cover', quality: 80, format: 'webp' }
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
      }
    ];
  }

  async healthCheck(): Promise<boolean> {
    try {
      // 使用一个测试图片URL进行健康检查
      const testUrl = `${this.baseUrl}/test`;

      // 创建一个带超时的 fetch
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(testUrl, {
        method: 'HEAD',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      return response.status < 500;
    } catch {
      return false;
    }
  }

  private buildTransformUrl(imageUrl: string, options: ImageTransformOptions): string {
    const params: string[] = [];

    // 尺寸参数
    if (options.width) params.push(`width=${options.width}`);
    if (options.height) params.push(`height=${options.height}`);
    if (options.fit) params.push(`fit=${options.fit}`);

    // 质量和格式
    if (options.quality) params.push(`quality=${options.quality}`);
    if (options.format && options.format !== 'auto') {
      params.push(`format=${options.format}`);
    }

    // 其他变换
    if (options.blur) params.push(`blur=${options.blur}`);
    if (options.rotate) params.push(`rotate=${options.rotate}`);
    if (options.grayscale) params.push(`grayscale=true`);

    // 水印 (Cloudflare使用draw参数)
    if (options.watermark) {
      const watermarkParam = this.buildWatermarkParam(options.watermark);
      if (watermarkParam) params.push(watermarkParam);
    }

    // 裁剪
    if (options.crop) {
      const { x, y, width, height } = options.crop;
      params.push(`crop=${x},${y},${width},${height}`);
    }

    const transformParams = params.join(',');
    
    // 如果是完整URL，需要特殊处理
    if (imageUrl.startsWith('http')) {
      return `${this.baseUrl}/cdn-cgi/image/${transformParams}/${imageUrl}`;
    } else {
      return `${this.baseUrl}/${imageUrl}/${transformParams}`;
    }
  }

  private buildWatermarkParam(watermark: WatermarkOptions): string | null {
    if (!watermark.url && !watermark.text) return null;

    const drawOptions: any = {};
    
    if (watermark.url) {
      drawOptions.url = watermark.url;
    }
    
    if (watermark.opacity) {
      drawOptions.opacity = watermark.opacity;
    }

    // 位置映射
    if (watermark.position) {
      const positionMap = {
        'top-left': { top: 10, left: 10 },
        'top-right': { top: 10, right: 10 },
        'bottom-left': { bottom: 10, left: 10 },
        'bottom-right': { bottom: 10, right: 10 },
        'center': {}
      };
      Object.assign(drawOptions, positionMap[watermark.position]);
    }

    return `draw=${JSON.stringify([drawOptions])}`;
  }

  private extractFormatFromContentType(contentType: string): string {
    if (contentType.includes('webp')) return 'webp';
    if (contentType.includes('avif')) return 'avif';
    if (contentType.includes('png')) return 'png';
    if (contentType.includes('jpeg') || contentType.includes('jpg')) return 'jpeg';
    return 'unknown';
  }
}
