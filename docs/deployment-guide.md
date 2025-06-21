# 部署与运维指南

## 概述

本指南详细介绍如何将 ShipAny 模板部署到各种平台，以及生产环境的运维最佳实践。

## 部署平台选择

### 1. Vercel (推荐)
- **优势**: 零配置部署、自动 HTTPS、全球 CDN
- **适用场景**: 中小型项目、快速原型
- **限制**: 函数执行时间限制、带宽限制

### 2. Cloudflare Pages
- **优势**: 免费额度高、全球边缘计算
- **适用场景**: 静态站点、边缘计算需求
- **限制**: 函数大小限制

### 3. 自托管 (Docker)
- **优势**: 完全控制、无限制
- **适用场景**: 大型项目、企业部署
- **要求**: 服务器管理经验

## Vercel 部署

### 1. 快速部署

```bash
# 安装 Vercel CLI
npm i -g vercel

# 登录 Vercel
vercel login

# 部署项目
vercel --prod
```

### 2. 环境变量配置

在 Vercel Dashboard 中设置环境变量：

**必需变量**:
```env
NEXT_PUBLIC_WEB_URL=https://your-domain.vercel.app
SUPABASE_URL=your-supabase-url
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
AUTH_SECRET=your-auth-secret
STRIPE_PUBLIC_KEY=your-stripe-public-key
STRIPE_PRIVATE_KEY=your-stripe-private-key
```

**可选变量**:
```env
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
STORAGE_ENDPOINT=your-s3-endpoint
STORAGE_ACCESS_KEY=your-access-key
STORAGE_SECRET_KEY=your-secret-key
STORAGE_BUCKET=your-bucket-name
```

### 3. 自定义域名

1. 在 Vercel Dashboard 中添加域名
2. 配置 DNS 记录指向 Vercel
3. 等待 SSL 证书自动配置

### 4. 构建优化

```javascript
// vercel.json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "regions": ["hkg1", "sin1"],
  "framework": "nextjs"
}
```

## Cloudflare Pages 部署

### 1. 准备配置文件

```bash
# 复制配置模板
cp .env.example .env.production
cp wrangler.toml.example wrangler.toml
```

### 2. 配置 wrangler.toml

```toml
name = "your-project-name"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

[env.production]
vars = {
  NEXT_PUBLIC_WEB_URL = "https://your-domain.pages.dev",
  NEXT_PUBLIC_PROJECT_NAME = "Your Project",
  SUPABASE_URL = "your-supabase-url",
  SUPABASE_ANON_KEY = "your-anon-key",
  # 其他环境变量...
}

[[env.production.kv_namespaces]]
binding = "CACHE"
id = "your-kv-namespace-id"
```

### 3. 部署命令

```bash
# 构建并部署
npm run cf:deploy

# 预览部署
npm run cf:preview
```

### 4. 自定义域名

1. 在 Cloudflare Dashboard 中添加自定义域名
2. 配置 DNS 记录
3. 启用 SSL/TLS

## Docker 自托管部署

### 1. 构建 Docker 镜像

```dockerfile
# Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json pnpm-lock.yaml* ./
RUN corepack enable pnpm && pnpm i --frozen-lockfile

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1
RUN corepack enable pnpm && pnpm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 2. 构建和运行

```bash
# 构建镜像
docker build -t shipany-app .

# 运行容器
docker run -d \
  --name shipany-app \
  -p 3000:3000 \
  --env-file .env.production \
  shipany-app
```

### 3. Docker Compose 部署

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    env_file:
      - .env.production
    restart: unless-stopped
    depends_on:
      - redis
      
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - app
    restart: unless-stopped
```

### 4. Nginx 配置

```nginx
# nginx.conf
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }
    
    server {
        listen 80;
        server_name your-domain.com;
        return 301 https://$server_name$request_uri;
    }
    
    server {
        listen 443 ssl http2;
        server_name your-domain.com;
        
        ssl_certificate /etc/nginx/ssl/cert.pem;
        ssl_certificate_key /etc/nginx/ssl/key.pem;
        
        location / {
            proxy_pass http://app;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
        }
    }
}
```

## 数据库部署

### 1. Supabase 生产配置

```sql
-- 创建生产环境数据库
-- 在 Supabase Dashboard 中执行

-- 设置 RLS (Row Level Security)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;

-- 创建用户访问策略
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (uuid = auth.uid()::text);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (uuid = auth.uid()::text);
```

### 2. 数据库备份

```bash
# 使用 Supabase CLI 备份
supabase db dump --file backup.sql

# 恢复备份
supabase db reset --file backup.sql
```

### 3. 数据库监控

在 Supabase Dashboard 中监控：
- 连接数
- 查询性能
- 存储使用量
- API 请求量

## 监控与日志

### 1. 应用监控

集成监控服务：

