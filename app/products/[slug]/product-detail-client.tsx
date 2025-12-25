'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { formatRupiah, generateWhatsAppLink } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

interface ProductData {
  id: string
  slug: string
  name: string
  description: string | null
  brand: string | null
  base_image_url: string | null
  discount_percent?: number
  is_featured?: boolean
  categories: {
    name: string
  } | null
}

interface OptionType {
  id: string
  name: string
  position: number
  product_option_values: Array<{
    id: string
    value: string
    position: number
  }>
}

interface SKU {
  id: string
  sku_code: string | null
  attributes: Record<string, string>
  price_idr: number
}

interface BranchStock {
  branch_id: string
  sku_id: string
  quantity: number
  branches: {
    id: string
    slug: string
    name: string
    whatsapp_phone: string
    city: string | null
  }
}

interface Props {
  product: ProductData
  optionTypes: OptionType[]
  skus: SKU[]
  branchStock: BranchStock[]
  similarProducts?: Array<{
    id: string
    slug: string
    name: string
    brand: string | null
    base_image_url: string | null
    discount_percent?: number
    is_featured?: boolean
  }>
}

export default function ProductDetailClient({
  product,
  optionTypes,
  skus,
  branchStock,
  similarProducts = [],
}: Props) {
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({})
  const [selectedBranchId, setSelectedBranchId] = useState<string>('')

  // Find matching SKU based on selected options
  const matchedSKU = useMemo(() => {
    if (optionTypes.length === 0) {
      return skus[0] || null
    }

    const allOptionsSelected = optionTypes.every(
      opt => selectedOptions[opt.name]
    )

    if (!allOptionsSelected) return null

    return skus.find(sku => {
      return Object.entries(selectedOptions).every(
        ([key, value]) => sku.attributes[key] === value
      )
    }) || null
  }, [selectedOptions, skus, optionTypes])

  // Get branches with stock for current SKU
  const availableBranches = useMemo(() => {
    if (!matchedSKU) return []

    const stockMap = new Map<string, BranchStock>()
    branchStock
      .filter(bs => bs.sku_id === matchedSKU.id && bs.quantity > 0)
      .forEach(bs => stockMap.set(bs.branch_id, bs))

    return Array.from(stockMap.values()).sort((a, b) =>
      a.branches.name.localeCompare(b.branches.name)
    )
  }, [matchedSKU, branchStock])

  const handleOptionChange = (optionName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [optionName]: value,
    }))
    setSelectedBranchId('')
  }

  const selectedBranch = availableBranches.find(
    bs => bs.branch_id === selectedBranchId
  )

  const canOrder = matchedSKU && selectedBranch

  const handleWhatsAppClick = () => {
    if (!canOrder) return

    const link = generateWhatsAppLink(
      selectedBranch.branches.whatsapp_phone,
      product.name,
      matchedSKU.attributes,
      matchedSKU.price_idr,
      selectedBranch.branches.name
    )

    window.open(link, '_blank')
  }

  const discountedPrice = matchedSKU && product.discount_percent
    ? Math.round(matchedSKU.price_idr * (1 - product.discount_percent / 100))
    : null

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-slate-900 text-white shadow-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-4">
          <Link href="/" className="text-blue-300 hover:text-blue-200 font-medium">
            ← Kembali
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* Product Image */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 relative rounded-lg overflow-hidden border border-gray-200 group">
              {product.base_image_url ? (
                <Image
                  src={product.base_image_url}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <span className="text-6xl">📦</span>
                </div>
              )}
              {product.discount_percent ? (
                <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full font-bold text-sm">
                  -{product.discount_percent}%
                </div>
              ) : null}
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              {product.brand && (
                <p className="text-sm text-gray-500 mb-2 font-semibold uppercase">
                  {product.brand}
                </p>
              )}
              <h1 className="text-4xl font-bold text-gray-900 mb-3">
                {product.name}
              </h1>

              <div className="flex gap-2 flex-wrap items-center">
                {product.categories && (
                  <Badge variant="secondary" className="bg-blue-100 text-blue-700 hover:bg-blue-200">
                    {product.categories.name}
                  </Badge>
                )}
                {product.is_featured && (
                  <Badge variant="destructive" className="bg-orange-100 text-orange-700 hover:bg-orange-200">
                    ⭐ Featured
                  </Badge>
                )}
              </div>
            </div>

            {product.description && (
              <div className="prose prose-sm">
                <p className="text-gray-700 leading-relaxed">
                  {product.description}
                </p>
              </div>
            )}

            {/* Pricing Section */}
            {matchedSKU && (
              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                <div className="space-y-2">
                  {product.discount_percent ? (
                    <>
                      <p className="text-sm text-gray-600">Harga Normal</p>
                      <p className="text-lg text-gray-400 line-through">
                        {formatRupiah(matchedSKU.price_idr)}
                      </p>
                      <p className="text-sm text-gray-600 mt-3">Harga Spesial (Hemat {product.discount_percent}%)</p>
                      <p className="text-3xl font-bold text-red-600">
                        {formatRupiah(discountedPrice!)}
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-gray-600">Harga</p>
                      <p className="text-3xl font-bold text-blue-600">
                        {formatRupiah(matchedSKU.price_idr)}
                      </p>
                    </>
                  )}
                </div>
                {matchedSKU.sku_code && (
                  <p className="text-xs text-gray-500 mt-3 pt-3 border-t">
                    SKU: {matchedSKU.sku_code}
                  </p>
                )}
              </div>
            )}

            {/* Variant Selectors */}
            {optionTypes.length > 0 && (
              <div className="space-y-4 border-t pt-6">
                {optionTypes.map(optionType => (
                  <div key={optionType.id}>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {optionType.name}
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {optionType.product_option_values
                        .sort((a, b) => a.position - b.position)
                        .map(val => (
                          <button
                            key={val.id}
                            onClick={() =>
                              handleOptionChange(optionType.name, val.value)
                            }
                            className={`px-3 py-2 rounded-lg border-2 text-sm font-medium transition-all ${
                              selectedOptions[optionType.name] === val.value
                                ? 'border-blue-600 bg-blue-50 text-blue-700'
                                : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }`}
                          >
                            {val.value}
                          </button>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Branch Selector */}
            {matchedSKU && (
              <div className="border-t pt-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Tersedia di Cabang
                </label>
                {availableBranches.length === 0 ? (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                    ❌ Stok tidak tersedia di semua cabang untuk varian ini
                  </div>
                ) : (
                  <div className="space-y-2">
                    {availableBranches.map(bs => (
                      <button
                        key={bs.branch_id}
                        onClick={() => setSelectedBranchId(bs.branch_id)}
                        className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                          selectedBranchId === bs.branch_id
                            ? 'border-green-600 bg-green-50'
                            : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-semibold text-gray-900">
                              {bs.branches.name}
                            </p>
                            {bs.branches.city && (
                              <p className="text-sm text-gray-600">
                                📍 {bs.branches.city}
                              </p>
                            )}
                          </div>
                          <div className={`text-sm font-bold px-3 py-1 rounded-full ${
                            bs.quantity > 5
                              ? 'bg-green-100 text-green-700'
                              : bs.quantity > 0
                              ? 'bg-yellow-100 text-yellow-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {bs.quantity} stok
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* WhatsApp CTA */}
            <button
              onClick={handleWhatsAppClick}
              disabled={!canOrder}
              className={`w-full py-4 px-6 rounded-lg font-bold text-white transition-all flex items-center justify-center gap-2 text-lg ${
                canOrder
                  ? 'bg-green-600 hover:bg-green-700 shadow-lg hover:shadow-xl'
                  : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              <span className="text-2xl">💬</span>
              {canOrder ? 'Pesan via WhatsApp' : 'Pilih Varian & Cabang untuk Pesan'}
            </button>

            {!matchedSKU && optionTypes.length > 0 && (
              <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded text-center">
                👆 Pilih semua varian di atas untuk melihat harga dan ketersediaan
              </p>
            )}
          </div>
        </div>

        {/* Similar Products */}
        {similarProducts && similarProducts.length > 0 && (
          <div className="border-t pt-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Produk Serupa
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {similarProducts.slice(0, 4).map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group"
                >
                  <div className="relative bg-gray-100 aspect-square rounded-lg overflow-hidden mb-3 border border-gray-200 group-hover:shadow-md transition-shadow">
                    {product.base_image_url ? (
                      <Image
                        src={product.base_image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        📦
                      </div>
                    )}
                    {product.discount_percent ? (
                      <div className="absolute top-2 right-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        -{product.discount_percent}%
                      </div>
                    ) : null}
                  </div>
                  <p className="font-semibold text-gray-900 text-sm line-clamp-2 group-hover:text-blue-600">
                    {product.name}
                  </p>
                  {product.brand && (
                    <p className="text-xs text-gray-500">{product.brand}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
