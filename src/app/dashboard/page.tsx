"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Ticket, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

interface Raffle {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  end_date: string;
}

// Define a type for the raw raffle data from the database
interface RawRaffle {
  id: string;
  title: string;
  description: string;
  image_url: string;
  end_date: string;
}

type TicketStatus = 'active' | 'won' | 'lost';

interface Ticket {
  id: string;
  raffleName: string;
  ticketNumber: string;
  purchaseDate: string;
  status: TicketStatus;
  drawDate: string;
  prize?: string;
}

export default function UserDashboard() {
  const [activeTickets, setActiveTickets] = useState<Ticket[]>([]);
  const [pastTickets, setPastTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const fetchUserRaffles = async () => {
      setLoading(true);
      try {
        // Get current user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user) {
          router.push("/login");
          return;
        }
        setUserEmail(user.email ?? null);
        // Get tickets for this user
        const { data: tickets, error: ticketError } = await supabase
          .from("raffle_tickets")
          .select("raffle_id")
          .eq("user_id", user.id);
        if (ticketError) throw ticketError;
        
        // Type assertion for the database response
        const raffleIds = (tickets as { raffle_id: string }[])?.map((t) => t.raffle_id) || [];
        if (raffleIds.length === 0) {
          setActiveTickets([]);
          setPastTickets([]);
          setLoading(false);
          return;
        }
        // Get raffles for these IDs
        const { data: rafflesData, error: raffleError } = await supabase
          .from("raffles")
          .select("id, title, description, image_url, end_date")
          .in("id", raffleIds);
        if (raffleError) throw raffleError;
        const mappedRaffles: Raffle[] = rafflesData.map((raffle: RawRaffle) => ({
          id: raffle.id,
          title: raffle.title,
          description: raffle.description,
          imageUrl: raffle.image_url,
          end_date: raffle.end_date,
        }));
        const activeTicketsData = mappedRaffles.filter(raffle => new Date(raffle.end_date) > new Date()).map(raffle => ({
          id: raffle.id,
          raffleName: raffle.title,
          ticketNumber: '',
          purchaseDate: '',
          status: 'active' as TicketStatus,
          drawDate: '',
        }));
        const pastTicketsData = mappedRaffles.filter(raffle => new Date(raffle.end_date) <= new Date()).map(raffle => ({
          id: raffle.id,
          raffleName: raffle.title,
          ticketNumber: '',
          purchaseDate: '',
          status: 'won' as TicketStatus,
          drawDate: '',
          prize: '',
        }));
        setActiveTickets(activeTicketsData);
        setPastTickets(pastTicketsData);
      } catch (err: unknown) {
        console.error("Failed to load your raffles.", err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserRaffles();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Your Raffles</CardTitle>
              {userEmail && <div className="text-sm text-gray-500">Signed in as {userEmail}</div>}
            </CardHeader>
            <CardContent>
              {/* Welcome Section */}
              <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900">Welcome back!</h1>
                <p className="text-gray-600 mt-2">Manage your raffle tickets and track your entries</p>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Active Tickets</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">{activeTickets.length}</h3>
                      </div>
                      <div className="bg-primary/10 p-3 rounded-full">
                        <Ticket className="h-6 w-6 text-primary" />
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Won Prizes</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                          {pastTickets.filter(t => t.status === 'won').length}
                        </h3>
                      </div>
                      <div className="bg-secondary/10 p-3 rounded-full">
                        <CheckCircle className="h-6 w-6 text-secondary" />
                      </div>
                    </div>
                  </CardContent>
                </div>

                <div className="bg-white shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600">Total Entries</p>
                        <h3 className="text-2xl font-bold text-gray-900 mt-1">
                          {activeTickets.length + pastTickets.length}
                        </h3>
                      </div>
                      <div className="bg-accent/10 p-3 rounded-full">
                        <Clock className="h-6 w-6 text-accent" />
                      </div>
                    </div>
                  </CardContent>
                </div>
              </div>

              {/* Active Tickets Section */}
              <section className="mb-8">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-gray-900">Active Tickets</h2>
                  <Link href="/raffles">
                    <Button variant="outline" className="flex items-center gap-2 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00] hover:text-white">
                      <Ticket className="h-4 w-4" />
                      Enter New Raffle
                    </Button>
                  </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activeTickets.map((ticket) => (
                    <Card key={ticket.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{ticket.raffleName}</h3>
                            <p className="text-sm text-gray-600 mt-1">Ticket #{ticket.ticketNumber}</p>
                            <div className="mt-4 space-y-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Purchase Date:</span> {new Date(ticket.purchaseDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Draw Date:</span> {new Date(ticket.drawDate).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="bg-primary/10 px-3 py-1 rounded-full">
                            <span className="text-sm font-medium text-primary">Active</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>

              {/* Past Tickets Section */}
              <section>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Past Entries</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastTickets.map((ticket) => (
                    <Card key={ticket.id} className="bg-white shadow-sm hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-gray-900">{ticket.raffleName}</h3>
                            <p className="text-sm text-gray-600 mt-1">Ticket #{ticket.ticketNumber}</p>
                            <div className="mt-4 space-y-2">
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Purchase Date:</span> {new Date(ticket.purchaseDate).toLocaleDateString()}
                              </p>
                              <p className="text-sm text-gray-600">
                                <span className="font-medium">Draw Date:</span> {new Date(ticket.drawDate).toLocaleDateString()}
                              </p>
                              {ticket.status === 'won' && ticket.prize && (
                                <p className="text-sm text-[#FFB800] font-medium">
                                  Won: {ticket.prize}
                                </p>
                              )}
                            </div>
                          </div>
                          <div className={`px-3 py-1 rounded-full ${
                            ticket.status === 'won' ? 'bg-secondary/10' : 'bg-gray-100'
                          }`}>
                            <span className={`text-sm font-medium ${
                              ticket.status === 'won' ? 'text-secondary' : 'text-gray-600'
                            }`}>
                              {ticket.status === 'won' ? 'Won' : 'Not Won'}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </section>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 