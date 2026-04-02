import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

// Simple hash for demo purposes (in production use bcrypt)
function hashPassword(password: string): string {
  return createHash('sha256').update(password + 'clawfour-salt').digest('hex')
}

async function main() {
  console.log('🌱 开始初始化数据库...')

  // Clean all tables in correct order
  await prisma.activityLog.deleteMany()
  await prisma.nodeEntry.deleteMany()
  await prisma.progressRecord.deleteMany()
  await prisma.nodeComment.deleteMany()
  await prisma.comment.deleteMany()
  await prisma.material.deleteMany()
  await prisma.node.deleteMany()
  await prisma.phase.deleteMany()
  await prisma.project.deleteMany()
  await prisma.user.deleteMany()

  console.log('✅ 已清空旧数据')

  // ============ Users ============
  const homeowner = await prisma.user.create({
    data: { username: 'zhang_ming', password: hashPassword('demo123'), role: 'HOMEOWNER', name: '张明', phone: '13800000001', email: 'zhangming@example.com' },
  })
  const homeowner2 = await prisma.user.create({
    data: { username: 'li_fang', password: hashPassword('demo123'), role: 'HOMEOWNER', name: '李芳', phone: '13800000004', email: 'lifang@example.com' },
  })
  const company = await prisma.user.create({
    data: { username: 'lijiasheng', password: hashPassword('demo123'), role: 'COMPANY', name: '李家盛施工队', phone: '13800000002', email: 'lijiasheng@example.com' },
  })
  const admin = await prisma.user.create({
    data: { username: 'admin', password: hashPassword('demo123'), role: 'ADMIN', name: '系统管理员', email: 'admin@clawfour.com' },
  })
  console.log('✅ 已创建 4 个用户')

  // ============ Project 1 ============
  const project1 = await prisma.project.create({
    data: {
      name: '张明新房全包装修',
      description: '朝阳区阳光城三室两厅装修项目，中式现代风格，全屋翻新改造。',
      ownerId: homeowner.id,
      status: 'IN_PROGRESS',
      startDate: new Date('2026-02-01'),
      endDate: new Date('2026-06-30'),
      address: '北京市朝阳区阳光城3号楼1501室',
      community: '阳光城',
      budget: 380000,
      members: { connect: [{ id: company.id }] },
    },
  })

  const phases1Data = [
    { name: '拆除与基础工程', description: '墙体拆除、水电改造、防水工程', order: 1, status: 'COMPLETED', startDate: new Date('2026-02-01'), endDate: new Date('2026-02-28') },
    { name: '泥瓦施工', description: '瓦工贴砖、地面找平、卫生间防水', order: 2, status: 'COMPLETED', startDate: new Date('2026-03-01'), endDate: new Date('2026-03-25') },
    { name: '木工与油漆', description: '木工造型、柜体制作、墙面刷漆', order: 3, status: 'IN_PROGRESS', startDate: new Date('2026-03-26'), endDate: new Date('2026-04-20') },
    { name: '安装与软装', description: '灯具安装、洁具安装、家具进场', order: 4, status: 'PENDING', startDate: new Date('2026-04-21'), endDate: new Date('2026-05-31') },
    { name: '验收与收尾', description: '全屋验收、清洁整理、问题整改', order: 5, status: 'PENDING', startDate: new Date('2026-06-01'), endDate: new Date('2026-06-30') },
  ]

  const createdPhases1: any[] = []
  for (const p of phases1Data) {
    const phase = await prisma.phase.create({ data: { ...p, projectId: project1.id } })
    createdPhases1.push(phase)
  }

  // Phase 1 nodes
  const p1n1 = await prisma.node.create({ data: { title: '墙体拆除', description: '拆除非承重隔墙，扩大客厅空间', order: 1, status: 'COMPLETED', urgency: 'NORMAL', assignee: '工长王师傅', plannedDate: new Date('2026-02-03'), actualDate: new Date('2026-02-05'), phaseId: createdPhases1[0].id, projectId: project1.id, createdBy: admin.id } })
  const p1n2 = await prisma.node.create({ data: { title: '水电改造', description: '全屋水路电路重新规划布线', order: 2, status: 'COMPLETED', urgency: 'NORMAL', assignee: '水电工陈师傅', plannedDate: new Date('2026-02-06'), actualDate: new Date('2026-02-18'), phaseId: createdPhases1[0].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '新建隔墙', description: '主卧书房隔墙新建', order: 3, status: 'COMPLETED', urgency: 'NORMAL', assignee: '工长王师傅', plannedDate: new Date('2026-02-19'), actualDate: new Date('2026-02-22'), phaseId: createdPhases1[0].id, projectId: project1.id, createdBy: admin.id } })
  const p1n4 = await prisma.node.create({ data: { title: '卫生间防水', description: '两个卫生间全面防水处理并闭水实验', order: 4, status: 'COMPLETED', urgency: 'URGENT', assignee: '防水工张师傅', plannedDate: new Date('2026-02-23'), actualDate: new Date('2026-02-27'), phaseId: createdPhases1[0].id, projectId: project1.id, createdBy: admin.id } })

  // Phase 2 nodes
  await prisma.node.create({ data: { title: '客厅地面铺砖', description: '800×800灰色哑光砖满铺', order: 1, status: 'COMPLETED', urgency: 'NORMAL', assignee: '瓦工刘师傅', plannedDate: new Date('2026-03-02'), actualDate: new Date('2026-03-06'), phaseId: createdPhases1[1].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '卫生间墙砖铺贴', description: '两卫墙面瓷砖铺贴，到顶处理', order: 2, status: 'COMPLETED', urgency: 'NORMAL', assignee: '瓦工刘师傅', plannedDate: new Date('2026-03-07'), actualDate: new Date('2026-03-15'), phaseId: createdPhases1[1].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '厨房墙地砖', description: '厨房地面防滑砖及墙面小白砖铺贴', order: 3, status: 'COMPLETED', urgency: 'NORMAL', assignee: '瓦工刘师傅', plannedDate: new Date('2026-03-16'), actualDate: new Date('2026-03-20'), phaseId: createdPhases1[1].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '地面找平', description: '全屋地面自流平找平处理', order: 4, status: 'COMPLETED', urgency: 'NORMAL', assignee: '瓦工刘师傅', plannedDate: new Date('2026-03-21'), actualDate: new Date('2026-03-24'), phaseId: createdPhases1[1].id, projectId: project1.id, createdBy: admin.id } })

  // Phase 3 nodes (IN_PROGRESS)
  await prisma.node.create({ data: { title: '石膏板吊顶', description: '客餐厅区域石膏板平顶及灯槽制作', order: 1, status: 'COMPLETED', urgency: 'NORMAL', assignee: '木工赵师傅', plannedDate: new Date('2026-03-26'), actualDate: new Date('2026-03-30'), phaseId: createdPhases1[2].id, projectId: project1.id, createdBy: admin.id } })
  const p3n2 = await prisma.node.create({ data: { title: '全屋柜体制作', description: '衣柜、鞋柜、书柜现场制作', order: 2, status: 'IN_PROGRESS', urgency: 'NORMAL', assignee: '木工赵师傅', plannedDate: new Date('2026-03-31'), phaseId: createdPhases1[2].id, projectId: project1.id, createdBy: admin.id } })
  const p3n3 = await prisma.node.create({ data: { title: '墙面基础处理', description: '批嵌腻子、打磨，两遍底漆', order: 3, status: 'IN_PROGRESS', urgency: 'URGENT', assignee: '油漆工李师傅', plannedDate: new Date('2026-04-05'), phaseId: createdPhases1[2].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '乳胶漆面漆施工', description: '全屋面漆两遍，颜色确认后执行', order: 4, status: 'PENDING', urgency: 'NORMAL', assignee: '油漆工李师傅', plannedDate: new Date('2026-04-12'), phaseId: createdPhases1[2].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '门套与踢脚线', description: '木门门套、踢脚线安装与收口', order: 5, status: 'PENDING', urgency: 'NORMAL', assignee: '木工赵师傅', plannedDate: new Date('2026-04-16'), phaseId: createdPhases1[2].id, projectId: project1.id, createdBy: admin.id } })

  // Phase 4 nodes
  await prisma.node.create({ data: { title: '全屋灯具安装', order: 1, status: 'PENDING', urgency: 'NORMAL', assignee: '水电工陈师傅', plannedDate: new Date('2026-04-21'), phaseId: createdPhases1[3].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '卫生间洁具安装', order: 2, status: 'PENDING', urgency: 'NORMAL', assignee: '水工黄师傅', plannedDate: new Date('2026-04-25'), phaseId: createdPhases1[3].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '厨房橱柜进场', order: 3, status: 'PENDING', urgency: 'NORMAL', assignee: '橱柜厂家', plannedDate: new Date('2026-05-01'), phaseId: createdPhases1[3].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '地板铺设', order: 4, status: 'PENDING', urgency: 'NORMAL', assignee: '地板厂家', plannedDate: new Date('2026-05-08'), phaseId: createdPhases1[3].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '木门安装', order: 5, status: 'PENDING', urgency: 'NORMAL', assignee: '门厂家', plannedDate: new Date('2026-05-15'), phaseId: createdPhases1[3].id, projectId: project1.id, createdBy: admin.id } })

  // Phase 5 nodes
  await prisma.node.create({ data: { title: '全屋验收检查', order: 1, status: 'PENDING', urgency: 'NORMAL', plannedDate: new Date('2026-06-05'), phaseId: createdPhases1[4].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '问题整改处理', order: 2, status: 'PENDING', urgency: 'NORMAL', plannedDate: new Date('2026-06-15'), phaseId: createdPhases1[4].id, projectId: project1.id, createdBy: admin.id } })
  await prisma.node.create({ data: { title: '保洁与交付', order: 3, status: 'PENDING', urgency: 'NORMAL', plannedDate: new Date('2026-06-28'), phaseId: createdPhases1[4].id, projectId: project1.id, createdBy: admin.id } })

  console.log('✅ 已创建项目1的阶段与节点')

  // Materials
  const materials1 = [
    { name: '灰色哑光地砖 800x800', brand: '马可波罗', category: 'tile', status: 'INSTALLED', quantity: 200, unit: '片', price: 12000, addedBy: company.id, projectId: project1.id },
    { name: '卫生间墙砖 300x600', brand: '东鹏', category: 'tile', status: 'INSTALLED', quantity: 300, unit: '片', price: 6000, addedBy: company.id, projectId: project1.id },
    { name: '乳胶漆 净味系列', brand: '立邦', category: 'paint', status: 'PURCHASED', quantity: 10, unit: '桶', price: 3500, addedBy: company.id, projectId: project1.id },
    { name: '定制实木衣柜', brand: '索菲亚', category: 'furniture', status: 'ORDERED', quantity: 2, unit: '组', price: 28000, addedBy: company.id, projectId: project1.id },
    { name: '实木复合地板 橡木纹', brand: '圣象', category: 'floor', status: 'ORDERED', quantity: 100, unit: '㎡', price: 15000, addedBy: company.id, projectId: project1.id },
    { name: '吊顶石膏板', brand: '龙牌', category: 'base', status: 'INSTALLED', quantity: 50, unit: '张', price: 2500, addedBy: company.id, projectId: project1.id },
    { name: '定制橱柜', brand: '好莱客', category: 'kitchen', status: 'ORDERED', quantity: 1, unit: '套', price: 32000, addedBy: company.id, projectId: project1.id },
    { name: '主卫马桶', brand: '科勒', category: 'bathroom', status: 'NOT_PURCHASED', quantity: 1, unit: '个', price: 3800, addedBy: company.id, projectId: project1.id },
    { name: '花洒套装', brand: '汉斯格雅', category: 'bathroom', status: 'NOT_PURCHASED', quantity: 2, unit: '套', price: 4600, addedBy: company.id, projectId: project1.id },
    { name: '客厅吊灯', brand: '雷士', category: 'light', status: 'NOT_PURCHASED', quantity: 1, unit: '套', price: 2800, addedBy: company.id, projectId: project1.id },
  ]
  for (const mat of materials1) { await prisma.material.create({ data: mat }) }

  // Progress Records
  await prisma.progressRecord.create({ data: { nodeId: p3n2.id, percentage: 30, note: '主卧衣柜框架已完成', recordedBy: company.id, recordedAt: new Date('2026-04-01') } })
  await prisma.progressRecord.create({ data: { nodeId: p3n2.id, percentage: 60, note: '客卧衣柜和书柜框架完成，正在安装内部分隔板', recordedBy: company.id, recordedAt: new Date('2026-04-03') } })
  await prisma.progressRecord.create({ data: { nodeId: p3n3.id, percentage: 20, note: '客厅批嵌第一遍腻子完成', recordedBy: company.id, recordedAt: new Date('2026-04-02') } })
  await prisma.progressRecord.create({ data: { nodeId: p1n1.id, percentage: 100, note: '墙体拆除完成，渣土已清运完毕', recordedBy: company.id, recordedAt: new Date('2026-02-05') } })

  // Node Comments
  await prisma.nodeComment.create({ data: { nodeId: p3n2.id, content: '柜体材料用的是什么板材？甲醛含量怎么样？', projectId: project1.id, userId: homeowner.id } })
  await prisma.nodeComment.create({ data: { nodeId: p3n2.id, content: '用的是E0级生态板，有检测报告，环保达标。颜色按照效果图来的，明天可以来工地确认一下。', projectId: project1.id, userId: company.id } })
  await prisma.nodeComment.create({ data: { nodeId: p3n3.id, content: '客厅那面特色墙的颜色，我想改成浅蓝灰色，可以吗？', projectId: project1.id, userId: homeowner.id } })
  await prisma.nodeComment.create({ data: { nodeId: p3n3.id, content: '可以的，浅蓝灰色（立邦色号LB-3012）效果很好，在底漆施工完之后会先刷样板让您确认。', projectId: project1.id, userId: company.id } })
  await prisma.nodeComment.create({ data: { nodeId: p1n4.id, content: '防水很重要，一定要做好24小时闭水实验！', projectId: project1.id, userId: homeowner.id } })
  await prisma.nodeComment.create({ data: { nodeId: p1n4.id, content: '放心，已做48小时闭水，楼下邻居也来确认了，完全无渗漏。', projectId: project1.id, userId: company.id } })

  // Project-level comment
  await prisma.comment.create({ data: { targetType: 'Project', targetId: project1.id, content: '项目整体进度不错，辛苦大家！', projectId: project1.id, userId: homeowner.id } })

  // Node Entries
  await prisma.nodeEntry.create({ data: { nodeId: p3n2.id, type: 'PROGRESS', title: '柜体框架安装进度', content: '主卧衣柜框架完成，使用德国海福乐铰链，质量有保障', createdBy: company.id } })
  await prisma.nodeEntry.create({ data: { nodeId: p1n4.id, type: 'INSPECTION', title: '防水闭水实验', content: '卫生间蓄水48小时，楼下无渗漏，防水验收合格', isCompleted: true, createdBy: company.id } })
  await prisma.nodeEntry.create({ data: { nodeId: p3n3.id, type: 'ISSUE', title: '发现原墙体空鼓问题', content: '主卧一面墙发现空鼓，需要铲除重新处理，工期可能延误2天', urgency: 'URGENT', createdBy: company.id } })
  await prisma.nodeEntry.create({ data: { nodeId: p1n2.id, type: 'PROGRESS', title: '水电改造完工', content: '全屋水路电路改造完成，共新增插座32个，灯位16个', isCompleted: true, createdBy: company.id } })

  // Activity Logs
  const logs1 = [
    { projectId: project1.id, action: 'CREATED', entityType: 'Project', entityId: project1.id, description: '创建了装修项目「张明新房全包装修」', userId: homeowner.id },
    { projectId: project1.id, action: 'MEMBER_ADDED', entityType: 'Project', entityId: project1.id, description: '将李家盛施工队加入项目团队', userId: admin.id },
    { projectId: project1.id, action: 'STATUS_CHANGED', entityType: 'Phase', entityId: createdPhases1[0].id, description: '拆除与基础工程阶段标记为已完成', userId: company.id },
    { projectId: project1.id, action: 'STATUS_CHANGED', entityType: 'Phase', entityId: createdPhases1[1].id, description: '泥瓦施工阶段标记为已完成', userId: company.id },
    { projectId: project1.id, action: 'COMMENT_ADDED', entityType: 'Comment', entityId: 'c1', description: '对柜体制作节点发表了评论', userId: homeowner.id },
    { projectId: project1.id, nodeId: p3n2.id, action: 'STATUS_CHANGED', entityType: 'Progress', entityId: 'p1', description: '更新全屋柜体制作进度至 60%', userId: company.id },
    { projectId: project1.id, action: 'UPDATED', entityType: 'Material', entityId: 'm1', description: '更新了实木复合地板状态为「已下单」', userId: company.id },
    { projectId: project1.id, nodeId: p3n3.id, action: 'COMMENT_ADDED', entityType: 'Comment', entityId: 'c2', description: '业主对墙面颜色提出了修改意见', userId: homeowner.id },
  ]
  for (const log of logs1) { await prisma.activityLog.create({ data: log }) }

  console.log('✅ 已创建项目1的材料、评论、进度、日志')

  // ============ Project 2 ============
  const project2 = await prisma.project.create({
    data: {
      name: '李芳公寓局部改造',
      description: '海淀区两室一厅局部装修，主要翻新卫生间、厨房及主卧。',
      ownerId: homeowner2.id,
      status: 'PLANNING',
      startDate: new Date('2026-04-15'),
      endDate: new Date('2026-07-15'),
      address: '北京市海淀区学院路8号1203室',
      budget: 120000,
      members: { connect: [{ id: company.id }] },
    },
  })

  const phases2Data = [
    { name: '方案确认', description: '设计方案确认、材料选择', order: 1, status: 'IN_PROGRESS' },
    { name: '卫生间改造', description: '主卫防水、贴砖、洁具更换', order: 2, status: 'PENDING' },
    { name: '厨房翻新', description: '橱柜更换、灶台改造', order: 3, status: 'PENDING' },
    { name: '主卧改造', description: '主卧翻新、地板更换', order: 4, status: 'PENDING' },
    { name: '收尾验收', description: '全屋验收', order: 5, status: 'PENDING' },
  ]

  const createdPhases2: any[] = []
  for (const p of phases2Data) {
    const phase = await prisma.phase.create({ data: { ...p, projectId: project2.id } })
    createdPhases2.push(phase)
  }

  const p2n1 = await prisma.node.create({ data: { title: '设计方案确认', description: '与设计师确认改造方案', order: 1, status: 'IN_PROGRESS', urgency: 'TODO', phaseId: createdPhases2[0].id, projectId: project2.id, createdBy: admin.id, plannedDate: new Date('2026-04-20') } })
  await prisma.node.create({ data: { title: '材料样品选择', description: '瓷砖、橱柜门板等材料样品确认', order: 2, status: 'PENDING', urgency: 'NORMAL', phaseId: createdPhases2[0].id, projectId: project2.id, createdBy: admin.id, plannedDate: new Date('2026-04-25') } })
  await prisma.node.create({ data: { title: '合同签订', description: '签订施工合同，首付款结算', order: 3, status: 'PENDING', urgency: 'TODO', phaseId: createdPhases2[0].id, projectId: project2.id, createdBy: admin.id, plannedDate: new Date('2026-04-30') } })

  const p2phase2nodes = ['防水施工', '地砖铺贴', '墙砖铺贴', '洁具安装']
  const p2phase3nodes = ['拆除旧橱柜', '水电改造', '新橱柜安装', '灶具安装']
  const p2phase4nodes = ['地板拆除', '地面处理', '新地板铺设', '门套更换']
  const p2phase5nodes = ['验收检查', '问题修复', '保洁交付']

  for (let i = 0; i < p2phase2nodes.length; i++) { await prisma.node.create({ data: { title: p2phase2nodes[i], order: i + 1, status: 'PENDING', urgency: 'NORMAL', phaseId: createdPhases2[1].id, projectId: project2.id, createdBy: admin.id } }) }
  for (let i = 0; i < p2phase3nodes.length; i++) { await prisma.node.create({ data: { title: p2phase3nodes[i], order: i + 1, status: 'PENDING', urgency: 'NORMAL', phaseId: createdPhases2[2].id, projectId: project2.id, createdBy: admin.id } }) }
  for (let i = 0; i < p2phase4nodes.length; i++) { await prisma.node.create({ data: { title: p2phase4nodes[i], order: i + 1, status: 'PENDING', urgency: 'NORMAL', phaseId: createdPhases2[3].id, projectId: project2.id, createdBy: admin.id } }) }
  for (let i = 0; i < p2phase5nodes.length; i++) { await prisma.node.create({ data: { title: p2phase5nodes[i], order: i + 1, status: 'PENDING', urgency: 'NORMAL', phaseId: createdPhases2[4].id, projectId: project2.id, createdBy: admin.id } }) }

  await prisma.nodeComment.create({ data: { nodeId: p2n1.id, content: '方案是否可以考虑主卫做干湿分离？', projectId: project2.id, userId: homeowner2.id } })
  await prisma.nodeComment.create({ data: { nodeId: p2n1.id, content: '可以的，已经在方案里加入了干湿分离设计，下次见面时给您看效果图。', projectId: project2.id, userId: company.id } })

  await prisma.activityLog.create({ data: { projectId: project2.id, action: 'CREATED', entityType: 'Project', entityId: project2.id, description: '创建了装修项目「李芳公寓局部改造」', userId: homeowner2.id } })
  await prisma.activityLog.create({ data: { projectId: project2.id, action: 'STATUS_CHANGED', entityType: 'Phase', entityId: createdPhases2[0].id, description: '开始方案确认阶段', userId: admin.id } })
  await prisma.activityLog.create({ data: { projectId: project2.id, nodeId: p2n1.id, action: 'COMMENT_ADDED', entityType: 'Comment', entityId: 'c3', description: '业主对设计方案发表了意见', userId: homeowner2.id } })

  console.log('✅ 已创建项目2的阶段与节点')

  const counts = await Promise.all([
    prisma.user.count(), prisma.project.count(), prisma.phase.count(),
    prisma.node.count(), prisma.material.count(), prisma.nodeComment.count(), prisma.activityLog.count()
  ])

  console.log('\n🎉 数据库初始化完成！')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`👤 用户: ${counts[0]}    📁 项目: ${counts[1]}    📑 阶段: ${counts[2]}`)
  console.log(`📋 节点: ${counts[3]}    📦 材料: ${counts[4]}    💬 评论: ${counts[5]}    📊 日志: ${counts[6]}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n演示账号:')
  console.log('  业主:    zhang_ming / demo123')
  console.log('  业主:    li_fang    / demo123')
  console.log('  施工队:  lijiasheng / demo123')
  console.log('  管理员:  admin      / demo123')
  console.log('\n🚀 启动: npm run dev → http://localhost:3000')
}

main()
  .catch((e) => { console.error('❌ Seed 失败:', e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })
