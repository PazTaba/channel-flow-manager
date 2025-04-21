
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

export type Column<T> = {
  header: string;
  accessorKey: keyof T;
  cell?: (item: T) => React.ReactNode;
  className?: string;
  hideOnMobile?: boolean;
  sortable?: boolean;
};

type SortDirection = "asc" | "desc" | null;

interface ResponsiveDataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchable?: boolean;
  searchPlaceholder?: string;
  pagination?: boolean;
  pageSize?: number;
  onRowClick?: (item: T) => void;
  highlightCondition?: (item: T) => boolean;
  highlightClass?: string;
  emptyMessage?: string;
  keyField: keyof T;
  className?: string;
}

export function ResponsiveDataTable<T>({
  data,
  columns,
  searchable = true,
  searchPlaceholder = "Search...",
  pagination = true,
  pageSize = 10,
  onRowClick,
  highlightCondition,
  highlightClass = "bg-muted/40",
  emptyMessage = "No data available",
  keyField,
  className,
}: ResponsiveDataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortColumn, setSortColumn] = useState<keyof T | null>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>(null);
  
  // Filter data based on search query
  const filteredData = searchable && searchQuery
    ? data.filter(item => 
        columns.some(column => {
          const value = item[column.accessorKey];
          return value && value.toString().toLowerCase().includes(searchQuery.toLowerCase());
        })
      )
    : data;
    
  // Sort data if a column is selected
  const sortedData = sortColumn
    ? [...filteredData].sort((a, b) => {
        const aValue = a[sortColumn];
        const bValue = b[sortColumn];
        
        // Handle null or undefined values
        if (!aValue && !bValue) return 0;
        if (!aValue) return sortDirection === "asc" ? -1 : 1;
        if (!bValue) return sortDirection === "asc" ? 1 : -1;
        
        // Compare based on type
        if (typeof aValue === "number" && typeof bValue === "number") {
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        }
        
        // Convert to string for comparison
        const aString = aValue.toString().toLowerCase();
        const bString = bValue.toString().toLowerCase();
        
        return sortDirection === "asc" 
          ? aString.localeCompare(bString)
          : bString.localeCompare(aString);
      })
    : filteredData;
  
  // Calculate pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const paginatedData = pagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;
    
  // Handle sort
  const handleSort = (column: keyof T) => {
    if (!columns.find(col => col.accessorKey === column)?.sortable) return;
    
    if (sortColumn === column) {
      // Toggle between asc, desc, and null
      if (sortDirection === "asc") {
        setSortDirection("desc");
      } else if (sortDirection === "desc") {
        setSortColumn(null);
        setSortDirection(null);
      }
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  // Render desktop table
  const renderDesktopTable = () => (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead
                key={index}
                className={cn(
                  column.hideOnMobile && "hidden md:table-cell",
                  column.className,
                  column.sortable && "cursor-pointer hover:bg-accent/50"
                )}
                onClick={() => column.sortable && handleSort(column.accessorKey)}
              >
                <div className="flex items-center space-x-1">
                  <span>{column.header}</span>
                  {column.sortable && (
                    <ArrowUpDown className={cn(
                      "h-4 w-4 transition-opacity",
                      sortColumn === column.accessorKey ? "opacity-100" : "opacity-30"
                    )} />
                  )}
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {paginatedData.length > 0 ? (
            paginatedData.map((item) => (
              <TableRow 
                key={item[keyField] as string | number}
                className={cn(
                  onRowClick && "cursor-pointer hover:bg-accent/50",
                  highlightCondition && highlightCondition(item) && highlightClass
                )}
                onClick={() => onRowClick && onRowClick(item)}
              >
                {columns.map((column, colIndex) => (
                  <TableCell 
                    key={colIndex}
                    className={cn(
                      column.hideOnMobile && "hidden md:table-cell",
                      column.className
                    )}
                  >
                    {column.cell ? column.cell(item) : item[column.accessorKey]?.toString()}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-6 text-muted-foreground">
                {emptyMessage}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
  
  // Render mobile card view
  const renderMobileCards = () => (
    <div className="space-y-4 md:hidden">
      {paginatedData.length > 0 ? (
        paginatedData.map((item) => (
          <Card 
            key={item[keyField] as string | number}
            className={cn(
              "overflow-hidden",
              onRowClick && "cursor-pointer hover:bg-accent/50",
              highlightCondition && highlightCondition(item) && highlightClass
            )}
            onClick={() => onRowClick && onRowClick(item)}
          >
            <CardContent className="p-4 space-y-3">
              {columns.map((column, colIndex) => (
                // Skip hidden columns on mobile
                !column.hideOnMobile && (
                  <div key={colIndex} className="flex justify-between items-start">
                    <div className="font-medium text-sm">{column.header}</div>
                    <div className="text-right">
                      {column.cell ? column.cell(item) : item[column.accessorKey]?.toString()}
                    </div>
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        ))
      ) : (
        <div className="text-center py-6 text-muted-foreground">
          {emptyMessage}
        </div>
      )}
    </div>
  );
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Search input */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1); // Reset to first page on search
            }}
            className="pl-8"
          />
        </div>
      )}
      
      {/* Desktop table view */}
      <div className="hidden md:block">
        {renderDesktopTable()}
      </div>
      
      {/* Mobile card view */}
      {renderMobileCards()}
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * pageSize + 1, sortedData.length)} to{" "}
            {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} items
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm px-2">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
