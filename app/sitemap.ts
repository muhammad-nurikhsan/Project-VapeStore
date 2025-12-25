import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

interface Product {
  slug: string
  updated_at: string
}

interface Category {
  slug: string
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://vapestore.com'
  const supabase = await createClient()

  // Get all active products
  const { data: products } = await supabase
    .from('products')
    .select('slug, updated_at')
    .eq('is_active', true)

  const productList = (products || []) as Product[]

  const productUrls: MetadataRoute.Sitemap = productList.map(product => ({
    url: `${baseUrl}/products/${product.slug}`,
    lastModified: new Date(product.updated_at),
    changeFrequency: 'daily',
    priority: 0.8,
  }))

  // Get categories
  const { data: categories } = await supabase
    .from('categories')
    .select('slug')

  const categoryList = (categories || []) as Category[]

  const categoryUrls: MetadataRoute.Sitemap = categoryList.map(cat => ({
    url: `${baseUrl}/?category=${cat.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    ...productUrls,
    ...categoryUrls,
  ]
}
