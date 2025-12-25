'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

export default function AgeGate() {
  const pathname = usePathname()
  const [isVerified, setIsVerified] = useState<boolean | null>(null)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    // Skip Age Gate for staff/auth pages
    if (pathname?.startsWith('/dashboard') || pathname === '/login') {
      setIsVerified(true)
      setShowModal(false)
      return
    }

    const ageVerified = localStorage.getItem('age_verified')
    if (ageVerified === 'true') {
      setIsVerified(true)
    } else {
      setIsVerified(false)
      setShowModal(true)
    }
  }, [pathname])

  const handleAccept = () => {
    localStorage.setItem('age_verified', 'true')
    setIsVerified(true)
    setShowModal(false)
  }

  const handleReject = () => {
    window.location.href = 'https://www.google.com'
  }

  if (isVerified === null) {
    return null // Loading state
  }

  if (!showModal) {
    return null
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-90 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mb-6">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Verifikasi Usia
          </h2>
          <div className="text-6xl mb-4">🔞</div>
        </div>

        <p className="text-gray-700 mb-6 text-lg leading-relaxed">
          Produk vape hanya untuk pengguna dewasa berusia <strong>18 tahun ke atas</strong>.
          <br />
          <br />
          Apakah Anda sudah berusia minimal 18 tahun?
        </p>

        <div className="flex gap-4">
          <button
            onClick={handleReject}
            className="flex-1 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition-colors"
          >
            Belum
          </button>
          <button
            onClick={handleAccept}
            className="flex-1 px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors"
          >
            Ya, Saya Sudah
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          Dengan mengklik &quot;Ya, Saya Sudah&quot;, Anda menyatakan bahwa Anda berusia minimal 18 tahun
          dan memahami bahwa produk ini mengandung nikotin.
        </p>
      </div>
    </div>
  )
}
