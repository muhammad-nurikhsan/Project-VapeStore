import BranchFormClient from '../branch-form-client'

export const dynamic = 'force-dynamic'

export default async function NewBranchPage() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Tambah Cabang</h2>
      <BranchFormClient mode="create" />
    </div>
  )
}
