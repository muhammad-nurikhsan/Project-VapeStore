import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import Image from 'next/image'
import { formatRupiah } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export const revalidate = 3600

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

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()

  const [
    { data: categories },
    { data: newArrivals },
    { data: bestDeals },
    { data: popularCats },
    { data: brands },
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

  const categoryList = (categories || []) as Category[]
  const newArrivalList = (newArrivals || []) as NewArrival[]
  const bestDealList = (bestDeals || []) as BestDeal[]
  const popularCategoryList = (popularCats || []) as PopularCategory[]
  const brandList = ((brands || []) as any[]).map(b => b.brand).filter(Boolean) as string[]

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

  if (params.sort === 'newest') {
    query = query.order('created_at', { ascending: false })
  }

  if (params.category) {
    const category = categoryList.find(c => c.slug === params.category)
    if (category) {
      query = query.eq('category_id', category.id)
    }
  }

  if (params.q) {
    const term = `%${params.q}%`
    query = query.or(`name.ilike.${term},brand.ilike.${term}`)
  }

  const { data: products } = await query

  const productsWithPrice = (products as Product[] || []).map(product => {
    const minPrice = product.product_skus.length > 0
      ? Math.min(...product.product_skus.map(sku => sku.price_idr))
      : 0
    return { ...product, minPrice }
  })

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Vapestore</h1>
              <p className="text-xs text-slate-600">Katalog Digital Multi-Cabang</p>
            </div>
            <Link href="/login" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
              Admin Login
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-3xl text-white p-8 sm:p-12 mb-8 shadow-xl overflow-hidden relative">
          <div className="absolute top-0 right-0 w-40 h-40 bg-blue-500 rounded-full opacity-20 -mr-10 -mt-10"></div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 relative z-10">
            <div>
              <p className="text-sm uppercase tracking-widest font-semibold text-blue-200">Selamat Datang</p>
              <h2 className="text-3xl sm:text-4xl font-bold mt-2">Temukan Vape Impian Kamu</h2>
              <p className="text-base text-blue-100 mt-3 max-w-2xl">
                Katalog lengkap dengan stok realtime per cabang. Cek ketersediaan dan chat langsung via WhatsApp.
              </p>
              <Button className="mt-6 bg-white text-blue-600 hover:bg-blue-50 font-semibold" size="lg">
                Jelajahi Katalog
              </Button>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full text-sm backdrop-blur">
                <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Stok Update Realtime
              </div>
            </div>
          </div>
        </section>

        {/* Promo Strip */}
        <section className="bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-orange-500 rounded-lg p-4 mb-8 flex items-center justify-between">
          <div>
            <p className="font-semibold text-gray-900">🎉 Promo Spesial!</p>
            <p className="text-sm text-gray-700">Dapatkan diskon hingga 20% untuk produk pilihan. Gratis ongkir lokal Jakarta!</p>
          </div>
          <Link href="/?sort=best-deals" className="text-orange-600 font-semibold hover:text-orange-700 whitespace-nowrap ml-4">
            Lihat Promo →
          </Link>
        </section>

        {/* Search & Filter Bar */}
        <div className="flex flex-col gap-3 mb-8">
          <form className="flex flex-col sm:flex-row gap-3" action="/">
            <input
              type="text"
              name="q"
              defaultValue={params.q || ''}
              placeholder="Cari produk atau brand..."
              className="w-full sm:w-80 rounded-lg border border-gray-300 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <select
              name="sort"
              defaultValue={params.sort || ''}
              className="rounded-lg border border-gray-300 px-3 py-2 text-sm w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Urutkan: Nama</option>
              <option value="newest">Urutkan: Terbaru</option>
            </select>
            {params.category && <input type="hidden" name="category" value={params.category} />}
            <Button className="px-6">Terapkan</Button>
            {(params.q || params.sort || params.category) && (
              <Link
                href="/"
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm text-gray-700 bg-white hover:bg-gray-50"
              >
                Reset
              </Link>
            )}
          </form>

          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              <Link
                href="/"
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  !params.category
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Semua
              </Link>
              {categoryList.filter(c => !c.parent_id).map(category => (
                <Link
                  key={category.id}
                  href={`/?category=${category.slug}${params.q ? `&q=${encodeURIComponent(params.q)}` : ''}${params.sort ? `&sort=${params.sort}` : ''}`}
                  className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    params.category === category.slug
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                  }`}
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Popular Categories */}
        {popularCategoryList.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Kategori Populer</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {popularCategoryList.map(cat => (
                <Link
                  key={cat.id}
                  href={`/?category=${cat.slug}`}
                  className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-6 text-center hover:shadow-lg transition-all border border-slate-200"
                >
                  <p className="text-3xl mb-2">📦</p>
                  <h4 className="font-semibold text-gray-900 text-sm mb-1">{cat.name}</h4>
                  <p className="text-xs text-gray-600">{cat.product_count} produk</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Main Product Grid */}
        {productsWithPrice.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-3xl mb-4">📭</p>
            <p className="text-gray-700 text-lg font-semibold">Belum ada produk tersedia</p>
            <p className="text-gray-500 mt-2 text-sm">Coba hapus filter atau kembali ke kategori lain.</p>
          </div>
        ) : (
          <>
            <h3 className="text-xl font-bold text-gray-900 mb-6">Produk Tersedia</h3>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6 mb-12">
              {productsWithPrice.map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-200 hover:border-blue-200"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.base_image_url ? (
                      <Image
                        src={product.base_image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                    {product.discount_percent > 0 && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-semibold">
                        -{product.discount_percent}%
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      {product.brand && (
                        <Badge variant="secondary" className="text-[11px]">
                          {product.brand}
                        </Badge>
                      )}
                      {product.categories && (
                        <Badge variant="outline" className="text-[11px]">
                          {product.categories.name}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 min-h-[40px]">
                      {product.name}
                    </h3>
                    <p className="text-blue-600 font-bold text-base">
                      {formatRupiah(product.minPrice)}
                    </p>
                    <p className="text-[11px] text-gray-500">Klik untuk pilih varian & cabang</p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        {/* New Arrivals */}
        {newArrivalList.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">✨ Produk Terbaru</h3>
              <Link href="/?sort=newest" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                Lihat Semua →
              </Link>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivalList.slice(0, 4).map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-200 hover:border-blue-200"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.base_image_url ? (
                      <Image
                        src={product.base_image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-emerald-500 hover:bg-emerald-600">Baru</Badge>
                    {product.discount_percent > 0 && (
                      <div className="absolute top-3 right-3 bg-red-600 text-white px-2 py-1 rounded-lg text-xs font-bold">
                        -{product.discount_percent}%
                      </div>
                    )}
                  </div>
                  <div className="p-4 space-y-2">
                    {product.brand && <Badge variant="secondary" className="text-xs">{product.brand}</Badge>}
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">{product.name}</h4>
                    {product.category_name && <p className="text-xs text-gray-500">{product.category_name}</p>}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Best Deals */}
        {bestDealList.length > 0 && (
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">🔥 Deals Terbaik</h3>
              <Link href="/?sort=best-deals" className="text-blue-600 hover:text-blue-700 font-semibold text-sm">
                Lihat Semua →
              </Link>
            </div>
            <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestDealList.slice(0, 4).map(product => (
                <Link
                  key={product.id}
                  href={`/products/${product.slug}`}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all overflow-hidden border border-gray-200 hover:border-orange-200 ring-1 ring-orange-100"
                >
                  <div className="aspect-square bg-gray-100 relative overflow-hidden">
                    {product.base_image_url ? (
                      <Image
                        src={product.base_image_url}
                        alt={product.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <span className="text-4xl">📦</span>
                      </div>
                    )}
                    <div className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold animate-pulse">
                      HEMAT {product.discount_percent}%
                    </div>
                  </div>
                  <div className="p-4 space-y-2">
                    {product.brand && <Badge variant="secondary" className="text-xs">{product.brand}</Badge>}
                    <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">{product.name}</h4>
                    {product.min_price && (
                      <p className="text-blue-600 font-bold">{formatRupiah(product.min_price)}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Brand Belt */}
        {brandList.length > 0 && (
          <section className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Brand Populer</h3>
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl border border-slate-200 p-6">
              <div className="overflow-x-auto">
                <div className="flex gap-4 pb-4">
                  {brandList.map(brand => (
                    <Link
                      key={brand}
                      href={`/?q=${encodeURIComponent(brand)}`}
                      className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-blue-50 hover:border-blue-300 whitespace-nowrap transition-all"
                    >
                      {brand}
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Marketplace CTA */}
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl text-white p-8 sm:p-12 mb-12 shadow-xl">
          <div className="text-center">
            <h3 className="text-2xl sm:text-3xl font-bold mb-4">Belanja di Berbagai Platform</h3>
            <p className="text-purple-100 mb-8 max-w-2xl mx-auto">
              Vapestore tersedia di semua marketplace favorit kamu dengan harga terbaik dan garansi authenticity.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="secondary" className="font-semibold">
                <a href="https://tokopedia.com" target="_blank" rel="noopener noreferrer" className="no-underline">
                  Tokopedia
                </a>
              </Button>
              <Button variant="secondary" className="font-semibold">
                <a href="https://shopee.co.id" target="_blank" rel="noopener noreferrer" className="no-underline">
                  Shopee
                </a>
              </Button>
              <Button variant="secondary" className="font-semibold">
                <a href="https://blibli.com" target="_blank" rel="noopener noreferrer" className="no-underline">
                  BliBli
                </a>
              </Button>
              <Button className="bg-white text-purple-600 hover:bg-purple-50 font-semibold">
                Chat via WhatsApp
              </Button>
            </div>
          </div>
        </section>

        {/* Location Section */}
        <section className="mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6">Kunjungi Toko Kami</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6">
              <h4 className="font-semibold text-lg text-gray-900 mb-3">Jakarta Pusat</h4>
              <p className="text-gray-600 text-sm mb-2">Jl. Contoh No. 123, Jakarta Pusat</p>
              <p className="text-gray-600 text-sm mb-4">📱 +62 812 1234 5678</p>
              <p className="text-gray-500 text-xs">⏰ Senin - Minggu, 10.00 - 21.00 WIB</p>
            </Card>
            <Card className="p-6">
              <h4 className="font-semibold text-lg text-gray-900 mb-3">Bandung</h4>
              <p className="text-gray-600 text-sm mb-2">Jl. Dago No. 456, Bandung</p>
              <p className="text-gray-600 text-sm mb-4">📱 +62 812 9876 5432</p>
              <p className="text-gray-500 text-xs">⏰ Senin - Minggu, 10.00 - 20.00 WIB</p>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-200 mt-12 py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">Vapestore</h4>
              <p className="text-sm text-slate-400">Katalog digital vape terpercaya dengan multi-cabang dan stok realtime.</p>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Kategori</h5>
              <ul className="space-y-2 text-sm">
                <li><Link href="/?category=liquid" className="text-slate-400 hover:text-white">Liquid</Link></li>
                <li><Link href="/?category=pod" className="text-slate-400 hover:text-white">Pod</Link></li>
                <li><Link href="/?category=mod" className="text-slate-400 hover:text-white">Mod</Link></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Sosial Media</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white">Instagram</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white">TikTok</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white">WhatsApp</a></li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold text-white mb-4">Lainnya</h5>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="text-slate-400 hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white">FAQ</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8">
            <p className="text-center text-sm text-slate-500">
              © 2025 Vapestore. All rights reserved. | Katalog Digital Multi-Cabang & Inventory
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
