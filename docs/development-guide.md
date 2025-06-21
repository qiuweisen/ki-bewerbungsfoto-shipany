# ShipAny 模板开发指南

## 项目概述

ShipAny 是一个基于 Next.js 的 AI SaaS 应用模板，集成了用户认证、支付、AI 服务、国际化等完整功能。本指南将帮助你了解如何基于此模板开发新的 AI 站点服务。

## 核心功能架构

### 1. 技术栈
- **前端框架**: Next.js 15 + TypeScript + App Router
- **样式**: Tailwind CSS + Shadcn UI
- **认证**: NextAuth.js (支持 Google、GitHub)
- **数据库**: Supabase (PostgreSQL)
- **支付**: Stripe
- **AI 服务**: AI SDK (支持 OpenAI、Replicate、Kling)
- **国际化**: next-intl
- **存储**: AWS S3 兼容服务
- **分析**: Google Analytics、OpenPanel、Plausible

### 2. 项目结构
```
├── app/                    # Next.js App Router
│   ├── [locale]/          # 国际化页面
│   ├── api/               # API 路由
│   └── globals.css        # 全局样式
├── aisdk/                 # AI 服务 SDK
│   ├── generate-video/    # 视频生成
│   └── kling/            # Kling AI 集成
├── components/            # React 组件
│   ├── blocks/           # 布局组件
│   ├── ui/               # UI 组件
│   └── ...
├── models/               # 数据模型
├── services/             # 业务逻辑
├── i18n/                # 国际化配置
├── types/               # TypeScript 类型定义
└── data/install.sql     # 数据库初始化脚本
```

## 快速开始新项目

### 第一步：项目初始化

1. **克隆项目**
```bash
git clone https://github.com/shipanyai/shipany-template-one.git your-project-name
cd your-project-name
```

2. **安装依赖**
```bash
pnpm install
```

3. **配置环境变量**
```bash
cp .env.example .env.local
```

### 第二步：数据库配置

