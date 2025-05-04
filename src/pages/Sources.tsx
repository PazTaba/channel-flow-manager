import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveDataTable, Column } from "@/components/data/ResponsiveDataTable";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Plus, Play, Pause, Edit, Trash2 } from "lucide-react";
import { Source } from "@/types/source";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

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

export default function Sources() {
  const { toast } = useToast();
  const [sources, setSources] = useState<Source[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // State for dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<Source | null>(null);
  const [newSourceData, setNewSourceData] = useState({
    name: "",
    ipAddress: "",
    encryptedMulticastAddress: "",
    encryptionEnabled: false,
    protocol: "UDP TS"
  });

  // Load sources from API
  useEffect(() => {
    const loadSources = async () => {
      try {
        setLoading(true);
        const response = await fetchWithAuth('/sources');

        if (response.success) {
          setSources(response.data.data);
        } else {
          setError("Failed to load sources");
          toast({
            title: "Error",
            description: "Failed to load sources",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error loading sources:', err);
        setError(err.message);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    loadSources();
  }, [toast]);

  // Toggle source status (play/pause)
  const toggleSourceStatus = async (source: Source) => {
    try {
      const newStatus = source.status === 'play' ? 'pause' : 'play';
      const endpoint = `/sources/${source.id}/${newStatus === 'play' ? 'resume' : 'pause'}`;

      const response = await fetchWithAuth(endpoint, {
        method: 'PATCH'
      });

      if (response.success) {
        // Update local state
        setSources(prev =>
          prev.map(s => s.id === source.id ? { ...s, status: newStatus } : s)
        );

        toast({
          title: "Success",
          description: `Source ${source.name} is now ${newStatus === 'play' ? 'playing' : 'paused'}`,
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update source status",
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error toggling status:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // Handle editing source
  const handleEditSource = (source: Source) => {
    setEditingSource(source);
    setNewSourceData({
      name: source.name,
      ipAddress: source.ipAddress || "",
      encryptedMulticastAddress: source.encryptedMulticastAddress || "",
      encryptionEnabled: source.encryptionEnabled || false,
      protocol: source.protocol || "UDP TS"
    });
    setDialogOpen(true);
  };

  // Handle adding new source
  const handleAddSource = () => {
    setEditingSource(null);
    setNewSourceData({
      name: "",
      ipAddress: "",
      encryptedMulticastAddress: "",
      encryptionEnabled: false,
      protocol: "UDP TS"
    });
    setDialogOpen(true);
  };

  // Handle deleting source
  const handleDeleteSource = async (source: Source) => {
    if (confirm(`Are you sure you want to delete ${source.name}?`)) {
      try {
        const response = await fetchWithAuth(`/sources/${source.id}`, {
          method: 'DELETE'
        });

        if (response.success) {
          setSources(prev => prev.filter(s => s.id !== source.id));

          toast({
            title: "Success",
            description: `Source ${source.name} has been deleted`,
          });
        } else {
          toast({
            title: "Error",
            description: "Failed to delete source",
            variant: "destructive"
          });
        }
      } catch (err) {
        console.error('Error deleting source:', err);
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive"
        });
      }
    }
  };

  // Save source (create or update)
  const saveSource = async () => {
    try {
      const sourceData = {
        ...newSourceData
      };

      let response;

      if (editingSource) {
        // Update existing source
        response = await fetchWithAuth(`/sources/${editingSource.id}`, {
          method: 'PUT',
          body: JSON.stringify(sourceData)
        });
      } else {
        // Create new source
        response = await fetchWithAuth('/sources', {
          method: 'POST',
          body: JSON.stringify(sourceData)
        });
      }

      if (response.success) {
        // Reload sources to get updated data
        const sourcesResponse = await fetchWithAuth('/sources');
        if (sourcesResponse.success) {
          setSources(sourcesResponse.data.data);
        }

        setDialogOpen(false);
        toast({
          title: "Success",
          description: `Source ${editingSource ? 'updated' : 'created'} successfully`,
        });
      } else {
        toast({
          title: "Error",
          description: `Failed to ${editingSource ? 'update' : 'create'} source`,
          variant: "destructive"
        });
      }
    } catch (err) {
      console.error('Error saving source:', err);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive"
      });
    }
  };

  // Define table columns with simplified data
  const columns: Column<Source>[] = [
    {
      header: "Name",
      accessorKey: "name",
      cell: (source) => <span className="font-medium">{source.name}</span>,
      sortable: true
    },
    {
      header: "IP Address",
      accessorKey: "ipAddress",
      cell: (source) => (
        <code className="rounded bg-muted px-2 py-1">{source.ipAddress}</code>
      ),
      sortable: true
    },
    {
      header: "Multicast",
      accessorKey: "encryptedMulticastAddress",
      cell: (source) => (
        <code className="rounded bg-muted px-2 py-1">{source.encryptedMulticastAddress}</code>
      ),
      sortable: true
    },
    {
      header: "Protocol",
      accessorKey: "protocol",
      cell: (source) => source.protocol,
      sortable: true
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (source) => (
        <Badge
          variant="outline"
          className={
            source.status === 'play'
              ? 'border-green-500 text-green-600 bg-green-50/50 dark:bg-green-900/10'
              : 'border-amber-500 text-amber-600 bg-amber-50/50 dark:bg-amber-900/10'
          }
        >
          {source.status === 'play' ? 'Active' : 'Paused'}
        </Badge>
      ),
      sortable: true
    },
    {
      header: "Actions",
      id: "actions",
      cell: (source) => (
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleSourceStatus(source)}
            title={source.status === 'play' ? 'Pause' : 'Play'}
          >
            {source.status === 'play' ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleEditSource(source)}
            title="Edit"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleDeleteSource(source)}
            title="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-lg">Loading sources...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold mb-2">Error Loading Sources</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Sources</h1>
        <div className="flex gap-2">
          <Button onClick={handleAddSource}>
            <Plus className="h-4 w-4 mr-2" />
            Add Source
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Input Sources</CardTitle>
          <CardDescription>
            Manage unified input sources that feed multiple servers and arteries.
            Each source can be distributed to many destinations through different channels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveDataTable
            data={sources}
            columns={columns}
            keyField="id"
            searchable={true}
            searchPlaceholder="Search sources..."
            pagination={true}
            pageSize={8}
            emptyMessage="No sources configured yet"
          />
        </CardContent>
      </Card>

      {/* Source Edit/Create Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingSource ? 'Edit Source' : 'Add New Source'}</DialogTitle>
            <DialogDescription>
              {editingSource ? 'Update the source properties below.' : 'Configure a new input source.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={newSourceData.name}
                onChange={(e) => setNewSourceData({ ...newSourceData, name: e.target.value })}
                placeholder="Source name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ipAddress">IP Address</Label>
              <Input
                id="ipAddress"
                value={newSourceData.ipAddress}
                onChange={(e) => setNewSourceData({ ...newSourceData, ipAddress: e.target.value })}
                placeholder="e.g. 192.168.1.10"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="multicast">Multicast Address</Label>
              <Input
                id="multicast"
                value={newSourceData.encryptedMulticastAddress}
                onChange={(e) => setNewSourceData({
                  ...newSourceData,
                  encryptedMulticastAddress: e.target.value
                })}
                placeholder="e.g. 239.255.1.1"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="protocol">Protocol</Label>
              <Input
                id="protocol"
                value={newSourceData.protocol}
                onChange={(e) => setNewSourceData({ ...newSourceData, protocol: e.target.value })}
                placeholder="e.g. UDP TS"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="encryption"
                checked={newSourceData.encryptionEnabled}
                onCheckedChange={(checked) => setNewSourceData({
                  ...newSourceData,
                  encryptionEnabled: checked
                })}
              />
              <Label htmlFor="encryption">Enable Encryption</Label>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={saveSource}>
              {editingSource ? 'Update Source' : 'Create Source'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}