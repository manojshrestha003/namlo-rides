
import axios from 'axios';

const BASE_URL = import.meta.env.VITE_BASE_URL;



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

