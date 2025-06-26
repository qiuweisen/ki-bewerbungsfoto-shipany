/**
 * 图片处理服务工厂
 * 根据配置创建相应的图片处理服务实例
 */

import {
  ImageProcessingService,
  ImageProcessingConfig,
  ImageProcessingError
} from "@/types/image-processing";
import { CloudflareImageService } from "./cloudflare-image-service";
import { SelfHostedImageService } from "./self-hosted-image-service";

/**
 * 获取图片处理配置
 */
export function getImageProcessingConfig(): ImageProcessingConfig {
  const provider = (process.env.IMAGE_PROCESSING_PROVIDER || 'cloudflare') as 'cloudflare' | 'self-hosted';
  
  const config: ImageProcessingConfig = {
    provider,
    defaultQuality: parseInt(process.env.IMAGE_DEFAULT_QUALITY || '85'),
    defaultFormat: (process.env.IMAGE_DEFAULT_FORMAT || 'auto') as any,
    maxImageSize: parseInt(process.env.IMAGE_MAX_SIZE || '10485760'), // 10MB
    allowedFormats: (process.env.IMAGE_ALLOWED_FORMATS || 'jpeg,png,webp,avif').split(','),
    variants: []
  };

  // Cloudflare配置
  if (provider === 'cloudflare') {
    config.cloudflare = {
      accountId: process.env.CLOUDFLARE_ACCOUNT_ID || '',
      apiToken: process.env.CLOUDFLARE_API_TOKEN || '',
      imageDeliveryUrl: process.env.CLOUDFLARE_IMAGE_DELIVERY_URL || '',
      enabledFeatures: (process.env.CLOUDFLARE_IMAGE_FEATURES || 'resize,watermark,format').split(',')
    };
  }

  // 自实现配置
  if (provider === 'self-hosted') {
    config.selfHosted = {
      endpoint: process.env.SELF_HOSTED_IMAGE_ENDPOINT || 'http://localhost:3001',
      apiKey: process.env.SELF_HOSTED_IMAGE_API_KEY,
      maxConcurrency: parseInt(process.env.SELF_HOSTED_IMAGE_CONCURRENCY || '5'),
      cacheEnabled: process.env.SELF_HOSTED_IMAGE_CACHE === 'true',
      cacheTTL: parseInt(process.env.SELF_HOSTED_IMAGE_CACHE_TTL || '3600')
    };
  }

  return config;
}

/**
 * 创建图片处理服务实例
 */
export function createImageProcessingService(): ImageProcessingService {
  const config = getImageProcessingConfig();

  switch (config.provider) {
    case 'cloudflare':
      if (!config.cloudflare) {
        throw new ImageProcessingError(
          'Cloudflare configuration is missing',
          'CONFIG_MISSING',
          'factory'
        );
      }
      return new CloudflareImageService(config.cloudflare);

    case 'self-hosted':
      if (!config.selfHosted) {
        throw new ImageProcessingError(
          'Self-hosted configuration is missing',
          'CONFIG_MISSING',
          'factory'
        );
      }
      return new SelfHostedImageService(config.selfHosted);

    default:
      throw new ImageProcessingError(
        `Unsupported image processing provider: ${config.provider}`,
        'UNSUPPORTED_PROVIDER',
        'factory'
      );
  }
}

/**
 * 验证图片处理配置
 */
