export interface DropPoint {
    id: number;
    name: string;
    address: string;
    distance?: string;
    status: 'Buka' | 'Tutup';
    hours: string;
    latitude?: number;
    longitude?: number;
    phone: string;
    area?: string;
}
