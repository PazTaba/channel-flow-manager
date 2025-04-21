
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertOctagon, AlertTriangle, Info, CheckCircle, ChevronDown, ChevronUp, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

// Alert type definition
type AlertType = "critical" | "warning" | "info" | "success";

type Alert = {
  id: string | number;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  isExpanded?: boolean;
};

interface AlertsComponentProps {
  className?: string;
  title?: string;
  maxAlerts?: number;
  showBadge?: boolean;
}

export function AlertsComponent({
  className,
  title = "System Alerts",
  maxAlerts = 5,
  showBadge = true,
}: AlertsComponentProps) {
  // Mock alerts data
  const [alerts, setAlerts] = useState<Alert[]>([
    {
      id: 1,
      type: "critical",
      title: "Channel 7 Connection Lost",
      description: "The connection to Channel 7 has been lost. All data transfer has stopped. Technical team has been notified automatically.",
      timestamp: "10 minutes ago",
      isRead: false,
    },
    {
      id: 2,
      type: "warning",
      title: "High Latency Detected",
      description: "Channel 3 is experiencing higher than normal latency. This may affect data transfer speed.",
      timestamp: "25 minutes ago",
      isRead: false,
    },
    {
      id: 3,
      type: "info",
      title: "System Maintenance Scheduled",
      description: "Routine maintenance scheduled for tonight at 2:00 AM. Service interruption expected to last 30 minutes.",
      timestamp: "1 hour ago",
      isRead: true,
    },
    {
      id: 4,
      type: "success",
      title: "Channel 12 Backup Restored",
      description: "The backup system for Channel 12 has been successfully restored and is now operational.",
      timestamp: "2 hours ago",
      isRead: true,
    },
    {
      id: 5,
      type: "warning",
      title: "Bandwidth Threshold Reached",
      description: "Channel 5 has reached 85% of allocated bandwidth. Consider optimizing data flow or increasing capacity.",
      timestamp: "3 hours ago",
      isRead: false,
    },
  ]);

  // Get unread count
  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  // Toggle alert expansion
  const toggleExpand = (id: string | number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isExpanded: !alert.isExpanded } : alert
    ));
  };

  // Mark an alert as read
  const markAsRead = (id: string | number) => {
    setAlerts(alerts.map(alert => 
      alert.id === id ? { ...alert, isRead: true } : alert
    ));
  };

  // Dismiss an alert
  const dismissAlert = (id: string | number) => {
    setAlerts(alerts.filter(alert => alert.id !== id));
  };

  // Mark all as read
  const markAllAsRead = () => {
    setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));
  };

  return (
    <Card className={cn("", className)}>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <CardTitle className="text-lg">{title}</CardTitle>
          {showBadge && unreadCount > 0 && (
            <Badge variant="destructive" className="ml-2">
              {unreadCount} new
            </Badge>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={markAllAsRead} disabled={unreadCount === 0}>
          Mark all as read
        </Button>
      </CardHeader>
      <CardContent>
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <Bell className="h-8 w-8 mb-2 opacity-50" />
            <p>No alerts to display</p>
          </div>
        ) : (
          <div className="space-y-3">
            {alerts.slice(0, maxAlerts).map((alert) => (
              <div 
                key={alert.id} 
                className={cn(
                  "rounded-lg border transition-all",
                  alert.isRead ? "bg-background" : "bg-accent/30",
                  alert.type === "critical" && "border-l-4 border-l-status-fault",
                  alert.type === "warning" && "border-l-4 border-l-status-standby",
                  alert.type === "info" && "border-l-4 border-l-status-info",
                  alert.type === "success" && "border-l-4 border-l-status-active"
                )}
              >
                <div className="p-3">
                  <div className="flex justify-between items-start">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {alert.type === "critical" && <AlertOctagon className="h-5 w-5 text-status-fault" />}
                        {alert.type === "warning" && <AlertTriangle className="h-5 w-5 text-status-standby" />}
                        {alert.type === "info" && <Info className="h-5 w-5 text-status-info" />}
                        {alert.type === "success" && <CheckCircle className="h-5 w-5 text-status-active" />}
                      </div>
                      <div>
                        <div className="flex items-center">
                          <h4 className="font-medium text-sm">{alert.title}</h4>
                          {!alert.isRead && (
                            <span className="ml-2 inline-block w-2 h-2 bg-primary rounded-full"></span>
                          )}
                        </div>
                        <div className="flex items-center mt-1">
                          <span className="text-xs text-muted-foreground">{alert.timestamp}</span>
                        </div>
                        
                        {/* Expandable description */}
                        {alert.isExpanded && (
                          <p className="text-sm mt-2 text-muted-foreground">
                            {alert.description}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-6 w-6"
                        onClick={() => toggleExpand(alert.id)}
                      >
                        {alert.isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                      {!alert.isRead && (
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-6 w-6" 
                          onClick={() => markAsRead(alert.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="icon"
                        className="h-6 w-6" 
                        onClick={() => dismissAlert(alert.id)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Action buttons - visible when expanded */}
                  {alert.isExpanded && (
                    <div className="mt-3 flex justify-end space-x-2">
                      <Button size="sm" variant="outline">View Details</Button>
                      {alert.type === "critical" && (
                        <Button size="sm" variant="destructive">Resolve Issue</Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {alerts.length > maxAlerts && (
              <Button variant="outline" className="w-full" size="sm">
                View All ({alerts.length}) Alerts
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
