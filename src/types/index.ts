
export interface Location {
    lat: number;
    lng: number;
}

export interface RideData {
    id?: string;
    riderId: string;
    driverId?: string;
    status: string;
    pickup: Location;
    dropoff?: Location;
    driverLocation?: Location;
    createdAt?: string;
}

export type UserRole = 'rider' | 'driver';