export function validateImageProcessingConfig(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const config = getImageProcessingConfig();
  const errors: string[] = [];
  const warnings: string[] = [];

  // 验证基础配置
  if (config.defaultQuality < 1 || config.defaultQuality > 100) {
    errors.push('Default quality must be between 1 and 100');
  }

  if (config.maxImageSize < 1024) {
    warnings.push('Max image size is very small (< 1KB)');
  }

  if (config.allowedFormats.length === 0) {
    errors.push('At least one image format must be allowed');
  }

  // 验证提供商特定配置
  if (config.provider === 'cloudflare') {
    if (!config.cloudflare?.accountId) {
      errors.push('Cloudflare account ID is required');
    }
    if (!config.cloudflare?.apiToken) {
      errors.push('Cloudflare API token is required');
    }
    if (!config.cloudflare?.imageDeliveryUrl) {
      errors.push('Cloudflare image delivery URL is required');
    }
  }

  if (config.provider === 'self-hosted') {
    if (!config.selfHosted?.endpoint) {
      errors.push('Self-hosted endpoint is required');
    }
    if (config.selfHosted?.maxConcurrency && config.selfHosted.maxConcurrency < 1) {
      errors.push('Max concurrency must be at least 1');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * 获取当前提供商的能力信息
 */
export async function getProviderCapabilities(): Promise<{
  provider: string;
  capabilities: string[];
  isHealthy: boolean;
  version: string;
}> {
  try {
    const service = createImageProcessingService();
    const isHealthy = await service.healthCheck();

    return {
      provider: service.name,
      capabilities: service.capabilities,
      isHealthy,
      version: service.version
    };
  } catch (error) {
    return {
      provider: 'unknown',
      capabilities: [],
      isHealthy: false,
      version: 'unknown'
    };
  }
}

/**
 * 切换图片处理提供商
 * 注意：这需要重启应用才能生效
 */
export function switchProvider(newProvider: 'cloudflare' | 'self-hosted'): {
  success: boolean;
  message: string;
  requiresRestart: boolean;
} {
  try {
    // 在生产环境中，这应该更新环境变量或配置文件
    process.env.IMAGE_PROCESSING_PROVIDER = newProvider;

    return {
      success: true,
      message: `Image processing provider switched to ${newProvider}`,
      requiresRestart: true
    };
  } catch (error) {
    return {
      success: false,
      message: `Failed to switch provider: ${error instanceof Error ? error.message : 'Unknown error'}`,
      requiresRestart: false
    };
  }
}

/**
 * 获取提供商切换建议
 */
export function getProviderSwitchRecommendation(stats: {
  monthlyRequests: number;
  averageImageSize: number;
  requiredFeatures: string[];
}): {
  recommendedProvider: 'cloudflare' | 'self-hosted';
  reason: string;
  estimatedCost: {
    cloudflare: number;
    selfHosted: number;
  };
} {
  const { monthlyRequests, averageImageSize, requiredFeatures } = stats;

  // 计算Cloudflare成本
  const cloudflareTransforms = monthlyRequests;
  const cloudflareCost = Math.max(0, (cloudflareTransforms - 5000) * 0.0005); // $0.50 per 1000 after first 5000

  // 计算自实现成本 (估算)
  const selfHostedCost = monthlyRequests > 100000 ? 100 : 50; // 简化的成本模型

  // 高级功能检查
  const advancedFeatures = ['ai-enhancement', 'smart-crop', 'advanced-filters', 'batch-processing'];
  const needsAdvancedFeatures = requiredFeatures.some(feature => advancedFeatures.includes(feature));

  let recommendedProvider: 'cloudflare' | 'self-hosted';
  let reason: string;

  if (needsAdvancedFeatures) {
    recommendedProvider = 'self-hosted';
    reason = 'Advanced features like AI enhancement and smart crop are only available in self-hosted solution';
  } else if (monthlyRequests > 100000) {
    recommendedProvider = 'self-hosted';
    reason = 'High volume usage makes self-hosted solution more cost-effective';
  } else if (monthlyRequests < 10000) {
    recommendedProvider = 'cloudflare';
    reason = 'Low volume usage benefits from Cloudflare\'s free tier and zero maintenance';
  } else {
    recommendedProvider = cloudflareCost < selfHostedCost ? 'cloudflare' : 'self-hosted';
    reason = `Cost optimization: ${recommendedProvider} is more cost-effective for your usage pattern`;
  }

  return {
    recommendedProvider,
    reason,
    estimatedCost: {
      cloudflare: cloudflareCost,
      selfHosted: selfHostedCost
    }
  };
}
