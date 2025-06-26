# 功能配置指南

统一的功能配置和管理指南，涵盖积分系统、图片处理、地理位置功能等核心功能的配置和管理。

## 🎯 功能架构概览

### 核心功能模块
```
ShipAny V2 功能架构
├── 用户系统 (User System)
│   ├── 认证授权 (Auth)
│   ├── 用户管理 (User Management)
│   └── 权限控制 (Permission Control)
│
├── 积分系统 (Credit System)
│   ├── 积分策略 (Credit Strategy)
│   ├── 地理位置积分 (Geo Credits)
│   ├── 积分消费 (Credit Consumption)
│   └── 积分历史 (Credit History)
│
├── 支付系统 (Payment System)
│   ├── Stripe集成 (Stripe Integration)
│   ├── 订单管理 (Order Management)
│   ├── 支付回调 (Payment Webhooks)
│   └── 退款处理 (Refund Processing)
│
├── 图片处理 (Image Processing)
│   ├── Cloudflare Images (CDN方案)
│   ├── 自托管方案 (Self-hosted)
│   ├── 图片变换 (Image Transform)
│   └── 图片存储 (Image Storage)
│
├── AI服务 (AI Services)
│   ├── 多提供商支持 (Multi-provider)
│   ├── 统一接口 (Unified Interface)
│   ├── 成本控制 (Cost Control)
│   └── 性能监控 (Performance Monitoring)
│
└── 内容管理 (Content Management)
    ├── 页面管理 (Page Management)
    ├── 博客系统 (Blog System)
    ├── SEO优化 (SEO Optimization)
    └── 多语言支持 (i18n)
```

### 配置管理原则
1. **环境变量驱动**: 所有配置通过环境变量控制
2. **功能开关**: 支持功能的动态启用/禁用
3. **分层配置**: 全局配置 → 功能配置 → 用户配置
4. **热更新**: 支持配置的动态更新
5. **监控告警**: 配置变更的监控和告警

## 💰 积分系统配置

### 基础积分配置
```bash
# .env.local - 积分系统配置

# 积分策略选择
CREDIT_STRATEGY="geolocation" # "standard" | "geolocation" | "custom"

# 标准积分配置
STANDARD_CREDITS_ENABLED="true"
STANDARD_NEW_USER_CREDITS="100" # 新用户赠送积分
STANDARD_DAILY_FREE_CREDITS="10" # 每日免费积分
STANDARD_REFERRAL_CREDITS="50" # 推荐奖励积分

# 地理位置积分配置
GEO_CREDITS_ENABLED="true"
GEO_CREDITS_TIER1_COUNTRIES="US,CA,GB,AU,DE,FR,JP" # 发达国家
GEO_CREDITS_TIER1_AMOUNT="50"
GEO_CREDITS_TIER2_COUNTRIES="CN,BR,RU,MX,TR,KR" # 中等收入国家
GEO_CREDITS_TIER2_AMOUNT="100"
GEO_CREDITS_TIER3_COUNTRIES="IN,BD,PK,NG,ID,VN" # 发展中国家
GEO_CREDITS_TIER3_AMOUNT="200"

# 积分消费配置
CREDIT_COSTS_AI_IMAGE_GENERATION="10"
CREDIT_COSTS_AI_TEXT_GENERATION="5"
CREDIT_COSTS_AI_VIDEO_GENERATION="50"
CREDIT_COSTS_IMAGE_PROCESSING="2"
CREDIT_COSTS_PREMIUM_FEATURES="20"

# 积分限制配置
CREDIT_DAILY_LIMIT_ENABLED="true"
CREDIT_DAILY_LIMIT_AMOUNT="1000" # 每日使用限制
CREDIT_MONTHLY_LIMIT_ENABLED="false"
CREDIT_MONTHLY_LIMIT_AMOUNT="10000" # 每月使用限制
```

