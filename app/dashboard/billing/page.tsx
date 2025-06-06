'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Search, 
  DollarSign, 
  FileText, 
  AlertCircle,
  CheckCircle,
  Clock,
  Filter,
  ArrowUpDown,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  FilterFn,
} from '@tanstack/react-table';

// Define the billing data type
type BillingItem = {
  id: string;
  patientName: string;
  sessionDate: string;
  provider: string;
  cptCode: string;
  icdCode: string;
  modifier: string;
  fee: number;
  status: 'ready' | 'review' | 'submitted' | 'error';
  confidence: number;
};

// Mock billing data
const mockBillingData: BillingItem[] = [
  {
    id: '1',
    patientName: 'John Doe',
    sessionDate: '2024-01-15',
    provider: 'Dr. Sarah Johnson',
    cptCode: '99213',
    icdCode: 'F32.9',
    modifier: '',
    fee: 150,
    status: 'ready',
    confidence: 95,
  },
  {
    id: '2',
    patientName: 'Jane Smith',
    sessionDate: '2024-01-15',
    provider: 'Dr. Michael Chen',
    cptCode: '90834',
    icdCode: 'F41.1',
    modifier: '',
    fee: 200,
    status: 'review',
    confidence: 78,
  },
  {
    id: '3',
    patientName: 'Robert Johnson',
    sessionDate: '2024-01-15',
    provider: 'Dr. Emily Davis',
    cptCode: '99214',
    icdCode: 'G43.909',
    modifier: '25',
    fee: 225,
    status: 'ready',
    confidence: 92,
  },
  {
    id: '4',
    patientName: 'Emily Davis',
    sessionDate: '2024-01-14',
    provider: 'Dr. James Wilson',
    cptCode: '90837',
    icdCode: 'F33.1',
    modifier: '',
    fee: 300,
    status: 'submitted',
    confidence: 98,
  },
  {
    id: '5',
    patientName: 'Michael Brown',
    sessionDate: '2024-01-14',
    provider: 'Dr. Sarah Johnson',
    cptCode: '99212',
    icdCode: 'R51.9',
    modifier: '',
    fee: 100,
    status: 'error',
    confidence: 45,
  },
  {
    id: '6',
    patientName: 'Lisa Anderson',
    sessionDate: '2024-01-13',
    provider: 'Dr. Michael Chen',
    cptCode: '90791',
    icdCode: 'Z00.8',
    modifier: '',
    fee: 250,
    status: 'ready',
    confidence: 88,
  },
  {
    id: '7',
    patientName: 'David Martinez',
    sessionDate: '2024-01-13',
    provider: 'Dr. Emily Davis',
    cptCode: '99215',
    icdCode: 'M79.3',
    modifier: '',
    fee: 275,
    status: 'submitted',
    confidence: 96,
  },
  {
    id: '8',
    patientName: 'Sarah Wilson',
    sessionDate: '2024-01-12',
    provider: 'Dr. James Wilson',
    cptCode: '90847',
    icdCode: 'F90.0',
    modifier: '',
    fee: 350,
    status: 'review',
    confidence: 72,
  },
];

// Helper functions for status
const getStatusIcon = (status: string) => {
  switch (status) {
    case 'ready':
      return <CheckCircle className="h-4 w-4 text-green-600" />;
    case 'review':
      return <AlertCircle className="h-4 w-4 text-yellow-600" />;
    case 'submitted':
      return <Clock className="h-4 w-4 text-blue-600" />;
    case 'error':
      return <AlertCircle className="h-4 w-4 text-red-600" />;
    default:
      return null;
  }
};

const getStatusText = (status: string) => {
  switch (status) {
    case 'ready':
      return 'Ready to Submit';
    case 'review':
      return 'Needs Review';
    case 'submitted':
      return 'Submitted';
    case 'error':
      return 'Error';
    default:
      return status;
  }
};

const getConfidenceBadge = (confidence: number) => {
  let colorClass = '';
  if (confidence >= 90) {
    colorClass = 'bg-green-100 text-green-800';
  } else if (confidence >= 70) {
    colorClass = 'bg-yellow-100 text-yellow-800';
  } else {
    colorClass = 'bg-red-100 text-red-800';
  }
  
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      {confidence}%
    </span>
  );
};

// Custom filter function for global search
const globalFilterFn: FilterFn<BillingItem> = (row, columnId, value) => {
  const search = value.toLowerCase();
  return (
    row.original.patientName.toLowerCase().includes(search) ||
    row.original.provider.toLowerCase().includes(search) ||
    row.original.cptCode.toLowerCase().includes(search) ||
    row.original.icdCode.toLowerCase().includes(search)
  );
};

