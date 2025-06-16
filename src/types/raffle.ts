export interface Raffle {
  id: string;
  title: string;
  description: string;
  image_url: string;
  price: number;
  total_tickets: number;
  sold_tickets: number;
  end_date: string;
  prize: {
    name: string;
    value: number;
    description: string;
  };
  status: 'active' | 'ended' | 'drawn';
  winner?: {
    id: string;
    name: string;
    email: string;
  };
  created_at: string;
  updated_at: string;
} 