### 积分策略实现
```typescript
// services/credits/credit-strategy.ts
export interface CreditStrategy {
  calculateNewUserCredits(userInfo: UserInfo): Promise<number>;
  calculateDailyCredits(userInfo: UserInfo): Promise<number>;
  validateCreditUsage(userId: string, amount: number): Promise<boolean>;
}

export class GeolocationCreditStrategy implements CreditStrategy {
  async calculateNewUserCredits(userInfo: UserInfo): Promise<number> {
    const country = userInfo.country || 'US';
    
    // 根据地理位置分配积分
    if (this.isTier1Country(country)) {
      return parseInt(process.env.GEO_CREDITS_TIER1_AMOUNT || '50');
    } else if (this.isTier2Country(country)) {
      return parseInt(process.env.GEO_CREDITS_TIER2_AMOUNT || '100');
    } else {
      return parseInt(process.env.GEO_CREDITS_TIER3_AMOUNT || '200');
    }
  }
  
  async calculateDailyCredits(userInfo: UserInfo): Promise<number> {
    // 地理位置策略下的每日积分
    const baseCredits = parseInt(process.env.STANDARD_DAILY_FREE_CREDITS || '10');
    const country = userInfo.country || 'US';
    
    // 发展中国家用户获得更多每日积分
    if (this.isTier3Country(country)) {
      return baseCredits * 2;
    }
    
    return baseCredits;
  }
  
  private isTier1Country(country: string): boolean {
    const tier1Countries = process.env.GEO_CREDITS_TIER1_COUNTRIES?.split(',') || [];
    return tier1Countries.includes(country);
  }
  
  private isTier2Country(country: string): boolean {
    const tier2Countries = process.env.GEO_CREDITS_TIER2_COUNTRIES?.split(',') || [];
    return tier2Countries.includes(country);
  }
  
  private isTier3Country(country: string): boolean {
    const tier3Countries = process.env.GEO_CREDITS_TIER3_COUNTRIES?.split(',') || [];
    return tier3Countries.includes(country);
  }
}
```

### 积分消费管理
```typescript
// services/credits/credit-manager.ts
export class CreditManager {
  async deductCredits(
    userId: string, 
    amount: number, 
    bizNo: string, 
    description: string
  ): Promise<{ success: boolean; remainingCredits?: number; error?: string }> {
    
    // 幂等性检查
    const existingOrder = await db.creditOrder.findUnique({
      where: {
        user_uuid_biz_no: {
          user_uuid: userId,
          biz_no: bizNo
        }
      }
    });
    
    if (existingOrder) {
      if (existingOrder.status === 'completed') {
        return { success: true, remainingCredits: existingOrder.remaining_credits };
      } else if (existingOrder.status === 'processing') {
        // 继续处理中的订单
        return await this.processExistingOrder(existingOrder);
      }
    }
    
    // 创建新订单
    const order = await db.creditOrder.create({
      data: {
        user_uuid: userId,
        biz_no: bizNo,
        amount,
        description,
        status: 'created'
      }
    });
    
    // 检查余额
    const user = await db.user.findUnique({ where: { uuid: userId } });
    if (!user || user.credits < amount) {
      await db.creditOrder.update({
        where: { id: order.id },
        data: { status: 'failed', error: 'Insufficient credits' }
      });
      return { success: false, error: 'Insufficient credits' };
    }
    
    // 扣除积分
    const updatedUser = await db.user.update({
      where: { uuid: userId },
      data: { credits: { decrement: amount } }
    });
    
    // 更新订单状态
    await db.creditOrder.update({
      where: { id: order.id },
      data: { 
        status: 'completed',
        remaining_credits: updatedUser.credits
      }
    });
    
    return { success: true, remainingCredits: updatedUser.credits };
  }
}
```

## 🖼️ 图片处理配置

