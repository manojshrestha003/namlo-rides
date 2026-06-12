
import axios from 'axios';

const BASE_URL = 'https://6a2a91d4b687a7d5cbc3fd7c.mockapi.io/api/v1'

export interface Ride {
  id?: string;
  riderId: string;
  driverId?: string;
  status: string;
  pickup: { lat: number; lng: number };
  dropoff?: { lat: number; lng: number };
  createdAt?: string;
}

export const saveRide = async (ride: Ride): Promise<Ride> => {
  const res = await axios.post(`${BASE_URL}/rides`, ride);
  return res.data;
};

export const fetchRides = async (): Promise<Ride[]> => {
  const res = await axios.get(`${BASE_URL}/rides`);
  return res.data;
};

