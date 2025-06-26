# 故障排除指南

常见问题的快速诊断和解决方案，帮助您快速解决开发和部署过程中遇到的问题。

## 🔍 快速诊断流程

### 问题分类
1. **环境配置问题**: 环境变量、依赖安装、数据库连接
2. **开发时问题**: 编译错误、类型错误、运行时错误
3. **功能问题**: AI服务、支付系统、图片处理
4. **部署问题**: 构建失败、运行时错误、性能问题
5. **用户体验问题**: 页面加载、功能异常、数据同步

### 诊断步骤
```bash
# 1. 检查基础环境
node --version  # 确保 Node.js 18.17+
npm --version   # 确保 npm 正常

# 2. 检查项目状态
npm run type-check  # TypeScript 类型检查
npm run lint       # 代码规范检查
npm run build      # 构建检查

# 3. 检查服务状态
npm run db:studio  # 数据库连接检查
curl http://localhost:3000/api/ping  # API 服务检查
```

## 🔧 环境配置问题

### 问题1: npm install 失败
```bash
# 症状
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree

# 解决方案
# 方案1: 清理缓存重新安装
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# 方案2: 使用 --legacy-peer-deps
npm install --legacy-peer-deps

# 方案3: 使用 yarn 替代
npm install -g yarn
yarn install
```

### 问题2: 环境变量未生效
```bash
# 症状
Error: Environment variable not found

# 检查步骤
# 1. 确认文件名正确
ls -la .env*  # 应该看到 .env.local

# 2. 确认变量格式
cat .env.local | grep "VARIABLE_NAME"

# 3. 重启开发服务器
npm run dev

# 解决方案
# 确保环境变量格式正确
NEXT_PUBLIC_SITE_NAME="Your Site Name"  # ✓ 正确
NEXT_PUBLIC_SITE_NAME=Your Site Name    # ✗ 错误 (缺少引号)
```

### 问题3: 数据库连接失败
```bash
# 症状
Error: Can't reach database server

# 检查步骤
# 1. 验证数据库URL
echo $DATABASE_URL

# 2. 测试数据库连接
npm run db:studio

# 3. 检查数据库状态
npx prisma db push

# 解决方案
# 1. 确认 Supabase 项目状态
# 2. 检查网络连接
# 3. 验证数据库凭据
# 4. 重新生成数据库URL
```

## 💻 开发时问题

### 问题4: TypeScript 编译错误
```bash
# 症状
Type error: Property 'xxx' does not exist on type 'yyy'

# 解决方案
# 1. 重新生成类型
npm run db:generate

# 2. 检查类型定义
npm run type-check

# 3. 清理 TypeScript 缓存
rm -rf .next
npm run dev

# 4. 更新类型定义
npm install @types/node@latest
```

### 问题5: 页面样式异常
```bash
# 症状
页面样式不正确或缺失

# 解决方案
# 1. 清理构建缓存
rm -rf .next
npm run dev

# 2. 检查 Tailwind 配置
npx tailwindcss -i ./app/globals.css -o ./dist/output.css --watch

# 3. 验证 CSS 导入
# 确保在 app/layout.tsx 中导入了样式文件
import './globals.css'

# 4. 检查 PostCSS 配置
cat postcss.config.js
```

### 问题6: 热重载不工作
```bash
# 症状
修改代码后页面不自动刷新

# 解决方案
# 1. 重启开发服务器
npm run dev

# 2. 检查文件监听
# 在 next.config.js 中添加
module.exports = {
  webpack: (config) => {
    config.watchOptions = {
      poll: 1000,
      aggregateTimeout: 300,
    }
    return config
  },
}

# 3. 检查防火墙设置
# 确保端口 3000 未被阻止
```

## 🤖 功能问题

### 问题7: AI服务调用失败
```bash
# 症状
AI generation failed: API key invalid

# 检查步骤
# 1. 验证 API 密钥
echo $OPENAI_API_KEY
echo $ANTHROPIC_API_KEY

# 2. 测试 API 连接
curl -H "Authorization: Bearer $OPENAI_API_KEY" \
  https://api.openai.com/v1/models

# 3. 检查配额和限制
# 登录对应的 AI 服务控制台检查使用情况

# 解决方案
# 1. 重新生成 API 密钥
# 2. 检查账户余额
# 3. 验证 API 权限
# 4. 配置备用提供商
```

### 问题8: 支付功能异常
```bash
# 症状
Payment processing failed

# 检查步骤
# 1. 验证 Stripe 配置
echo $STRIPE_SECRET_KEY
echo $NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

# 2. 检查 Webhook 配置
curl -X POST http://localhost:3000/api/stripe-notify \
  -H "Content-Type: application/json" \
  -d '{"type": "test"}'

# 3. 查看 Stripe 日志
# 在 Stripe Dashboard 中查看事件日志

# 解决方案
# 1. 重新配置 Webhook URL
# 2. 验证 Webhook 签名
# 3. 检查测试/生产环境密钥
# 4. 确认产品和价格配置
```

