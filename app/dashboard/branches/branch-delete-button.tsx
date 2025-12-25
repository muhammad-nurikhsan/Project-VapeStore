"use client"

import { useTransition, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

type Props = {
  branchId: string
  branchName: string
}

export function BranchDeleteButton({ branchId, branchName }: Props) {
  const [confirming, setConfirming] = useState(false)
  const [loading, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  async function handleDelete() {
    setError(null)
    startTransition(async () => {
      const { error } = await supabase
        .from('branches')
        .delete()
        .eq('id', branchId)
      if (error) {
        setError(error.message)
        return
      }
      router.refresh()
    })
  }

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={() => setConfirming(true)}
        className="inline-flex items-center justify-center px-3 py-2 text-sm text-red-700 bg-red-50 hover:bg-red-100 rounded-md border border-red-200"
      >
        Hapus
      </button>
    )
  }

  return (
    <div className="space-y-2">
      <p className="text-sm text-red-700">Hapus cabang “{branchName}”? Tindakan ini permanen.</p>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleDelete}
          disabled={loading}
          className="inline-flex items-center justify-center px-3 py-2 text-sm text-white bg-red-600 hover:bg-red-700 rounded-md"
        >
          {loading ? 'Menghapus...' : 'Ya, hapus'}
        </button>
        <button
          type="button"
          onClick={() => setConfirming(false)}
          className="inline-flex items-center justify-center px-3 py-2 text-sm text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
        >
          Batal
        </button>
      </div>
      {error && (
        <p className="text-xs text-red-600">{error}</p>
      )}
    </div>
  )
}
