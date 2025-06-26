import { respData, respErr } from "@/lib/resp";
import { getUserInfo } from "@/services/user";
import { getImageProcessingService } from "@/services/image-processing-service";
import { 
  getImageProcessingConfig, 
  validateImageProcessingConfig,
  getProviderCapabilities,
  getProviderSwitchRecommendation
} from "@/services/image-processing/image-processing-factory";

export async function GET(req: Request) {
  try {
    // 检查管理员权限
    const userInfo = await getUserInfo();
    if (!userInfo || !userInfo.email) {
      return respErr("no auth");
    }

    const adminEmails = process.env.ADMIN_EMAILS?.split(",");
    if (!adminEmails?.includes(userInfo.email)) {
      return respErr("access denied");
    }

    const imageService = getImageProcessingService();
    const config = getImageProcessingConfig();
    const validation = validateImageProcessingConfig();
    const capabilities = await getProviderCapabilities();
    const stats = imageService.getStats();

    // 获取切换建议
    const recommendation = getProviderSwitchRecommendation({
      monthlyRequests: stats.totalRequests * 30, // 估算月请求量
      averageImageSize: 1024 * 1024, // 1MB 估算
      requiredFeatures: ['resize', 'watermark'] // 基础功能
    });

    return respData({
      currentConfig: {
        provider: config.provider,
        defaultQuality: config.defaultQuality,
        defaultFormat: config.defaultFormat,
        maxImageSize: config.maxImageSize,
        allowedFormats: config.allowedFormats
      },
      validation,
      capabilities,
      stats,
      recommendation,
      serviceInfo: imageService.getServiceInfo(),
      environmentVariables: {
        IMAGE_PROCESSING_PROVIDER: process.env.IMAGE_PROCESSING_PROVIDER || 'cloudflare',
        IMAGE_DEFAULT_QUALITY: process.env.IMAGE_DEFAULT_QUALITY || '85',
        IMAGE_DEFAULT_FORMAT: process.env.IMAGE_DEFAULT_FORMAT || 'auto',
        IMAGE_MAX_SIZE: process.env.IMAGE_MAX_SIZE || '10485760',
        IMAGE_ALLOWED_FORMATS: process.env.IMAGE_ALLOWED_FORMATS || 'jpeg,png,webp,avif',
        
        // Cloudflare配置
        CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID ? '***' : 'Not set',
        CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN ? '***' : 'Not set',
        CLOUDFLARE_IMAGE_DELIVERY_URL: process.env.CLOUDFLARE_IMAGE_DELIVERY_URL || 'Not set',
        
        // 自实现配置
        SELF_HOSTED_IMAGE_ENDPOINT: process.env.SELF_HOSTED_IMAGE_ENDPOINT || 'Not set',
        SELF_HOSTED_IMAGE_API_KEY: process.env.SELF_HOSTED_IMAGE_API_KEY ? '***' : 'Not set',
        SELF_HOSTED_IMAGE_CONCURRENCY: process.env.SELF_HOSTED_IMAGE_CONCURRENCY || '5'
      },
      instructions: {
        providers: {
          cloudflare: "Use Cloudflare Images for basic transformations with zero maintenance",
          "self-hosted": "Use self-hosted solution for advanced features and high volume"
        },
        configuration: {
          "Switch to Cloudflare": "IMAGE_PROCESSING_PROVIDER=cloudflare",
          "Switch to Self-hosted": "IMAGE_PROCESSING_PROVIDER=self-hosted",
          "Set default quality": "IMAGE_DEFAULT_QUALITY=85",
          "Set default format": "IMAGE_DEFAULT_FORMAT=webp"
        },
        examples: {
          "Cloudflare setup": {
            "IMAGE_PROCESSING_PROVIDER": "cloudflare",
            "CLOUDFLARE_ACCOUNT_ID": "your-account-id",
            "CLOUDFLARE_API_TOKEN": "your-api-token",
            "CLOUDFLARE_IMAGE_DELIVERY_URL": "https://imagedelivery.net/your-account"
          },
          "Self-hosted setup": {
            "IMAGE_PROCESSING_PROVIDER": "self-hosted",
            "SELF_HOSTED_IMAGE_ENDPOINT": "http://localhost:3001",
            "SELF_HOSTED_IMAGE_API_KEY": "your-api-key",
            "SELF_HOSTED_IMAGE_CONCURRENCY": "10"
          }
        }
      }
    });
  } catch (error) {
    console.error("Get image processing config error:", error);
    return respErr("failed to get image processing configuration");
  }
}
