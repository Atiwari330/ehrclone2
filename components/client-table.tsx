'use client';

import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  OnChangeFn,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { 
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Calendar,
  Clock,
  Eye,
  Play,
  UserCheck,
  UserPlus,
  UserX,
  TrendingUp
} from 'lucide-react';
import type { ClientListItem } from '@/lib/types/client';
import { formatPhoneNumber, getStatusColor } from '@/lib/types/client';

interface ClientTableProps {
  data: ClientListItem[];
  sorting: SortingState;
  setSorting: OnChangeFn<SortingState>;
  onViewClient?: (client: ClientListItem) => void;
  onViewOutcomes?: (client: ClientListItem) => void;
}

// Helper function to format dates
const formatDate = (date: Date | undefined) => {
  if (!date) return '-';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
};

// Helper function to get status icon
const getStatusIcon = (status: ClientListItem['status']) => {
  switch (status) {
    case 'active':
      return <UserCheck className="h-4 w-4 text-green-600" />;
    case 'inactive':
      return <UserX className="h-4 w-4 text-gray-600" />;
    case 'new':
      return <UserPlus className="h-4 w-4 text-blue-600" />;
    default:
      return null;
  }
};

// Helper function to get status text
const getStatusText = (status: ClientListItem['status']) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'inactive':
      return 'Inactive';
    case 'new':
      return 'New';
    default:
      return status;
  }
};

export function ClientTable({ data, sorting, setSorting, onViewClient, onViewOutcomes }: ClientTableProps) {
  // Define columns
  const columns = useMemo<ColumnDef<ClientListItem>[]>(
    () => [
      {
        id: 'name',
        accessorFn: (row) => `${row.firstName} ${row.lastName}`,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Name
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
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div>
              <div className="font-medium">{`${client.firstName} ${client.lastName}`}</div>
              <div className="text-sm text-muted-foreground">MRN: {client.mrn}</div>
            </div>
          );
        },
      },
      {
        id: 'dobAge',
        accessorFn: (row) => row.dateOfBirth,
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              DOB / Age
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
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div>
              <div className="text-sm">{formatDate(client.dateOfBirth)}</div>
              <div className="text-sm text-muted-foreground">{client.age} years</div>
            </div>
          );
        },
      },
      {
        accessorKey: 'contactPhone',
        header: 'Phone',
        cell: ({ row }) => {
          const phone = row.getValue('contactPhone') as string | undefined;
          return phone ? formatPhoneNumber(phone) : '-';
        },
      },
      {
        accessorKey: 'lastVisit',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Last Visit
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
        cell: ({ row }) => {
          const lastVisit = row.getValue('lastVisit') as Date | undefined;
          if (!lastVisit) return <span className="text-muted-foreground">-</span>;
          
          const today = new Date();
          const diffTime = today.getTime() - lastVisit.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          return (
            <div>
              <div className="text-sm">{formatDate(lastVisit)}</div>
              <div className="text-xs text-muted-foreground">
                {diffDays === 0 ? 'Today' : 
                 diffDays === 1 ? 'Yesterday' : 
                 `${diffDays} days ago`}
              </div>
            </div>
          );
        },
      },
      {
        accessorKey: 'nextAppointment',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              size="sm"
              className="-ml-3 h-8 data-[state=open]:bg-accent"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
              Next Appointment
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
        cell: ({ row }) => {
          const nextAppt = row.getValue('nextAppointment') as Date | undefined;
          if (!nextAppt) return <span className="text-muted-foreground">-</span>;
          
          const today = new Date();
          const diffTime = nextAppt.getTime() - today.getTime();
          const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
          
          return (
            <div>
              <div className="text-sm">{formatDate(nextAppt)}</div>
              <div className="text-xs text-muted-foreground">
                {diffDays === 0 ? 'Today' : 
                 diffDays === 1 ? 'Tomorrow' : 
                 diffDays < 0 ? 'Overdue' :
                 `In ${diffDays} days`}
              </div>
            </div>
          );
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
          const status = row.getValue('status') as ClientListItem['status'];
          const statusColor = getStatusColor(status);
          
          return (
            <div className="flex items-center justify-center gap-2">
              <span 
                className={`inline-block h-2 w-2 rounded-full ${statusColor}`}
                aria-hidden="true"
              />
              <span className="text-sm">{getStatusText(status)}</span>
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: () => <div className="text-right">Actions</div>,
        cell: ({ row }) => {
          const client = row.original;
          return (
            <div className="flex items-center justify-end gap-2">
              <Button 
                size="sm" 
                variant="ghost"
                title="View client details"
                onClick={() => onViewClient?.(client)}
              >
                <Eye className="h-4 w-4" />
              </Button>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      disabled={!client.outcomes?.phq9 || client.outcomes.phq9.length === 0}
                      onClick={() => onViewOutcomes?.(client)}
                    >
                      <TrendingUp className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Outcomes</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button 
                size="sm" 
                variant="ghost"
                title="Schedule appointment"
              >
                <Calendar className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                title="Start session"
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [onViewClient, onViewOutcomes]
  );

  // Create table instance
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="space-y-4">
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
      <div className="flex items-center justify-between space-x-2">
        <div className="text-sm text-muted-foreground">
          Showing {table.getState().pagination.pageIndex * table.getState().pagination.pageSize + 1} to{' '}
          {Math.min(
            (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
            table.getFilteredRowModel().rows.length
          )}{' '}
          of {table.getFilteredRowModel().rows.length} clients
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
    </div>
  );
}
