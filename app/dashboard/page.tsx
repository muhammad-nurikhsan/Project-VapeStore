import { createClient } from '@/lib/supabase/server'

interface StaffProfile {
  role: 'admin' | 'vaporista'
  branch_id: string | null
  branches: {
    name: string
    slug: string
  } | null
}

interface StockItem {
  quantity: number
  low_stock_threshold: number
  branches: {
    name: string
  }
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) return null

  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role, branch_id, branches(name, slug)')
    .eq('user_id', user.id)
    .single()

  const staffProfile = profile as StaffProfile | null

  // Get stock stats for user's branch or all branches (admin)
  let stockQuery = supabase
    .from('branch_stock')
    .select('quantity, low_stock_threshold, branches(name)')

  if (staffProfile?.role === 'vaporista' && staffProfile.branch_id) {
    stockQuery = stockQuery.eq('branch_id', staffProfile.branch_id)
  }

  const { data: stocks } = await stockQuery

  const stockList = (stocks || []) as StockItem[]
  const totalItems = stockList.reduce((sum, s) => sum + s.quantity, 0)
  const lowStockCount = stockList.filter(s => s.quantity <= s.low_stock_threshold).length

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        Selamat Datang di Dashboard
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Total Stok</div>
          <div className="text-3xl font-bold text-blue-600">{totalItems}</div>
          <div className="text-xs text-gray-500 mt-1">Unit di semua SKU</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Stok Menipis</div>
          <div className="text-3xl font-bold text-red-600">{lowStockCount}</div>
          <div className="text-xs text-gray-500 mt-1">SKU perlu restock</div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-sm text-gray-600 mb-2">Akses Anda</div>
          <div className="text-lg font-bold text-gray-900">
            {staffProfile?.role === 'admin' ? 'Admin' : 'Vaporista'}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {staffProfile?.branches?.name || 'Semua Cabang'}
          </div>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-2">Quick Actions</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            → <a href="/dashboard/stock" className="hover:underline">Kelola Stok</a> untuk update quantity produk
          </li>
          {staffProfile?.role === 'admin' && (
            <>
              <li>
                → <a href="/dashboard/products" className="hover:underline">Kelola Produk</a> untuk tambah/edit produk & varian
              </li>
              <li>
                → <a href="/dashboard/branches" className="hover:underline">Kelola Cabang</a> untuk atur info cabang & WhatsApp
              </li>
            </>
          )}
        </ul>
      </div>
    </div>
  )
}
