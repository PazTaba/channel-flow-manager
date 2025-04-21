
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "@/context/ThemeProvider";

export default function Settings() {
  const { theme, setTheme } = useTheme();
  
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
      </div>
      
      <Tabs defaultValue="general">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>Manage your system preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-refresh">Auto-refresh data</Label>
                  <p className="text-sm text-muted-foreground">Automatically update dashboard metrics</p>
                </div>
                <Switch id="auto-refresh" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-offline">Show offline channels</Label>
                  <p className="text-sm text-muted-foreground">Display channels that are currently offline</p>
                </div>
                <Switch id="show-offline" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="auto-backup">Automatic backups</Label>
                  <p className="text-sm text-muted-foreground">Enable scheduled configuration backups</p>
                </div>
                <Switch id="auto-backup" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize your interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="theme-mode">Dark mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme for the interface</p>
                </div>
                <Switch 
                  id="theme-mode" 
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dense-tables">Dense tables</Label>
                  <p className="text-sm text-muted-foreground">Reduce padding in data tables</p>
                </div>
                <Switch id="dense-tables" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="animations">Interface animations</Label>
                  <p className="text-sm text-muted-foreground">Enable transitions and animations</p>
                </div>
                <Switch id="animations" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>Configure your alert preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="critical-alerts">Critical alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for critical issues</p>
                </div>
                <Switch id="critical-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="warning-alerts">Warning alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for warnings</p>
                </div>
                <Switch id="warning-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="info-alerts">Informational alerts</Label>
                  <p className="text-sm text-muted-foreground">Receive notifications for information updates</p>
                </div>
                <Switch id="info-alerts" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="email-alerts">Email notifications</Label>
                  <p className="text-sm text-muted-foreground">Send alerts to email address</p>
                </div>
                <Switch id="email-alerts" defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>Configure system behavior</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-center justify-center border rounded-md">
                <p className="text-muted-foreground">Advanced configuration options will be displayed here</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
