# CLAUDE.md — AI Dev Pipeline 状态文件
# Run ID: 20260402-001325 | 生成时间: 2026-04-01T16:14:33Z

## [ASSUMED] 自动假设清单（待人类确认）
- [A-001] 项目类型: nextjs
- [A-002] 测试域名: https://test.clawfour.com
- [A-003] 后端: 需要后端服务

## 项目基本信息
- project_type: nextjs
- test_base_url: https://test.clawfour.com
- run_id: 20260402-001325
- current_phase: Phase 2 (执行中)

## Secrets 权限矩阵
| Agent          | DB 权限    | 环境范围      |
|----------------|-----------|--------------|
| frontend-agent | 只读 Schema | dev only     |
| backend-agent  | 读写       | dev test DB  |
| test-agent     | 只读       | test DB only |
| deploy-agent   | 无         | Vercel API   |

## 文件所有权分配（静态，运行时不可变更）
- frontend-agent: /app/**, /components/**, /styles/**, /public/**
- backend-agent: /server/**, /api/**, /app/api/**, /prisma/**, /lib/**
- test-agent: /tests/**, /e2e/**, /playwright/**, /__tests__/**

## 评分权重配置
- code_quality: 40%
- test_coverage: 30%
- perf_a11y: 20%
- security: 10%


## 任务进度
- [ ] T1 [backend] 对 /tmp/reno-merge-audit/reno-timeline、/tmp/reno-merge-audit/renovation-timeline 以及 /Users/wdgzz/Desktop/clawfour-renovation-salvage-20260402-001303 进行能力级审计，提炼可保留优势与应舍弃实现，形成融合设计结论：信息架构、角色体系、时间线/阶段/节点表达、评论/进度/材料/日志/管理端能力、数据模型亮点，并明确哪些模块需要从零重写。
- [ ] T2 [backend] 在 /Users/wdgzz/Desktop/clawfour-renovation 初始化全新 Next.js + TypeScript + Tailwind + Prisma 项目骨架，配置基础目录结构、eslint、tsconfig、环境变量模板、数据库连接、构建脚本与可部署的 package.json，确保 npm install 可用。
- [ ] T3 [backend] 设计并实现干净的 Prisma 数据模型，覆盖用户与角色（homeowner/company/admin）、装修项目、阶段、时间线节点、评论、进度记录、材料记录、日志/活动流及基础管理实体；同时考虑状态流转、排序字段、审计时间戳和示例数据可扩展性。
- [ ] T4 [backend] 实现 Prisma migration 与 seed 脚本，提供完整示例数据：至少包含多角色用户、一个或多个装修项目、分阶段时间线、节点详情、评论、进度记录、材料项、管理端可见日志，支持本地开发和测试环境快速初始化。
- [ ] T5 [backend] 定义后端访问层与边界：构建清晰的 server actions 或 Route Handlers/API 层，封装项目列表、Dashboard 汇总、Timeline 查询、节点详情、评论新增、进度记录新增、材料查询、管理端列表与角色视图数据接口，避免页面层直接耦合数据库。
- [ ] T6 [backend] 实现基础权限与角色访问策略，支持 homeowner/company/admin 三类角色的页面与数据访问隔离；即便先使用简化认证/模拟登录，也需具备后续接入正式认证的清晰扩展点。
- [ ] T7 [frontend] 基于融合分析输出全站信息架构与导航方案，设计首页/产品入口、Dashboard、Timeline、节点详情、admin、homeowner、company 的页面层级、路由结构、通用布局、移动端导航与空状态/错误状态规范。
- [ ] T8 [frontend] 搭建全局 UI 基础设施：App Router 布局、Tailwind 主题、响应式容器、导航栏、侧边栏、卡片、表格、Badge、Tabs、表单、评论流、时间线组件、状态提示组件等，形成可复用设计系统雏形。
- [ ] T9 [frontend] 实现首页/产品入口页面，清晰展示产品定位、角色入口、示例项目入口与测试环境可操作路径，保证视觉简洁且移动端基本可用。
- [ ] T10 [frontend] 实现 Dashboard 总览页面，展示项目概况、当前阶段、待处理节点、最新评论/动态、材料与进度摘要，并根据角色展示不同重点视图。
- [ ] T11 [frontend] 实现 Timeline 时间线页面，支持按阶段与节点展示装修全流程，突出阶段状态、节点进度、负责人、计划/实际时间、评论数与材料/日志关联，兼顾桌面与移动端可读性。
- [ ] T12 [frontend] 实现节点详情页，包含节点基础信息、评论列表与发布、进度记录展示与录入、相关材料与日志展示，支持从时间线页跳转进入。
- [ ] T13 [frontend] 实现 homeowner 页面，聚焦业主视角：项目进展、关键节点、沟通评论、材料确认、近期动态与需关注事项。
- [ ] T14 [frontend] 实现 company 页面，聚焦装修公司视角：项目执行、节点更新、进度填报、材料记录、跨项目概览与待办事项。
- [ ] T15 [frontend] 实现 admin 页面，提供项目管理、用户/角色概览、时间线模板或阶段配置展示、系统活动日志与基础运营观察视图。
- [ ] T16 [backend] 打通前后端数据流，将 Dashboard、Timeline、节点详情、评论、进度、材料、角色页面全部接入真实 Prisma 数据与 API/server actions，处理加载、异常、表单提交与数据刷新逻辑。
- [ ] T17 [test] 编写基础自动化测试，覆盖至少：应用首页可访问、Dashboard 渲染、Timeline 列表显示、节点详情展示、评论/进度提交主流程、admin/homeowner/company 页面访问与关键元素存在。
- [ ] T18 [test] 建立构建与部署验证方案，确保 npm run build 可通过，并补充面向 test.clawfour.com 的 deploy-pipeline 所需检查项、环境变量说明与健康检查建议。
- [ ] T19 [backend] 整理项目文档与运行说明，包括融合分析结论、架构说明、目录说明、本地启动、数据库迁移与 seed、测试与部署方式；并写入 /Users/wdgzz/ai-lab/.openclaw/runs/<run_id>/report.md。
- [ ] T20 [backend] 在全部任务完成后触发 EXEC_DONE system event，并确认最终交付满足“更完整、可部署、可继续开发”的目标。

## 🎨 Design System (强制遵守)
### 配色方案
- primary: #3B82F6
- secondary: #8B5CF6
- success: #10B981
- warning: #F59E0B
- error: #EF4444
- background: #FFFFFF
- surface: #F9FAFB
- text: #111827
- textSecondary: #6B7280

### 字体规范
- Font Family: Inter, system-ui, -apple-system, sans-serif
- Sizes: xs/sm/base/lg/xl/2xl/3xl/4xl

### 间距系统
- Base Unit: 4px
- Scale: 0, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, 96, 128

### 组件库
- Library: shadcn/ui

### 设计原则
- Use Tailwind CSS utility classes
- Prefer flexbox/grid over absolute positioning
- Mobile-first responsive design (sm:, md:, lg:, xl:)
- Maintain 4px spacing grid alignment
- Use semantic HTML5 elements
- Ensure WCAG AA contrast ratios (4.5:1 for text)
- Add hover/focus states for interactive elements
- Use loading states for async operations

**⚠️ 所有 UI 组件必须严格遵守以上规范，不得自行定义颜色或间距值。**

## Change Request 队列
（空）

## 成本追踪
- Claude API: $0.00 | Cloudflare: $0.00 | 合计: $0.00
