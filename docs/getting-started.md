# 快速开始指南

30分钟内完成第一个基于ShipAny V2的项目，从环境准备到运行验证的完整流程。

## 🎯 目标

完成本指南后，您将：
- ✅ 搭建完整的开发环境
- ✅ 创建并运行第一个项目
- ✅ 了解基本的配置和定制方法
- ✅ 掌握下一步的开发方向

## ⏱️ 时间安排

- **环境准备**: 5分钟
- **项目初始化**: 10分钟
- **基础配置**: 10分钟
- **运行验证**: 5分钟

## 🔧 环境准备 (5分钟)

### 必需软件
```bash
# 1. Node.js (推荐 18.17+)
node --version  # 检查版本

# 2. Git
git --version   # 检查版本

# 3. 代码编辑器 (推荐 VS Code)
```

### 账号准备
```bash
# 必需账号 (免费)
□ GitHub账号 (代码管理)
□ Vercel账号 (部署平台)
□ Supabase账号 (数据库)

# 可选账号 (后续配置)
□ Google账号 (OAuth登录)
□ Stripe账号 (支付功能)
□ OpenAI账号 (AI功能)
```

## 🚀 项目初始化 (10分钟)

### 1. 克隆项目
```bash
# 克隆ShipAny V2模板
git clone https://github.com/your-org/shipany-v2.git my-ai-project
cd my-ai-project

# 重新初始化Git
rm -rf .git
git init
git add .
git commit -m "Initial commit"
```

### 2. 安装依赖
```bash
# 安装项目依赖
npm install

# 验证安装
npm run build
```

### 3. 环境配置
```bash
# 复制环境变量模板
cp .env.example .env.local

# 编辑环境变量
# 暂时只需要配置基础变量，其他后续配置
```

## ⚙️ 基础配置 (10分钟)

### 1. 项目信息修改
```bash
# 修改 package.json
{
  "name": "my-ai-project",
  "description": "我的AI项目描述",
  "repository": "https://github.com/your-username/my-ai-project"
}
```

### 2. 基础环境变量
```bash
# .env.local 最小配置
NEXT_PUBLIC_SITE_NAME="我的AI项目"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
NEXT_PUBLIC_SITE_DESCRIPTION="我的AI项目描述"

# 数据库配置 (使用Supabase)
DATABASE_URL="your_supabase_database_url"
DIRECT_URL="your_supabase_direct_url"

# 认证配置 (临时使用测试密钥)
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. 数据库初始化
```bash
# 推送数据库结构到Supabase
npm run db:push

# 查看数据库 (可选)
npm run db:studio
```

## ✅ 运行验证 (5分钟)

### 1. 启动开发服务器
```bash
# 启动项目
npm run dev

# 访问 http://localhost:3000
# 应该看到ShipAny模板首页
```

### 2. 功能验证
```bash
# 验证清单
□ 首页正常显示
□ 页面样式正确加载
□ 导航菜单正常工作
□ 无控制台错误

# 基础功能测试
□ 用户注册/登录页面可访问
□ 定价页面正常显示
□ 管理后台可访问 (/admin)
```

### 3. 构建验证
```bash
# 验证生产构建
npm run build

# 应该看到构建成功信息
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
```

## 🎨 快速定制

### 1. 修改品牌信息
```typescript
// 修改网站标题和描述
// i18n/messages/zh.json
{
  "site": {
    "name": "我的AI项目",
    "description": "我的AI项目描述"
  }
}
```

### 2. 修改主色调
```css
/* app/theme.css */
:root {
  --primary: 你的主色调;
  --secondary: 你的辅助色;
}
```

### 3. 替换Logo
```bash
# 替换以下文件
public/logo.png          # 网站Logo
public/favicon.ico       # 网站图标
public/apple-touch-icon.png  # 苹果设备图标
```

## 🔍 常见问题快速解决

### 问题1: npm install 失败
```bash
# 解决方案
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 问题2: 数据库连接失败
```bash
# 检查环境变量
echo $DATABASE_URL

# 验证Supabase连接
npm run db:studio
```

### 问题3: 页面样式异常
```bash
# 清理缓存重新启动
rm -rf .next
npm run dev
```

### 问题4: TypeScript错误
```bash
# 检查类型
npm run type-check

# 重新生成类型
npm run db:generate
```

## 📚 下一步指引

### 新手开发者
1. **学习项目结构**: 阅读 [项目开发完整指南](./project-development-guide.md)
2. **了解功能配置**: 查看 [功能配置指南](./features-configuration.md)
3. **掌握内容创作**: 学习 [内容与SEO策略](./content-seo-strategy.md)

### 有经验开发者
1. **AI功能集成**: 查看 [AI服务集成指南](./ai-services-integration.md)
2. **API开发**: 参考 [API参考文档](./api-reference.md)
3. **生产部署**: 阅读 [部署指南](./deployment-guide.md)

### 内容创作者
1. **SEO优化**: 学习 [内容与SEO策略](./content-seo-strategy.md)
2. **页面定制**: 了解页面内容策略
3. **落地页优化**: 掌握转化优化技巧

## 🎯 推荐学习路径

### 路径1: AI工具网站
```
1. 完成快速开始 ✓
2. 配置AI服务 → ai-services-integration.md
3. 设计页面内容 → content-seo-strategy.md
4. 部署上线 → deployment-guide.md
```

### 路径2: SaaS产品
```
1. 完成快速开始 ✓
2. 配置支付系统 → features-configuration.md
3. 开发核心功能 → project-development-guide.md
4. 用户增长优化 → content-seo-strategy.md
```

### 路径3: 内容网站
```
1. 完成快速开始 ✓
2. SEO策略规划 → content-seo-strategy.md
3. 内容管理系统 → features-configuration.md
4. 流量变现 → project-development-guide.md
```

## 📞 获取帮助

### 遇到问题时
1. **查看故障排除**: [故障排除指南](./troubleshooting.md)
2. **检查API文档**: [API参考文档](./api-reference.md)
3. **社区支持**: GitHub Issues 或 Discord

### 反馈和建议
- **文档改进**: 提交 GitHub Issue
- **功能建议**: 参与社区讨论
- **Bug报告**: 使用 Issue 模板

## ✨ 恭喜！

您已经成功完成了ShipAny V2的快速开始！现在您有了一个完整可运行的AI项目基础，可以开始构建您的创意想法了。

**下一步建议**:
1. 根据您的项目类型选择对应的学习路径
2. 加入我们的开发者社区获取更多支持
3. 开始构建您的第一个功能模块

祝您开发愉快！🚀
