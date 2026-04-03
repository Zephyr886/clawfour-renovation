# CLAUDE.md — AI Dev Pipeline 状态文件
# Run ID: 20260402-181741 | 生成时间: 2026-04-02T10:18:46Z

## [ASSUMED] 自动假设清单（待人类确认）
- [A-001] 项目类型: nextjs
- [A-002] 测试域名: https://test.clawfour.com
- [A-003] 后端: 需要后端服务

## 项目基本信息
- project_type: nextjs
- test_base_url: https://test.clawfour.com
- run_id: 20260402-181741
- current_phase: Phase 2 (执行中)

## Secrets 权限矩阵
| Agent          | DB 权限    | 环境范围      |
|----------------|-----------|--------------|
| frontend-agent | 只读 Schema | dev only     |
| backend-agent  | 读写       | dev test DB  |
| test-agent     | 只读       | test DB only |
| deploy-agent   | 无         | Vercel API   |

## 文件所有权分配（静态，运行时不可变更）
- frontend-agent: /components/**, /app/**, /styles/**
- backend-agent: /server/**, /api/**
- test-agent: /tests/**, /e2e/**

## 评分权重配置
- code_quality: 40%
- test_coverage: 30%
- perf_a11y: 20%
- security: 10%


## 任务进度
- [ ] T1 [backend] 审查现有 Prisma 模型、认证方案、项目/材料/节点/用户关系与 API 结构，输出本轮迭代的数据模型差异清单；在尽量复用现有模型前提下补齐材料、节点负责人、进度记录、施工日志、评论、用户禁用状态、角色管理、系统日志所需字段与关联，并准备迁移方案。
- [ ] T2 [backend] 修复并统一登录态服务端获取逻辑，确保刷新后仍可恢复会话；提供当前登录用户查询接口/服务，返回用户基础信息、角色、可访问项目范围与禁用状态，为前端导航和权限控制提供稳定数据源。
- [ ] T3 [frontend] 修复登录后导航栏状态：显示当前用户信息与角色标识（HOMEOWNER / COMPANY / ADMIN）、隐藏登录按钮、增加退出登录按钮，并在页面刷新后正确恢复显示；同时处理当前已知登录态展示不完整问题。
- [ ] T4 [backend] 实现统一 RBAC 权限校验中间层/工具：校验 HOMEOWNER 仅可访问自己的项目，COMPANY 仅可查看和修改参与项目，ADMIN 可访问全部并执行管理操作；所有新增/编辑/删除接口必须接入该权限校验，禁止仅依赖前端控制。
- [ ] T5 [backend] 补齐材料管理 API：支持材料列表查询、创建、编辑、状态更新；字段至少包含名称、品牌、分类、数量、单位、单价、备注、关联项目、关联节点（可选）；对 COMPANY / ADMIN 开放写权限，对 HOMEOWNER 仅开放只读；写入数据库后返回最新结果。
- [ ] T6 [frontend] 在材料相关页面补齐可操作 UI：新增材料按钮、编辑材料入口、材料状态修改入口、表单校验、成功/失败反馈、提交后自动刷新或局部更新；HOMEOWNER 仅展示只读视图，COMPANY / ADMIN 展示可编辑操作。
- [ ] T7 [backend] 补齐时间线节点管理 API：支持节点创建、编辑、删除、状态修改、计划日期/实际日期更新、排序调整、阶段归属管理；保证节点写入、排序变更和删除操作具备事务性与权限校验。
- [ ] T8 [frontend] 在时间线页面与节点详情页补齐节点管理交互：新增节点、编辑节点、删除节点、调整状态、修改计划日期/实际日期、排序调整、阶段归属选择；提供清晰按钮入口、表单反馈与提交后即时刷新。
- [ ] T9 [backend] 实现负责人分配相关 API：提供可选用户列表查询、节点负责人绑定/修改接口，并基于项目参与关系与角色做权限控制；确保时间线与节点详情可读取负责人信息。
- [ ] T10 [frontend] 在时间线页与节点详情页增加负责人展示与分配交互：从用户列表选择负责人并提交绑定，管理员与公司角色可修改，HOMEOWNER 仅可查看；操作完成后即时更新页面显示。
- [ ] T11 [backend] 补齐工作记录能力 API：支持新增进度记录、施工日志/工作记录、评论；节点详情支持录入进度百分比、备注、问题记录，并真实写入数据库；提供按项目/节点维度的查询接口与权限控制。
- [ ] T12 [frontend] 在节点详情页及相关项目页面补齐进度记录、施工日志、评论录入与展示 UI；支持进度百分比、备注、问题记录填写，提交后显示成功/失败反馈并即时刷新列表数据。
- [ ] T13 [backend] 补齐角色页面与后台管理 API：ADMIN 支持查看全部项目、管理用户、修改用户角色、启用/禁用用户、创建项目、创建/编辑阶段、创建/编辑节点、查看系统日志；同时输出 HOMEOWNER 与 COMPANY 所需聚合查询接口。
- [ ] T14 [frontend] 完善角色化页面能力：HOMEOWNER 可查看自己的项目、时间线、材料、评论、记录；COMPANY 可更新节点状态、填写进度、录入材料、维护施工日志；ADMIN 增加后台入口与用户/项目/阶段/节点管理页面，并保证导航按角色展示对应入口。
- [ ] T15 [frontend] 统一全站交互体验：所有新增/编辑功能增加明确按钮入口、表单 loading/禁用态、成功/失败消息、局部刷新或页面自动刷新；补齐移动端基础可用布局与表单适配。
- [ ] T16 [backend] 补充系统日志/审计记录能力，记录关键管理操作与数据变更（如用户角色修改、用户启停用、项目创建、节点创建编辑删除、材料更新等），供 ADMIN 后台查看，并保证可部署环境下可正常工作。
- [ ] T17 [test] 编写并更新 API 权限测试与集成测试：覆盖登录态恢复、退出登录、HOMEOWNER/COMPANY/ADMIN 访问边界、材料增改、节点增改删、负责人分配、进度记录/施工日志/评论写入、用户角色修改与启停用等关键场景。
- [ ] T18 [test] 编写端到端测试用例，基于 test.clawfour.com 对关键验收流程进行验证：登录后导航状态正确、可退出登录、可新增材料并看到结果、可编辑材料状态、可新增时间线节点、可编辑节点信息、可分配负责人、可新增进度记录/工作记录、角色权限有效。
- [ ] T19 [test] 执行回归测试与移动端基础可用性验证，覆盖主要页面刷新后的登录态、写入后列表刷新、错误提示、权限拦截与角色切换显示，整理缺陷清单并推动修复闭环。
- [ ] T20 [backend] 完成部署适配与交付收尾：检查环境变量、数据库迁移、构建与运行配置，确保升级后仍可部署到 test.clawfour.com；输出新的 report，标注可继续 Deploy 或 Iterate 的结果与已完成范围。

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
