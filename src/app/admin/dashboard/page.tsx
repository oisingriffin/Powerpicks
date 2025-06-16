'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  PlusCircle, 
  Users, 
  BarChart3, 
  Ticket, 
  LogOut,
  ChevronRight,
  Clock,
  AlertCircle,
  DollarSign
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';

interface RaffleStats {
  ongoing: number;
  inactive: number;
  totalRevenue: number;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [raffleStats, setRaffleStats] = useState<RaffleStats>({
    ongoing: 0,
    inactive: 0,
    totalRevenue: 0
  });

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/admin/login');
      } else {
        setUser(user);
        fetchRaffleStats();
      }
    };
    checkUser();
  }, [router]);

  const fetchRaffleStats = async () => {
    try {
      const { data: ongoingRaffles, error: ongoingError } = await supabase
        .from('raffles')
        .select('*')
        .eq('status', 'active')
        .gte('end_date', new Date().toISOString());

      const { data: inactiveRaffles, error: inactiveError } = await supabase
        .from('raffles')
        .select('*')
        .or('status.eq.inactive,end_date.lt.' + new Date().toISOString());

      if (ongoingError || inactiveError) throw ongoingError || inactiveError;

      // Calculate total revenue based on tickets sold (total_tickets - available_tickets)
      const totalRevenue = [...(ongoingRaffles || []), ...(inactiveRaffles || [])].reduce((sum, raffle) => {
        const ticketsSold = raffle.total_tickets - raffle.available_tickets;
        const raffleRevenue = raffle.ticket_price * ticketsSold;
        console.log(`Raffle ${raffle.title}:`, {
          ticketPrice: raffle.ticket_price,
          totalTickets: raffle.total_tickets,
          availableTickets: raffle.available_tickets,
          ticketsSold,
          raffleRevenue
        });
        return sum + raffleRevenue;
      }, 0);

      console.log('Total Revenue:', totalRevenue);

      setRaffleStats({
        ongoing: ongoingRaffles?.length || 0,
        inactive: inactiveRaffles?.length || 0,
        totalRevenue
      });
    } catch (error) {
      console.error('Error fetching raffle stats:', error);
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-sm text-gray-500">Welcome back, {user?.email}</p>
          </div>
          <Button
            variant="outline"
            onClick={handleSignOut}
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Ongoing Raffles</p>
                <p className="text-2xl font-bold text-blue-600">{raffleStats.ongoing}</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Inactive Raffles</p>
                <p className="text-2xl font-bold text-green-600">{raffleStats.inactive}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-green-500" />
            </div>
          </Card>
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                <p className="text-2xl font-bold text-purple-600">${raffleStats.totalRevenue.toFixed(2)}</p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-500" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Raffle Management */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Ticket className="h-5 w-5 text-blue-600" />
                Raffle Management
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Link href="/admin/dashboard/create-raffle" className="block">
                <Button className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <PlusCircle className="h-4 w-4" />
                    Create New Raffle
                  </span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link href="/admin/dashboard/raffles" className="block">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Ticket className="h-4 w-4" />
                    View All Raffles
                  </span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* User Management */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <Users className="h-5 w-5 text-green-600" />
                User Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/dashboard/users" className="block">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    View All Users
                  </span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Analytics */}
          <Card className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-xl">
                <BarChart3 className="h-5 w-5 text-purple-600" />
                Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Link href="/admin/dashboard/analytics" className="block">
                <Button variant="outline" className="w-full justify-between group">
                  <span className="flex items-center gap-2">
                    <BarChart3 className="h-4 w-4" />
                    View Analytics
                  </span>
                  <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 