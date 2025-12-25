'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect } from 'react'
import { formatRupiah } from '@/lib/utils'

interface Branch {
  id: string
  name: string
  slug: string
}

interface StockItem {
  branch_id: string
  sku_id: string
  quantity: number
  low_stock_threshold: number
  product_skus: {
    id: string
    sku_code: string | null
    attributes: Record<string, string>
    price_idr: number
    products: {
      name: string
      brand: string | null
    }
  }
}

interface Props {
  branches: Branch[]
  userRole: string
  userBranchId: string | null
}

export default function StockManagementClient({
  branches,
  userRole,
  userBranchId,
}: Props) {
  const [selectedBranchId, setSelectedBranchId] = useState<string>(
    userBranchId || branches[0]?.id || ''
  )
  const [stocks, setStocks] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState<string | null>(null)

  useEffect(() => {
    if (selectedBranchId) {
      fetchStocks()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBranchId])

  const fetchStocks = async () => {
    setLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from('branch_stock')
      .select(`
        branch_id,
        sku_id,
        quantity,
        low_stock_threshold,
        product_skus (
          id,
          sku_code,
          attributes,
          price_idr,
          products (
            name,
            brand
          )
        )
      `)
      .eq('branch_id', selectedBranchId)
      .order('quantity', { ascending: true })

    setStocks((data as StockItem[]) || [])
    setLoading(false)
  }

  const updateStock = async (skuId: string, newQuantity: number) => {
    if (newQuantity < 0) return

    setUpdating(skuId)
    const supabase = createClient()

    const branchStock = (supabase as any).from('branch_stock')
    const { error } = await branchStock
      .update({ quantity: newQuantity })
      .eq('branch_id', selectedBranchId)
      .eq('sku_id', skuId)

    if (!error) {
      setStocks(prev =>
        prev.map(stock =>
          stock.sku_id === skuId ? { ...stock, quantity: newQuantity } : stock
        )
      )
    }

    setUpdating(null)
  }

  const renderVariantText = (attributes: Record<string, string>) => {
    const entries = Object.entries(attributes)
    if (entries.length === 0) return '-'
    return entries.map(([key, value]) => `${key}: ${value}`).join(', ')
  }

  return (
    <div>
      {/* Branch Selector */}
      {branches.length > 1 && (
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Pilih Cabang
          </label>
          <select
            value={selectedBranchId}
            onChange={e => setSelectedBranchId(e.target.value)}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            {branches.map(branch => (
              <option key={branch.id} value={branch.id}>
                {branch.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="text-gray-500">Memuat data stok...</div>
        </div>
      ) : stocks.length === 0 ? (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800">
            Belum ada stok untuk cabang ini. Admin dapat menambahkan produk ke cabang melalui menu Produk.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Produk
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Varian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    SKU
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Harga
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Stok
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {stocks.map(stock => {
                  const isLowStock = stock.quantity <= stock.low_stock_threshold
                  return (
                    <tr
                      key={stock.sku_id}
                      className={isLowStock ? 'bg-red-50' : ''}
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {stock.product_skus.products.name}
                        </div>
                        {stock.product_skus.products.brand && (
                          <div className="text-xs text-gray-500">
                            {stock.product_skus.products.brand}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700">
                        {renderVariantText(stock.product_skus.attributes)}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {stock.product_skus.sku_code || '-'}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {formatRupiah(stock.product_skus.price_idr)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            isLowStock
                              ? 'bg-red-100 text-red-800'
                              : stock.quantity === 0
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {stock.quantity}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() =>
                              updateStock(stock.sku_id, stock.quantity - 1)
                            }
                            disabled={
                              stock.quantity === 0 || updating === stock.sku_id
                            }
                            className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            -
                          </button>
                          <button
                            onClick={() =>
                              updateStock(stock.sku_id, stock.quantity + 1)
                            }
                            disabled={updating === stock.sku_id}
                            className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded disabled:opacity-50"
                          >
                            +
                          </button>
                          <button
                            onClick={() => {
                              const newQty = prompt(
                                'Masukkan jumlah stok baru:',
                                stock.quantity.toString()
                              )
                              if (newQty !== null) {
                                const qty = parseInt(newQty)
                                if (!isNaN(qty) && qty >= 0) {
                                  updateStock(stock.sku_id, qty)
                                }
                              }
                            }}
                            disabled={updating === stock.sku_id}
                            className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-sm disabled:opacity-50"
                          >
                            Set
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
