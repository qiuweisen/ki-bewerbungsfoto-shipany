# ShipAny 模板文档中心

欢迎使用 ShipAny AI SaaS 模板！本文档中心将帮助你快速了解和使用这个强大的 AI 应用开发模板。

## 📚 文档导航

### [🚀 开发指南](./development-guide.md)
**适合人群**: 新手开发者、项目负责人  
**内容概览**: 
- 项目架构详解
- 快速开始新项目
- 数据库配置
- 认证系统设置
- 支付系统集成
- 自定义开发指南

**关键章节**:
- 第一步：项目初始化
- 第二步：数据库配置  
- 第三步：认证配置
- 第四步：支付配置
- 自定义落地页
- 主题自定义

### [🤖 AI 接口集成指南](./ai-integration-guide.md)
**适合人群**: AI 开发者、技术架构师  
**内容概览**:
- AI SDK 架构设计
- 文生图服务集成
- 文生视频功能开发
- 新增 AI 提供商
- 前端组件开发
- 积分系统集成

**关键章节**:
- 新增文生图提供商
- 新增文生视频功能
- 前端组件开发
- 积分消耗集成
- 性能优化

### [🚢 部署与运维指南](./deployment-guide.md)
**适合人群**: 运维工程师、DevOps  
**内容概览**:
- 多平台部署方案
- 生产环境配置
- 监控与日志
- 安全配置
- 性能优化
- 故障排查

**关键章节**:
- Vercel 部署
- Cloudflare Pages 部署
- Docker 自托管部署
- 监控与日志
- 安全配置

## 🎯 快速开始

### 1. 选择你的角色

**🆕 我是新手开发者**
1. 先阅读 [开发指南](./development-guide.md) 的"快速开始新项目"部分
2. 按照步骤配置基础服务（数据库、认证、支付）
3. 自定义落地页内容
4. 部署到 Vercel 进行测试

**🤖 我要开发 AI 功能**
1. 阅读 [开发指南](./development-guide.md) 了解项目架构
2. 深入学习 [AI 接口集成指南](./ai-integration-guide.md)
3. 选择合适的 AI 服务提供商
4. 开发自定义 AI 功能

**🚀 我要部署到生产环境**
1. 完成开发和测试
2. 阅读 [部署与运维指南](./deployment-guide.md)
3. 选择合适的部署平台
4. 配置监控和备份

### 2. 核心配置清单

在开始开发前，确保完成以下配置：

#### 必需服务
- [ ] **Supabase**: 数据库服务
- [ ] **NextAuth**: 用户认证
- [ ] **Stripe**: 支付处理

#### 可选服务
- [ ] **Google OAuth**: Google 登录
- [ ] **GitHub OAuth**: GitHub 登录
- [ ] **AWS S3**: 文件存储
- [ ] **Google Analytics**: 网站分析

#### AI 服务（按需选择）
- [ ] **OpenAI**: GPT 和 DALL-E
- [ ] **Replicate**: 开源 AI 模型
- [ ] **Kling**: 国产 AI 服务

## 🏗️ 项目架构概览

```
ShipAny 模板架构
├── 前端层 (Next.js + React)
│   ├── 落地页 (营销页面)
│   ├── 用户控制台 (功能界面)
│   └── 管理后台 (数据管理)
│
├── API 层 (Next.js API Routes)
│   ├── 用户认证 (/api/auth)
│   ├── 支付处理 (/api/checkout)
│   ├── AI 服务 (/api/demo)
│   └── 数据操作 (/api/*)
│
├── 业务逻辑层
│   ├── 用户管理 (services/user.ts)
│   ├── 订单处理 (services/order.ts)
│   ├── 积分系统 (services/credit.ts)
│   └── AI 集成 (aisdk/*)
│
├── 数据层
│   ├── 用户数据 (users 表)
│   ├── 订单数据 (orders 表)
│   ├── 积分记录 (credits 表)
│   └── 反馈数据 (feedbacks 表)
│
└── 外部服务
    ├── Supabase (数据库)
    ├── Stripe (支付)
    ├── AI 服务商 (OpenAI/Kling/等)
    └── 存储服务 (S3/OSS/等)
```

