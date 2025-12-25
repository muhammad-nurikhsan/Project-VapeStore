export default function StockLoading() {
  return (
    <div className="p-6">
      <div className="h-10 w-64 bg-gray-200 rounded mb-6 animate-pulse" />
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="h-10 bg-gray-100" />
        <div className="space-y-2 p-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-10 bg-gray-100 rounded" />
          ))}
        </div>
      </div>
    </div>
  )
}
