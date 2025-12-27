/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSocket } from './SocketContext';
import { DropPoint } from '@/lib/types';

// --- Interfaces ---

export interface Product {
    id: number;
    name: string;
    description: string;
    points: number;
    image: string;
    category: string;
    stock: number;
}
// ... (User interface)
export interface User {
    id: number;
    username: string;
    name: string;
    email: string;
    points: number;
    totalDeposited?: number;
    co2Saved?: number;
    joinDate?: string;
    pointHistory?: {
        id: number;
        date: string;
        description: string;
        amount: number;
        type: 'earn' | 'redeem';
    }[];
    role: 'User' | 'Admin' | 'Moderator';
    password?: string;
    image?: string;
}

export interface LeaderboardEntry {
    id: number;
    userId: number;
    userName: string;
    monthlyPoints: number;
    category: string;
    month: string;
    rank: number;
}

export interface DepositRequest {
    id: number;
    userId: number;
    userName: string;
    userEmail: string;
    amount: number;
    points: number;
    status: 'pending' | 'confirmed' | 'rejected';
    date: string;
    location?: string;
    method: 'courier' | 'drop_point';
    address?: string;
    contact?: string;
    image?: string;
    note?: string;
}

interface DataContextType {
    products: Product[];
    users: User[];
    dropPoints: DropPoint[];
    currentUser: User | null;
    isLoggedIn: boolean;
    leaderboard: LeaderboardEntry[];
    depositRequests: DepositRequest[];
    login: (email: string, password?: string) => boolean;
    logout: () => void;
    addProduct: (product: Product) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    addUser: (user: User) => Promise<void>;
    updateUser: (user: User) => Promise<void>;
    deleteUser: (id: number) => Promise<void>;
    addDropPoint: (dropPoint: DropPoint) => Promise<void>;
    updateDropPoint: (dropPoint: DropPoint) => Promise<void>;
    deleteDropPoint: (id: number) => Promise<void>;
    updateLeaderboardEntry: (entry: LeaderboardEntry) => void;
    deductUserPoints: (amount: number, description?: string) => Promise<boolean>;
    addUserPoints: (amount: number, description?: string) => Promise<boolean>;
    addDepositRequest: (request: Omit<DepositRequest, 'id' | 'status' | 'date'>) => Promise<void>;
    confirmDepositRequest: (id: number) => Promise<void>;
    rejectDepositRequest: (id: number) => Promise<void>;
    refreshData: () => Promise<void>;
}

