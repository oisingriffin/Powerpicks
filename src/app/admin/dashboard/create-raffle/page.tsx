'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';

export default function CreateRaffle() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prize_description: '',
    ticket_price: '',
    total_tickets: '',
    start_date: '',
    end_date: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Format the data according to the table schema
      const startDate = new Date(formData.start_date);
      const currentDate = new Date();
      
      const raffleData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        prize_description: formData.prize_description.trim(),
        ticket_price: parseFloat(formData.ticket_price),
        total_tickets: parseInt(formData.total_tickets),
        available_tickets: parseInt(formData.total_tickets), // Initially equal to total_tickets
        start_date: startDate.toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
        status: startDate <= currentDate ? 'active' : 'draft' // Set status based on start date
      };

      // Validate the data
      if (!raffleData.title) {
        throw new Error('Title is required');
      }

      if (!raffleData.prize_description) {
        throw new Error('Prize description is required');
      }

      if (isNaN(raffleData.ticket_price) || raffleData.ticket_price <= 0) {
        throw new Error('Ticket price must be greater than 0');
      }

      if (isNaN(raffleData.total_tickets) || raffleData.total_tickets <= 0) {
        throw new Error('Total tickets must be greater than 0');
      }

      if (new Date(raffleData.start_date) >= new Date(raffleData.end_date)) {
        throw new Error('End date must be after start date');
      }

      // Log the data being sent
      console.log('Inserting raffle data:', raffleData);

      // Insert the raffle
      const { data, error: insertError } = await supabase
        .from('raffles')
        .insert([raffleData])
        .select()
        .single();

      if (insertError) {
        console.error('Supabase error:', insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }

      if (!data) {
        throw new Error('Failed to create raffle - no data returned');
      }

      console.log('Successfully created raffle:', data);
      router.push('/admin/dashboard');
    } catch (err) {
      console.error('Error creating raffle:', err);
      setError(err instanceof Error ? err.message : 'An error occurred while creating the raffle');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Raffle</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="bg-red-50 text-red-500 p-3 rounded-md">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                Title
              </label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                placeholder="Enter raffle title"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                placeholder="Enter raffle description"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="prize_description" className="block text-sm font-medium text-gray-700">
                Prize Description
              </label>
              <textarea
                id="prize_description"
                name="prize_description"
                value={formData.prize_description}
                onChange={handleChange}
                required
                className="w-full rounded-md border border-gray-300 px-3 py-2"
                rows={3}
                placeholder="Describe the prize"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="ticket_price" className="block text-sm font-medium text-gray-700">
                  Ticket Price ($)
                </label>
                <Input
                  id="ticket_price"
                  name="ticket_price"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formData.ticket_price}
                  onChange={handleChange}
                  required
                  placeholder="0.00"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="total_tickets" className="block text-sm font-medium text-gray-700">
                  Total Tickets
                </label>
                <Input
                  id="total_tickets"
                  name="total_tickets"
                  type="number"
                  min="1"
                  value={formData.total_tickets}
                  onChange={handleChange}
                  required
                  placeholder="Enter total number of tickets"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="start_date" className="block text-sm font-medium text-gray-700">
                  Start Date
                </label>
                <Input
                  id="start_date"
                  name="start_date"
                  type="datetime-local"
                  value={formData.start_date}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="end_date" className="block text-sm font-medium text-gray-700">
                  End Date
                </label>
                <Input
                  id="end_date"
                  name="end_date"
                  type="datetime-local"
                  value={formData.end_date}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Raffle'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 