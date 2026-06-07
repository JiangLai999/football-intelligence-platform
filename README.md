# 足球智能平台

面向多赛事覆盖、自动化和可解释预测的专业足球分析、赔率监控和预测平台脚手架。

## 项目范围

本项目定位为生产级足球智能平台的基础底座,而非仅限于世界杯的微站。

脚手架内已包含的核心能力:

- 多赛事赛程中心
- 具备可解释摘要的预测中心
- 赔率情报仪表盘
- 球队情报概览
- 回测工作区
- 覆盖赛事、赔率、预测和告警的 Prisma 领域模型
- 摄取与定时任务的自动化管道骨架
- 第一版预测与赔率分析引擎

## 技术栈

- Next.js 15
- TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Python 管道骨架

## 快速开始

1. 安装依赖

```bash
npm install
```

2. 复制环境变量模板

```bash
copy .env.example .env
```

3. 生成 Prisma 客户端

```bash
npm run db:generate
```

4. 推送数据表结构并写入演示数据

```bash
npm run db:push
npm run db:seed
```

5. 启动 Web 应用

```bash
npm run dev
```

6. 可选:启动管道骨架

```bash
npm run worker:dev
```

## 通过 Docker 搭建本地数据库

如果本地尚未运行 PostgreSQL,可以使用 Docker Compose:

```bash
npm run db:up
```

然后初始化数据表和演示数据:

```bash
npm run db:setup
```

常用的数据库生命周期命令:

```bash
npm run db:down
npm run db:reset
```

`db:reset` 会删除本地 Postgres 数据卷并清空所有持久化数据。

## 容器构建

构建生产环境容器镜像:

```bash
docker build -t football-intelligence-platform .
```

使用已配置好的数据库运行生产容器:

```bash
docker run --rm -p 3000:3000 --env-file .env football-intelligence-platform
```

## CI 与部署

- CI 工作流: `.github/workflows/ci.yml`
- 生产环境变量模板: `.env.production.example`
- 部署说明: `DEPLOYMENT.md`

CI 流水线包含以下验证:

- `npm run db:generate`
- `npm run lint`
- `npm run typecheck`
- `npm run build`

## 应用结构

```text
app/                  Next.js 应用路由页面与 API 端点
components/           可复用的 UI 构建块
lib/                  共享数据类型、校验器、Prisma 客户端
prisma/               数据库 Schema
services/pipeline/    自动化与摄取服务骨架
```

## 当前数据流

1. `connectors` 声明赛事、赔率、阵容和评分数据源职责。
2. `pipeline/jobs.py` 构建摄取、建模和交付的执行计划。
3. `prisma/seed.js` 为本地开发提供真实的演示环境。
4. `lib/server/platform-data.ts` 提供数据库优先的数据读取,当 `DATABASE_URL` 未配置时回退到演示数据。
5. `lib/server/prediction-engine.ts` 与 `lib/server/odds-engine.ts` 提供第一版分析层,供 API 和未来的后台任务使用。

## 额外 API 端点

- `GET /api/overview`
- `GET /api/data-sources`
- `GET /api/matches`
- `GET /api/matches/:id`
- `GET /api/predictions`
- `GET /api/operator`
- `GET /api/operator/jobs`
- `POST /api/operator/jobs/run`
- `PATCH /api/operator/alerts/:id`
- `PATCH /api/operator/sources/:code`

## 代码质量检查

```bash
npm run lint
npm run typecheck
npm run build
```

或者运行完整的本地验证链:

```bash
npm run check
```

## 本地环境说明

- 配置 `DATABASE_URL` 后,应用从 Prisma 持久化层读取数据。
- 缺少 `DATABASE_URL` 时,大多数读路径会回退到 `lib/demo-data.ts` 中的种子演示数据。
- 运维控制台支持本地模拟操作:任务执行、数据源切换和告警状态变更。
- Docker Compose 会在 `localhost:5432` 上提供本地 PostgreSQL 16 实例。
- 运维入口通过基于 Cookie 的会话鉴权,使用 `AUTH_SECRET`、`OPERATOR_USERNAME` 和 `OPERATOR_PASSWORD`。

## 运维登录

通过 `/login` 进入内部运维控制台完成鉴权。

所需环境变量:

- `AUTH_SECRET`
- `OPERATOR_USERNAME`
- `OPERATOR_PASSWORD`

## 运维审计与安全

运维控制台现已具备:

- 按操作者、操作和实体类型过滤的审计日志
- 按分类和状态过滤的任务列表
- 按严重程度和状态过滤的告警
- 失败登录、未授权访问与限流的安全事件摘要
- 审计记录的请求上下文捕获:路径、IP 和 User-Agent
- 登录限流:15 分钟内连续 5 次失败后,后续登录请求将被拒绝,直到窗口结束
- 限流事件会以 `LOGIN_RATE_LIMITED` 审计事件记录,并展示在安全摘要中

## 任务执行模型

运维任务现在通过统一的服务端执行器运行。

- 任务通过 `/api/operator/jobs/run` 入队
- 执行生命周期持久化为 `QUEUED`(排队中)、`RUNNING`(运行中)、`COMPLETED`(完成)或 `FAILED`(失败)
- 运维控制台可查看最近的任务历史
- 通过 `/api/operator/jobs` 和 `/api/operator/jobs/:id` 可获取详细任务记录

## 推荐的下一步

1. 为运维 API 补充身份鉴权和角色边界。
2. 用后台 Worker 与消息队列驱动的状态机替换模拟任务执行。
3. 实现赛事、赔率、阵容和新闻的外部数据源适配器。
4. 引入特征工程、模型版本管理和定时预测工作流。
5. 引入 Redis、消息队列和时序存储以支持实时更新。

## 当前状态

本仓库是一个可运行的基础脚手架,包含:

- 已运行的产品外壳
- 基于 Prisma 的可种子化演示环境
- 可工作的路由与 API 结构
- 可交互的运维控制台操作
- 领域数据模型
- 自动化入口
- 通过生产构建与类型检查

已具备进入下一阶段实现的条件:真实数据接入、异步执行与鉴权化的内部工具。
