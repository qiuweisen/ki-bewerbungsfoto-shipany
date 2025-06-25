# 功能模块快速映射

快速查找功能对应的文件位置，方便开发和维护。

## 📊 核心功能映射

| 功能模块 | 数据表 | 模型文件 | 服务文件 | API 路由 | 前端页面 |
|---------|--------|----------|----------|----------|----------|
| 用户系统 | `users` | `models/user.ts` | `services/user.ts` | `/api/get-user-info/` | `/auth/signin` |
| 订单系统 | `orders` | `models/order.ts` | `services/order.ts` | `/api/checkout/` | `/my-orders` |
| 积分系统 | `credits` | `models/credit.ts` | `services/credit.ts` | `/api/get-user-credits/` | `/my-credits` |
| AI生成 | `ai_generation_orders` | `models/ai-generation-record.ts` | `services/ai-generation-service.ts` | `/api/ai/generate-image/` | - |
| API密钥 | `apikeys` | `models/apikey.ts` | `services/apikey.ts` | - | `/api-keys` |
| 推广联盟 | `affiliates` | `models/affiliate.ts` | `services/affiliate.ts` | `/api/update-invite/` | `/my-invites` |
| 博客文章 | `posts` | `models/post.ts` | `services/page.ts` | - | `/posts` |
| 用户反馈 | `feedbacks` | `models/feedback.ts` | - | `/api/add-feedback/` | `/admin/feedbacks` |

## 🎨 页面路由映射

### 公开页面
| 页面 | 路由 | 文件路径 |
|------|------|----------|
| 首页 | `/` | `app/[locale]/(default)/page.tsx` |
| 定价页 | `/pricing` | `app/[locale]/(default)/pricing/page.tsx` |
| 博客列表 | `/posts` | `app/[locale]/(default)/posts/page.tsx` |
| 博客详情 | `/posts/[slug]` | `app/[locale]/(default)/posts/[slug]/page.tsx` |
| 登录页 | `/auth/signin` | `app/[locale]/auth/signin/page.tsx` |

### 用户控制台
| 页面 | 路由 | 文件路径 |
|------|------|----------|
| 我的订单 | `/my-orders` | `app/[locale]/(default)/(console)/my-orders/page.tsx` |
| 我的积分 | `/my-credits` | `app/[locale]/(default)/(console)/my-credits/page.tsx` |
| API密钥 | `/api-keys` | `app/[locale]/(default)/(console)/api-keys/page.tsx` |
| 我的邀请 | `/my-invites` | `app/[locale]/(default)/(console)/my-invites/page.tsx` |

### 管理后台
| 页面 | 路由 | 文件路径 |
|------|------|----------|
| 管理首页 | `/admin` | `app/[locale]/(admin)/admin/page.tsx` |
| 用户管理 | `/admin/users` | `app/[locale]/(admin)/admin/users/page.tsx` |
| 订单管理 | `/admin/orders` | `app/[locale]/(admin)/admin/orders/page.tsx` |
| 文章管理 | `/admin/posts` | `app/[locale]/(admin)/admin/posts/page.tsx` |
| 反馈管理 | `/admin/feedbacks` | `app/[locale]/(admin)/admin/feedbacks/page.tsx` |

## 🧩 组件映射

### 布局组件
| 组件 | 文件路径 | 用途 |
|------|----------|------|
| Header | `components/blocks/header/` | 网站头部导航 |
| Footer | `components/blocks/footer/` | 网站底部 |
| Hero | `components/blocks/hero/` | 首页英雄区域 |
| Pricing | `components/blocks/pricing/` | 定价表格 |
| FAQ | `components/blocks/faq/` | 常见问题 |

### 功能组件
| 组件 | 文件路径 | 用途 |
|------|----------|------|
| SignIn | `components/sign/` | 登录组件 |
| UserInfo | `components/sign/user.tsx` | 用户信息显示 |
| ThemeToggle | `components/theme/toggle.tsx` | 主题切换 |
| LocaleToggle | `components/locale/toggle.tsx` | 语言切换 |
| Feedback | `components/feedback/` | 反馈组件 |

### AI 组件
| 组件 | 文件路径 | 用途 |
|------|----------|------|
| TuziImageGenerator | `components/ai/tuzi-image-generator.tsx` | Tuzi图片生成 |

## ⚙️ 配置文件映射

| 配置类型 | 文件路径 | 用途 |
|---------|----------|------|
| 认证配置 | `auth/config.ts` | NextAuth.js 配置 |
| AI配置 | `config/ai-generation.ts` | AI生成服务配置 |
| 国际化路由 | `i18n/routing.ts` | 路由国际化配置 |
| 中文消息 | `i18n/messages/zh.json` | 中文翻译 |
| 英文消息 | `i18n/messages/en.json` | 英文翻译 |
| 落地页内容 | `i18n/pages/landing/` | 落地页多语言内容 |

