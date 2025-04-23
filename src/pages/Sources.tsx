
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ResponsiveDataTable, Column } from "@/components/data/ResponsiveDataTable";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/hooks/useLanguage";
import { translations } from "@/i18n/translations";
import { Source } from "@/types/source";
import { useToast } from "@/hooks/use-toast";
import { Plus } from "lucide-react";

// Initial mock data for sources
const initialSources: Source[] = [
  {
    id: 1,
    name: "Main Channel Source",
    encryptedMulticastAddress: "239.255.1.1",
    status: "play",
  },
  {
    id: 2,
    name: "Backup Channel Source",
    encryptedMulticastAddress: "239.255.1.2",
    status: "pause",
  }
];

export default function Sources() {
  const { toast } = useToast();
  const [sources, setSources] = useState<Source[]>(initialSources);
  const { language } = useLanguage();
  const t = translations[language].sources;

  // Define table columns with simplified data
  const columns: Column<Source>[] = [
    {
      header: t.name,
      accessorKey: "name",
      cell: (source) => <span className="font-medium">{source.name}</span>,
      sortable: true
    },
    {
      header: t.address,
      accessorKey: "encryptedMulticastAddress",
      cell: (source) => (
        <code className="rounded bg-muted px-2 py-1">{source.encryptedMulticastAddress}</code>
      ),
      sortable: true
    },
    {
      header: t.status,
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
          {source.status === 'play' ? t.play : t.pause}
        </Badge>
      ),
      sortable: true
    }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight" style={{ direction: language === 'he' ? 'rtl' : 'ltr' }}>
          {t.title}
        </h1>
        <div className="flex gap-2">
          <LanguageToggle />
          <Button onClick={() => {}}>
            <Plus className="h-4 w-4 mr-2" />
            {t.addSource}
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t.title}</CardTitle>
          <CardDescription>Manage input connections for all arterial channels</CardDescription>
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
    </div>
  );
}
