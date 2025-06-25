# AI 功能完整指南

本指南涵盖 ShipAny 模板中所有 AI 功能的集成、使用和开发。

## 📋 目录

- [AI 架构概览](#ai-架构概览)
- [支持的 AI 提供商](#支持的-ai-提供商)
- [API 接口使用](#api-接口使用)
- [前端集成](#前端集成)
- [新增 AI 提供商](#新增-ai-提供商)
- [配置和环境变量](#配置和环境变量)
- [最佳实践](#最佳实践)

## 🏗️ AI 架构概览

### 核心架构
```
AI 功能架构
├── API 层 (app/api/)
│   ├── /api/ai/generate-image     # 业务完整版（推荐）
│   ├── /api/demo/gen-image        # 核心功能版
│   ├── /api/ai-generations        # 生成记录查询
│   └── /api/ai/order-status       # 订单状态查询
│
├── 业务逻辑层 (services/)
│   ├── ai-generation-service.ts   # 核心业务逻辑
│   └── credit.ts                  # 积分系统
│
├── 数据层 (models/)
│   ├── ai-generation-record.ts    # 生成记录管理
│   └── credit.ts                  # 积分记录
│
├── AI SDK 层 (aisdk/)
│   ├── openai/                    # OpenAI 集成
│   ├── tuzi/                      # Tuzi API 集成
│   ├── kling/                     # Kling 集成
│   └── replicate/                 # Replicate 集成
│
└── 配置层 (config/)
    └── ai-generation.ts           # AI 服务配置
```

### 核心特性
- ✅ **幂等性处理**: 防重复扣费机制
- ✅ **状态管理**: 完整的生成状态流转
- ✅ **积分系统**: 自动积分扣减和记录
- ✅ **云存储**: 自动上传到云存储
- ✅ **多提供商**: 统一接口支持多个 AI 服务
- ✅ **轮询机制**: 适合异步 AI 提供商

## 🤖 支持的 AI 提供商

### 1. OpenAI DALL-E
```javascript
{
  provider: "openai",
  model: "dall-e-3",
  options: {
    quality: "hd",      // "standard" | "hd"
    style: "natural"    // "natural" | "vivid"
  }
}
```

**特点**: 高质量图片生成，英文提示词效果最佳
**成本**: 较高，适合高质量需求

### 2. Tuzi API (兔子API)
```javascript
{
  provider: "tuzi",
  model: "tuzi-general",
  options: {
    aspectRatio: "1:1",        // "1:1" | "16:9" | "9:16" | "4:3" | "3:4"
    outputFormat: "png",       // "png" | "jpg" | "webp"
    safetyTolerance: 2,        // 0-6，安全容忍度
    seed: 12345,               // 可选，固定种子
    steps: 20                  // 可选，推理步数
  }
}
```

**特点**: 中文友好，成本低，速度快
**成本**: 低，适合大量生成需求

### 3. Kling
```javascript
{
  provider: "kling",
  model: "kling-v1",
  options: {}
}
```

**特点**: 国产 AI，支持图片和视频生成
**成本**: 中等，功能丰富

### 4. Replicate
```javascript
{
  provider: "replicate",
  model: "stability-ai/stable-diffusion:db21e45d3f7023abc2a46ee38a23973f6dce16bb082a930b0c49861f96d1e5bf",
  options: {
    output_quality: 90,
    num_inference_steps: 50
  }
}
```

**特点**: 开源模型，可定制性强
**成本**: 按使用量计费

## 🔌 API 接口使用

### 核心接口概览

| 接口 | 功能 | 方法 | 路径 |
|------|------|------|------|
| 图片生成 | 生成AI图片（含业务逻辑） | POST | `/api/ai/generate-image` |
| 核心生成 | 纯图片生成（无业务逻辑） | POST | `/api/demo/gen-image` |
| 生成记录 | 获取用户生成历史 | GET/POST | `/api/ai-generations` |
| 订单状态 | 查询单个订单状态 | GET/POST | `/api/ai/order-status` |

### 1. 图片生成接口（推荐）

**`POST /api/ai/generate-image`**

**功能特性**:
- ✅ 自动扣减积分
- ✅ 保存生成记录
- ✅ 幂等性保证
- ✅ 状态管理
- ✅ 云存储上传

**请求示例**:
```javascript
const response = await fetch('/api/ai/generate-image', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: "一只可爱的小猫在花园里玩耍",
    provider: "tuzi",
    model: "tuzi-general",
    bizNo: Date.now().toString(), // 业务号，确保幂等性
    options: {
      aspectRatio: "1:1",
      outputFormat: "png",
      safetyTolerance: 2
    }
  })
});

const result = await response.json();
```

**响应格式**:
```javascript
{
  "success": true,
  "data": {
    "images": [
      {
        "url": "https://storage.example.com/image1.png",
        "location": "https://storage.example.com/image1.png",
        "provider": "tuzi",
        "filename": "tuzi_image_xxx_0.png"
      }
    ],
    "orderId": 123,
    "creditsConsumed": 10,
    "isRetry": false
  }
}
```

### 2. 生成记录查询

**`GET /api/ai-generations`**

**功能特性**:
- ✅ 分页查询
- ✅ 类型过滤
- ✅ 倒序排列
- ✅ 用户权限验证

**请求示例**:
```javascript
// 获取图片生成记录
const response = await fetch('/api/ai-generations?type=image&page=1&limit=20');
const result = await response.json();
```

### 3. 订单状态查询（轮询用）

**`GET /api/ai/order-status`**

**功能特性**:
- ✅ 支持 orderId 和 bizNo 查询
- ✅ 实时状态查询
- ✅ 适合轮询使用

**请求示例**:
```javascript
// 通过订单ID查询
const response = await fetch('/api/ai/order-status?orderId=123');
const result = await response.json();
```

**订单状态说明**:

| 状态 | 说明 | 前端处理建议 |
|------|------|-------------|
| `created` | 订单已创建 | 显示"准备中" |
| `credits_deducted` | 积分已扣减 | 显示"准备中" |
| `processing` | 正在生成 | 显示"生成中"，可轮询 |
| `success` | 生成成功 | 显示结果 |
| `failed` | 生成失败 | 显示错误信息，可重试 |

## 🎨 前端集成

### React Hook 示例

```javascript
import { useState, useCallback } from 'react';

export function useAIImageGeneration() {
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [error, setError] = useState(null);

  // 生成图片
  const generateImage = useCallback(async (prompt, provider = 'tuzi') => {
    setLoading(true);
    setError(null);
    
    try {
      const bizNo = Date.now().toString();
      
      const response = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          provider,
          model: provider === 'tuzi' ? 'tuzi-general' : 'dall-e-3',
          bizNo,
          options: {}
        })
      });

      const result = await response.json();
      
      if (result.success) {
        setImages(result.data.images);
        return { success: true, orderId: result.data.orderId };
      } else {
        throw new Error(result.error || '生成失败');
      }
    } catch (err) {
      setError(err.message);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // 轮询订单状态
  const pollOrderStatus = useCallback(async (orderId, maxAttempts = 30) => {
    for (let i = 0; i < maxAttempts; i++) {
      const response = await fetch(`/api/ai/order-status?orderId=${orderId}`);
      const result = await response.json();
      
      if (result.success) {
        const order = result.data;
        
        if (order.status === 'success') {
          return { success: true, order };
        } else if (order.status === 'failed') {
          throw new Error(order.error_message || '生成失败');
        }
      }
      
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    throw new Error('轮询超时');
  }, []);

  return { loading, images, error, generateImage, pollOrderStatus };
}
```

### 完整组件示例

```javascript
function ImageGenerator() {
  const { loading, images, error, generateImage } = useAIImageGeneration();
  const [prompt, setPrompt] = useState('');
  const [provider, setProvider] = useState('tuzi');

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      alert('请输入图片描述');
      return;
    }

    const result = await generateImage(prompt, provider);
    
    if (result.success) {
      console.log('生成成功');
    } else {
      console.error('生成失败:', result.error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="描述你想要生成的图片..."
          className="flex-1 p-2 border rounded"
          rows={3}
        />
        
        <div className="flex flex-col gap-2">
          <select 
            value={provider} 
            onChange={(e) => setProvider(e.target.value)}
            className="p-2 border rounded"
          >
            <option value="tuzi">Tuzi (兔子API)</option>
            <option value="openai">OpenAI DALL-E</option>
            <option value="kling">Kling</option>
          </select>
          
          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? '生成中...' : '生成图片'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-4">
        {images.map((img, index) => (
          <img
            key={index}
            src={img.url}
            alt={`Generated ${index + 1}`}
            className="w-full rounded-lg"
          />
        ))}
      </div>
    </div>
  );
}
```

## 🔧 新增 AI 提供商

### 1. 创建提供商实现

```typescript
// aisdk/your-provider/provider.ts
import { AIProvider } from "../types/provider";

export interface YourProviderSettings {
  apiKey: string;
  baseURL?: string;
}

export class YourProvider implements AIProvider {
  readonly name = "your-provider";

  constructor(private settings: YourProviderSettings) {}

  image(model: string) {
    return new YourImageModel(model, this.settings);
  }
}

export function createYourProvider(settings: YourProviderSettings) {
  return new YourProvider(settings);
}
```

### 2. 实现图像模型

```typescript
// aisdk/your-provider/image-model.ts
import { ImageModelV1 } from "@ai-sdk/provider";

export class YourImageModel implements ImageModelV1 {
  readonly specificationVersion = "v1";
  readonly provider = "your-provider";

  constructor(
    public readonly modelId: string,
    private settings: YourProviderSettings
  ) {}

  async doGenerate(options: ImageGenerateOptions) {
    const response = await fetch(`${this.settings.baseURL}/generate`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.settings.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: options.prompt,
        model: this.modelId,
        n: options.n || 1,
      }),
    });

    const data = await response.json();

    return {
      images: data.images.map((img: any) => ({
        base64: img.base64,
        mimeType: "image/png",
      })),
      warnings: [],
    };
  }
}
```

### 3. 注册提供商

```typescript
// aisdk/index.ts
export { yourProvider } from "./your-provider";

// app/api/demo/gen-image/route.ts
case "your-provider":
  imageModel = yourProvider.image(model);
  break;
```

## ⚙️ 配置和环境变量

### AI 生成配置

```typescript
// config/ai-generation.ts
export const AI_GENERATION_CONFIG = {
  image: {
    saveRecord: true,              // 是否保存生成记录
    consumeCredits: true,          // 是否扣减积分
    creditsPerGeneration: 10,      // 每次生成需要的积分
    enableStorage: true,           // 是否启用云存储
  }
};
```

### 环境变量

#### 必需配置
```bash
# AI 提供商 API Keys
OPENAI_API_KEY=sk-xxx
TUZI_API_KEY=your_tuzi_api_key
KLING_API_KEY=your_kling_api_key

# 云存储 (AWS S3)
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

#### 可选配置
```bash
# AI 图片生成配置
AI_IMAGE_SAVE_RECORD=true
AI_IMAGE_CONSUME_CREDITS=true
AI_IMAGE_CREDITS_COST=10
AI_IMAGE_ENABLE_STORAGE=true

# AI 视频生成配置
AI_VIDEO_SAVE_RECORD=true
AI_VIDEO_CONSUME_CREDITS=true
AI_VIDEO_CREDITS_COST=50
AI_VIDEO_ENABLE_STORAGE=true

# Tuzi API 配置
TUZI_BASE_URL=https://api.tu-zi.com

# Kling API 配置
KLING_BASE_URL=https://api.kling.ai
```

## 💡 最佳实践

### 1. 幂等性处理
```javascript
// 使用时间戳作为业务号确保幂等性
const bizNo = Date.now().toString();

// 或者使用更复杂的业务号
const bizNo = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
```

### 2. 错误重试机制
```javascript
async function generateImageWithRetry(params, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await fetch('/api/ai/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });

      const data = await result.json();

      if (data.success) {
        return data;
      } else if (data.error.includes('积分不足')) {
        throw new Error(data.error); // 积分不足不重试
      }

      if (i === maxRetries - 1) {
        throw new Error(data.error);
      }
    } catch (error) {
      if (i === maxRetries - 1) throw error;

      // 等待后重试（递增等待时间）
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}
```

### 3. 智能轮询
```javascript
async function smartPollOrderStatus(orderId) {
  const intervals = [1000, 2000, 3000, 5000]; // 递增间隔
  const maxAttempts = 20;

  for (let i = 0; i < maxAttempts; i++) {
    const response = await fetch(`/api/ai/order-status?orderId=${orderId}`);
    const result = await response.json();

    if (result.success) {
      const order = result.data;

      if (order.status === 'success' || order.status === 'failed') {
        return order;
      }
    }

    // 使用递增间隔
    const interval = intervals[Math.min(i, intervals.length - 1)];
    await new Promise(resolve => setTimeout(resolve, interval));
  }

  throw new Error('轮询超时');
}
```

### 4. 错误处理
```javascript
try {
  const result = await generateImage(params);
} catch (error) {
  if (error.message.includes('积分不足')) {
    // 跳转到充值页面
    window.location.href = '/pricing';
  } else if (error.message.includes('not authenticated')) {
    // 跳转到登录页面
    window.location.href = '/auth/signin';
  } else {
    // 显示通用错误
    console.error('生成失败:', error.message);
  }
}
```

## 🚀 快速开始

### 1. 基础配置 (5分钟)
```bash
# 1. 配置环境变量
OPENAI_API_KEY=sk-xxx
TUZI_API_KEY=your_key

# 2. 测试 API
curl -X POST http://localhost:3000/api/demo/gen-image \
  -H "Content-Type: application/json" \
  -d '{"prompt":"一只小猫","provider":"tuzi","model":"tuzi-general"}'
```

### 2. 前端集成 (10分钟)
```javascript
// 复制 useAIImageGeneration Hook
// 复制 ImageGenerator 组件
// 在页面中使用
```

### 3. 自定义配置 (15分钟)
```typescript
// 修改 config/ai-generation.ts
// 调整积分消耗
// 配置云存储
```

## 📞 技术支持

### 常见问题

**Q: 如何添加新的 AI 提供商？**
A: 参考"新增 AI 提供商"章节，实现提供商接口并注册。

**Q: 如何修改积分消耗？**
A: 修改 `config/ai-generation.ts` 中的 `creditsPerGeneration` 配置。

**Q: 如何处理生成失败？**
A: 检查订单状态，根据错误信息进行重试或提示用户。

**Q: 如何优化生成速度？**
A: 选择合适的提供商，使用缓存机制，实现智能轮询。

### 相关文档
- [开发指南](./development-guide.md) - 项目整体开发指南
- [部署指南](./deployment-guide.md) - 生产环境部署
- [API 参考](./api-reference.md) - 完整 API 文档

---

**🎯 总结**: 本指南涵盖了 AI 功能的完整开发流程，从基础使用到高级定制，帮助您快速集成和扩展 AI 功能。