```typescript
// lib/monitoring.ts
export class Monitor {
  static async trackError(error: Error, context?: any) {
    console.error('Application Error:', error, context);
    
    // 发送到监控服务
    if (process.env.NODE_ENV === 'production') {
      // await sendToSentry(error, context);
    }
  }
  
  static async trackEvent(event: string, data?: any) {
    console.log('Event:', event, data);
    
    // 发送到分析服务
    if (process.env.NODE_ENV === 'production') {
      // await sendToAnalytics(event, data);
    }
  }
}
```

### 2. 性能监控

```typescript
// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const start = Date.now();
  
  const response = NextResponse.next();
  
  // 记录响应时间
  response.headers.set('X-Response-Time', `${Date.now() - start}ms`);
  
  return response;
}
```

### 3. 日志管理

```typescript
// lib/logger.ts
export class Logger {
  static info(message: string, data?: any) {
    console.log(`[INFO] ${new Date().toISOString()} ${message}`, data);
  }
  
  static error(message: string, error?: any) {
    console.error(`[ERROR] ${new Date().toISOString()} ${message}`, error);
  }
  
  static warn(message: string, data?: any) {
    console.warn(`[WARN] ${new Date().toISOString()} ${message}`, data);
  }
}
```

## 安全配置

### 1. 环境变量安全

```bash
# 生产环境变量检查清单
✓ AUTH_SECRET - 使用强随机字符串
✓ 数据库密钥 - 定期轮换
✓ API 密钥 - 最小权限原则
✓ 第三方服务密钥 - 启用 IP 白名单
```

### 2. HTTPS 配置

确保所有生产环境都启用 HTTPS：
- Vercel: 自动配置
- Cloudflare: 启用 SSL/TLS
- 自托管: 配置 SSL 证书

### 3. 安全头配置

```typescript
// next.config.mjs
const nextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};
```

## 性能优化

### 1. 缓存策略

```typescript
// lib/cache.ts
export class Cache {
  static async get(key: string) {
    // 实现缓存获取逻辑
    return await redis.get(key);
  }
  
  static async set(key: string, value: any, ttl = 3600) {
    // 实现缓存设置逻辑
    return await redis.setex(key, ttl, JSON.stringify(value));
  }
}
```

### 2. CDN 配置

- 静态资源使用 CDN
- 图片优化和压缩
- 启用 Gzip 压缩

### 3. 数据库优化

```sql
-- 添加必要的索引
CREATE INDEX CONCURRENTLY idx_users_email ON users(email);
CREATE INDEX CONCURRENTLY idx_orders_user_uuid ON orders(user_uuid);
CREATE INDEX CONCURRENTLY idx_credits_user_uuid ON credits(user_uuid);

-- 定期清理过期数据
DELETE FROM credits WHERE expired_at < NOW() - INTERVAL '30 days';
```

## 备份与恢复

### 1. 数据备份

```bash
# 自动备份脚本
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="backup_$DATE.sql"

# 备份数据库
supabase db dump --file $BACKUP_FILE

# 上传到云存储
aws s3 cp $BACKUP_FILE s3://your-backup-bucket/

# 清理本地文件
rm $BACKUP_FILE
```

### 2. 代码备份

- 使用 Git 版本控制
- 定期推送到远程仓库
- 创建发布标签

### 3. 灾难恢复计划

1. 数据库恢复流程
2. 应用重新部署流程
3. DNS 切换流程
4. 用户通知机制

## 运维检查清单

### 部署前检查
- [ ] 环境变量配置完整
- [ ] 数据库连接测试
- [ ] 第三方服务集成测试
- [ ] SSL 证书配置
- [ ] 域名解析配置

### 部署后检查
- [ ] 应用正常启动
- [ ] 数据库连接正常
- [ ] 支付流程测试
- [ ] AI 接口测试
- [ ] 邮件发送测试
- [ ] 监控告警配置

### 日常维护
- [ ] 监控应用性能
- [ ] 检查错误日志
- [ ] 数据库性能监控
- [ ] 安全漏洞扫描
- [ ] 依赖包更新

## 故障排查

### 常见问题

1. **数据库连接失败**
   - 检查环境变量配置
   - 验证网络连接
   - 查看数据库日志

2. **支付回调失败**
   - 验证 Webhook URL
   - 检查 Webhook 签名
   - 查看 Stripe 日志

3. **AI 接口超时**
   - 检查 API 密钥
   - 验证网络连接
   - 增加超时时间

4. **图片上传失败**
   - 检查存储配置
   - 验证权限设置
   - 查看存储日志

### 日志分析

```bash
# 查看应用日志
docker logs shipany-app

# 实时监控日志
docker logs -f shipany-app

# 过滤错误日志
docker logs shipany-app 2>&1 | grep ERROR
```

## 扩容策略

### 水平扩容

```yaml
# docker-compose.yml
services:
  app:
    build: .
    deploy:
      replicas: 3
    ports:
      - "3000-3002:3000"
```

### 垂直扩容

```yaml
services:
  app:
    build: .
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 4G
```

### 数据库扩容

- 使用 Supabase 的自动扩容功能
- 配置读写分离
- 实施数据分片策略

通过遵循本指南，你可以确保 ShipAny 应用在生产环境中稳定、安全、高效地运行。
