import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ProductDetailClient from './product-detail-client'
import type { Metadata } from 'next'

export const revalidate = 3600

interface ProductData {
  id: string
  slug: string
  name: string
  description: string | null
  brand: string | null
  base_image_url: string | null
  meta_title: string | null
  meta_description: string | null
  discount_percent?: number
  is_featured?: boolean
  categories: {
    name: string
    id?: string
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: product } = await supabase
    .from('products')
    .select('name, meta_title, meta_description, description')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  interface MetaProduct {
    name: string
    meta_title: string | null
    meta_description: string | null
    description: string | null
  }

  const metaProduct = product as MetaProduct | null

  if (!metaProduct) {
    return {
      title: 'Produk Tidak Ditemukan',
    }
  }

  return {
    title: metaProduct.meta_title || `${metaProduct.name} - Vapestore`,
    description: metaProduct.meta_description || metaProduct.description || '',
  }
}

interface ProductWithDiscount extends ProductData {
  discount_percent?: number
  is_featured?: boolean
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  // Fetch product with discount & featured fields
  const { data: product, error: productError } = await supabase
    .from('products')
    .select(`
      id,
      slug,
      name,
      description,
      brand,
      base_image_url,
      meta_title,
      meta_description,
      discount_percent,
      is_featured,
      categories (
        name,
        id
      )
    `)
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (productError || !product) {
    notFound()
  }

  const productData = product as ProductWithDiscount

  // Fetch option types and values
  const { data: optionTypes } = await supabase
    .from('product_option_types')
    .select(`
      id,
      name,
      position,
      product_option_values (
        id,
        value,
        position
      )
    `)
    .eq('product_id', productData.id)
    .order('position')

  // Fetch SKUs
  const { data: skus } = await supabase
    .from('product_skus')
    .select('id, sku_code, attributes, price_idr')
    .eq('product_id', productData.id)
    .eq('is_active', true)

  const skuList = (skus || []) as SKU[]

  // Fetch stock for all branches
  const { data: branchStock } = await supabase
    .from('branch_stock')
    .select(`
      branch_id,
      sku_id,
      quantity,
      branches (
        id,
        slug,
        name,
        whatsapp_phone,
        city
      )
    `)
    .in('sku_id', skuList.map(s => s.id))
    .gt('quantity', 0)

  // Fetch similar products (same category, different product)
  const category_id = (productData.categories as any)?.id
  const { data: similarProducts } = category_id
    ? await supabase
        .from('products')
        .select('id, slug, name, brand, base_image_url, discount_percent, is_featured')
        .eq('category_id', category_id)
        .eq('is_active', true)
        .neq('id', productData.id)
        .limit(4)
    : { data: null }

  return (
    <ProductDetailClient
      product={productData}
      optionTypes={(optionTypes || []) as OptionType[]}
      skus={skuList}
      branchStock={(branchStock || []) as BranchStock[]}
      similarProducts={(similarProducts || []) as any[]}
    />
  )
}