### 双套图片处理系统
```bash
# .env.local - 图片处理配置

# 图片处理提供商选择
IMAGE_PROCESSING_PROVIDER="cloudflare" # "cloudflare" | "self-hosted"

# Cloudflare Images配置
CLOUDFLARE_ACCOUNT_ID="your-account-id"
CLOUDFLARE_API_TOKEN="your-api-token"
CLOUDFLARE_IMAGE_DELIVERY_URL="https://imagedelivery.net/your-hash"
CLOUDFLARE_IMAGES_ENABLED="true"

# 自托管图片处理配置
SELF_HOSTED_IMAGES_ENABLED="false"
SELF_HOSTED_BASE_URL="https://your-domain.com"
SELF_HOSTED_STORAGE_PATH="/uploads"
SELF_HOSTED_MAX_FILE_SIZE="10485760" # 10MB
SELF_HOSTED_ALLOWED_FORMATS="jpg,jpeg,png,webp,gif"

# 图片处理通用配置
IMAGE_MAX_WIDTH="2048"
IMAGE_MAX_HEIGHT="2048"
IMAGE_QUALITY="85"
IMAGE_COMPRESSION_ENABLED="true"
IMAGE_WATERMARK_ENABLED="false"
IMAGE_WATERMARK_TEXT="YourBrand"
```

### 图片处理服务实现
```typescript
// services/image-processing/image-processor.ts
export interface ImageProcessor {
  uploadImage(file: File, options?: UploadOptions): Promise<UploadResult>;
  transformImage(imageId: string, transformations: ImageTransformation[]): Promise<string>;
  deleteImage(imageId: string): Promise<boolean>;
  getImageUrl(imageId: string, variant?: string): string;
  healthCheck(): Promise<boolean>;
}

export class ImageProcessorFactory {
  static create(): ImageProcessor {
    const provider = process.env.IMAGE_PROCESSING_PROVIDER || 'cloudflare';
    
    switch (provider) {
      case 'cloudflare':
        return new CloudflareImageProcessor();
      case 'self-hosted':
        return new SelfHostedImageProcessor();
      default:
        throw new Error(`Unsupported image processing provider: ${provider}`);
    }
  }
}

// Cloudflare Images实现
export class CloudflareImageProcessor implements ImageProcessor {
  private accountId: string;
  private apiToken: string;
  private deliveryUrl: string;
  
  constructor() {
    this.accountId = process.env.CLOUDFLARE_ACCOUNT_ID!;
    this.apiToken = process.env.CLOUDFLARE_API_TOKEN!;
    this.deliveryUrl = process.env.CLOUDFLARE_IMAGE_DELIVERY_URL!;
  }
  
  async uploadImage(file: File, options?: UploadOptions): Promise<UploadResult> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (options?.metadata) {
      formData.append('metadata', JSON.stringify(options.metadata));
    }
    
    const response = await fetch(
      `https://api.cloudflare.com/client/v4/accounts/${this.accountId}/images/v1`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiToken}`,
        },
        body: formData,
      }
    );
    
    const result = await response.json();
    
    if (!result.success) {
      throw new Error(`Upload failed: ${result.errors?.[0]?.message}`);
    }
    
    return {
      success: true,
      imageId: result.result.id,
      imageUrl: result.result.variants[0],
      metadata: result.result
    };
  }
  
  getImageUrl(imageId: string, variant: string = 'public'): string {
    return `${this.deliveryUrl}/${imageId}/${variant}`;
  }
  
  async transformImage(imageId: string, transformations: ImageTransformation[]): Promise<string> {
    // Cloudflare Images使用URL参数进行变换
    const params = new URLSearchParams();
    
    transformations.forEach(transform => {
      switch (transform.type) {
        case 'resize':
          params.append('width', transform.width?.toString() || '');
          params.append('height', transform.height?.toString() || '');
          break;
        case 'crop':
          params.append('fit', 'crop');
          params.append('gravity', transform.gravity || 'center');
          break;
        case 'quality':
          params.append('quality', transform.quality?.toString() || '85');
          break;
      }
    });
    
    return `${this.getImageUrl(imageId)}?${params.toString()}`;
  }
}
```

## 🌍 地理位置功能配置

### Cloudflare IP Geolocation
```bash
# .env.local - 地理位置配置

# 地理位置服务配置
GEOLOCATION_ENABLED="true"
GEOLOCATION_PROVIDER="cloudflare" # "cloudflare" | "maxmind" | "ipapi"

