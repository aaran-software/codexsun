import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { requestJson } from "@/api/httpClient"
import { useAuth } from "@/state/authStore"

interface WeatherForecast {
  date: string
  temperatureC: number
  temperatureF: number
  summary: string
}

export default function Dashboard() {
  const auth = useAuth()
  const [weatherData, setWeatherData] = useState<WeatherForecast[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchWeatherForecast = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await requestJson<WeatherForecast[]>('/api/weatherforecast', {
        method: 'GET',
      })
      setWeatherData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch weather data')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchWeatherForecast()
  }, [])

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card className="col-span-full">
        <CardHeader>
          <CardTitle>Overview</CardTitle>
          <CardDescription>
            Welcome back to the CXStore application dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 text-sm text-muted-foreground md:grid-cols-3">
            <p><span className="font-medium text-foreground">User:</span> {auth.user?.username ?? "Unknown"}</p>
            <p><span className="font-medium text-foreground">Role:</span> {auth.user?.role ?? auth.claims?.role ?? "Unknown"}</p>
            <p><span className="font-medium text-foreground">Email:</span> {auth.user?.email ?? "Unknown"}</p>
          </div>
        </CardContent>
      </Card>
      
      <Card className="col-span-full">
        <CardHeader className="flex flex-row space-y-0 justify-between">
          <div>
            <CardTitle>System Weather Status (Backend API)</CardTitle>
            <CardDescription>Live connection response from cxserver</CardDescription>
          </div>
          <button 
            onClick={fetchWeatherForecast} 
            className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 px-3"
          >
            Refresh
          </button>
        </CardHeader>
        <CardContent>
          {error ? (
             <div className="text-destructive text-sm">{error}</div>
          ) : loading ? (
             <div className="text-sm text-muted-foreground">Loading data...</div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
              {weatherData.map((w, i) => (
                <div key={i} className="rounded border p-3 flex flex-col justify-center items-center">
                   <div className="font-semibold">{new Date(w.date).toLocaleDateString(undefined, { weekday: 'short' })}</div>
                   <div className="text-2xl font-bold mt-2">{w.temperatureC}°C</div>
                   <div className="text-xs text-muted-foreground mt-1">{w.summary}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