## 🛠️ 技术栈详解

### 核心框架
- **Next.js 15**: React 全栈框架，支持 App Router
- **TypeScript**: 类型安全的 JavaScript
- **Tailwind CSS**: 实用优先的 CSS 框架
- **Shadcn UI**: 高质量的 React 组件库

### 数据与认证
- **Supabase**: PostgreSQL 数据库即服务
- **NextAuth.js**: 灵活的认证解决方案
- **Zod**: TypeScript 优先的数据验证

### AI 与支付
- **Vercel AI SDK**: 统一的 AI 接口
- **Stripe**: 全球支付处理平台
- **多 AI 提供商**: OpenAI、Replicate、Kling 等

### 开发工具
- **ESLint**: 代码质量检查
- **Prettier**: 代码格式化
- **Husky**: Git 钩子管理

## 📋 开发流程

### 1. 项目初始化 (1-2 小时)
```bash
git clone https://github.com/shipanyai/shipany-template-one.git
cd shipany-template-one
pnpm install
cp .env.example .env.local
```

### 2. 基础配置 (2-4 小时)
- 配置 Supabase 数据库
- 设置用户认证（Google/GitHub）
- 配置 Stripe 支付
- 测试基础功能

### 3. 内容自定义 (1-3 小时)
- 修改落地页内容
- 自定义主题颜色
- 配置多语言支持
- 添加自定义页面

### 4. AI 功能开发 (4-8 小时)
- 选择 AI 服务提供商
- 开发 AI 接口
- 创建前端组件
- 集成积分系统

### 5. 测试与优化 (2-4 小时)
- 功能测试
- 性能优化
- 安全检查
- 用户体验优化

### 6. 部署上线 (1-2 小时)
- 选择部署平台
- 配置生产环境
- 设置监控告警
- 域名和 SSL 配置

## 🎨 自定义指南

### 品牌定制
1. **Logo 和图标**: 替换 `public/logo.png` 和 `public/favicon.ico`
2. **主题颜色**: 修改 `app/theme.css` 中的 CSS 变量
3. **字体**: 在 `app/layout.tsx` 中配置自定义字体

### 内容定制
1. **落地页**: 编辑 `i18n/pages/landing/` 中的 JSON 文件
2. **导航菜单**: 修改 `components/blocks/header.tsx`
3. **页脚信息**: 编辑 `components/blocks/footer.tsx`

### 功能定制
1. **支付计划**: 在 Stripe 中创建产品，更新落地页配置
2. **AI 功能**: 参考 AI 集成指南添加新功能
3. **用户权限**: 修改认证逻辑和权限检查

## 🔧 常见问题

### Q: 如何添加新的页面？
A: 在 `app/[locale]/` 目录下创建新的页面文件，参考现有页面结构。

### Q: 如何修改数据库结构？
A: 在 `data/install.sql` 中添加新的表结构，在 `models/` 中创建对应的 TypeScript 类型。

### Q: 如何集成新的支付方式？
A: 参考 Stripe 集成方式，在 `app/api/checkout/` 中添加新的支付处理逻辑。

### Q: 如何添加新的语言支持？
A: 在 `i18n/messages/` 中添加新语言的 JSON 文件，更新 `i18n/routing.ts` 配置。

### Q: 如何优化 AI 接口性能？
A: 参考 AI 集成指南中的性能优化章节，实施缓存、队列和重试机制。

## 📞 获取帮助

### 官方资源
- [官方文档](https://docs.shipany.ai/zh)
- [GitHub 仓库](https://github.com/shipanyai/shipany-template-one)
- [Discord 社区](https://discord.gg/HQNnrzjZQS)

### 技术支持
- 查看 GitHub Issues
- 在 Discord 中提问
- 参考官方示例项目

### 商业支持
- 定制开发服务
- 技术咨询服务
- 部署运维支持

---

**开始你的 AI SaaS 之旅吧！** 🚀

选择适合你的文档开始阅读，如有问题随时在社区中寻求帮助。祝你开发顺利！
