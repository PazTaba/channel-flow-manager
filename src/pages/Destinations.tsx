
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Destinations() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Destinations</h1>
        <Button>Add Destination</Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Output Destinations</CardTitle>
          <CardDescription>Configure where your data is sent</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center border rounded-md">
            <p className="text-muted-foreground">Destination configuration interface will be displayed here</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
