export default function DashboardLoading() {
  return (
    <div className="p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 animate-pulse">
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
        <div className="h-24 bg-gray-200 rounded" />
      </div>
      <div className="h-40 bg-gray-200 rounded" />
    </div>
  )
}
