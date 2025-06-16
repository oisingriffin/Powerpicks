'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, ArrowUpDown, Search, Download } from 'lucide-react';
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface Raffle {
  id: string;
  title: string;
  description: string;
  prize_description: string;
  ticket_price: number;
  total_tickets: number;
  available_tickets: number;
  start_date: string;
  end_date: string;
  status: string;
  created_at: string;
}

const availableColumns = [
  { id: 'title', label: 'Title' },
  { id: 'description', label: 'Description' },
  { id: 'prize_description', label: 'Prize Description' },
  { id: 'ticket_price', label: 'Ticket Price' },
  { id: 'total_tickets', label: 'Total Tickets' },
  { id: 'available_tickets', label: 'Available Tickets' },
  { id: 'start_date', label: 'Start Date' },
  { id: 'end_date', label: 'End Date' },
  { id: 'status', label: 'Status' },
  { id: 'created_at', label: 'Created At' }
];

export default function ViewRaffles() {
  const router = useRouter();
  const [raffles, setRaffles] = useState<Raffle[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<keyof Raffle>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [selectedColumns, setSelectedColumns] = useState<string[]>(availableColumns.map(col => col.id));

  useEffect(() => {
    fetchRaffles();
  }, []);

  const fetchRaffles = async () => {
    try {
      const { data, error } = await supabase
        .from('raffles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRaffles(data || []);
    } catch (error) {
      console.error('Error fetching raffles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSort = (field: keyof Raffle) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredRaffles = raffles
    .filter(raffle => 
      raffle.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      raffle.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      raffle.status.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' 
          ? aValue - bValue
          : bValue - aValue;
      }
      
      return 0;
    });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status: string) => {
    const statusColors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      draft: 'bg-yellow-100 text-yellow-800',
      ended: 'bg-red-100 text-red-800'
    };

    return (
      <Badge className={`${statusColors[status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const handleExport = () => {
    // Filter and sort the data
    const filteredData = filteredRaffles.map(raffle => {
      const row: Record<string, string | number> = {};
      selectedColumns.forEach(column => {
        if (column === 'start_date' || column === 'end_date' || column === 'created_at') {
          row[column] = formatDate(raffle[column as keyof Raffle] as string);
        } else {
          row[column] = raffle[column as keyof Raffle];
        }
      });
      return row;
    });

    // Convert to CSV
    const headers = selectedColumns.map(col => availableColumns.find(c => c.id === col)?.label || col);
    const csvContent = [
      headers.join(','),
      ...filteredData.map(row => 
        selectedColumns.map(col => {
          const value = row[col];
          // Handle values that might contain commas
          return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(',')
      )
    ].join('\n');

    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `raffles_export_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
            <h1 className="text-2xl font-bold text-gray-900">All Raffles</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Search raffles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Export
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Select Columns to Export</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    {availableColumns.map((column) => (
                      <div key={column.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={column.id}
                          checked={selectedColumns.includes(column.id)}
                          onCheckedChange={(checked: boolean) => {
                            if (checked) {
                              setSelectedColumns([...selectedColumns, column.id]);
                            } else {
                              setSelectedColumns(selectedColumns.filter(id => id !== column.id));
                            }
                          }}
                        />
                        <Label htmlFor={column.id}>{column.label}</Label>
                      </div>
                    ))}
                  </div>
                  <Button onClick={handleExport} className="w-full">
                    Export Selected Columns
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('title')}
                    >
                      <div className="flex items-center gap-2">
                        Title
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('status')}
                    >
                      <div className="flex items-center gap-2">
                        Status
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('ticket_price')}
                    >
                      <div className="flex items-center gap-2">
                        Price
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('available_tickets')}
                    >
                      <div className="flex items-center gap-2">
                        Available
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('start_date')}
                    >
                      <div className="flex items-center gap-2">
                        Start Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSort('end_date')}
                    >
                      <div className="flex items-center gap-2">
                        End Date
                        <ArrowUpDown className="h-4 w-4" />
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : filteredRaffles.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        No raffles found
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredRaffles.map((raffle) => (
                      <TableRow key={raffle.id}>
                        <TableCell className="font-medium">
                          <div>
                            <div>{raffle.title}</div>
                            <div className="text-sm text-gray-500">{raffle.description}</div>
                          </div>
                        </TableCell>
                        <TableCell>{getStatusBadge(raffle.status)}</TableCell>
                        <TableCell>${raffle.ticket_price.toFixed(2)}</TableCell>
                        <TableCell>
                          {raffle.available_tickets} / {raffle.total_tickets}
                        </TableCell>
                        <TableCell>{formatDate(raffle.start_date)}</TableCell>
                        <TableCell>{formatDate(raffle.end_date)}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 