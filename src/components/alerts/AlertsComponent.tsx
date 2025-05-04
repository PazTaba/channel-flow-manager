import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertOctagon, AlertTriangle, Info, CheckCircle, ChevronDown, ChevronUp, X, Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Alert type definition
type AlertType = "critical" | "warning" | "info" | "success";

type Alert = {
  id: string | number;
  type: AlertType;
  title: string;
  description: string;
  timestamp: string;
  isRead: boolean;
  relatedEntityType?: string;
  relatedEntityId?: number | null;
  isExpanded?: boolean;
};

interface AlertsComponentProps {
  className?: string;
  title?: string;
  maxAlerts?: number;
  showBadge?: boolean;
}

// API constants
const API_URL = 'http://localhost:3000/api';

// פונקציה עזר לקבלת/יצירת token
const getAuthToken = async () => {
  // בדיקה אם יש token קיים ב-localStorage
  let token = localStorage.getItem('auth_token');

  // אם אין token, יצירת אחד חדש
  if (!token) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'password'
        }),
      });

      const data = await response.json();

      if (data.success && data.data.access_token) {
        token = data.data.access_token;
        localStorage.setItem('auth_token', token);
      } else {
        throw new Error('Failed to login');
      }
    } catch (error) {
      console.error('Error getting auth token:', error);
      throw error;
    }
  }

  return token;
};

// פונקציה עזר לביצוע קריאות API עם אימות
const fetchWithAuth = async (endpoint, options = {}) => {
  try {
    const token = await getAuthToken();

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(options.headers || {})
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers
    });

    // אם קיבלנו שגיאת 401 (לא מורשה), ננסה לקבל token חדש
    if (response.status === 401) {
      localStorage.removeItem('auth_token');
      const newToken = await getAuthToken();

      // נסיון נוסף עם ה-token החדש
      const newResponse = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${newToken}`,
          'Content-Type': 'application/json',
          ...(options.headers || {})
        }
      });

      if (!newResponse.ok) {
        throw new Error(`API request failed: ${newResponse.statusText}`);
      }

      return newResponse.json();
    }

    if (!response.ok) {
      throw new Error(`API request failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Error fetching from ${endpoint}:`, error);
    throw error;
  }
};

// Helper function to format timestamp
const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) {
    return 'just now';
  } else if (diffMins < 60) {
    return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
  } else if (diffMins < 1440) {
    const hours = Math.floor(diffMins / 60);
    return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
  } else {
    const days = Math.floor(diffMins / 1440);
    return `${days} ${days === 1 ? 'day' : 'days'} ago`;
  }
};

export function AlertsComponent({
  className,
  title = "System Alerts",
  maxAlerts = 5,
  showBadge = true,
}: AlertsComponentProps) {
  const { toast } = useToast();
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load alerts from API
  useEffect(() => {
    const loadAlerts = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth('/dashboard/alerts');

        if (response.success) {
          // Map server alerts to the format we use
          const formattedAlerts = response.data.map(alert => ({
            ...alert,
            isExpanded: false,
            timestamp: formatTimestamp(alert.timestamp)
          }));

          setAlerts(formattedAlerts);
        } else {
          setError("Failed to load alerts");
          toast({
            title: "Error",
            description: "Failed to load system alerts",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error loading alerts:', err);
        setError(err.message);

        // Fallback to empty alerts list
        setAlerts([]);
      } finally {
        setLoading(false);
      }
    };

    loadAlerts();

    // Set up polling to refresh alerts every minute
    const interval = setInterval(() => {
      loadAlerts();
    }, 60000);

    return () => clearInterval(interval);
  }, [toast]);

  // Get unread count
  const unreadCount = alerts.filter(alert => !alert.isRead).length;

  // Toggle alert expansion
  const toggleExpand = (id: string | number) => {
    setAlerts(alerts.map(alert =>
      alert.id === id ? { ...alert, isExpanded: !alert.isExpanded } : alert
    ));
  };

  // Mark an alert as read
  const markAsRead = async (id: string | number) => {
    try {
      const response = await fetchWithAuth(`/dashboard/alerts/${id}/read`, {
        method: 'PATCH'
      });

      if (response.success) {
        setAlerts(alerts.map(alert =>
          alert.id === id ? { ...alert, isRead: true } : alert
        ));
      } else {
        toast({
          title: "Error",
          description: "Failed to mark alert as read",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error marking alert as read:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // Dismiss an alert
  const dismissAlert = async (id: string | number) => {
    try {
      const response = await fetchWithAuth(`/dashboard/alerts/${id}`, {
        method: 'DELETE'
      });

      if (response.success) {
        setAlerts(alerts.filter(alert => alert.id !== id));

        toast({
          title: "Success",
          description: "Alert dismissed",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to dismiss alert",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error dismissing alert:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // Mark all as read
  const markAllAsRead = async () => {
    try {
      const response = await fetchWithAuth('/dashboard/alerts/read-all', {
        method: 'PATCH'
      });

      if (response.success) {
        setAlerts(alerts.map(alert => ({ ...alert, isRead: true })));

        toast({
          title: "Success",
          description: "All alerts marked as read",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to mark all alerts as read",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error marking all alerts as read:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // View alert details
  const viewAlertDetails = (alert: Alert) => {
    // In a real app, this could navigate to a details page or show a modal
    console.log('View details for alert:', alert);

    // Just show a toast for now
    toast({
      title: alert.title,
      description: alert.description,
    });
  };

  // Resolve critical issue
  const resolveIssue = async (alert: Alert) => {
    // This would typically call an API to resolve the issue
    console.log('Resolving issue for alert:', alert);

    // For demonstration, just dismiss the alert
    await dismissAlert(alert.id);

    toast({
      title: "Issue Resolution",
      description: `Resolution process started for "${alert.title}"`,
      variant: "default"
    });
  };

  // Loading state
  if (loading && alerts.length === 0) {
    return (
      <Card className={cn("", className)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

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
                          {alert.relatedEntityType && (
                            <span className="text-xs text-muted-foreground ml-2">
                              • {alert.relatedEntityType} {alert.relatedEntityId}
                            </span>
                          )}
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => viewAlertDetails(alert)}
                      >
                        View Details
                      </Button>
                      {alert.type === "critical" && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => resolveIssue(alert)}
                        >
                          Resolve Issue
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {alerts.length > maxAlerts && (
              <Button
                variant="outline"
                className="w-full"
                size="sm"
                onClick={() => {
                  // In a real app, this would navigate to an alerts page
                  toast({
                    title: "Alerts",
                    description: `Viewing all ${alerts.length} alerts`,
                  });
                }}
              >
                View All ({alerts.length}) Alerts
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}