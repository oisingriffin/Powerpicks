'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface RaffleDetails {
  id: string;
  title: string;
  description: string;
  totalTickets: number;
  ticketsSold: number;
  pricePerTicket: number;
  endDate: string;
  image: string;
}

export default function RaffleDetailsPage() {
  const params = useParams();
  const [selectedTickets, setSelectedTickets] = useState(1);

  // Mock data - replace with actual data fetching
  const raffle: RaffleDetails = {
    id: params.id as string,
    title: "iPhone 15 Pro Max",
    description: "Win the latest iPhone 15 Pro Max in this exclusive raffle!",
    totalTickets: 100,
    ticketsSold: 45,
    pricePerTicket: 5,
    endDate: "2024-04-01",
    image: "/iphone.jpg"
  };

  const progress = (raffle.ticketsSold / raffle.totalTickets) * 100;

  const handleTicketChange = (value: number) => {
    if (value >= 1 && value <= (raffle.totalTickets - raffle.ticketsSold)) {
      setSelectedTickets(value);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Left Column - Image and Details */}
        <div className="space-y-6">
          <div className="relative aspect-square rounded-lg overflow-hidden">
            <img
              src={raffle.image}
              alt={raffle.title}
              className="object-cover w-full h-full"
            />
          </div>
          
          <Card className="p-6 bg-white">
            <h1 className="text-3xl font-bold text-primary mb-4">{raffle.title}</h1>
            <p className="text-gray-600 mb-4">{raffle.description}</p>
            
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-primary">Tickets Progress</h3>
                <Progress value={progress} className="h-2 bg-purple-light" />
                <p className="text-sm text-gray-600 mt-2">
                  {raffle.ticketsSold} of {raffle.totalTickets} tickets sold
                </p>
              </div>
              
              <div>
                <h3 className="font-semibold text-primary">Price per Ticket</h3>
                <p className="text-2xl font-bold text-primary">${raffle.pricePerTicket}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-primary">End Date</h3>
                <p className="text-gray-600">{new Date(raffle.endDate).toLocaleDateString()}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Right Column - Ticket Selection */}
        <Card className="p-6 bg-white h-fit">
          <h2 className="text-2xl font-bold text-primary mb-6">Select Your Tickets</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Tickets
              </label>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  onClick={() => handleTicketChange(selectedTickets - 1)}
                  disabled={selectedTickets <= 1}
                  className="text-primary border-primary hover:bg-purple-light"
                >
                  -
                </Button>
                <span className="text-xl font-semibold">{selectedTickets}</span>
                <Button
                  variant="outline"
                  onClick={() => handleTicketChange(selectedTickets + 1)}
                  disabled={selectedTickets >= (raffle.totalTickets - raffle.ticketsSold)}
                  className="text-primary border-primary hover:bg-purple-light"
                >
                  +
                </Button>
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-gray-600">Total Price</span>
                <span className="text-xl font-bold text-primary">
                  ${(selectedTickets * raffle.pricePerTicket).toFixed(2)}
                </span>
              </div>
            </div>

            <Button className="w-full bg-primary hover:bg-primary-dark text-white">
              Purchase Tickets
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
} 