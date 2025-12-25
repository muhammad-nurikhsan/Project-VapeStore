"use client"

import { useEffect, useMemo, useState, useTransition } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Database } from '@/lib/database.types'
import { cn, isValidWaNumber, sanitizePhoneToWa, slugify } from '@/lib/utils'
import { useRouter } from 'next/navigation'

type Branch = Database['public']['Tables']['branches']['Row']

type Props = {
  mode: 'create' | 'edit'
  initial?: Partial<Branch>
}

export default function BranchFormClient({ mode, initial }: Props) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const [name, setName] = useState(initial?.name ?? '')
  const [slug, setSlug] = useState(initial?.slug ?? '')
  const [city, setCity] = useState(initial?.city ?? '')
  const [address, setAddress] = useState(initial?.address ?? '')
  const [whatsapp, setWhatsapp] = useState(initial?.whatsapp_phone ?? '')
  const [active, setActive] = useState(initial?.is_active ?? true)

  const [saving, startSaving] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (mode === 'create') {
      const s = slugify(name)
      if (s && !initial?.slug) setSlug(s)
    }
  }, [name])

  async function checkSlugUnique(slugToCheck: string) {
    const { data, error } = await supabase
      .from('branches')
      .select('id')
      .eq('slug', slugToCheck)
      .maybeSingle()
    if (error && error.code !== 'PGRST116') {
      throw error
    }
    if (!data) return true
    if (mode === 'edit' && (data as any)?.id === initial?.id) return true
    return false
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const normalizedSlug = slugify(slug || name)
    const wa = sanitizePhoneToWa(whatsapp)

    if (!name.trim()) return setError('Nama cabang wajib diisi')
    if (!normalizedSlug) return setError('Slug tidak valid')
    if (!isValidWaNumber(wa)) return setError('Nomor WhatsApp tidak valid (format 62...)')

    try {
      const unique = await checkSlugUnique(normalizedSlug)
      if (!unique) return setError('Slug sudah digunakan, silakan pilih yang lain')
    } catch (err: any) {
      return setError(err?.message || 'Gagal mengecek slug')
    }

    startSaving(async () => {
      const payload = {
        name: name.trim(),
        slug: normalizedSlug,
        city: city.trim(),
        address: address.trim(),
        whatsapp_phone: wa,
        is_active: active,
      } satisfies Partial<Branch>

      if (mode === 'create') {
        const { error } = await supabase.from('branches').insert([payload as never]).single()
        if (error) {
          setError(error.message)
          return
        }
        setSuccess('Cabang berhasil dibuat')
      } else {
        const { error } = await supabase
          .from('branches')
          .update(payload as never)
          .eq('id', initial?.id || '')
        if (error) {
          setError(error.message)
          return
        }
        setSuccess('Cabang berhasil diperbarui')
      }

      setTimeout(() => {
        router.push('/dashboard/branches')
        router.refresh()
      }, 600)
    })
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-xl font-semibold mb-4">
        {mode === 'create' ? 'Tambah Cabang' : 'Edit Cabang'}
      </h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nama</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="Mis. VapeStore Tebet"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Slug</label>
          <input
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            className="w-full rounded border px-3 py-2"
            placeholder="vapestore-tebet"
          />
          <p className="text-xs text-gray-500 mt-1">Digunakan di URL dan unik.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Kota</label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="Jakarta Selatan"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full rounded border px-3 py-2"
              placeholder="62812xxxxxxx"
            />
            <p className="text-xs text-gray-500 mt-1">Format: 62xxxxxxxxx, tanpa + atau spasi.</p>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alamat</label>
          <textarea
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full rounded border px-3 py-2"
            rows={3}
            placeholder="Jl. Contoh No. 123..."
          />
        </div>
        <div className="flex items-center gap-2">
          <input
            id="is_active"
            type="checkbox"
            checked={!!active}
            onChange={(e) => setActive(e.target.checked)}
            className="h-4 w-4"
          />
          <label htmlFor="is_active" className="text-sm">Aktif</label>
        </div>

        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">
            {error}
          </div>
        )}
        {success && (
          <div className="text-sm text-green-700 bg-green-50 border border-green-200 rounded px-3 py-2">
            {success}
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            disabled={saving}
            className={cn(
              'inline-flex items-center rounded bg-black text-white px-4 py-2',
              saving && 'opacity-60 cursor-not-allowed'
            )}
          >
            {saving ? 'Menyimpan...' : mode === 'create' ? 'Buat Cabang' : 'Simpan Perubahan'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="inline-flex items-center rounded border px-4 py-2"
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  )
}