### 问题9: 图片上传失败
```bash
# 症状
Image upload failed: 413 Request Entity Too Large

# 解决方案
# 1. 检查文件大小限制
# 在 next.config.js 中配置
module.exports = {
  experimental: {
    serverComponentsExternalPackages: [],
  },
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
}

# 2. 检查 Cloudflare 配置
echo $CLOUDFLARE_ACCOUNT_ID
echo $CLOUDFLARE_API_TOKEN

# 3. 验证图片格式
# 确保支持的格式: jpg, jpeg, png, webp, gif
```

## 🚀 部署问题

### 问题10: Vercel 部署失败
```bash
# 症状
Build failed with exit code 1

# 解决方案
# 1. 检查构建日志
vercel logs

# 2. 本地构建测试
npm run build

# 3. 检查环境变量
# 在 Vercel Dashboard 中确认所有环境变量已配置

# 4. 检查依赖版本
npm audit
npm update

# 5. 清理构建缓存
# 在 Vercel 中重新部署并清理缓存
```

### 问题11: 数据库迁移失败
```bash
# 症状
Database migration failed

# 解决方案
# 1. 手动运行迁移
npx prisma db push --force-reset

# 2. 检查数据库权限
# 确保数据库用户有足够权限

# 3. 备份和恢复
# 在 Supabase 中创建备份
# 必要时恢复到之前的状态

# 4. 分步迁移
# 将复杂迁移拆分为多个步骤
```

### 问题12: 性能问题
```bash
# 症状
页面加载缓慢，响应时间长

# 诊断工具
# 1. 使用 Lighthouse 分析
npx lighthouse http://localhost:3000

# 2. 检查 Core Web Vitals
# 在 Chrome DevTools 中查看性能指标

# 3. 分析包大小
npm run analyze

# 解决方案
# 1. 优化图片
# 使用 next/image 组件
# 启用图片压缩和懒加载

# 2. 代码分割
# 使用动态导入
const Component = dynamic(() => import('./Component'))

# 3. 缓存优化
# 配置适当的缓存策略
# 使用 CDN 加速静态资源
```

## 🔍 调试工具和技巧

### 开发调试
```bash
# 1. 启用详细日志
DEBUG=* npm run dev

# 2. 数据库查询日志
# 在 schema.prisma 中启用日志
generator client {
  provider = "prisma-client-js"
  log      = ["query", "info", "warn", "error"]
}

# 3. API 调试
# 在 API 路由中添加日志
console.log('Request:', request)
console.log('Response:', response)

# 4. 客户端调试
# 在浏览器中使用 React DevTools
# 检查网络请求和响应
```

### 生产环境调试
```bash
# 1. 查看应用日志
vercel logs --follow

# 2. 监控错误
# 配置 Sentry 错误监控
npm install @sentry/nextjs

# 3. 性能监控
# 使用 Vercel Analytics
# 配置 Google Analytics

# 4. 健康检查
curl https://yourdomain.com/api/ping
```

## 📞 获取帮助

### 社区资源
- **GitHub Issues**: 报告 bug 和功能请求
- **Discord 社区**: 实时讨论和支持
- **文档**: 查看完整的技术文档

### 专业支持
- **技术咨询**: 复杂问题的专业解决方案
- **定制开发**: 特殊需求的定制化开发
- **培训服务**: 团队技术培训和指导

### 问题报告模板
```markdown
## 问题描述
简要描述遇到的问题

## 复现步骤
1. 第一步
2. 第二步
3. 第三步

## 预期行为
描述期望的正确行为

## 实际行为
描述实际发生的情况

## 环境信息
- Node.js 版本:
- npm 版本:
- 操作系统:
- 浏览器:

## 错误日志
```
粘贴相关的错误日志
```

## 其他信息
任何其他相关信息
```

## 🔄 预防措施

### 开发最佳实践
1. **定期更新依赖**: 保持依赖包的最新版本
2. **代码审查**: 确保代码质量和安全性
3. **自动化测试**: 编写和运行自动化测试
4. **监控告警**: 配置系统监控和告警
5. **备份策略**: 定期备份重要数据

### 部署检查清单
```bash
□ 环境变量配置完整
□ 数据库连接正常
□ API 服务正常响应
□ 静态资源加载正常
□ SSL 证书有效
□ 域名解析正确
□ 监控系统运行
□ 备份策略就绪
□ 错误处理完善
□ 性能指标达标
```

这个故障排除指南涵盖了最常见的问题和解决方案，帮助您快速诊断和解决各种技术问题！
