# AI服务集成指南

统一的AI服务集成和配置指南，支持多种AI服务提供商，提供完整的集成架构和最佳实践。

## 🎯 AI服务架构设计

### 分层架构设计
```
业务层 (Business Layer)
├── 用户接口 (API Routes)
├── 业务逻辑 (Services)
├── 积分管理 (Credits)
└── 订单管理 (Orders)

抽象层 (Abstraction Layer)
├── 统一接口 (Unified Interface)
├── 参数标准化 (Parameter Normalization)
├── 结果标准化 (Result Normalization)
└── 错误处理 (Error Handling)

提供商层 (Provider Layer)
├── OpenAI Provider
├── Anthropic Provider
├── Stability AI Provider
├── Tuzi API Provider
└── 自定义 Provider
```

### 核心设计原则
1. **统一接口**: 所有AI服务使用相同的调用接口
2. **参数驱动**: 通过配置参数控制不同提供商的特性
3. **错误隔离**: 单个服务故障不影响整体系统
4. **性能优化**: 支持缓存、重试、负载均衡
5. **成本控制**: 集成积分系统和使用监控

## 🏗️ 统一接口设计

### 核心接口定义
```typescript
// types/ai/base.ts
export interface AIProvider {
  name: string;
  generateImage(params: ImageGenerationParams): Promise<ImageResult>;
  generateText(params: TextGenerationParams): Promise<TextResult>;
  healthCheck(): Promise<boolean>;
}

export interface ImageGenerationParams {
  prompt: string;
  model?: string;
  width?: number;
  height?: number;
  style?: string;
  quality?: string;
  steps?: number;
  seed?: number;
  // 提供商特定参数
  providerOptions?: Record<string, any>;
}

export interface ImageResult {
  success: boolean;
  imageUrl?: string;
  imageData?: string;
  metadata?: {
    model: string;
    provider: string;
    generationTime: number;
    cost: number;
  };
  error?: string;
}
```

### 提供商注册系统
```typescript
// services/ai/provider-registry.ts
export class AIProviderRegistry {
  private providers: Map<string, AIProvider> = new Map();
  
  register(provider: AIProvider) {
    this.providers.set(provider.name, provider);
  }
  
  getProvider(name: string): AIProvider | undefined {
    return this.providers.get(name);
  }
  
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }
  
  async getHealthyProvider(preferredProvider?: string): Promise<AIProvider | null> {
    // 健康检查逻辑
    if (preferredProvider && this.providers.has(preferredProvider)) {
      const provider = this.providers.get(preferredProvider)!;
      if (await provider.healthCheck()) {
        return provider;
      }
    }
    
    // 回退到其他健康的提供商
    for (const [name, provider] of this.providers) {
      if (await provider.healthCheck()) {
        return provider;
      }
    }
    
    return null;
  }
}
```

## 🔌 主流AI服务集成

### OpenAI集成
```typescript
// services/ai/providers/openai-provider.ts
export class OpenAIProvider implements AIProvider {
  name = 'openai';
  private client: OpenAI;
  
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }
  
  async generateImage(params: ImageGenerationParams): Promise<ImageResult> {
    try {
      const response = await this.client.images.generate({
        model: params.model || 'dall-e-3',
        prompt: params.prompt,
        size: `${params.width || 1024}x${params.height || 1024}`,
        quality: params.quality || 'standard',
        n: 1,
        ...params.providerOptions
      });
      
      return {
        success: true,
        imageUrl: response.data[0].url,
        metadata: {
          model: params.model || 'dall-e-3',
          provider: 'openai',
          generationTime: Date.now(),
          cost: this.calculateCost(params)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async generateText(params: TextGenerationParams): Promise<TextResult> {
    try {
      const response = await this.client.chat.completions.create({
        model: params.model || 'gpt-4',
        messages: [{ role: 'user', content: params.prompt }],
        max_tokens: params.maxTokens || 1000,
        temperature: params.temperature || 0.7,
        ...params.providerOptions
      });
      
      return {
        success: true,
        text: response.choices[0].message.content,
        metadata: {
          model: params.model || 'gpt-4',
          provider: 'openai',
          tokens: response.usage?.total_tokens || 0,
          cost: this.calculateCost(params)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.models.list();
      return true;
    } catch {
      return false;
    }
  }
  
  private calculateCost(params: any): number {
    // 根据模型和参数计算成本
    return 0.01; // 示例成本
  }
}
```

