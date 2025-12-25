import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function generateWhatsAppLink(
  phone: string,
  productName: string,
  variant: Record<string, string>,
  price: number,
  branchName: string
): string {
  const variantText = Object.entries(variant)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')

  const message = `Halo, saya tertarik dengan produk:

📦 *${productName}*
${variantText ? `🎯 Varian: ${variantText}` : ''}
💰 Harga: ${formatRupiah(price)}
🏪 Cabang: ${branchName}

Apakah produk ini tersedia?`

  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

export function sanitizePhoneToWa(input: string): string {
  const digits = (input || '').replace(/\D/g, '')
  if (digits.startsWith('0')) return `62${digits.slice(1)}`
  if (digits.startsWith('62')) return digits
  if (digits.startsWith('8')) return `62${digits}`
  return digits
}

export function isValidWaNumber(input: string): boolean {
  const digits = sanitizePhoneToWa(input)
  return /^62\d{8,13}$/.test(digits)
}