// --- Initial Mock Data ---
const initialDropPoints: DropPoint[] = [
    // Wilayah Kota & Sekitarnya
    { id: 1, name: 'Drop Point Alun-Alun', address: 'Jl. Jend. Sudirman, Cilacap Tengah', distance: '0.5 km', status: 'Buka', hours: '08:00 - 17:00', latitude: -7.7212, longitude: 109.0069, phone: '0812-3456-7890', area: 'Cilacap Tengah' },
    { id: 2, name: 'Drop Point Teluk Penyu', address: 'Jl. Pasir Emas, Cilacap Selatan', distance: '2.3 km', status: 'Buka', hours: '09:00 - 18:00', latitude: -7.7365, longitude: 109.0253, phone: '0813-4567-8901', area: 'Cilacap Selatan' },
    { id: 3, name: 'Drop Point Gumilir', address: 'Jl. Tentara Pelajar, Cilacap Utara', distance: '4.7 km', status: 'Buka', hours: '08:00 - 20:00', latitude: -7.6953, longitude: 109.0305, phone: '0812-9876-5432', area: 'Cilacap Utara' },
    // Wilayah Timur
    { id: 4, name: 'Drop Point Pasar Kroya', address: 'Jl. Jend. Sudirman, Kroya', distance: '28 km', status: 'Buka', hours: '07:00 - 16:00', latitude: -7.6322, longitude: 109.2486, phone: '0857-1234-5678', area: 'Kroya' },
    { id: 5, name: 'Drop Point Adipala', address: 'Jl. Laut, Adipala', distance: '22 km', status: 'Tutup', hours: '08:00 - 16:00', latitude: -7.6811, longitude: 109.1558, phone: '0815-9876-1234', area: 'Adipala' },
    { id: 6, name: 'Drop Point Maos', address: 'Jl. Raya Maos, Maos', distance: '18 km', status: 'Buka', hours: '08:00 - 17:00', latitude: -7.6189, longitude: 109.1356, phone: '0812-5555-4444', area: 'Maos' },
    { id: 7, name: 'Drop Point Nusawungu', address: 'Jl. Raya Nusawungu', distance: '35 km', status: 'Buka', hours: '08:00 - 16:00', latitude: -7.6534, longitude: 109.3245, phone: '0812-3333-2222', area: 'Nusawungu' },
    { id: 8, name: 'Drop Point Binangun', address: 'Jl. Raya Binangun', distance: '30 km', status: 'Buka', hours: '08:00 - 16:00', latitude: -7.6654, longitude: 109.2876, phone: '0813-4444-5555', area: 'Binangun' },
    { id: 9, name: 'Drop Point Sampang', address: 'Jl. Raya Sampang', distance: '20 km', status: 'Tutup', hours: '08:00 - 17:00', latitude: -7.5876, longitude: 109.1897, phone: '0812-6666-7777', area: 'Sampang' },
    // Wilayah Tengah
    { id: 10, name: 'Drop Point Jeruklegi', address: 'Jl. Raya Jeruklegi', distance: '10 km', status: 'Buka', hours: '09:00 - 17:00', latitude: -7.6253, longitude: 109.0061, phone: '0813-8888-9999', area: 'Jeruklegi' },
    { id: 11, name: 'Drop Point Kesugihan', address: 'Jl. Serayu, Kesugihan', distance: '15 km', status: 'Buka', hours: '08:00 - 16:00', latitude: -7.6542, longitude: 109.0764, phone: '0811-7777-6666', area: 'Kesugihan' },
    { id: 12, name: 'Drop Point Kawunganten', address: 'Jl. Raya Kawunganten', distance: '25 km', status: 'Buka', hours: '08:00 - 17:00', latitude: -7.5890, longitude: 108.9765, phone: '0812-9999-1111', area: 'Kawunganten' },
    { id: 13, name: 'Drop Point Bantarsari', address: 'Jl. Raya Bantarsari', distance: '30 km', status: 'Tutup', hours: '09:00 - 15:00', latitude: -7.5345, longitude: 108.9234, phone: '0856-2222-3333', area: 'Bantarsari' },
    { id: 14, name: 'Drop Point Kampung Laut', address: 'Kawasan Segara Anakan', distance: '40 km', status: 'Buka', hours: '08:00 - 14:00', latitude: -7.7001, longitude: 108.9001, phone: '0813-1111-0000', area: 'Kampung Laut' },
    // Wilayah Barat
    { id: 15, name: 'Drop Point Sidareja', address: 'Jl. Jenderal Sudirman, Sidareja', distance: '45 km', status: 'Buka', hours: '08:00 - 17:00', latitude: -7.4856, longitude: 108.7944, phone: '0812-1111-2222', area: 'Sidareja' },
    { id: 16, name: 'Drop Point Gandrungmangu', address: 'Jl. Raya Gandrungmangu', distance: '35 km', status: 'Tutup', hours: '09:00 - 16:00', latitude: -7.5417, longitude: 108.8542, phone: '0856-7777-8888', area: 'Gandrungmangu' },
    { id: 17, name: 'Drop Point Kedungreja', address: 'Jl. Raya Kedungreja', distance: '50 km', status: 'Buka', hours: '08:00 - 16:00', latitude: -7.5123, longitude: 108.7654, phone: '0812-4444-3333', area: 'Kedungreja' },
    { id: 18, name: 'Drop Point Patimuan', address: 'Jl. Raya Patimuan', distance: '55 km', status: 'Buka', hours: '08:00 - 16:00', latitude: -7.5789, longitude: 108.7432, phone: '0813-5555-6666', area: 'Patimuan' },
    { id: 19, name: 'Drop Point Cipari', address: 'Jl. Ahmad Yani, Cipari', distance: '50 km', status: 'Buka', hours: '08:00 - 17:00', latitude: -7.4333, longitude: 108.7667, phone: '0812-9999-0000', area: 'Cipari' },
    { id: 20, name: 'Drop Point Karangpucung', address: 'Jl. Raya Karangpucung', distance: '60 km', status: 'Buka', hours: '08:00 - 17:00', latitude: -7.4123, longitude: 108.8765, phone: '0812-7777-8888', area: 'Karangpucung' },
    { id: 21, name: 'Drop Point Cimanggu', address: 'Jl. Raya Cimanggu', distance: '70 km', status: 'Buka', hours: '08:00 - 17:00', latitude: -7.3654, longitude: 108.8234, phone: '0813-2222-1111', area: 'Cimanggu' },
    { id: 22, name: 'Drop Point Majenang', address: 'Jl. Diponegoro, Majenang', distance: '80 km', status: 'Buka', hours: '08:00 - 20:00', latitude: -7.2975, longitude: 108.7303, phone: '0813-3333-4444', area: 'Majenang' },
    { id: 23, name: 'Drop Point Wanareja', address: 'Jl. Raya Wanareja', distance: '85 km', status: 'Buka', hours: '08:00 - 17:00', latitude: -7.3234, longitude: 108.6789, phone: '0812-6666-5555', area: 'Wanareja' },
    { id: 24, name: 'Drop Point Dayeuhluhur', address: 'Jl. Raya Dayeuhluhur', distance: '95 km', status: 'Tutup', hours: '09:00 - 15:00', latitude: -7.2567, longitude: 108.6123, phone: '0857-8888-9999', area: 'Dayeuhluhur' },
];

