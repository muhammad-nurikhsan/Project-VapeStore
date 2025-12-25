import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { formatRupiah } from '@/lib/utils'

interface Product {
  id: string
  slug: string
  name: string
  brand: string | null
  is_active: boolean
  categories: {
    name: string
  } | null
  product_skus: Array<{
    price_idr: number
  }>
}

export default async function ProductsPage() {
  const supabase = await createClient()

  const { data: products } = await supabase
    .from('products')
    .select(`
      id,
      slug,
      name,
      brand,
      is_active,
      categories (name),
      product_skus (price_idr)
    `)
    .order('name')

  const productList = (products || []) as Product[]

  const productsWithPrice = productList.map(product => {
    const minPrice =
      product.product_skus.length > 0
        ? Math.min(...product.product_skus.map(s => s.price_idr))
        : 0
    return { ...product, minPrice }
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Kelola Produk</h2>
        <Link
          href="/dashboard/products/new"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg"
        >
          + Tambah Produk
        </Link>
      </div>

      {productsWithPrice.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500 mb-4">Belum ada produk</p>
          <Link
            href="/dashboard/products/new"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            Tambah produk pertama →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Produk
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Kategori
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Harga Mulai
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Varian
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {productsWithPrice.map(product => (
                <tr key={product.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {product.name}
                    </div>
                    {product.brand && (
                      <div className="text-xs text-gray-500">{product.brand}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    {product.categories?.name || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gray-900">
                    {product.minPrice > 0 ? formatRupiah(product.minPrice) : '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {product.product_skus.length} SKU
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        product.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {product.is_active ? 'Aktif' : 'Non-Aktif'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/products/${product.slug}`}
                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Edit →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
