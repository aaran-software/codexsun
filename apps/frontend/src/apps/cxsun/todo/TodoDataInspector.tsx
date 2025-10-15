import { useState, useEffect } from 'react'
import { useAuth } from "@/global/auth/useAuth"
import { Button } from '@/components/ui/button'
import { Copy } from 'lucide-react'

export function TodoDataInspector() {
    const { token, user, API_URL } = useAuth()
    const [userData, setUserData] = useState<never>()
    const [loading, setLoading] = useState<boolean>(true)
    const [userError, setUserError] = useState<string | null>(null)
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
            const response = await fetch(`${API_URL}${endpoint}`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                    'x-tenant-id': `${user.tenantId}`,
                    'x-user-id': `${user.id}`,
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
            setError(`Network error for ${endpoint}: ${err.message}. Is the server running at ${API_URL}?`)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (user?.tenantId) {
            fetchData(`/api/todos`, setUserData, setUserError)
        } else {
            setUserError('No tenant ID available. Please log in with a valid user.')
            setLoading(false)
        }
    }, [token, retryCount, user?.tenantId])

    return (
        <div className="flex flex-col items-center space-y-8 p-6 bg-gray-100 rounded-lg shadow-lg w-full max-w-5xl mx-auto">
            <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-4xl">
                <h1 className="text-xl font-semibold mb-4 text-center">Raw User Data from /api/users</h1>
                {loading ? (
                    <p className="text-gray-600 text-center">Loading...</p>
                ) : userError ? (
                    <div className="flex flex-col items-start gap-2">
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
                        <div className="mt-4 text-sm text-gray-600 pl-5">
                            <ul className="list-disc space-y-2 pl-5">
                                <li>Ensure the backend server is running at {API_URL} with user routes registered.</li>
                                <li>Add user routes to Express: app.use('/api/users', createUserRouter(dbAdapter)).</li>
                                <li>Test with curl: curl -H "Authorization: Bearer &lt;token&gt;" {API_URL}/api/todos</li>
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

            <Button
                onClick={() => setRetryCount((prev) => prev + 1)}
                className="bg-blue-600 hover:bg-blue-700 text-sm px-4 py-2"
            >
                Retry Fetch
            </Button>
        </div>
    )
}