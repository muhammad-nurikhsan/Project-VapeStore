import { createClient } from '@/lib/supabase/server'
import StockManagementClient from './stock-management-client'

interface StaffProfile {
  role: 'admin' | 'vaporista'
  branch_id: string | null
}

interface Branch {
  id: string
  name: string
  slug: string
}

export default async function StockManagementPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role, branch_id')
    .eq('user_id', user.id)
    .single()

  const staffProfile = profile as StaffProfile | null

  // Fetch branches (admin sees all, vaporista sees own branch)
  let branchQuery = supabase
    .from('branches')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('name')

  if (staffProfile?.role === 'vaporista' && staffProfile.branch_id) {
    branchQuery = branchQuery.eq('id', staffProfile.branch_id)
  }

  const { data: branches } = await branchQuery
  const branchList = (branches || []) as Branch[]

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Kelola Stok
      </h2>
      <StockManagementClient
        branches={branchList}
        userRole={staffProfile?.role || 'vaporista'}
        userBranchId={staffProfile?.branch_id || null}
      />
    </div>
  )
}
