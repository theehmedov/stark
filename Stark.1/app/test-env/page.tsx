export default function TestEnvPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-900">
          🔍 Environment Variables Test Page
        </h1>
        
        <div className="space-y-6">
          <div className="border-l-4 border-blue-500 bg-blue-50 p-4">
            <h2 className="font-semibold text-lg mb-2">NEXT_PUBLIC_SUPABASE_URL</h2>
            <div className="font-mono text-sm break-all">
              {supabaseUrl ? (
                <div>
                  <span className="text-green-600">✅ SET</span>
                  <p className="mt-2 text-gray-700">{supabaseUrl}</p>
                </div>
              ) : (
                <span className="text-red-600">❌ NOT SET (undefined)</span>
              )}
            </div>
          </div>

          <div className="border-l-4 border-purple-500 bg-purple-50 p-4">
            <h2 className="font-semibold text-lg mb-2">NEXT_PUBLIC_SUPABASE_ANON_KEY</h2>
            <div className="font-mono text-sm break-all">
              {supabaseKey ? (
                <div>
                  <span className="text-green-600">✅ SET</span>
                  <p className="mt-2 text-gray-700">
                    {supabaseKey.substring(0, 20)}...{supabaseKey.substring(supabaseKey.length - 10)}
                  </p>
                </div>
              ) : (
                <span className="text-red-600">❌ NOT SET (undefined)</span>
              )}
            </div>
          </div>

          <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4">
            <h2 className="font-semibold text-lg mb-2">📋 Diagnostic Info</h2>
            <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
              <li>This page is rendered on the server (Server Component)</li>
              <li>Environment variables are read at build/start time</li>
              <li>If variables show as "NOT SET", check your .env.local file</li>
              <li>After creating/modifying .env.local, you MUST restart the dev server</li>
            </ul>
          </div>

          <div className="border-l-4 border-green-500 bg-green-50 p-4">
            <h2 className="font-semibold text-lg mb-2">✅ Next Steps</h2>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>Ensure .env.local exists in project root</li>
              <li>Stop dev server (Ctrl+C)</li>
              <li>Run: <code className="bg-gray-200 px-2 py-1 rounded">Remove-Item -Recurse -Force .next</code></li>
              <li>Run: <code className="bg-gray-200 px-2 py-1 rounded">npm run dev</code></li>
              <li>Refresh this page</li>
            </ol>
          </div>

          <div className="bg-gray-100 p-4 rounded">
            <h3 className="font-semibold mb-2">Expected .env.local content:</h3>
            <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-x-auto text-xs">
{`NEXT_PUBLIC_SUPABASE_URL=https://bjsdagwquuontqgvdtdx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_9JeQ0326vVqrkbZJdWDHxg_MkDRgNep`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}
