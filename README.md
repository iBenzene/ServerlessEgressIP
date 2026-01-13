# Serverless Egress IP Detector

探测 Serverless 函数的出口 IP 地址，支持 IPv4 和 IPv6 双栈探测。

## 支持的平台

| 平台                | 源目录        | 打包输出           |
| ------------------- | ------------- | ------------------ |
| Vercel              | `vercel/`     | 无需打包           |
| Cloudflare Worker   | `cloudflare/` | `dist/cloudflare/` |
| AWS Lambda          | `aws/`        | `dist/aws/`        |
| GCP Cloud Functions | `gcp/`        | `dist/gcp/`        |
| Azure Functions     | `azure/`      | `dist/azure/`      |

## 返回格式

```json
{
  "ipv4": "1.2.3.4",
  "ipv6": "2001:db8::1",
  "timestamp": "2026-01-14T04:50:00.000Z",
  "platform": "vercel",
  "detectionTimeMs": 150
}
```

如果 IPv4 或 IPv6 探测失败，对应字段为 `null`。

## 快速开始

```bash
# 安装依赖
npm install

# 运行测试
npm test

# 打包所有平台
npm run build:cloudflare
npm run build:aws
npm run build:gcp
npm run build:azure
```

## 部署指南

### Vercel

```bash
vercel
```

### Cloudflare Worker

```bash
npm run build:cloudflare
wrangler deploy
```

### AWS Lambda

```bash
npm run build:aws
cd dist/aws && sam deploy --guided
```

### GCP Cloud Functions

```bash
npm run build:gcp
gcloud functions deploy detectEgressIP --gen2 --runtime nodejs20 --trigger-http --allow-unauthenticated --source dist/gcp --entry-point detectEgressIP
```

### Azure Functions

```bash
npm run build:azure
cd dist/azure && func azure functionapp publish <app-name>
```

## 项目结构

```
├── lib/ip-detector.js        # 共享 IP 探测核心库
├── vercel/index.js           # Vercel（直接部署）
├── cloudflare/index.js       # Cloudflare Worker（需打包）
├── aws/index.js              # AWS Lambda（需打包）
├── gcp/index.js              # GCP Cloud Functions（需打包）
├── azure/src/functions/      # Azure Functions（需打包）
├── dist/                     # 打包输出
└── test/test.js
```

## 架构

- **共享库**: `lib/ip-detector.js` 封装 IP 探测逻辑
- **打包工具**: 使用 esbuild 将共享库内联到各平台文件
- **零代码重复**: 源代码保持 DRY，通过打包生成部署文件

## License

MIT