# Cloudflare配置 (免费，需要通过Cloudflare代理)
CLOUDFLARE_GEOLOCATION_ENABLED="true"

# MaxMind配置 (付费，更精确)
MAXMIND_LICENSE_KEY="your-license-key"
MAXMIND_DATABASE_PATH="./data/GeoLite2-Country.mmdb"

# IP-API配置 (免费，有限制)
IPAPI_KEY="your-api-key"
IPAPI_RATE_LIMIT="1000" # 每月请求限制

# 地理位置缓存配置
GEOLOCATION_CACHE_ENABLED="true"
GEOLOCATION_CACHE_TTL="86400" # 24小时缓存
```

### 地理位置服务实现
```typescript
// services/geolocation/geolocation-service.ts
export interface GeolocationService {
  getCountryByIP(ip: string): Promise<string | null>;
  getLocationInfo(ip: string): Promise<LocationInfo | null>;
}

export class CloudflareGeolocationService implements GeolocationService {
  async getCountryByIP(ip: string): Promise<string | null> {
    // Cloudflare在请求头中提供地理位置信息
    // 这需要通过Cloudflare代理才能获取
    return null; // 在实际请求中从headers获取
  }
  
  async getLocationInfo(ip: string): Promise<LocationInfo | null> {
    // 从Cloudflare headers获取完整位置信息
    return null;
  }
}

// 地理位置中间件
export function geolocationMiddleware(request: Request): LocationInfo | null {
  const headers = request.headers;
  
  // Cloudflare提供的地理位置信息
  const country = headers.get('CF-IPCountry');
  const city = headers.get('CF-IPCity');
  const region = headers.get('CF-IPRegion');
  const timezone = headers.get('CF-Timezone');
  
  if (!country) return null;
  
  return {
    country,
    city: city || undefined,
    region: region || undefined,
    timezone: timezone || undefined,
    ip: headers.get('CF-Connecting-IP') || headers.get('X-Forwarded-For') || ''
  };
}
```

## 🔧 功能开关管理

### 功能开关配置
```typescript
// config/feature-flags.ts
export const FEATURE_FLAGS = {
  // 用户功能
  USER_REGISTRATION: process.env.FEATURE_USER_REGISTRATION === 'true',
  SOCIAL_LOGIN: process.env.FEATURE_SOCIAL_LOGIN === 'true',
  EMAIL_VERIFICATION: process.env.FEATURE_EMAIL_VERIFICATION === 'true',
  
  // 积分功能
  CREDIT_SYSTEM: process.env.FEATURE_CREDIT_SYSTEM === 'true',
  GEO_CREDITS: process.env.FEATURE_GEO_CREDITS === 'true',
  DAILY_FREE_CREDITS: process.env.FEATURE_DAILY_FREE_CREDITS === 'true',
  
  // 支付功能
  STRIPE_PAYMENTS: process.env.FEATURE_STRIPE_PAYMENTS === 'true',
  SUBSCRIPTION_PLANS: process.env.FEATURE_SUBSCRIPTION_PLANS === 'true',
  REFUND_PROCESSING: process.env.FEATURE_REFUND_PROCESSING === 'true',
  
  // AI功能
  AI_IMAGE_GENERATION: process.env.FEATURE_AI_IMAGE_GENERATION === 'true',
  AI_TEXT_GENERATION: process.env.FEATURE_AI_TEXT_GENERATION === 'true',
  AI_VIDEO_GENERATION: process.env.FEATURE_AI_VIDEO_GENERATION === 'true',
  
  // 图片处理
  IMAGE_UPLOAD: process.env.FEATURE_IMAGE_UPLOAD === 'true',
  IMAGE_TRANSFORMATION: process.env.FEATURE_IMAGE_TRANSFORMATION === 'true',
  IMAGE_OPTIMIZATION: process.env.FEATURE_IMAGE_OPTIMIZATION === 'true',
  
  // 内容功能
  BLOG_SYSTEM: process.env.FEATURE_BLOG_SYSTEM === 'true',
  COMMENT_SYSTEM: process.env.FEATURE_COMMENT_SYSTEM === 'true',
  SEO_OPTIMIZATION: process.env.FEATURE_SEO_OPTIMIZATION === 'true',
  
  // 管理功能
  ADMIN_DASHBOARD: process.env.FEATURE_ADMIN_DASHBOARD === 'true',
  USER_ANALYTICS: process.env.FEATURE_USER_ANALYTICS === 'true',
  SYSTEM_MONITORING: process.env.FEATURE_SYSTEM_MONITORING === 'true'
};