export default function BillingPage() {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<BillingItem>[]>(
    () => [
      {
        accessorKey: 'patientName',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Patient
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => <div className="font-medium">{row.getValue('patientName')}</div>,
      },
      {
        accessorKey: 'sessionDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Date
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => row.getValue('sessionDate'),
      },
      {
        accessorKey: 'provider',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Provider
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          );
        },
        cell: ({ row }) => row.getValue('provider'),
      },
      {
        accessorKey: 'cptCode',
        header: 'CPT',
        cell: ({ row }) => <div className="font-mono text-sm">{row.getValue('cptCode')}</div>,
      },
      {
        accessorKey: 'icdCode',
        header: 'ICD-10',
        cell: ({ row }) => <div className="font-mono text-sm">{row.getValue('icdCode')}</div>,
      },
      {
        accessorKey: 'modifier',
        header: 'Modifier',
        cell: ({ row }) => row.getValue('modifier') || '-',
      },
      {
        accessorKey: 'fee',
        header: ({ column }) => {
          return (
            <div className="text-right">
              <Button
                variant="ghost"
                size="sm"
                className="-mr-3 h-8 data-[state=open]:bg-accent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Fee
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const fee = row.getValue('fee') as number;
          return <div className="text-right font-medium">${fee}</div>;
        },
      },
      {
        accessorKey: 'confidence',
        header: ({ column }) => {
          return (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 data-[state=open]:bg-accent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Confidence
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const confidence = row.getValue('confidence') as number;
          return <div className="text-center">{getConfidenceBadge(confidence)}</div>;
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => {
          return (
            <div className="text-center">
              <Button
                variant="ghost"
                size="sm"
                className="h-8 data-[state=open]:bg-accent"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              >
                Status
                {column.getIsSorted() === "asc" ? (
                  <ArrowUp className="ml-2 h-4 w-4" />
                ) : column.getIsSorted() === "desc" ? (
                  <ArrowDown className="ml-2 h-4 w-4" />
                ) : (
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                )}
              </Button>
            </div>
          );
        },
        cell: ({ row }) => {
          const status = row.getValue('status') as string;
          return (
            <div className="flex items-center justify-center gap-2">
              {getStatusIcon(status)}
              <span className="text-sm">{getStatusText(status)}</span>
            </div>
          );
        },
        filterFn: (row, id, value) => {
          return value === 'all' || row.getValue(id) === value;
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          return (
            <div className="text-right">
              <Button size="sm" variant="ghost">
                <FileText className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    []
  );
  
  // Filter data based on selected status
  const filteredData = useMemo(() => {
    if (selectedStatus === 'all') return mockBillingData;
    return mockBillingData.filter(item => item.status === selectedStatus);
  }, [selectedStatus]);
  
  // Create table instance
  const table = useReactTable({
    data: filteredData,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn,
    state: {
      sorting,
      columnFilters,
      globalFilter,
    },
  });
  
  // Calculate summary statistics
  const totalRevenue = filteredData.reduce((sum, item) => sum + item.fee, 0);
  const readyCount = filteredData.filter(item => item.status === 'ready').length;
  const reviewCount = filteredData.filter(item => item.status === 'review').length;
  const avgConfidence = Math.round(
    filteredData.reduce((sum, item) => sum + item.confidence, 0) / 
    filteredData.length || 0
  );
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Billing Console</h1>
        <p className="text-muted-foreground">
          Review and submit insurance claims
        </p>
      </div>
      
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">${totalRevenue.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ready to Submit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{readyCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Needs Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{reviewCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Avg. Confidence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{avgConfidence}%</p>
          </CardContent>
        </Card>
      </div>
      
      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by patient, provider, or code..."
            value={globalFilter ?? ''}
            onChange={(e) => setGlobalFilter(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={selectedStatus === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedStatus('all');
              table.getColumn('status')?.setFilterValue('all');
            }}
          >
            All
          </Button>
          <Button
            variant={selectedStatus === 'ready' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedStatus('ready');
              table.getColumn('status')?.setFilterValue('ready');
            }}
          >
            Ready
          </Button>
          <Button
            variant={selectedStatus === 'review' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedStatus('review');
              table.getColumn('status')?.setFilterValue('review');
            }}
          >
            Review
          </Button>
          <Button
            variant={selectedStatus === 'submitted' ? 'default' : 'outline'}
            size="sm"
            onClick={() => {
              setSelectedStatus('submitted');
              table.getColumn('status')?.setFilterValue('submitted');
            }}
          >
            Submitted
          </Button>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          More Filters
        </Button>
        <Button variant="default" size="sm">
          Submit Selected
        </Button>
      </div>
      
      {/* Data table with TanStack Table */}
      <Card>
        <CardHeader>
          <CardTitle>Claims Queue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <table className="w-full">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id} className="border-b">
                    {headerGroup.headers.map((header) => (
                      <th
                        key={header.id}
                        className="h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0"
                      >
                        {header.isPlaceholder
                          ? null
                          : flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                      </th>
                    ))}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows?.length ? (
                  table.getRowModel().rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted"
                    >
                      {row.getVisibleCells().map((cell) => (
                        <td
                          key={cell.id}
                          className="p-4 align-middle [&:has([role=checkbox])]:pr-0"
                        >
                          {flexRender(
                            cell.column.columnDef.cell,
                            cell.getContext()
                          )}
                        </td>
                      ))}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={columns.length}
                      className="h-24 text-center"
                    >
                      No results.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="text-sm text-muted-foreground">
              Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
              {Math.min(
                (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                table.getFilteredRowModel().rows.length
              )}{' '}
              of {table.getFilteredRowModel().rows.length} results
            </div>
            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
