# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

这是一个 Egg.js 应用（Node.js >= 18.0.0），集成了 MySQL 数据库、JWT 认证和 Swagger API 文档。

## 常用命令

```bash
npm i          # 安装依赖
npm run dev    # 开发模式运行（端口 7001）
npm start      # 生产环境启动（守护进程模式）
npm stop       # 停止生产环境服务
npm run lint   # ESLint 代码风格检查
npm test       # 运行 lint --fix 和测试
npm run cov    # 运行带覆盖率的测试
```

## 架构

### 分层结构
- **Controller** (`app/controller/`) - HTTP 请求处理，路由映射
- **Service** (`app/service/`) - 业务逻辑，通过 `app.mysql` 操作数据库
- **Middleware** (`app/middleware/`) - `authorization.js`（JWT 认证）、`writeApiLog.js`（API 日志）
- **Extend** (`app/extend/helper.js`) - 工具函数：`formatDate`、`formatCamelNaming`、`uuid`
- **Contract** (`app/contract/`) - 请求/响应验证模式，用于 `egg-validate`

### 关键配置
- `config/config.default.js` - 主配置：MySQL 连接（192.168.21.5）、JWT secret、CORS、文件上传（100mb）、swagger-doc
- `config/plugin.js` - 插件启用：validate、mysql、jwt、cors、swaggerdoc
- `app/middleware/authorization.js` - JWT 认证中间件，通过 `AccessToken` header 读取令牌，跳过 GET 请求和 swagger-ui
- `app/middleware/writeApiLog.js` - API 请求日志中间件

### 数据库规范
- 表使用 snake_case 字段名
- Service 层使用 `helper.formatObjCamelNaming()` 转换为 camelCase
- 使用 UUID 作为主键
- 日期时间字段使用 `unix_timestamp()`

### API 模式
- 路由在 `app/router.js` 中定义
- 注释的路由表示 "node server" (ns) CRUD 模式，使用 moduleKey
- Swagger UI 访问地址：`/swagger-ui.html`
- JWT token 通过 `AccessToken` header 传递（不是 Authorization Bearer）
- 静态文件从 `/public/` 目录提供，前缀为 `/static/`

### 请求/响应验证
`app/contract/` 中的 contract 定义验证模式。响应格式：
```json
{ "code": "200", "msg": "...", "body": {} }
```