## 🤖 AI SDK 映射

| AI提供商 | 目录路径 | 主要文件 | 支持功能 |
|---------|----------|----------|----------|
| OpenAI | `@ai-sdk/openai` | - | 图片生成 (DALL-E) |
| Tuzi | `aisdk/tuzi/` | `tuzi-provider.ts` | 图片生成 |
| Kling | `aisdk/kling/` | `kling-provider.ts` | 图片生成、视频生成 |
| Replicate | `@ai-sdk/replicate` | - | 图片生成 (Stable Diffusion) |

## 🛠️ 工具函数映射

| 功能 | 文件路径 | 主要函数 |
|------|----------|----------|
| 响应格式 | `lib/resp.ts` | `respData()`, `respErr()` |
| 时间处理 | `lib/time.ts` | `getIsoTimestr()` |
| 哈希生成 | `lib/hash.ts` | `getUuid()` |
| IP获取 | `lib/ip.ts` | `getClientIp()` |
| 存储服务 | `lib/storage.ts` | `newStorage()` |
| 样式工具 | `lib/utils.ts` | `cn()` |

## 📱 移动端适配

| 功能 | 文件路径 | 说明 |
|------|----------|------|
| 移动端检测 | `hooks/use-mobile.ts` | 检测移动端设备 |
| 媒体查询 | `hooks/useMediaQuery.tsx` | 响应式媒体查询 |
| 抽屉组件 | `components/ui/drawer.tsx` | 移动端抽屉 |

## 🌍 国际化映射

| 语言 | 消息文件 | 页面内容 |
|------|----------|----------|
| 中文 | `i18n/messages/zh.json` | `i18n/pages/landing/zh.json` |
| 英文 | `i18n/messages/en.json` | `i18n/pages/landing/en.json` |

## 🚀 部署配置

| 平台 | 配置文件 | 说明 |
|------|----------|------|
| Vercel | `vercel.json` | Vercel 部署配置 |
| Cloudflare | `wrangler.toml.example` | Cloudflare Pages 配置 |
| Docker | `Dockerfile` | 容器化部署 |

## 📋 环境变量分类

### 必需配置
```bash
# 数据库
NEXT_PUBLIC_SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

# 认证
NEXTAUTH_SECRET=
NEXTAUTH_URL=

# 支付
STRIPE_SECRET_KEY=
```

### AI 服务
```bash
OPENAI_API_KEY=
TUZI_API_KEY=
KLING_API_KEY=
```

### 云存储
```bash
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_S3_BUCKET=
```

### 第三方登录
```bash
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
```

## 🔍 快速查找指南

### 要修改用户相关功能
1. 数据模型: `models/user.ts`
2. 业务逻辑: `services/user.ts`
3. 认证配置: `auth/config.ts`
4. 用户页面: `app/[locale]/(default)/(console)/`

### 要修改 AI 功能
1. AI 配置: `config/ai-generation.ts`
2. 业务逻辑: `services/ai-generation-service.ts`
3. 数据模型: `models/ai-generation-record.ts`
4. API 接口: `app/api/ai/`
5. AI SDK: `aisdk/`

### 要修改支付功能
1. 数据模型: `models/order.ts`, `models/credit.ts`
2. 业务逻辑: `services/order.ts`, `services/credit.ts`
3. API 接口: `app/api/checkout/`
4. 用户页面: `app/[locale]/(default)/(console)/my-orders/`

### 要修改页面内容
1. 页面组件: `app/[locale]/(default)/`
2. 布局组件: `components/blocks/`
3. 国际化文本: `i18n/messages/`, `i18n/pages/`

### 要添加新功能
1. 创建数据表: 修改 `data/install.sql`
2. 创建数据模型: `models/your-model.ts`
3. 创建业务逻辑: `services/your-service.ts`
4. 创建 API 接口: `app/api/your-endpoint/`
5. 创建前端页面: `app/[locale]/(default)/your-page/`
6. 添加类型定义: `types/your-types.ts`

## 💡 开发提示

1. **遵循现有结构**: 新功能按照现有的分层架构开发
2. **复用组件**: 优先使用 `components/ui/` 中的基础组件
3. **国际化**: 所有文本都要添加到国际化文件中
4. **类型安全**: 为新功能添加 TypeScript 类型定义
5. **错误处理**: 使用统一的错误响应格式
6. **测试**: 在开发和生产环境都要测试功能

---

**🎯 使用建议**: 
- 开发新功能时，先查看相似功能的实现方式
- 修改现有功能时，确保不破坏其他相关功能
- 添加新的环境变量时，记得更新文档
