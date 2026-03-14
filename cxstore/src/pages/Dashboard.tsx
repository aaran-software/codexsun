import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/state/authStore"

const kpiCards = [
  { title: "Today's orders", value: "184", detail: "+12% vs yesterday" },
  { title: "Gross sales", value: "$24,860", detail: "After discounts and bundles" },
  { title: "Open carts", value: "53", detail: "Customers still in checkout" },
  { title: "Low-stock SKUs", value: "19", detail: "Needs replenishment today" },
]

const fulfillmentQueue = [
  { label: "Ready to pack", value: 28 },
  { label: "Awaiting pickup", value: 14 },
  { label: "Returns pending", value: 6 },
  { label: "Payment review", value: 3 },
]

const merchandisingSignals = [
  { name: "Summer Essentials", performance: "Strong", change: "+18%" },
  { name: "Mobile Accessories", performance: "Stable", change: "+4%" },
  { name: "Home Office", performance: "Watch", change: "-6%" },
]

const operationsFeed = [
  "Vendor onboarding review due for 4 new suppliers.",
  "11 customer tickets are awaiting warehouse confirmation.",
  "Two promotional banners expire before midnight.",
  "Restock alert triggered for fast-moving electronics.",
]

export default function Dashboard() {
  const auth = useAuth()

  return (
    <div className="grid gap-4 xl:grid-cols-12">
      <Card className="xl:col-span-12">
        <CardHeader>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-2">
              <CardTitle>Back Office Overview</CardTitle>
              <CardDescription>
                Monitor orders, stock movement, vendor activity, and customer operations from one admin workspace.
              </CardDescription>
            </div>
            <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-3">
              <p><span className="font-medium text-foreground">Operator:</span> {auth.user?.username ?? "Unknown"}</p>
              <p><span className="font-medium text-foreground">Role:</span> {auth.user?.role ?? auth.claims?.role ?? "Unknown"}</p>
              <p><span className="font-medium text-foreground">Email:</span> {auth.user?.email ?? "Unknown"}</p>
            </div>
          </div>
        </CardHeader>
      </Card>

      {kpiCards.map((card) => (
        <Card key={card.title} className="xl:col-span-3">
          <CardHeader className="pb-2">
            <CardDescription>{card.title}</CardDescription>
            <CardTitle className="text-3xl">{card.value}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{card.detail}</p>
          </CardContent>
        </Card>
      ))}

      <Card className="xl:col-span-5">
        <CardHeader>
          <CardTitle>Fulfillment Queue</CardTitle>
          <CardDescription>Orders currently moving through warehouse and finance checkpoints.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {fulfillmentQueue.map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-lg border px-4 py-3">
              <span className="text-sm font-medium">{item.label}</span>
              <Badge variant="secondary" className="text-sm">{item.value}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="xl:col-span-4">
        <CardHeader>
          <CardTitle>Merchandising Signals</CardTitle>
          <CardDescription>Category movement and promotional health across the storefront.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {merchandisingSignals.map((signal) => (
            <div key={signal.name} className="rounded-lg border px-4 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="font-medium">{signal.name}</p>
                <Badge variant={signal.performance === "Strong" ? "default" : "outline"}>
                  {signal.performance}
                </Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">Conversion movement: {signal.change}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="xl:col-span-3">
        <CardHeader>
          <CardTitle>Store Health</CardTitle>
          <CardDescription>Immediate operational checks for today&apos;s commerce cycle.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Payment gateways</span>
            <span className="font-medium text-foreground">Healthy</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Warehouse SLA</span>
            <span className="font-medium text-foreground">96%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Refund backlog</span>
            <span className="font-medium text-foreground">7 cases</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Active vendors</span>
            <span className="font-medium text-foreground">42</span>
          </div>
        </CardContent>
      </Card>

      <Card className="xl:col-span-12">
        <CardHeader>
          <CardTitle>Operations Feed</CardTitle>
          <CardDescription>Tasks and alerts the admin team should address before the next dispatch window.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 lg:grid-cols-2">
          {operationsFeed.map((item) => (
            <div key={item} className="rounded-lg border bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              {item}
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
