import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BranchFormClient from '../branch-form-client'

export const dynamic = 'force-dynamic'

export default async function EditBranchPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: branch } = await supabase
    .from('branches')
    .select('id, slug, name, whatsapp_phone, address, city, is_active')
    .eq('slug', slug)
    .single()

  if (!branch) notFound()

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Edit Cabang</h2>
      <BranchFormClient mode="edit" initial={branch} />
    </div>
  )
}
