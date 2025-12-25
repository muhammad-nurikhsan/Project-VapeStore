export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      branches: {
        Row: {
          id: string
          slug: string
          name: string
          whatsapp_phone: string
          address: string | null
          city: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          whatsapp_phone: string
          address?: string | null
          city?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          whatsapp_phone?: string
          address?: string | null
          city?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      categories: {
        Row: {
          id: string
          slug: string
          name: string
          parent_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          parent_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      products: {
        Row: {
          id: string
          slug: string
          name: string
          description: string | null
          brand: string | null
          category_id: string | null
          base_image_url: string | null
          is_active: boolean
          meta_title: string | null
          meta_description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          name: string
          description?: string | null
          brand?: string | null
          category_id?: string | null
          base_image_url?: string | null
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          name?: string
          description?: string | null
          brand?: string | null
          category_id?: string | null
          base_image_url?: string | null
          is_active?: boolean
          meta_title?: string | null
          meta_description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      product_option_types: {
        Row: {
          id: string
          product_id: string
          name: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          name: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          name?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_option_values: {
        Row: {
          id: string
          option_type_id: string
          value: string
          position: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          option_type_id: string
          value: string
          position?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          option_type_id?: string
          value?: string
          position?: number
          created_at?: string
          updated_at?: string
        }
      }
      product_skus: {
        Row: {
          id: string
          product_id: string
          sku_code: string | null
          attributes: Json
          price_idr: number
          is_active: boolean
          barcode: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          product_id: string
          sku_code?: string | null
          attributes?: Json
          price_idr: number
          is_active?: boolean
          barcode?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          sku_code?: string | null
          attributes?: Json
          price_idr?: number
          is_active?: boolean
          barcode?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      branch_stock: {
        Row: {
          branch_id: string
          sku_id: string
          quantity: number
          low_stock_threshold: number
          updated_at: string
        }
        Insert: {
          branch_id: string
          sku_id: string
          quantity?: number
          low_stock_threshold?: number
          updated_at?: string
        }
        Update: {
          branch_id?: string
          sku_id?: string
          quantity?: number
          low_stock_threshold?: number
          updated_at?: string
        }
      }
      staff_profiles: {
        Row: {
          user_id: string
          full_name: string | null
          role: 'admin' | 'vaporista'
          branch_id: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name?: string | null
          role: 'admin' | 'vaporista'
          branch_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string | null
          role?: 'admin' | 'vaporista'
          branch_id?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      v_catalog_skus: {
        Row: {
          sku_id: string
          sku_code: string | null
          attributes: Json
          price_idr: number
          sku_active: boolean
          product_id: string
          product_slug: string
          product_name: string
          brand: string | null
          category_id: string | null
          base_image_url: string | null
          product_active: boolean
        }
      }
      v_branch_sku_availability: {
        Row: {
          branch_id: string
          sku_id: string
          in_stock: boolean
          quantity: number
          updated_at: string
        }
      }
    }
    Functions: {}
    Enums: {}
  }
}