// 功能开关检查函数
export function isFeatureEnabled(feature: keyof typeof FEATURE_FLAGS): boolean {
  return FEATURE_FLAGS[feature] || false;
}

// React Hook for feature flags
export function useFeatureFlag(feature: keyof typeof FEATURE_FLAGS): boolean {
  return isFeatureEnabled(feature);
}
```

### 功能开关使用示例
```typescript
// 在组件中使用
import { useFeatureFlag } from '@/config/feature-flags';

export function PaymentSection() {
  const isPaymentEnabled = useFeatureFlag('STRIPE_PAYMENTS');
  
  if (!isPaymentEnabled) {
    return <div>Payment feature is currently disabled</div>;
  }
  
  return <StripePaymentForm />;
}

// 在API路由中使用
import { isFeatureEnabled } from '@/config/feature-flags';

export async function POST(request: Request) {
  if (!isFeatureEnabled('AI_IMAGE_GENERATION')) {
    return Response.json(
      { error: 'AI image generation is currently disabled' }, 
      { status: 503 }
    );
  }
  
  // 处理AI图片生成请求
}
```

## 📊 配置监控和管理

### 配置验证
```typescript
// lib/config-validator.ts
export class ConfigValidator {
  static validateRequired() {
    const requiredEnvVars = [
      'DATABASE_URL',
      'NEXTAUTH_SECRET',
      'STRIPE_SECRET_KEY'
    ];
    
    const missing = requiredEnvVars.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
  
  static validateAIProviders() {
    const enabledProviders = [];
    
    if (process.env.OPENAI_API_KEY) enabledProviders.push('openai');
    if (process.env.ANTHROPIC_API_KEY) enabledProviders.push('anthropic');
    if (process.env.TUZI_API_KEY) enabledProviders.push('tuzi');
    
    if (enabledProviders.length === 0) {
      console.warn('No AI providers configured');
    }
    
    return enabledProviders;
  }
  
  static validateImageProcessing() {
    const provider = process.env.IMAGE_PROCESSING_PROVIDER;
    
    if (provider === 'cloudflare') {
      if (!process.env.CLOUDFLARE_ACCOUNT_ID || !process.env.CLOUDFLARE_API_TOKEN) {
        throw new Error('Cloudflare configuration incomplete');
      }
    }
    
    return true;
  }
}
```

### 配置管理API
```typescript
// app/api/admin/config/route.ts
export async function GET() {
  // 返回当前配置状态 (不包含敏感信息)
  return Response.json({
    features: FEATURE_FLAGS,
    providers: {
      ai: ConfigValidator.validateAIProviders(),
      imageProcessing: process.env.IMAGE_PROCESSING_PROVIDER,
      geolocation: process.env.GEOLOCATION_PROVIDER
    },
    health: {
      database: await checkDatabaseHealth(),
      ai: await checkAIProvidersHealth(),
      imageProcessing: await checkImageProcessingHealth()
    }
  });
}

export async function POST(request: Request) {
  const { feature, enabled } = await request.json();
  
  // 动态更新功能开关
  if (feature in FEATURE_FLAGS) {
    process.env[`FEATURE_${feature.toUpperCase()}`] = enabled.toString();
    return Response.json({ success: true });
  }
  
  return Response.json({ error: 'Invalid feature flag' }, { status: 400 });
}
```

这个功能配置指南提供了完整的系统功能配置和管理方案，确保系统的灵活性和可维护性！