const initialUsers: User[] = [
    { id: 1, username: 'bayu', name: 'Bayu Prasetio', email: 'bayu@example.com', points: 100, role: 'User', password: 'password123', image: '' },
    { id: 2, username: 'siti', name: 'Siti Aminah', email: 'siti@example.com', points: 250, role: 'User', password: 'password123', image: '' },
    { id: 3, username: 'budi', name: 'Budi Santoso', email: 'budi@example.com', points: 15, role: 'User', password: 'password123', image: '' },
];

const initialLeaderboard: LeaderboardEntry[] = [];

const initialProducts: Product[] = [
    // ... (Products remain same)
    {
        id: 1,
        name: 'Sabun Cuci Piring',
        description: 'Sabun cuci piring ramah lingkungan 450ml',
        points: 200,
        image: '/placeholder-image.jpg',
        category: 'Kebersihan',
        stock: 50
    },
    {
        id: 2,
        name: 'Shampoo Herbal',
        description: 'Shampoo herbal alami tanpa bahan kimia 200ml',
        points: 300,
        image: '/placeholder-image.jpg',
        category: 'Perawatan',
        stock: 32
    },
    {
        id: 3,
        name: 'Voucher Bensin',
        description: 'Voucher bensin senilai Rp 20.000',
        points: 500,
        image: '/placeholder-image.jpg',
        category: 'Bahan Bakar',
        stock: 100
    },
    {
        id: 4,
        name: 'Pupuk Organik Cair',
        description: 'Pupuk organik cair untuk tanaman hias 500ml',
        points: 150,
        image: '/placeholder-image.jpg',
        category: 'Pertanian',
        stock: 25
    },
    {
        id: 5,
        name: 'Set Alat Tulis Eco',
        description: 'Set pensil dan buku catatan daur ulang',
        points: 100,
        image: '/placeholder-image.jpg',
        category: 'Alat Tulis',
        stock: 40
    },
    {
        id: 6,
        name: 'Tote Bag Kanvas',
        description: 'Tas belanja kuat dan modis dari bahan kanvas',
        points: 400,
        image: '/placeholder-image.jpg',
        category: 'Aksesori',
        stock: 15
    }
];
// ... (Initial mock data setup)

