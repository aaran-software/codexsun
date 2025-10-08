import { useState, useEffect } from 'react'
import { useAuth } from "@/global/auth/useAuth"
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'

export function UserDataInspector() {
    const { token } = useAuth()
    const [userData, setUserData] = useState<never>()
    const [todoData, setTodoData] = useState<never>()
    const [loading, setLoading] = useState<boolean>(true)
    const [userError, setUserError] = useState<string | null>(null)
    const [todoError, setTodoError] = useState<string | null>(null)
    const [retryCount, setRetryCount] = useState<number>(0)

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(
            () => alert('Error copied to clipboard!'),
            (err) => alert(`Failed to copy error: ${err.message}`)
        )
    }

    const fetchData = async (endpoint: string, setData: (data: any) => void, setError: (error: string | null) => void) => {
        if (!token) {
            setError('No authentication token available. Please log in.')
            setLoading(false)
            return
        }

        console.log(`Fetching ${endpoint} with token:`, token) // Debug token

        try {
            setLoading(true)
            const response = await fetch(`http://localhost:3000${endpoint}`, {
                headers: {
                    'X-Tenant-Id': 'tenant1',
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
            })

            if (response.ok) {
                const jsonData = await response.json()
                setData(jsonData)
                setError(null)
            } else {
                const errorText = await response.text()
                setError(`Failed to fetch from ${endpoint}: ${response.status} ${response.statusText} - ${errorText}`)
            }
        } catch (err) {
            setError(`Network error for ${endpoint}: ${err.message}. Is the server running at http://localhost:3000?`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchData('/api/users', setUserData, setUserError)
        fetchData('/api/todos', setTodoData, setTodoError)
    }, [token, retryCount])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <p className="text-gray-600">Loading...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 space-y-6 p-4">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
                <h1 className="text-xl font-semibold mb-4 text-center">Raw User Data from /api/users</h1>
                {userError ? (
                    <div className="space-y-3">
                        <div className="flex items-center gap-2">
                            <p className="text-red-600 text-sm">{userError}</p>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => copyToClipboard(userError)}
                                title="Copy error to clipboard"
                            >
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                        <div className="text-gray-600 text-sm">
                            <p>Troubleshooting tips for /api/users 404:</p>
                            <ul className="list-disc pl-5">
                                <li>Ensure the backend server is running at http://localhost:3000 with user routes registered.</li>
                                <li>Add user routes to Express: app.use('/api/users', createUserRouter(dbAdapter)).</li>
                                <li>Since /api/todos is working, the server is up, but /api/users may not be included in the production app.</li>
                                <li>Test with curl: curl -H "X-Tenant-Id: tenant1" -H "Authorization: Bearer &lt;token&gt;" http://localhost:3000/api/users</li>
                                <li>Check backend logs for missing route errors.</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-[40vh] text-xs">
            {JSON.stringify(userData, null, 2)}
          </pre>
                )}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
                <h1 className="text-xl font-semibold mb-4 text-center">Raw Todo Data from /api/todos (Control)</h1>
                {todoError ? (
                    <div className="flex items-center gap-2">
                        <p className="text-red-600 text-sm">{todoError}</p>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => copyToClipboard(todoError)}
                            title="Copy error to clipboard"
                        >
                            <Copy className="h-4 w-4" />
                        </Button>
                    </div>
                ) : (
                    <pre className="bg-gray-50 p-3 rounded overflow-auto max-h-[40vh] text-xs">
            {JSON.stringify(todoData, null, 2)}
          </pre>
                )}
            </div>

            <Button
                onClick={() => setRetryCount((prev) => prev + 1)}
                className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2"
            >
                Retry Fetch
            </Button>
        </div>
    )
}