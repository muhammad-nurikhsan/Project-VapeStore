import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="text-center">
        <div className="text-6xl mb-4">🔎</div>
        <h1 className="text-3xl font-bold mb-2">Halaman Tidak Ditemukan</h1>
        <p className="text-gray-600 mb-6">
          Maaf, halaman yang Anda cari tidak tersedia.
        </p>
        <Link
          href="/"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
        >
          Kembali ke Katalog
        </Link>
      </div>
    </div>
  )
}