// --- Context ---
const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
    const [products, setProducts] = useState<Product[]>(initialProducts);
    const [users, setUsers] = useState<User[]>(initialUsers);
    const [dropPoints, setDropPoints] = useState<DropPoint[]>(initialDropPoints);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>(initialLeaderboard);
    const [depositRequests, setDepositRequests] = useState<DepositRequest[]>([]);
    const { socket } = useSocket();

    const refreshData = async () => {
        console.log('JB: Loading data from JSON Database...');
        try {
            const res = await fetch('/api/db');
            if (res.ok) {
                const data = await res.json();
                if (data.users && data.users.length > 0) setUsers(data.users);
                if (data.products && data.products.length > 0) setProducts(data.products);
                if (data.dropPoints && data.dropPoints.length > 0) setDropPoints(data.dropPoints);
                if (data.depositRequests) setDepositRequests(data.depositRequests);
            }
        } catch (err) {
            console.error('JB: JSON DB Load Error:', err);
        }
    };

    // Socket Listener for Realtime Updates
    useEffect(() => {
        if (socket) {
            const handleUpdate = (data?: any) => {
                console.log('DataContext: Received realtime update:', data);
                refreshData();
            };

            socket.on('db:updated', handleUpdate);
            socket.on('user:updated', handleUpdate);
            socket.on('deposit:updated', handleUpdate);
            socket.on('product:updated', handleUpdate);

            return () => {
                socket.off('db:updated', handleUpdate);
                socket.off('user:updated', handleUpdate);
                socket.off('deposit:updated', handleUpdate);
                socket.off('product:updated', handleUpdate);
            };
        }
    }, [socket]);

    // Initial Load
    useEffect(() => {
        refreshData().then(() => {
            // Restore Login State from LocalStorage (session is device-specific)
            const savedLoginState = localStorage.getItem('isLoggedIn');
            const savedUsername = localStorage.getItem('username');
            if (savedLoginState === 'true' && savedUsername) {
                setIsLoggedIn(true);
            }
        });
    }, []);

    // Handle Login persistence specifically after users state is potentially updated
    useEffect(() => {
        if (isLoggedIn && !currentUser && users.length > 0) {
            const savedUsername = localStorage.getItem('username');
            if (savedUsername) {
                const found = users.find(u => (u as any).username === savedUsername || u.email === savedUsername || u.name === savedUsername);
                if (found) setCurrentUser(found);
            }
        }
    }, [users, isLoggedIn, currentUser]);

    // --- Persistence Helper Removed ---
    // We now use direct API calls in each function

    const login = (identifier: string, password?: string) => {
        // Search by username (priority), email, or name
        const user = users.find(u =>
            (u as any).username === identifier ||
            u.email === identifier ||
            u.name === identifier
        );

        if (user) {
            // Check password if provided and user has one
            if (password && user.password && user.password !== password) return false;

            setIsLoggedIn(true);
            localStorage.setItem('isLoggedIn', 'true');
            // Store the identifier we found
            localStorage.setItem('username', (user as any).username || user.name);
            setCurrentUser(user);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsLoggedIn(false);
        setCurrentUser(null);
        localStorage.setItem('isLoggedIn', 'false');
    };

    // --- Products CRUD ---
    const addProduct = async (product: Product) => {
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (res.ok) {
                const newProduct = await res.json();
                setProducts(prev => [...prev, newProduct]);
            }
        } catch (error) {
            console.error('Error adding product:', error);
        }
    };

    const updateProduct = async (product: Product) => {
        try {
            const res = await fetch(`/api/products/${product.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            if (res.ok) {
                const updatedProduct = await res.json();
                setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
            }
        } catch (error) {
            console.error('Error updating product:', error);
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(prev => prev.filter(p => p.id !== id));
            }
        } catch (error) {
            console.error('Error deleting product:', error);
        }
    };

    // --- Users CRUD ---
    const addUser = async (user: User) => {
        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            if (res.ok) {
                const newUser = await res.json();
                setUsers(prev => [...prev, newUser]);
            }
        } catch (error) {
            console.error('Error adding user:', error);
        }
    };

    const updateUser = async (user: User) => {
        try {
            const res = await fetch(`/api/users/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            if (res.ok) {
                const updatedUser = await res.json();
                setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
                if (currentUser && currentUser.id === user.id) {
                    setCurrentUser(updatedUser);
                }
            }
        } catch (error) {
            console.error('Error updating user:', error);
        }
    };

    const deleteUser = async (id: number) => {
        try {
            const res = await fetch(`/api/users/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setUsers(prev => prev.filter(u => u.id !== id));
            }
        } catch (error) {
            console.error('Error deleting user:', error);
        }
    };

    // --- Drop Points CRUD ---
    const addDropPoint = async (dropPoint: DropPoint) => {
        try {
            const res = await fetch('/api/drop-points', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dropPoint)
            });
            if (res.ok) {
                const newPoint = await res.json();
                setDropPoints(prev => [...prev, newPoint]);
            }
        } catch (error) {
            console.error('Error adding drop point:', error);
        }
    };

    const updateDropPoint = async (dropPoint: DropPoint) => {
        try {
            const res = await fetch(`/api/drop-points/${dropPoint.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(dropPoint)
            });
            if (res.ok) {
                const updatedPoint = await res.json();
                setDropPoints(prev => prev.map(dp => dp.id === dropPoint.id ? updatedPoint : dp));
            }
        } catch (error) {
            console.error('Error updating drop point:', error);
        }
    };

    const deleteDropPoint = async (id: number) => {
        try {
            const res = await fetch(`/api/drop-points/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setDropPoints(prev => prev.filter(dp => dp.id !== id));
            }
        } catch (error) {
            console.error('Error deleting drop point:', error);
        }
    };

    // --- Leaderboard Logic ---
    useEffect(() => {
        const currentMonthName = new Intl.DateTimeFormat('id-ID', { month: 'long', year: 'numeric' }).format(new Date());
        const getDefaultCategory = (pts: number) => {
            if (pts >= 500) return 'Eco Warrior';
            if (pts >= 200) return 'Green Champion';
            if (pts >= 100) return 'Earth Saver';
            if (pts >= 50) return 'Nature Hero';
            return 'Planet Protector';
        };

        const updatedLeaderboard = [...users]
            // .filter(u => u.role === 'User') // Removed filter to allow Admin/Moderator to show up in leaderboard for demo purposes
            .sort((a, b) => b.points - a.points)
            .map((user, index) => {
                const existingEntry = leaderboard.find(e => e.userId === user.id);
                const category = existingEntry?.category || getDefaultCategory(user.points);
                return {
                    id: user.id,
                    userId: user.id,
                    userName: user.name,
                    monthlyPoints: user.points,
                    category: category,
                    month: currentMonthName,
                    rank: index + 1
                };
            });

        if (JSON.stringify(updatedLeaderboard) !== JSON.stringify(leaderboard)) {
            setLeaderboard(updatedLeaderboard);
            localStorage.setItem('jb_leaderboard', JSON.stringify(updatedLeaderboard));
        }
    }, [users]);

    const updateLeaderboardEntry = (entry: LeaderboardEntry) => {
        setLeaderboard(leaderboard.map(e => e.id === entry.id ? { ...e, category: entry.category } : e));
    };

    const deductUserPoints = async (amount: number, description: string = 'Penukaran Poin') => {
        if (!currentUser) return false;
        if (currentUser.points >= amount) {
            const newHistoryItem = {
                id: Date.now(),
                date: new Date().toISOString().split('T')[0],
                description: description,
                amount: amount,
                type: 'redeem' as const
            };
            const updatedUser = {
                ...currentUser,
                points: currentUser.points - amount,
                pointHistory: [newHistoryItem, ...(currentUser.pointHistory || [])]
            };
            await updateUser(updatedUser);
            return true;
        }
        return false;
    };

    const addUserPoints = async (amount: number, description: string = 'Penambahan Poin') => {
        if (!currentUser) return false;
        const newHistoryItem = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            description: description,
            amount: amount,
            type: 'earn' as const
        };
        const updatedUser = {
            ...currentUser,
            points: currentUser.points + amount,
            pointHistory: [newHistoryItem, ...(currentUser.pointHistory || [])]
        };
        await updateUser(updatedUser);
        return true;
    };

    // --- Deposit Requests ---
    const addDepositRequest = async (request: Omit<DepositRequest, 'id' | 'status' | 'date'>) => {
        const payload = {
            ...request,
            // id and date will be assigned by server/api if not present, but for now we send what we have
            date: new Date().toLocaleDateString('id-ID', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            }),
            status: 'pending'
        };

        try {
            const res = await fetch('/api/deposits', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const newRequest = await res.json();
                setDepositRequests(prev => [newRequest, ...prev]);
            }
        } catch (error) {
            console.error('Error adding deposit request:', error);
        }
    };

    const confirmDepositRequest = async (id: number) => {
        const request = depositRequests.find(r => r.id === id);
        if (!request || request.status !== 'pending') return;

        try {
            // 1. Update Deposit Request Status
            const res = await fetch(`/api/deposits/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'confirmed' })
            });

            if (res.ok) {
                const updatedRequest = await res.json();
                setDepositRequests(prev => prev.map(r => r.id === id ? updatedRequest : r));

                // 2. Add Points to User
                const targetUser = users.find(u => u.id === request.userId);
                if (targetUser) {
                    const newHistoryItem = {
                        id: Date.now(),
                        date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
                        description: `Setor Jelantah ${request.amount}L`,
                        amount: request.points,
                        type: 'earn' as const
                    };

                    const updatedUser: User = {
                        ...targetUser,
                        points: targetUser.points + request.points,
                        totalDeposited: (targetUser.totalDeposited || 0) + request.amount,
                        co2Saved: (targetUser.co2Saved || 0) + Math.round(request.amount * 2.5),
                        pointHistory: [newHistoryItem, ...(targetUser.pointHistory || [])]
                    };
                    await updateUser(updatedUser);
                }
            }
        } catch (error) {
            console.error('Error confirming deposit:', error);
        }
    };

    const rejectDepositRequest = async (id: number) => {
        try {
            const res = await fetch(`/api/deposits/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'rejected' })
            });

            if (res.ok) {
                const updatedRequest = await res.json();
                setDepositRequests(prev => prev.map(r => r.id === id ? updatedRequest : r));
            }
        } catch (error) {
            console.error('Error rejecting deposit:', error);
        }
    };

    return (
        <DataContext.Provider value={{
            products, users, dropPoints, currentUser, isLoggedIn, leaderboard, depositRequests,
            login, logout, addProduct, updateProduct, deleteProduct, addUser, updateUser, deleteUser,
            addDropPoint, updateDropPoint, deleteDropPoint, updateLeaderboardEntry,
            deductUserPoints, addUserPoints, addDepositRequest, confirmDepositRequest, rejectDepositRequest, refreshData
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) throw new Error('useData must be used within a DataProvider');
    return context;
}

