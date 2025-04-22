
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function BandwidthUsageGraph() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bandwidth Usage</CardTitle>
        <CardDescription>Network traffic across all channels</CardDescription>
        <Tabs defaultValue="daily" className="mt-2">
          <TabsList>
            <TabsTrigger value="daily">Daily</TabsTrigger>
            <TabsTrigger value="weekly">Weekly</TabsTrigger>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
          </TabsList>
        </Tabs>
      </CardHeader>
      <CardContent>
        <div className="h-[250px] w-full flex items-center justify-center bg-muted/30 rounded-md">
          <p className="text-muted-foreground">Bandwidth graph visualization would appear here</p>
        </div>
      </CardContent>
    </Card>
  );
}
