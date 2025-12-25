import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'

interface StaffProfile {
  role: 'admin' | 'vaporista'
  full_name: string | null
  branch_id: string | null
  branches: {
    name: string
  } | null
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Get staff profile
  const { data: profile } = await supabase
    .from('staff_profiles')
    .select('role, full_name, branch_id, branches(name)')
    .eq('user_id', user.id)
    .eq('is_active', true)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const staffProfile = profile as StaffProfile

  const handleSignOut = async () => {
    'use server'
    const supabase = await createClient()
    await supabase.auth.signOut()
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard {staffProfile.role === 'admin' ? 'Admin' : 'Vaporista'}
              </h1>
              <p className="text-sm text-gray-600">
                {staffProfile.full_name || user.email}
                {staffProfile.branch_id && staffProfile.branches && (
                  <span className="ml-2 text-blue-600">
                    - {staffProfile.branches.name}
                  </span>
                )}
              </p>
            </div>
            <form action={handleSignOut}>
              <button
                type="submit"
                className="px-4 py-2 text-sm text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            <Link
              href="/dashboard"
              className="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              📊 Overview
            </Link>
            <Link
              href="/dashboard/stock"
              className="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-700 whitespace-nowrap"
            >
              📦 Kelola Stok
            </Link>
            {staffProfile.role === 'admin' && (
              <>
                <Link
                  href="/dashboard/products"
                  className="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  🛍️ Produk
                </Link>
                <Link
                  href="/dashboard/branches"
                  className="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-gray-700 whitespace-nowrap"
                >
                  🏪 Cabang
                </Link>
              </>
            )}
            <Link
              href="/"
              target="_blank"
              className="py-4 px-1 border-b-2 border-transparent hover:border-gray-300 text-sm font-medium text-blue-600 whitespace-nowrap"
            >
              🔗 Lihat Katalog
            </Link>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}
