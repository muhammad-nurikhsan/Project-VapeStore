'use client'

import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'

interface Product {
  id: string
  slug: string
  name: string
  brand: string | null
  base_image_url: string | null
  category_id: string | null
  discount_percent: number
  categories: {
    name: string
    slug: string
  } | null
  product_skus: Array<{
    price_idr: number
  }>
}

interface Category {
  id: string
  slug: string
  name: string
  parent_id: string | null
}

interface Brand {
  brand: string | null
}

interface NewArrival {
  id: string
  slug: string
  name: string
  brand: string | null
  base_image_url: string | null
  discount_percent: number
  category_name: string | null
}

interface BestDeal {
  id: string
  slug: string
  name: string
  brand: string | null
  base_image_url: string | null
  discount_percent: number
  min_price: number | null
  category_name: string | null
}

interface PopularCategory {
  id: string
  slug: string
  name: string
  product_count: number
}

export default function HomePage() {
  const searchParams = useSearchParams()
  const category = searchParams.get('category') || undefined
  const q = searchParams.get('q') || undefined
  const sort = searchParams.get('sort') || undefined

  const [categories, setCategories] = useState<Category[]>([])
  const [newArrivals, setNewArrivals] = useState<NewArrival[]>([])
  const [bestDeals, setBestDeals] = useState<BestDeal[]>([])
  const [popularCats, setPopularCats] = useState<PopularCategory[]>([])
  const [brands, setBrands] = useState<string[]>([])
  const [products, setProducts] = useState<(Product & { minPrice: number })[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const supabase = createClient()

      const [
        { data: categoriesData },
        { data: newArrivalsData },
        { data: bestDealsData },
        { data: popularCatsData },
        { data: brandsData },
      ] = await Promise.all([
        supabase
          .from('categories')
          .select('id, slug, name, parent_id')
          .order('name'),
        supabase.from('v_new_arrivals').select('*'),
        supabase.from('v_best_deals').select('*'),
        supabase.from('v_popular_categories').select('*').limit(6),
        supabase.from('v_all_brands').select('brand').limit(20),
      ])

      const categoryList = (categoriesData || []) as Category[]
      setCategories(categoryList)
      setNewArrivals((newArrivalsData || []) as NewArrival[])
      setBestDeals((bestDealsData || []) as BestDeal[])
      setPopularCats((popularCatsData || []) as PopularCategory[])
      setBrands(((brandsData || []) as any[]).map(b => b.brand).filter(Boolean) as string[])

      let query = supabase
        .from('products')
        .select(`
          id,
          slug,
          name,
          brand,
          base_image_url,
          category_id,
          discount_percent,
          categories (
            name,
            slug
          ),
          product_skus (
            price_idr
          )
        `)
        .eq('is_active', true)
        .order('name')

      if (sort === 'newest') {
        query = query.order('created_at', { ascending: false })
      }

      if (category) {
        const categoryObj = categoryList.find(c => c.slug === category)
        if (categoryObj) {
          query = query.eq('category_id', categoryObj.id)
        }
      }

      if (q) {
        const term = `%${q}%`
        query = query.or(`name.ilike.${term},brand.ilike.${term}`)
      }

      const { data: productsData } = await query

      const productsWithPrice = (productsData as Product[] || []).map(product => {
        const minPrice = product.product_skus.length > 0
          ? Math.min(...product.product_skus.map(sku => sku.price_idr))
          : 0
        return { ...product, minPrice }
      })

      setProducts(productsWithPrice)
      setLoading(false)
    }

    fetchData()
  }, [category, q, sort])

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Modern Header with Glass Effect */}
      <header className="glass fixed top-0 left-0 right-0 z-50 border-b border-slate-200/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl group-hover:scale-105 transition-transform">
                <span className="text-2xl">💨</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Vapestore
                </h1>
                <p className="text-xs text-slate-500">Multi-Branch Digital Catalog</p>
              </div>
            </Link>
            <Link 
              href="/login" 
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-900 font-medium text-sm transition-all border border-slate-300"
            >
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Premium Hero Section */}
          <section className="relative rounded-3xl overflow-hidden mb-12 animate-fade-in shadow-strong">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMC41IiBvcGFjaXR5PSIwLjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
            
            <div className="relative z-10 p-8 sm:p-16">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-white mb-6">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                  </span>
                  Stok Update Realtime
                </div>
                
                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight">
                  Temukan Vape <br className="hidden sm:block"/>
                  <span className="text-transparent bg-gradient-to-r from-yellow-200 to-pink-200 bg-clip-text">
                    Impian Kamu
                  </span>
                </h2>
                
                <p className="text-lg text-blue-100 mb-8 leading-relaxed max-w-2xl">
                  Katalog lengkap dengan stok real-time per cabang. Cek ketersediaan produk, lihat spesifikasi detail, dan langsung hubungi kami via WhatsApp.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button 
                    size="lg" 
                    className="bg-white text-blue-600 hover:bg-blue-50 font-semibold shadow-lg hover:shadow-xl transition-all"
                    onClick={() => document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' })}
                  >
                    Jelajahi Katalog
                    <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </Button>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20"
                  >
                    Lihat Lokasi Toko
                  </Button>
                </div>
              </div>
              
              <div className="absolute right-8 bottom-8 hidden lg:block">
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-white shadow-xl">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="text-3xl">📦</div>
                    <div>
                      <p className="text-2xl font-bold">{products.length}+</p>
                      <p className="text-sm text-blue-100">Produk Tersedia</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Promo Banner */}
          <section className="mb-12 animate-slide-up">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-orange-500 rounded-xl p-6 shadow-soft">
              <div className="flex items-start sm:items-center justify-between gap-4 flex-col sm:flex-row">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🎉</div>
                  <div>
                    <p className="font-bold text-gray-900 text-lg">Promo Spesial Hari Ini!</p>
                    <p className="text-sm text-gray-700 mt-1">
                      Dapatkan diskon hingga 20% untuk produk pilihan. Gratis ongkir area Jakarta!
                    </p>
                  </div>
                </div>
                <Link 
                  href="/?sort=best-deals" 
                  className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-lg transition-all whitespace-nowrap shadow-md hover:shadow-lg"
                >
                  Lihat Promo →
                </Link>
              </div>
            </div>
          </section>

          {/* Search & Filter */}
          <div id="catalog" className="mb-12">
            <div className="bg-white rounded-2xl shadow-medium border border-slate-200 p-6">
              <form className="space-y-4" action="/">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      name="q"
                      defaultValue={q || ''}
                      placeholder="Cari produk, brand, atau kategori..."
                      className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <select
                    name="sort"
                    defaultValue={sort || ''}
                    className="px-4 py-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-full sm:w-48"
                  >
                    <option value="">Urutkan: Default</option>
                    <option value="newest">Terbaru</option>
                  </select>
                  {category && <input type="hidden" name="category" value={category} />}
                  <Button type="submit" size="lg" className="font-semibold">
                    Terapkan Filter
                  </Button>
                </div>
                
                {(q || sort || category) && (
                  <div className="flex items-center gap-3 pt-2">
                    <span className="text-sm text-slate-600">Filter aktif:</span>
                    <div className="flex gap-2 flex-wrap">
                      {q && (
                        <Badge variant="secondary" className="gap-1">
                          Pencarian: {q}
                        </Badge>
                      )}
                      {sort && (
                        <Badge variant="secondary" className="gap-1">
                          Urutan: {sort === 'newest' ? 'Terbaru' : 'Default'}
                        </Badge>
                      )}
                      {category && (
                        <Badge variant="secondary" className="gap-1">
                          Kategori: {categories.find(c => c.slug === category)?.name}
                        </Badge>
                      )}
                    </div>
                    <Link
                      href="/"
                      className="ml-auto text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Reset Semua
                    </Link>
                  </div>
                )}
              </form>
              
              <div className="mt-6 pt-6 border-t border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <span className="text-sm font-semibold text-slate-700">Kategori</span>
                </div>
                <div className="flex gap-2 overflow-x-auto pb-2">
                  <Link
                    href="/"
                    className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                      !category
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    Semua Produk
                  </Link>
                  {categories.filter(c => !c.parent_id).map(cat => (
                    <Link
                      key={cat.id}
                      href={`/?category=${cat.slug}${q ? `&q=${encodeURIComponent(q)}` : ''}${sort ? `&sort=${sort}` : ''}`}
                      className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                        category === cat.slug
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Popular Categories */}
          {popularCats.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                <h3 className="text-2xl font-bold text-gray-900">Kategori Populer</h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
                {popularCats.map(cat => (
                  <Link
                    key={cat.id}
                    href={`/?category=${cat.slug}`}
                    className="group bg-white rounded-2xl p-6 text-center hover:shadow-strong transition-all border border-slate-200 hover:border-blue-300 card-hover"
                  >
                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">📦</div>
                    <h4 className="font-bold text-gray-900 text-sm mb-1">{cat.name}</h4>
                    <p className="text-xs text-slate-500">{cat.product_count} produk</p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Main Product Grid */}
          {products.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-300">
              <div className="text-6xl mb-4">📭</div>
              <p className="text-gray-900 text-xl font-bold">Belum ada produk tersedia</p>
              <p className="text-gray-500 mt-2">Coba hapus filter atau kembali ke kategori lain.</p>
              <Button className="mt-6" onClick={() => window.location.href = '/'}>
                Reset Filter
              </Button>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-blue-600 to-purple-600 rounded-full"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">Semua Produk</h3>
                    <p className="text-sm text-slate-500">{products.length} produk ditemukan</p>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
                {products.map(product => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group bg-white rounded-2xl shadow-soft hover:shadow-strong transition-all overflow-hidden border border-slate-200 hover:border-blue-300 card-hover"
                  >
                    <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-50 relative overflow-hidden">
                      {product.base_image_url ? (
                        <Image
                          src={product.base_image_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <span className="text-5xl">📦</span>
                        </div>
                      )}
                      {product.discount_percent > 0 && (
                        <div className="absolute top-3 right-3">
                          <div className="bg-red-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-lg">
                            HEMAT {product.discount_percent}%
                          </div>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2 flex-wrap min-h-[24px]">
                        {product.brand && (
                          <Badge variant="secondary" className="text-[10px] font-semibold">
                            {product.brand}
                          </Badge>
                        )}
                        {product.categories && (
                          <Badge variant="outline" className="text-[10px]">
                            {product.categories.name}
                          </Badge>
                        )}
                      </div>
                      <h3 className="font-bold text-sm text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-blue-600 transition-colors">
                        {product.name}
                      </h3>
                      <div className="pt-2 border-t border-slate-100">
                        <p className="text-blue-600 font-bold text-lg">
                          {formatRupiah(product.minPrice)}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          Pilih varian & cabang
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </>
          )}

          {/* New Arrivals */}
          {newArrivals.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-emerald-500 to-teal-500 rounded-full"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">✨ Produk Terbaru</h3>
                    <p className="text-sm text-slate-500">Fresh from the latest collection</p>
                  </div>
                </div>
                <Link href="/?sort=newest" className="text-blue-600 hover:text-blue-700 font-semibold text-sm flex items-center gap-1 group">
                  Lihat Semua
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {newArrivals.slice(0, 4).map(product => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group bg-white rounded-2xl shadow-soft hover:shadow-strong transition-all overflow-hidden border border-slate-200 hover:border-emerald-300 card-hover"
                  >
                    <div className="aspect-square bg-gradient-to-br from-emerald-50 to-teal-50 relative overflow-hidden">
                      {product.base_image_url ? (
                        <Image
                          src={product.base_image_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <span className="text-5xl">📦</span>
                        </div>
                      )}
                      <Badge className="absolute top-3 left-3 bg-emerald-500 hover:bg-emerald-600 shadow-lg font-bold">
                        BARU
                      </Badge>
                      {product.discount_percent > 0 && (
                        <div className="absolute top-3 right-3 bg-red-500 text-white px-2.5 py-1 rounded-lg text-xs font-bold shadow-lg">
                          -{product.discount_percent}%
                        </div>
                      )}
                    </div>
                    <div className="p-4 space-y-2">
                      {product.brand && (
                        <Badge variant="secondary" className="text-xs font-semibold">{product.brand}</Badge>
                      )}
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-emerald-600 transition-colors">
                        {product.name}
                      </h4>
                      {product.category_name && (
                        <p className="text-xs text-slate-500">{product.category_name}</p>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Best Deals */}
          {bestDeals.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-orange-500 to-red-500 rounded-full"></div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900">🔥 Deals Terbaik</h3>
                    <p className="text-sm text-slate-500">Diskon hingga 20% - Terbatas!</p>
                  </div>
                </div>
                <Link href="/?sort=best-deals" className="text-orange-600 hover:text-orange-700 font-semibold text-sm flex items-center gap-1 group">
                  Lihat Semua
                  <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
                {bestDeals.slice(0, 4).map(product => (
                  <Link
                    key={product.id}
                    href={`/products/${product.slug}`}
                    className="group bg-white rounded-2xl shadow-soft hover:shadow-strong transition-all overflow-hidden border-2 border-orange-200 hover:border-orange-400 card-hover relative"
                  >
                    <div className="absolute -top-1 -right-1 bg-red-500 text-white px-3 py-1 rounded-bl-xl rounded-tr-xl text-xs font-bold z-10 shadow-lg">
                      SALE
                    </div>
                    <div className="aspect-square bg-gradient-to-br from-orange-50 to-red-50 relative overflow-hidden">
                      {product.base_image_url ? (
                        <Image
                          src={product.base_image_url}
                          alt={product.name}
                          fill
                          className="object-cover group-hover:scale-110 transition-transform duration-500"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300">
                          <span className="text-5xl">📦</span>
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3 right-3">
                        <div className="bg-red-500 text-white px-3 py-2 rounded-lg text-center font-bold shadow-xl">
                          HEMAT {product.discount_percent}%
                        </div>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      {product.brand && (
                        <Badge variant="secondary" className="text-xs font-semibold">{product.brand}</Badge>
                      )}
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-2 min-h-[40px] group-hover:text-orange-600 transition-colors">
                        {product.name}
                      </h4>
                      {product.min_price && (
                        <div className="pt-2 border-t border-orange-100">
                          <p className="text-orange-600 font-bold text-lg">
                            {formatRupiah(product.min_price)}
                          </p>
                          <p className="text-xs text-slate-500 line-through">
                            {formatRupiah(Math.round(product.min_price / (1 - product.discount_percent / 100)))}
                          </p>
                        </div>
                      )}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Brand Showcase */}
          {brands.length > 0 && (
            <section className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-1 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Brand Populer</h3>
                  <p className="text-sm text-slate-500">Produk original dari brand terpercaya</p>
                </div>
              </div>
              <div className="bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200 p-8 shadow-medium">
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {brands.slice(0, 10).map(brand => (
                    <Link
                      key={brand}
                      href={`/?q=${encodeURIComponent(brand)}`}
                      className="group bg-white hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-xl px-6 py-4 text-center font-semibold text-slate-700 hover:text-blue-600 transition-all shadow-soft hover:shadow-medium"
                    >
                      <span className="text-lg">{brand}</span>
                    </Link>
                  ))}
                </div>
                {brands.length > 10 && (
                  <div className="mt-6 text-center">
                    <Link href="/" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                      Lihat {brands.length - 10}+ brand lainnya →
                    </Link>
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Marketplace CTA */}
          <section className="relative rounded-3xl overflow-hidden mb-12 shadow-strong">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-red-600"></div>
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImRvdHMiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PGNpcmNsZSBjeD0iMiIgY3k9IjIiIHI9IjEiIGZpbGw9IndoaXRlIiBvcGFjaXR5PSIwLjIiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZG90cykiLz48L3N2Zz4=')] opacity-40"></div>
            
            <div className="relative z-10 p-8 sm:p-12 text-center text-white">
              <div className="max-w-3xl mx-auto">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6">
                  <span className="text-xl">🛍️</span>
                  Multi-Platform
                </div>
                
                <h3 className="text-3xl sm:text-4xl font-bold mb-4">
                  Belanja di Platform Favorit Kamu
                </h3>
                <p className="text-purple-100 text-lg mb-8 max-w-2xl mx-auto">
                  Temukan produk kami di berbagai marketplace dengan harga terbaik, gratis ongkir, dan garansi 100% original.
                </p>
                
                <div className="flex flex-wrap gap-4 justify-center">
                  <a 
                    href="https://tokopedia.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white text-purple-600 hover:bg-purple-50 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                  >
                    <span className="text-xl">🟢</span> Tokopedia
                  </a>
                  <a 
                    href="https://shopee.co.id" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white text-purple-600 hover:bg-purple-50 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                  >
                    <span className="text-xl">🟠</span> Shopee
                  </a>
                  <a 
                    href="https://blibli.com" 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-6 py-3 bg-white text-purple-600 hover:bg-purple-50 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
                  >
                    <span className="text-xl">🔵</span> BliBli
                  </a>
                  <Button 
                    size="lg" 
                    className="bg-green-500 hover:bg-green-600 text-white font-bold shadow-lg hover:shadow-xl"
                  >
                    <span className="text-xl mr-2">💬</span>
                    Chat WhatsApp
                  </Button>
                </div>
              </div>
            </div>
          </section>

          {/* Store Locations */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-gradient-to-b from-blue-500 to-teal-500 rounded-full"></div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Kunjungi Toko Kami</h3>
                <p className="text-sm text-slate-500">Belanja langsung atau konsultasi dengan tim kami</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="group bg-white rounded-2xl p-6 shadow-soft hover:shadow-strong transition-all border border-slate-200 hover:border-blue-300">
                <div className="flex items-start gap-4">
                  <div className="bg-blue-100 p-3 rounded-xl group-hover:bg-blue-200 transition-colors">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Jakarta Pusat</h4>
                    <p className="text-slate-600 text-sm mb-3">Jl. Contoh No. 123, Jakarta Pusat</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        +62 812 1234 5678
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Senin - Minggu, 10.00 - 21.00 WIB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="group bg-white rounded-2xl p-6 shadow-soft hover:shadow-strong transition-all border border-slate-200 hover:border-blue-300">
                <div className="flex items-start gap-4">
                  <div className="bg-purple-100 p-3 rounded-xl group-hover:bg-purple-200 transition-colors">
                    <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-lg text-gray-900 mb-2">Bandung</h4>
                    <p className="text-slate-600 text-sm mb-3">Jl. Dago No. 456, Bandung</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                        +62 812 9876 5432
                      </div>
                      <div className="flex items-center gap-2 text-slate-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Senin - Minggu, 10.00 - 20.00 WIB
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Premium Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-300 border-t border-slate-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-xl">
                  <span className="text-2xl">💨</span>
                </div>
                <h4 className="font-bold text-xl text-white">Vapestore</h4>
              </div>
              <p className="text-sm text-slate-400 mb-6 leading-relaxed">
                Katalog digital vape terpercaya dengan sistem multi-cabang dan stok real-time. Belanja mudah, aman, dan terpercaya.
              </p>
              <div className="flex gap-3">
                <a href="#" className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors">
                  <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </a>
                <a href="#" className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors">
                  <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                  </svg>
                </a>
                <a href="#" className="bg-slate-800 hover:bg-slate-700 p-3 rounded-xl transition-colors">
                  <svg className="w-5 h-5 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h5 className="font-bold text-white mb-4 text-lg">Kategori</h5>
              <ul className="space-y-3 text-sm">
                {categories.filter(c => !c.parent_id).slice(0, 5).map(cat => (
                  <li key={cat.id}>
                    <Link href={`/?category=${cat.slug}`} className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                      <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h5 className="font-bold text-white mb-4 text-lg">Bantuan</h5>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Cara Belanja
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Kebijakan Privasi
                  </a>
                </li>
                <li>
                  <a href="#" className="text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                    <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                    Syarat & Ketentuan
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h5 className="font-bold text-white mb-4 text-lg">Hubungi Kami</h5>
              <ul className="space-y-4 text-sm">
                <li className="flex items-start gap-3">
                  <div className="bg-slate-800 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-400">Email</p>
                    <a href="mailto:info@vapestore.com" className="text-white hover:text-blue-400 transition-colors">
                      info@vapestore.com
                    </a>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="bg-slate-800 p-2 rounded-lg">
                    <svg className="w-4 h-4 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-slate-400">WhatsApp</p>
                    <a href="https://wa.me/6281212345678" className="text-white hover:text-green-400 transition-colors">
                      +62 812 1234 5678
                    </a>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-slate-700 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-slate-500 text-center md:text-left">
                © 2025 Vapestore. All rights reserved. | Digital Catalog & Multi-Branch Inventory System
              </p>
              <div className="flex items-center gap-6 text-xs text-slate-500">
                <span className="inline-flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  System Online
                </span>
                <Link href="/login" className="hover:text-white transition-colors">
                  Admin Portal
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
