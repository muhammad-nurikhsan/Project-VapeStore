import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { BranchDeleteButton } from './branch-delete-button'

interface Branch {
  id: string
  slug: string
  name: string
  city: string | null
  whatsapp_phone: string
  is_active: boolean
}

export default async function BranchesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q } = await searchParams
  const supabase = await createClient()

  let query = supabase
    .from('branches')
    .select('id, slug, name, city, whatsapp_phone, is_active')
    .order('name')

  if (q) {
    const term = `%${q}%`
    query = query.or(`name.ilike.${term},city.ilike.${term},whatsapp_phone.ilike.${term}`)
  }

  const { data: branches } = await query

  const branchList = (branches || []) as Branch[]

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kelola Cabang</h2>
          <p className="text-sm text-gray-600">Cari, edit, atau hapus cabang.</p>
        </div>
        <div className="flex gap-2">
          <form className="flex items-center gap-2" action="/dashboard/branches">
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Cari nama/kota/WA"
              className="rounded-lg border px-3 py-2 text-sm w-56"
            />
            {q && (
              <Link
                href="/dashboard/branches"
                className="px-3 py-2 text-sm text-gray-700 bg-gray-100 rounded-lg"
              >
                Reset
              </Link>
            )}
          </form>
          <Link
            href="/dashboard/branches/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
          >
            + Tambah Cabang
          </Link>
        </div>
      </div>

      {branchList.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">Belum ada cabang</p>
          <Link
            href="/dashboard/branches/new"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Tambah cabang pertama →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branchList.map(branch => (
            <div
              key={branch.id}
              className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {branch.name}
                  </h3>
                  {branch.city && (
                    <p className="text-sm text-gray-600">{branch.city}</p>
                  )}
                </div>
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    branch.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {branch.is_active ? 'Aktif' : 'Non-Aktif'}
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500">📱</span>
                  <a
                    href={`https://wa.me/${branch.whatsapp_phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-700"
                  >
                    {branch.whatsapp_phone}
                  </a>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/branches/${branch.slug}`}
                  className="flex-1 text-center px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors"
                >
                  Edit
                </Link>
                <BranchDeleteButton branchId={branch.id} branchName={branch.name} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