### Anthropic集成
```typescript
// services/ai/providers/anthropic-provider.ts
export class AnthropicProvider implements AIProvider {
  name = 'anthropic';
  private client: Anthropic;
  
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });
  }
  
  async generateText(params: TextGenerationParams): Promise<TextResult> {
    try {
      const response = await this.client.messages.create({
        model: params.model || 'claude-3-sonnet-20240229',
        max_tokens: params.maxTokens || 1000,
        messages: [{ role: 'user', content: params.prompt }],
        temperature: params.temperature || 0.7,
        ...params.providerOptions
      });
      
      return {
        success: true,
        text: response.content[0].text,
        metadata: {
          model: params.model || 'claude-3-sonnet-20240229',
          provider: 'anthropic',
          tokens: response.usage.input_tokens + response.usage.output_tokens,
          cost: this.calculateCost(response.usage)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  // 注意: Anthropic主要提供文本生成，不支持图片生成
  async generateImage(params: ImageGenerationParams): Promise<ImageResult> {
    return {
      success: false,
      error: 'Anthropic does not support image generation'
    };
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.messages.create({
        model: 'claude-3-haiku-20240307',
        max_tokens: 10,
        messages: [{ role: 'user', content: 'Hello' }]
      });
      return true;
    } catch {
      return false;
    }
  }
}
```

### 兔子API集成 (成本优化)
```typescript
// services/ai/providers/tuzi-provider.ts
export class TuziProvider implements AIProvider {
  name = 'tuzi';
  private baseUrl = 'https://api.tu-zi.com';
  private apiKey: string;
  
  constructor() {
    this.apiKey = process.env.TUZI_API_KEY || '';
  }
  
  async generateImage(params: ImageGenerationParams): Promise<ImageResult> {
    try {
      const requestBody = {
        prompt: params.prompt,
        model: params.model || 'sd-xl',
        width: params.width || 1024,
        height: params.height || 1024,
        steps: params.steps || 20,
        // 兔子API特定参数
        aspectRatio: params.providerOptions?.aspectRatio || '1:1',
        outputFormat: params.providerOptions?.outputFormat || 'png',
        safetyTolerance: params.providerOptions?.safetyTolerance || 2,
        ...params.providerOptions
      };
      
      const response = await fetch(`${this.baseUrl}/v1/images/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        imageUrl: result.data.imageUrl,
        metadata: {
          model: params.model || 'sd-xl',
          provider: 'tuzi',
          generationTime: result.data.generationTime,
          cost: this.calculateCost(params)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async generateText(params: TextGenerationParams): Promise<TextResult> {
    // 兔子API文本生成实现
    try {
      const response = await fetch(`${this.baseUrl}/v1/text/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: params.prompt,
          model: params.model || 'qwen-plus',
          maxTokens: params.maxTokens || 1000,
          temperature: params.temperature || 0.7,
          ...params.providerOptions
        }),
      });
      
      const result = await response.json();
      
      return {
        success: true,
        text: result.data.text,
        metadata: {
          model: params.model || 'qwen-plus',
          provider: 'tuzi',
          tokens: result.data.tokens,
          cost: this.calculateCost(params)
        }
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
  
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/v1/health`, {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
        },
      });
      return response.ok;
    } catch {
      return false;
    }
  }
  
  private calculateCost(params: any): number {
    // 兔子API成本计算 (通常比OpenAI便宜60-80%)
    return 0.004; // 示例成本
  }
}
```

## 🎛️ AI服务配置管理

### 配置文件结构
```typescript
// config/ai-providers.ts
export const AI_PROVIDERS_CONFIG = {
  default: 'openai', // 默认提供商
  
  providers: {
    openai: {
      enabled: true,
      apiKey: process.env.OPENAI_API_KEY,
      models: {
        text: ['gpt-4', 'gpt-3.5-turbo'],
        image: ['dall-e-3', 'dall-e-2']
      },
      rateLimit: {
        requestsPerMinute: 60,
        tokensPerMinute: 90000
      },
      cost: {
        'gpt-4': { input: 0.03, output: 0.06 }, // per 1K tokens
        'dall-e-3': 0.04 // per image
      }
    },
    
    anthropic: {
      enabled: true,
      apiKey: process.env.ANTHROPIC_API_KEY,
      models: {
        text: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307']
      },
      rateLimit: {
        requestsPerMinute: 50,
        tokensPerMinute: 40000
      },
      cost: {
        'claude-3-opus-20240229': { input: 0.015, output: 0.075 },
        'claude-3-sonnet-20240229': { input: 0.003, output: 0.015 }
      }
    },
    
    tuzi: {
      enabled: true,
      apiKey: process.env.TUZI_API_KEY,
      models: {
        text: ['qwen-plus', 'qwen-turbo'],
        image: ['sd-xl', 'sd-1.5', 'midjourney']
      },
      rateLimit: {
        requestsPerMinute: 100,
        tokensPerMinute: 200000
      },
      cost: {
        'qwen-plus': { input: 0.001, output: 0.002 },
        'sd-xl': 0.002 // per image
      }
    }
  },
  
  // 回退策略
  fallback: {
    text: ['openai', 'anthropic', 'tuzi'],
    image: ['openai', 'tuzi']
  },
  
  // 负载均衡
  loadBalancing: {
    strategy: 'round-robin', // 'round-robin', 'least-cost', 'fastest'
    healthCheckInterval: 60000 // 1分钟
  }
};
```

### 动态配置管理
```typescript
// services/ai/config-manager.ts
export class AIConfigManager {
  private config = AI_PROVIDERS_CONFIG;
  
