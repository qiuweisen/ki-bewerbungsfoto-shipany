# ShipAny V2

一个现代化的全栈模板，用于构建基于AI的应用程序，集成Next.js、TypeScript和前沿技术。

![preview](preview.png)

## 🚀 核心特性

- **Next.js 14** App Router + TypeScript
- **用户认证** NextAuth.js (Google, GitHub)
- **数据库** Prisma + Supabase
- **支付系统** Stripe 完整集成
- **UI组件** Tailwind CSS + Shadcn UI
- **国际化** next-intl 多语言支持
- **邮件服务** Resend 集成
- **AI集成** 支持 OpenAI、Anthropic、兔子API等
- **图片处理** 双套方案 (Cloudflare Images + 自托管)
- **积分系统** 地理位置策略 + 防薅羊毛
- **SEO优化** 元数据 + 网站地图生成
- **数据分析** Vercel Analytics + Google Analytics
- **错误监控** Sentry 集成
- **响应式设计** 移动端优先

## 🛠️ 技术栈

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **数据库**: Prisma + Supabase
- **认证**: NextAuth.js
- **支付**: Stripe
- **样式**: Tailwind CSS + Shadcn UI
- **邮件**: Resend
- **部署**: Vercel
- **分析**: Vercel Analytics + Google Analytics
- **监控**: Sentry

## 📚 文档导航

### 🚀 快速开始
- [**快速开始指南**](./docs/getting-started.md) - 30分钟完成第一个项目

### 📖 开发指南
- [**项目开发完整指南**](./docs/project-development-guide.md) - 完整开发流程
- [**内容与SEO策略**](./docs/content-seo-strategy.md) - 内容创作和SEO优化

### 🔧 技术集成
- [**AI服务集成指南**](./docs/ai-services-integration.md) - AI功能集成
- [**功能配置指南**](./docs/features-configuration.md) - 系统功能配置

### 📚 技术参考
- [**API参考文档**](./docs/api-reference.md) - 完整API文档
- [**部署指南**](./docs/deployment-guide.md) - 生产环境部署

### 🆘 问题解决
- [**故障排除指南**](./docs/troubleshooting.md) - 常见问题解决

## 📋 按使用场景导航

### 🆕 新手开发者
```
1. 快速开始指南 → 30分钟上手
2. 项目开发完整指南 → 学习完整流程
3. 故障排除指南 → 解决常见问题
```

### 🎨 内容创作者
```
1. 快速开始指南 → 基础环境
2. 内容与SEO策略 → 内容创作方法
3. 功能配置指南 → 系统配置
```

### 👨‍💻 技术开发者
```
1. AI服务集成指南 → AI功能开发
2. 功能配置指南 → 系统配置
3. API参考文档 → 技术细节
```

### 🚀 运维人员
```
1. 部署指南 → 生产环境部署
2. 故障排除指南 → 问题诊断
3. 功能配置指南 → 系统管理
```

## ⚡ 30秒快速开始

```bash
# 1. 克隆项目
git clone https://github.com/your-org/shipany-v2.git my-project
cd my-project

# 2. 安装依赖
npm install

# 3. 配置环境
cp .env.example .env.local
# 编辑 .env.local 配置基础变量

# 4. 初始化数据库
npm run db:push

# 5. 启动项目
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000) 查看效果！

## 🎯 项目类型快速模板

### AI工具网站
```bash
# 适合: AI图片生成、AI文案工具等
1. 完成快速开始 ✓
2. 配置AI服务 → ai-services-integration.md
3. 设计页面内容 → content-seo-strategy.md
4. 部署上线 → deployment-guide.md
```

### SaaS产品
```bash
# 适合: 在线工具、企业服务等
1. 完成快速开始 ✓
2. 配置支付系统 → features-configuration.md
3. 开发核心功能 → project-development-guide.md
4. 用户增长优化 → content-seo-strategy.md
```

### 内容网站
```bash
# 适合: 博客、资讯站、教程站等
1. 完成快速开始 ✓
2. SEO策略规划 → content-seo-strategy.md
3. 内容管理系统 → features-configuration.md
4. 流量变现 → project-development-guide.md
```

## 🔧 核心功能配置

### 必需环境变量
```bash
# 基础配置
NEXT_PUBLIC_SITE_NAME="你的项目名称"
NEXT_PUBLIC_SITE_URL="https://yourdomain.com"
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"

# 认证服务
GOOGLE_CLIENT_ID="your-google-client-id"
GITHUB_ID="your-github-id"

# 支付系统
STRIPE_SECRET_KEY="sk_live_..."
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_live_..."

# AI服务 (可选)
OPENAI_API_KEY="sk-..."
ANTHROPIC_API_KEY="sk-ant-..."
TUZI_API_KEY="your-tuzi-key"
```

### 功能开关
```bash
# 启用/禁用功能
FEATURE_AI_IMAGE_GENERATION="true"
FEATURE_STRIPE_PAYMENTS="true"
FEATURE_GEO_CREDITS="true"
CREDIT_STRATEGY="geolocation"
IMAGE_PROCESSING_PROVIDER="cloudflare"
```

## 🚀 部署选项

### Vercel (推荐)
```bash
1. 连接 GitHub 仓库到 Vercel
2. 在 Vercel 控制台配置环境变量
3. 自动部署 - Vercel 会自动构建和部署
```

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fyour-org%2Fshipany-v2&project-name=my-ai-project&repository-name=my-ai-project)

### 手动部署
```bash
# 构建项目
npm run build

# 启动生产服务器
npm start
```

## 📊 项目统计

- **🎯 开发效率**: 相比从零开始节省 80% 开发时间
- **🔧 功能完整**: 包含 20+ 核心功能模块
- **📱 响应式**: 支持所有主流设备和浏览器
- **🌍 国际化**: 支持多语言和地区定制
- **⚡ 性能**: Lighthouse 评分 90+ 分
- **🔒 安全**: 企业级安全标准

## 🤝 社区和支持

### 获取帮助
- **📖 文档**: 查看完整的技术文档
- **🐛 问题报告**: GitHub Issues
- **💬 社区讨论**: Discord 频道
- **📧 技术支持**: support@shipany.com

### 贡献指南
我们欢迎社区贡献！请查看 [贡献指南](./CONTRIBUTING.md) 了解详情。

### 更新日志
查看 [CHANGELOG.md](./CHANGELOG.md) 了解最新更新和改进。

## 📄 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](./LICENSE) 文件了解详情。

## 🙏 致谢

感谢以下开源项目和服务：
- [Next.js](https://nextjs.org/) - 强大的React框架
- [Vercel](https://vercel.com/) - 优秀的部署平台
- [Supabase](https://supabase.com/) - 现代化数据库服务
- [Stripe](https://stripe.com/) - 专业的支付处理
- 所有为开源社区做出贡献的开发者们

---

**开始构建您的下一个AI项目吧！** 🚀
