'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

interface Winner {
  id: string;
  title: string;
  prize_description: string;
  winner_id: string;
  winner_email: string;
  end_date: string;
}

interface RaffleWithWinner {
  id: string;
  title: string;
  prize_description: string;
  winner_id: string;
  end_date: string;
  winner: {
    email: string;
  } | null;
}

export default function WinnersPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWinners();
  }, []);

  const fetchWinners = async () => {
    try {
      // Get all completed raffles with winners
      const { data, error } = await supabase
        .from('raffles')
        .select(`
          id,
          title,
          prize_description,
          winner_id,
          end_date,
          winner:winner_id (
            email
          )
        `)
        .not('winner_id', 'is', null)
        .order('end_date', { ascending: false });

      if (error) throw error;

      // Transform the data to include winner's email
      const formattedWinners = (data as unknown as RaffleWithWinner[]).map(raffle => ({
        id: raffle.id,
        title: raffle.title,
        prize_description: raffle.prize_description,
        winner_id: raffle.winner_id,
        winner_email: raffle.winner?.email || 'Unknown',
        end_date: raffle.end_date
      }));

      setWinners(formattedWinners);
    } catch (error) {
      console.error('Error fetching winners:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Raffle Winners</h1>
          <p className="text-lg text-gray-600">Congratulations to all our lucky winners!</p>
        </div>

        {loading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading winners...</p>
          </div>
        ) : winners.length === 0 ? (
          <div className="text-center">
            <p className="text-gray-600">No winners to display yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {winners.map((winner) => (
              <Card key={winner.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{winner.title}</CardTitle>
                    <Trophy className="h-6 w-6 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Prize</h3>
                      <p className="mt-1 text-gray-900">{winner.prize_description}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Winner</h3>
                      <p className="mt-1 text-gray-900">{winner.winner_email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Drawn On</h3>
                      <p className="mt-1 text-gray-900">{formatDate(winner.end_date)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 