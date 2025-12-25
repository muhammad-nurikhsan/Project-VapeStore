export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-lg shadow p-6 animate-pulse">
        <div className="h-6 w-40 bg-gray-200 rounded mb-4" />
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square bg-gray-200 rounded" />
          <div className="space-y-4">
            <div className="h-8 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded w-full" />
          </div>
        </div>
      </div>
    </div>
  )
}