1. **申请 Supabase 账号**
   - 访问 [Supabase](https://supabase.com)
   - 创建新项目
   - 获取项目 URL 和 API Keys

2. **配置数据库连接**
   在 `.env.local` 中设置：
```env
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

3. **初始化数据库表**
   - 在 Supabase Dashboard 的 SQL Editor 中执行 `data/install.sql`
   - 或使用 Supabase CLI：
```bash
supabase db reset
```

### 第三步：认证配置

1. **配置 Google OAuth**
   - 访问 [Google Cloud Console](https://console.cloud.google.com)
   - 创建 OAuth 2.0 客户端 ID
   - 设置重定向 URI: `{your-domain}/api/auth/callback/google`

2. **配置 GitHub OAuth**
   - 访问 GitHub Settings > Developer settings > OAuth Apps
   - 创建新的 OAuth App
   - 设置 Authorization callback URL: `{your-domain}/api/auth/callback/github`

3. **更新环境变量**
```env
AUTH_SECRET="your-auth-secret"
AUTH_GOOGLE_ID="your-google-client-id"
AUTH_GOOGLE_SECRET="your-google-client-secret"
AUTH_GITHUB_ID="your-github-client-id"
AUTH_GITHUB_SECRET="your-github-client-secret"
```

### 第四步：支付配置

1. **申请 Stripe 账号**
   - 访问 [Stripe](https://stripe.com)
   - 获取 API Keys

2. **配置 Stripe**
```env
STRIPE_PUBLIC_KEY="pk_test_..."
STRIPE_PRIVATE_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
```

3. **设置 Webhook**
   - 在 Stripe Dashboard 中创建 Webhook
   - 端点 URL: `{your-domain}/api/stripe-notify`
   - 选择事件: `checkout.session.completed`, `invoice.payment_succeeded`

### 第五步：存储配置

配置 S3 兼容存储服务（如 AWS S3、阿里云 OSS、腾讯云 COS）：
```env
STORAGE_ENDPOINT="your-storage-endpoint"
STORAGE_REGION="your-region"
STORAGE_ACCESS_KEY="your-access-key"
STORAGE_SECRET_KEY="your-secret-key"
STORAGE_BUCKET="your-bucket-name"
STORAGE_DOMAIN="your-cdn-domain"
```

## 自定义开发

### 1. 修改落地页

落地页内容配置位于 `i18n/pages/landing/` 目录：

- `i18n/pages/landing/zh.json` - 中文内容
- `i18n/pages/landing/en.json` - 英文内容

主要配置项：
```json
{
  "hero": {
    "title": "你的产品标题",
    "description": "产品描述",
    "cta": "立即开始"
  },
  "features": [...],
  "pricing": [...],
  "faq": [...]
}
```

### 2. 主题自定义

在 `app/theme.css` 中自定义主题颜色：
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  /* ... */
}
```

推荐使用 [Shadcn UI Theme Generator](https://zippystarter.com/tools/shadcn-ui-theme-generator)

### 3. 新增 AI 接口

#### 文生图接口示例

参考 `app/api/demo/gen-image/route.ts`，支持的提供商：
- OpenAI (DALL-E)
- Replicate
- Kling

#### 新增文生视频接口

1. **创建 API 路由**
```typescript
// app/api/generate-video/route.ts
import { generateVideo } from "@/aisdk";

export async function POST(req: Request) {
  const { prompt, provider, model } = await req.json();
  
  const result = await generateVideo({
    model: provider.video(model),
    prompt,
  });
  
  return Response.json(result);
}
```

2. **添加前端组件**
```typescript
// components/video-generator.tsx
export function VideoGenerator() {
  const [prompt, setPrompt] = useState("");
  
  const handleGenerate = async () => {
    const response = await fetch("/api/generate-video", {
      method: "POST",
      body: JSON.stringify({ prompt, provider: "kling", model: "kling-v1" }),
    });
    // 处理响应
  };
  
  return (
    // UI 组件
  );
}
```

### 4. 数据库扩展

如需新增表结构，在 `data/install.sql` 中添加：
```sql
CREATE TABLE your_new_table (
    id SERIAL PRIMARY KEY,
    created_at timestamptz,
    -- 其他字段
);
```

对应的模型文件：
```typescript
// models/your-model.ts
export interface YourModel {
  id: number;
  created_at: string;
  // 其他字段
}
```

### 5. 业务逻辑服务

在 `services/` 目录下创建业务逻辑：
```typescript
// services/your-service.ts
export class YourService {
  static async create(data: any) {
    // 业务逻辑
  }
  
  static async findById(id: string) {
    // 查询逻辑
  }
}
```

## 测试与部署

### 1. 本地测试

```bash
# 启动开发服务器
pnpm dev

# 测试支付流程
# 使用 Stripe 测试卡号: 4242 4242 4242 4242

# 测试 AI 接口
# 访问 /api/demo/gen-image 进行测试
```

### 2. 部署到 Vercel

```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 3. 部署到 Cloudflare

```bash
# 配置环境变量
cp .env.example .env.production
cp wrangler.toml.example wrangler.toml

# 部署
npm run cf:deploy
```

## 常见问题

### Q: 如何添加新的 AI 提供商？
A: 在 `aisdk/` 目录下创建新的提供商实现，参考 `aisdk/kling/` 的结构。

### Q: 如何修改支付计划？
A: 在 Stripe Dashboard 中创建产品和价格，然后在落地页配置中更新价格 ID。

### Q: 如何添加新的认证提供商？
A: 在 `auth/config.ts` 中添加新的提供商配置。

### Q: 数据库迁移如何处理？
A: 使用 Supabase 的迁移功能或直接在 SQL Editor 中执行 DDL 语句。

## 高级功能开发

### 1. 积分系统

项目内置了完整的积分系统，支持：
- 用户注册赠送积分
- 购买套餐获得积分
- 使用 AI 功能消耗积分
- 邀请用户获得积分

#### 积分操作示例
```typescript
import { CreditService } from "@/services/credit";

// 消耗积分
await CreditService.consume({
  userUuid: "user-uuid",
  credits: 10,
  transType: "ai_generation"
});

// 赠送积分
await CreditService.reward({
  userUuid: "user-uuid",
  credits: 100,
  transType: "signup_bonus"
});
```

### 2. API Key 管理

支持用户生成和管理 API Key：
```typescript
import { ApiKeyService } from "@/services/apikey";

// 创建 API Key
const apiKey = await ApiKeyService.create({
  userUuid: "user-uuid",
  title: "My API Key"
});

// 验证 API Key
const isValid = await ApiKeyService.verify(apiKey);
```

### 3. 分销系统

内置分销功能，支持邀请码和佣金分成：
```typescript
import { AffiliateService } from "@/services/affiliate";

// 处理分销奖励
await AffiliateService.processReward({
  inviteCode: "ABC123",
  orderNo: "order-123",
  amount: 9900 // 分
});
```

### 4. 用户反馈系统

收集用户反馈和评分：
```typescript
// app/api/add-feedback/route.ts
export async function POST(req: Request) {
  const { content, rating } = await req.json();

  await FeedbackService.create({
    userUuid: session.user.uuid,
    content,
    rating
  });
}
```

## 开发最佳实践

### 1. 错误处理

使用统一的响应格式：
```typescript
import { respData, respErr } from "@/lib/resp";

// 成功响应
return respData({ message: "操作成功" });

// 错误响应
return respErr("操作失败");
```

### 2. 数据验证

使用 Zod 进行数据验证：
```typescript
import { z } from "zod";

const schema = z.object({
  prompt: z.string().min(1).max(1000),
  model: z.string(),
});

const { prompt, model } = schema.parse(await req.json());
```

### 3. 缓存策略

使用内置缓存工具：
```typescript
import { cache } from "@/lib/cache";

// 设置缓存
await cache.set("key", data, 3600); // 1小时

// 获取缓存
const data = await cache.get("key");
```

### 4. 国际化开发

添加新的语言支持：
```typescript
// i18n/messages/zh.json
{
  "common": {
    "save": "保存",
    "cancel": "取消"
  }
}

// 组件中使用
import { useTranslations } from "next-intl";

export function MyComponent() {
  const t = useTranslations("common");

  return <button>{t("save")}</button>;
}
```

## 性能优化

### 1. 图片优化

使用 Next.js Image 组件：
```typescript
import Image from "next/image";

<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority
/>
```

### 2. 代码分割

使用动态导入：
```typescript
import dynamic from "next/dynamic";

const HeavyComponent = dynamic(() => import("./HeavyComponent"), {
  loading: () => <p>Loading...</p>,
});
```

### 3. 数据库查询优化

使用索引和合理的查询：
```sql
-- 为常用查询字段添加索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_user_uuid ON orders(user_uuid);
```

## 安全考虑

### 1. API 安全

- 使用 API Key 验证
- 实现速率限制
- 验证用户权限

```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  // 验证 API Key
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) {
    return new Response("Unauthorized", { status: 401 });
  }
}
```

### 2. 数据验证

- 严格验证输入数据
- 防止 SQL 注入
- 过滤敏感信息

### 3. 环境变量安全

- 不要在客户端暴露敏感信息
- 使用 `NEXT_PUBLIC_` 前缀的变量会暴露给客户端

## 监控与分析

### 1. 错误监控

集成错误监控服务：
```typescript
// 在 API 路由中添加错误捕获
try {
  // 业务逻辑
} catch (error) {
  console.error("API Error:", error);
  // 发送到监控服务
}
```

### 2. 性能监控

使用 Next.js 内置的性能监控：
```typescript
// next.config.mjs
export default {
  experimental: {
    instrumentationHook: true,
  },
};
```

### 3. 用户行为分析

已集成多种分析工具：
- Google Analytics
- OpenPanel
- Plausible

## 下一步

1. 根据你的具体需求修改落地页内容
2. 配置所需的第三方服务
3. 开发你的核心 AI 功能
4. 测试完整的用户流程
5. 部署到生产环境

更多详细信息请参考：
- [官方文档](https://docs.shipany.ai/zh)
- [自定义落地页教程](https://docs.shipany.ai/zh/tutorials/customize-landing-page)
- [更新日志](https://docs.shipany.ai/zh/what-is-new)