  getProviderConfig(providerName: string) {
    return this.config.providers[providerName];
  }
  
  isProviderEnabled(providerName: string): boolean {
    return this.config.providers[providerName]?.enabled || false;
  }
  
  getAvailableModels(providerName: string, type: 'text' | 'image'): string[] {
    return this.config.providers[providerName]?.models[type] || [];
  }
  
  getCost(providerName: string, model: string): any {
    return this.config.providers[providerName]?.cost[model];
  }
  
  getFallbackProviders(type: 'text' | 'image'): string[] {
    return this.config.fallback[type] || [];
  }
  
  updateProviderStatus(providerName: string, enabled: boolean) {
    if (this.config.providers[providerName]) {
      this.config.providers[providerName].enabled = enabled;
    }
  }
}
```

## 📊 性能优化和监控

### 缓存策略
```typescript
// services/ai/cache-manager.ts
export class AICacheManager {
  private cache = new Map<string, any>();
  private ttl = 3600000; // 1小时
  
  generateCacheKey(params: any): string {
    return crypto
      .createHash('md5')
      .update(JSON.stringify(params))
      .digest('hex');
  }
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      expiry: Date.now() + this.ttl
    });
  }
  
  clear(): void {
    this.cache.clear();
  }
}
```

### 使用监控
```typescript
// services/ai/usage-monitor.ts
export class AIUsageMonitor {
  async trackUsage(
    userId: string,
    provider: string,
    model: string,
    type: 'text' | 'image',
    cost: number,
    tokens?: number
  ) {
    // 记录使用情况到数据库
    await db.aiUsage.create({
      data: {
        userId,
        provider,
        model,
        type,
        cost,
        tokens,
        timestamp: new Date()
      }
    });
    
    // 更新用户统计
    await this.updateUserStats(userId, cost, tokens);
  }
  
  async getUserUsage(userId: string, period: 'day' | 'month' | 'year') {
    const startDate = this.getStartDate(period);
    
    return await db.aiUsage.aggregate({
      where: {
        userId,
        timestamp: { gte: startDate }
      },
      _sum: {
        cost: true,
        tokens: true
      },
      _count: true
    });
  }
  
  async getProviderStats(period: 'day' | 'month' | 'year') {
    const startDate = this.getStartDate(period);
    
    return await db.aiUsage.groupBy({
      by: ['provider'],
      where: {
        timestamp: { gte: startDate }
      },
      _sum: {
        cost: true,
        tokens: true
      },
      _count: true
    });
  }
}
```

## 🔧 环境变量配置

### 必需的环境变量
```bash
# .env.local

# OpenAI配置
OPENAI_API_KEY="sk-..."
OPENAI_ORG_ID="org-..." # 可选

# Anthropic配置
ANTHROPIC_API_KEY="sk-ant-..."

# 兔子API配置
TUZI_API_KEY="your-tuzi-api-key"
TUZI_BASE_URL="https://api.tu-zi.com" # 可选，使用默认值

# Stability AI配置 (可选)
STABILITY_API_KEY="sk-..."

# AI服务配置
AI_DEFAULT_PROVIDER="openai" # 默认提供商
AI_ENABLE_CACHING="true" # 启用缓存
AI_CACHE_TTL="3600" # 缓存时间(秒)
AI_ENABLE_MONITORING="true" # 启用监控
AI_RATE_LIMIT_ENABLED="true" # 启用速率限制

# 成本控制
AI_DAILY_COST_LIMIT="100" # 每日成本限制(美元)
AI_USER_DAILY_LIMIT="10" # 用户每日使用限制
```

## 🚀 快速集成示例

### 基础使用示例
```typescript
// app/api/ai/generate-image/route.ts
import { AIProviderRegistry } from '@/services/ai/provider-registry';
import { OpenAIProvider } from '@/services/ai/providers/openai-provider';
import { TuziProvider } from '@/services/ai/providers/tuzi-provider';

// 初始化提供商注册表
const registry = new AIProviderRegistry();
registry.register(new OpenAIProvider());
registry.register(new TuziProvider());

export async function POST(request: Request) {
  try {
    const { prompt, provider = 'openai', ...options } = await request.json();
    
    // 获取健康的提供商
    const aiProvider = await registry.getHealthyProvider(provider);
    if (!aiProvider) {
      return Response.json({ error: 'No healthy AI provider available' }, { status: 503 });
    }
    
    // 生成图片
    const result = await aiProvider.generateImage({
      prompt,
      ...options
    });
    
    if (!result.success) {
      return Response.json({ error: result.error }, { status: 500 });
    }
    
    return Response.json({
      success: true,
      imageUrl: result.imageUrl,
      metadata: result.metadata
    });
    
  } catch (error) {
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
```

这个AI服务集成指南提供了完整的多提供商支持架构，确保系统的可靠性、性能和成本效益！
