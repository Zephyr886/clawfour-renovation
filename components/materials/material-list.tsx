'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { MaterialForm } from './material-form'
import { Plus, Edit2, Trash2, Loader2, Package } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface Material {
  id: string
  name: string
  brand?: string
  category: string
  status: string
  quantity: number
  unit?: string
  price?: number
  description?: string
  adder?: { name?: string; username: string }
  node?: { id: string; title: string } | null
}

interface MaterialListProps {
  materials: Material[]
  projectId: string
  userRole: string
  nodeId?: string
}

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  NOT_PURCHASED: { label: '未采购', color: 'bg-gray-100 text-gray-600' },
  ORDERED: { label: '已订购', color: 'bg-yellow-100 text-yellow-700' },
  PURCHASED: { label: '已采购', color: 'bg-blue-100 text-blue-700' },
  DELIVERED: { label: '已到货', color: 'bg-green-100 text-green-700' },
  INSTALLED: { label: '已安装', color: 'bg-purple-100 text-purple-700' },
}

const CATEGORY_LABELS: Record<string, string> = {
  main: '主材',
  auxiliary: '辅材',
  furniture: '家具',
  appliance: '家电',
  fixture: '洁具',
  other: '其他',
}

export function MaterialList({ materials: initialMaterials, projectId, userRole, nodeId }: MaterialListProps) {
  const router = useRouter()
  const [materials, setMaterials] = useState(initialMaterials)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editStatus, setEditStatus] = useState<Record<string, string>>({})
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [loading, setLoading] = useState<Record<string, boolean>>({})

  const canEdit = userRole !== 'HOMEOWNER'

  const handleStatusChange = async (materialId: string, newStatus: string) => {
    setLoading(l => ({ ...l, [materialId]: true }))
    try {
      const res = await fetch(`/api/materials/${materialId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        setMaterials(ms => ms.map(m => m.id === materialId ? { ...m, status: newStatus } : m))
      }
    } finally {
      setLoading(l => ({ ...l, [materialId]: false }))
    }
  }

  const handleDelete = async (materialId: string) => {
    if (!confirm('确认删除该材料？')) return
    setDeletingId(materialId)
    try {
      const res = await fetch(`/api/materials/${materialId}`, { method: 'DELETE' })
      if (res.ok) {
        setMaterials(ms => ms.filter(m => m.id !== materialId))
      }
    } finally {
      setDeletingId(null)
    }
  }

  const handleAddSuccess = () => {
    setShowAddForm(false)
    router.refresh()
  }

  return (
    <div className="space-y-4">
      {/* Header with Add Button */}
      <div className="flex items-center justify-between">
        <span className="text-sm text-gray-500">{materials.length} 项材料</span>
        {canEdit && (
          <Button
            size="sm"
            onClick={() => setShowAddForm(v => !v)}
            className="gap-1"
          >
            <Plus size={14} />
            新增材料
          </Button>
        )}
      </div>

      {/* Add Form */}
      {showAddForm && canEdit && (
        <div className="border border-blue-100 rounded-xl p-4 bg-blue-50/30">
          <h4 className="text-sm font-medium text-gray-700 mb-3">新增材料</h4>
          <MaterialForm
            projectId={projectId}
            nodeId={nodeId}
            onSuccess={handleAddSuccess}
            onCancel={() => setShowAddForm(false)}
          />
        </div>
      )}

      {/* Materials Table */}
      {materials.length === 0 ? (
        <div className="text-center py-10 text-gray-400">
          <Package size={32} className="mx-auto mb-2 opacity-40" />
          <p className="text-sm">暂无材料记录</p>
          {canEdit && !showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="mt-2 text-blue-500 text-sm hover:underline"
            >
              + 点击新增材料
            </button>
          )}
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {materials.map(material => {
            const statusInfo = STATUS_LABELS[material.status] || { label: material.status, color: 'bg-gray-100 text-gray-600' }
            return (
              <div key={material.id} className="py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-sm text-gray-900">{material.name}</span>
                      {material.brand && (
                        <span className="text-xs text-gray-400">{material.brand}</span>
                      )}
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 rounded text-gray-500">
                        {CATEGORY_LABELS[material.category] || material.category}
                      </span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">
                      {material.quantity}{material.unit || '件'}
                      {material.price != null && ` · ¥${material.price}/件`}
                      {material.description && ` · ${material.description}`}
                    </div>
                    {material.node && (
                      <div className="text-xs text-blue-500 mt-0.5">关联节点: {material.node.title}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {canEdit ? (
                      <select
                        value={material.status}
                        onChange={e => handleStatusChange(material.id, e.target.value)}
                        disabled={!!loading[material.id]}
                        className={`text-xs px-2 py-1 rounded-full border-0 font-medium cursor-pointer ${statusInfo.color}`}
                      >
                        {Object.entries(STATUS_LABELS).map(([v, { label }]) => (
                          <option key={v} value={v}>{label}</option>
                        ))}
                      </select>
                    ) : (
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${statusInfo.color}`}>
                        {statusInfo.label}
                      </span>
                    )}
                    {canEdit && (
                      <button
                        onClick={() => handleDelete(material.id)}
                        disabled={deletingId === material.id}
                        className="p-1 text-gray-300 hover:text-red-500 transition-colors"
                        title="删除"
                      >
                        {deletingId === material.id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
