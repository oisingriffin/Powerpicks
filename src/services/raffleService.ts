import { supabase } from '@/lib/supabase';
import { Raffle } from '@/types/raffle';
import { PostgrestResponse, PostgrestSingleResponse } from '@supabase/supabase-js';

const RAFFLES_COLLECTION = 'raffles';
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const retryOperation = async <T>(
  operation: () => Promise<PostgrestResponse<T>>,
  retries = MAX_RETRIES
): Promise<PostgrestResponse<T>> => {
  try {
    return await operation();
  } catch (error) {
    console.error('Operation failed:', error);
    if (retries > 0) {
      console.log(`Retrying operation... ${retries} attempts remaining`);
      await delay(RETRY_DELAY);
      return retryOperation(operation, retries - 1);
    }
    throw error;
  }
};

const retrySingleOperation = async <T>(
  operation: () => Promise<PostgrestSingleResponse<T>>,
  retries = MAX_RETRIES
): Promise<PostgrestSingleResponse<T>> => {
  try {
    return await operation();
  } catch (error) {
    console.error('Operation failed:', error);
    if (retries > 0) {
      console.log(`Retrying operation... ${retries} attempts remaining`);
      await delay(RETRY_DELAY);
      return retrySingleOperation(operation, retries - 1);
    }
    throw error;
  }
};

export const raffleService = {
  // Get all active raffles
  async getActiveRaffles(): Promise<Raffle[]> {
    try {
      console.log('Fetching active raffles...');
      const { data, error } = await retryOperation<Raffle[]>(() =>
        Promise.resolve(
          supabase
            .from(RAFFLES_COLLECTION)
            .select('*')
            .order('created_at', { ascending: false })
        )
      );

      if (error) {
        console.error('Supabase error in getActiveRaffles:', error);
        throw new Error(`Failed to fetch raffles: ${error.message}`);
      }

      console.log('Successfully fetched raffles:', data?.length || 0);
      return (data as unknown as Raffle[]) || [];
    } catch (error) {
      console.error('Error in getActiveRaffles:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch raffles: ${error.message}`);
      }
      throw new Error('Failed to fetch raffles: Network error');
    }
  },

  // Get a single raffle by ID
  async getRaffleById(id: string): Promise<Raffle | null> {
    try {
      console.log('Fetching raffle by ID:', id);
      const { data, error } = await retrySingleOperation<Raffle>(() =>
        Promise.resolve(
          supabase
            .from(RAFFLES_COLLECTION)
            .select('*')
            .eq('id', id)
            .single()
        )
      );

      if (error) {
        console.error('Supabase error in getRaffleById:', error);
        throw new Error(`Failed to fetch raffle: ${error.message}`);
      }

      console.log('Successfully fetched raffle:', data ? 'found' : 'not found');
      return data as Raffle;
    } catch (error) {
      console.error('Error in getRaffleById:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to fetch raffle: ${error.message}`);
      }
      throw new Error('Failed to fetch raffle: Network error');
    }
  },

  // Create a new raffle
  async createRaffle(raffle: Omit<Raffle, 'id' | 'created_at' | 'updated_at'>): Promise<Raffle | null> {
    try {
      console.log('Creating new raffle...');
      const now = new Date().toISOString();
      const { data, error } = await retrySingleOperation<Raffle>(() =>
        Promise.resolve(
          supabase
            .from(RAFFLES_COLLECTION)
            .insert([{ ...raffle, created_at: now, updated_at: now }])
            .select()
            .single()
        )
      );

      if (error) {
        console.error('Supabase error in createRaffle:', error);
        throw new Error(`Failed to create raffle: ${error.message}`);
      }

      console.log('Successfully created raffle:', data?.id);
      return data as Raffle;
    } catch (error) {
      console.error('Error in createRaffle:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to create raffle: ${error.message}`);
      }
      throw new Error('Failed to create raffle: Network error');
    }
  },

  // Update a raffle
  async updateRaffle(id: string, updates: Partial<Raffle>): Promise<boolean> {
    try {
      console.log('Updating raffle:', id);
      const { error } = await retrySingleOperation<null>(() =>
        Promise.resolve(
          supabase
            .from(RAFFLES_COLLECTION)
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
        )
      );

      if (error) {
        console.error('Supabase error in updateRaffle:', error);
        throw new Error(`Failed to update raffle: ${error.message}`);
      }

      console.log('Successfully updated raffle:', id);
      return true;
    } catch (error) {
      console.error('Error in updateRaffle:', error);
      if (error instanceof Error) {
        throw new Error(`Failed to update raffle: ${error.message}`);
      }
      throw new Error('Failed to update raffle: Network error');
    }
  },
}; 