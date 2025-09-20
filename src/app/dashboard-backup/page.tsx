export default function DashboardPage() {
  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">
          ✅ Login Successful!
        </h1>
        <p className="text-lg text-gray-600 mb-6">
          You have successfully logged in and reached the dashboard.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-green-800 mb-2">
            Authentication Working
          </h2>
          <p className="text-green-700">
            The login system is now working correctly. You can access the dashboard after authentication.
          </p>
        </div>
      </div>
    </div>
  )
}