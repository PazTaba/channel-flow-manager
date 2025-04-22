
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Quick Actions</CardTitle>
        <CardDescription>Common tasks and operations</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-wrap gap-3">
        <button className="py-2 px-4 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors">
          Add Channel
        </button>
        <button className="py-2 px-4 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors">
          Run Diagnostics
        </button>
        <button className="py-2 px-4 rounded-md bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors">
          System Health Report
        </button>
        <button className="py-2 px-4 rounded-md border hover:bg-secondary transition-colors">
          Configure Alerts
        </button>
      </CardContent>
    </Card>
  );
}
