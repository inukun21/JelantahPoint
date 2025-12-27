'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useData } from '@/context/DataContext';
import {
    LayoutDashboard,
    Package,
    Users,
    Settings,
    LogOut,
    Plus,
    Search,
    Edit2,
    Trash2,
    MoreVertical,
    Save,
    X,
    Droplet,
    Trophy,
    Upload,
    MapPin,
    Eye,
    EyeOff,
    Check,
    Clock,
    Camera,
    Phone,
    QrCode
} from 'lucide-react';
import { AREAS } from '@/lib/constants';

// --- Mock Data ---

const initialProducts = [
    { id: 1, name: 'Sabun Cuci Piring', points: 200, category: 'Kebersihan', stock: 50 },
    { id: 2, name: 'Shampoo Herbal', points: 300, category: 'Perawatan', stock: 32 },
    { id: 3, name: 'Voucher Bensin', points: 500, category: 'Bahan Bakar', stock: 100 },
    { id: 4, name: 'Pupuk Organik Cair', points: 150, category: 'Pertanian', stock: 25 },
];

const initialUsers = [
    { id: 1, name: 'Bayu Prasetio', email: 'bayu@example.com', points: 100, role: 'User' },
    { id: 2, name: 'Siti Aminah', email: 'siti@example.com', points: 250, role: 'User' },
    { id: 3, name: 'Budi Santoso', email: 'budi@example.com', points: 15, role: 'User' },
];

// --- Components ---

export default function AdminPage() {
    const router = useRouter();

    // --- Context ---
    const {
        currentUser,
        products,
        users,
        leaderboard,
        dropPoints, // Added
        addProduct,
        updateProduct,
        deleteProduct,
        addUser,
        updateUser,
        deleteUser,
        addDropPoint, // Added
        updateDropPoint, // Added
        deleteDropPoint, // Added
        updateLeaderboardEntry,
        depositRequests,
        confirmDepositRequest,
        rejectDepositRequest
    } = useData();

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState<string>('');
    const [isLoading, setIsLoading] = useState(true);

    // UI States
    const [activeTab, setActiveTab] = useState('dashboard');
    const [isSidebarOpen, setSidebarOpen] = useState(false); // Default false for mobile first
    const [isDesktop, setIsDesktop] = useState(true);

    // Effect to handle window resize for sidebar
    useEffect(() => {
        const handleResize = () => {
            const desk = window.innerWidth >= 1024;
            setIsDesktop(desk);
            setSidebarOpen(desk);
        };

        handleResize(); // Initial check
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Modal States
    const [showProductModal, setShowProductModal] = useState(false);
    const [editingProduct, setEditingProduct] = useState<any>(null);
    const [productImagePreview, setProductImagePreview] = useState<string>('');
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<any>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({});
    const [showLeaderboardModal, setShowLeaderboardModal] = useState(false);
    const [editingLeaderboard, setEditingLeaderboard] = useState<any>(null);
    const [showDropPointModal, setShowDropPointModal] = useState(false); // Added
    const [editingDropPoint, setEditingDropPoint] = useState<any>(null); // Added

    // Transaction States
    const [transactionCode, setTransactionCode] = useState('');
    const [searchedTransaction, setSearchedTransaction] = useState<any>(null);
    const [transactionError, setTransactionError] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isConfirming, setIsConfirming] = useState(false);

    // Check authentication on mount
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/admin/check-auth');
                if (response.ok) {
                    const data = await response.json();
                    setIsAuthenticated(true);
                    setUserRole(data.role || 'user');
                } else {
                    router.push('/admin/login');
                }
            } catch (error) {
                console.error('Auth check failed:', error);
                router.push('/admin/login');
            } finally {
                setIsLoading(false);
            }
        };

        checkAuth();
    }, [router]);

    // Logout handler
    const handleLogout = async () => {
        try {
            await fetch('/api/admin/logout', { method: 'POST' });
            router.push('/admin/login');
        } catch (error) {
            console.error('Logout failed:', error);
            router.push('/admin/login');
        }
    };

    // Show loading state
    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#A3D921] mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat...</p>
                </div>
            </div>
        );
    }

    // Don't render if not authenticated
    if (!isAuthenticated) {
        return null;
    }



    // --- Handlers: Products ---
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProductImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const productData: any = {
            id: editingProduct ? editingProduct.id : Date.now(),
            name: formData.get('name') as string,
            points: Number(formData.get('points')),
            category: formData.get('category') as string,
            stock: Number(formData.get('stock')),
            image: productImagePreview || editingProduct?.image || '/placeholder-image.jpg',
            description: formData.get('description') as string || editingProduct?.description || 'Deskripsi produk...',
        };

        if (editingProduct) {
            updateProduct(productData);
        } else {
            addProduct(productData);
        }
        setShowProductModal(false);
        setEditingProduct(null);
        setProductImagePreview('');
    };

    const handleDeleteProduct = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            deleteProduct(id);
        }
    };

    const handleOpenProductModal = (product?: any) => {
        setEditingProduct(product || null);
        setProductImagePreview(product?.image || '');
        setShowProductModal(true);
    };

    // --- Handlers: Users ---
    const handleSaveUser = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const userData: any = {
            id: editingUser ? editingUser.id : Date.now(),
            name: formData.get('name') as string,
            email: formData.get('email') as string,
            points: Number(formData.get('points')),
            role: 'User',
            password: formData.get('password') as string || 'password123',
        };

        if (editingUser) {
            updateUser(userData);
        } else {
            addUser(userData);
        }
        setShowUserModal(false);
        setEditingUser(null);
    };

    const handleDeleteUser = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus pengguna ini?')) {
            deleteUser(id);
        }
    };

    // --- Handlers: Leaderboard ---
    const handleSaveLeaderboard = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);

        // Only update category - points are auto-synced from user data
        const leaderboardData: any = {
            ...editingLeaderboard,
            category: formData.get('category') as string,
        };

        updateLeaderboardEntry(leaderboardData);
        setShowLeaderboardModal(false);
        setEditingLeaderboard(null);
    };

    // --- Handlers: Drop Points ---
    const handleSaveDropPoint = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const dropPointData: any = {
            ...(editingDropPoint || {}), // Preserve existing data like lat/long
            id: editingDropPoint ? editingDropPoint.id : Date.now(),
            name: formData.get('name') as string,
            address: formData.get('address') as string,
            phone: formData.get('phone') as string,
            area: formData.get('area') as string,
            hours: formData.get('hours') as string,
            status: formData.get('status') as 'Buka' | 'Tutup',
            latitude: formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : undefined,
            longitude: formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : undefined,
        };

        if (editingDropPoint) {
            updateDropPoint(dropPointData);
        } else {
            addDropPoint(dropPointData);
        }
        setShowDropPointModal(false);
        setEditingDropPoint(null);
    };

    const handleDeleteDropPoint = (id: number) => {
        if (confirm('Apakah Anda yakin ingin menghapus lokasi ini?')) {
            deleteDropPoint(id);
        }
    };

    // --- Handlers: Orders/Transactions ---
    const handleSearchTransaction = async () => {
        if (!transactionCode.trim()) {
            setTransactionError('Masukkan kode transaksi');
            return;
        }

        setIsSearching(true);
        setTransactionError('');
        setSearchedTransaction(null);

        try {
            const response = await fetch(`/api/transactions/${transactionCode}`);
            if (response.ok) {
                const transaction = await response.json();
                setSearchedTransaction(transaction);
            } else {
                const error = await response.json();
                setTransactionError(error.error || 'Kode transaksi tidak ditemukan');
            }
        } catch (error) {
            setTransactionError('Terjadi kesalahan saat mencari transaksi');
        } finally {
            setIsSearching(false);
        }
    };

    const handleConfirmTransaction = async () => {
        if (!searchedTransaction) return;

        if (!confirm('Apakah Anda yakin ingin mengkonfirmasi pengambilan barang untuk transaksi ini?')) {
            return;
        }

        setIsConfirming(true);

        try {
            const response = await fetch(`/api/transactions/${searchedTransaction.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'completed',
                    confirmedBy: currentUser?.id
                })
            });

            if (response.ok) {
                // Reset form
                setTransactionCode('');
                setSearchedTransaction(null);
                alert('Transaksi berhasil dikonfirmasi! Kode transaksi sudah tidak berlaku.');
            } else {
                const error = await response.json();
                setTransactionError(error.error || 'Gagal mengkonfirmasi transaksi');
            }
        } catch (error) {
            setTransactionError('Terjadi kesalahan saat mengkonfirmasi transaksi');
        } finally {
            setIsConfirming(false);
        }
    };

    const handleCancelTransaction = async () => {
        if (!searchedTransaction) return;

        if (!confirm('Apakah Anda yakin ingin menolak transaksi ini? Tindakan ini tidak dapat dibatalkan.')) {
            return;
        }

        setIsConfirming(true);

        try {
            const response = await fetch(`/api/transactions/${searchedTransaction.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    status: 'cancelled',
                    confirmedBy: currentUser?.id
                })
            });

            if (response.ok) {
                // Reset form
                setTransactionCode('');
                setSearchedTransaction(null);
                alert('Transaksi berhasil ditolak.');
            } else {
                const error = await response.json();
                setTransactionError(error.error || 'Gagal menolak transaksi');
            }
        } catch (error) {
            setTransactionError('Terjadi kesalahan saat menolak transaksi');
        } finally {
            setIsConfirming(false);
        }
    };


    return (
        <div className="flex h-screen bg-neutral-50 font-sans">

            {/* Sidebar Overlay (Mobile Only) */}
            {!isDesktop && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 transition-opacity"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`bg-gray-900 text-white transition-all duration-300 fixed h-full z-40 flex flex-col
                ${isDesktop ? (isSidebarOpen ? 'w-64' : 'w-20') : (isSidebarOpen ? 'translate-x-0 w-64' : '-translate-x-full w-64')}`}
            >
                <div className="p-6 flex items-center justify-between border-b border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="bg-[#A3D921] p-2 rounded-lg text-gray-900">
                            <Droplet size={24} fill="currentColor" />
                        </div>
                        {(isSidebarOpen || !isDesktop) && <span className="font-bold text-xl tracking-tight">Admin<span className="text-[#A3D921]">Panel</span></span>}
                    </div>
                    {!isDesktop && (
                        <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                            <X size={24} />
                        </button>
                    )}
                </div>

                <nav className="flex-1 py-6 px-3 space-y-2 overflow-y-auto">
                    <SidebarItem
                        icon={<LayoutDashboard size={20} />}
                        label="Dashboard"
                        isActive={activeTab === 'dashboard'}
                        onClick={() => { setActiveTab('dashboard'); if (!isDesktop) setSidebarOpen(false); }}
                        isExpanded={isSidebarOpen || !isDesktop}
                    />
                    <SidebarItem
                        icon={<Package size={20} />}
                        label="Produk & Hadiah"
                        isActive={activeTab === 'products'}
                        onClick={() => { setActiveTab('products'); if (!isDesktop) setSidebarOpen(false); }}
                        isExpanded={isSidebarOpen || !isDesktop}
                    />
                    <SidebarItem
                        icon={<Users size={20} />}
                        label="Pengguna"
                        isActive={activeTab === 'users'}
                        onClick={() => { setActiveTab('users'); if (!isDesktop) setSidebarOpen(false); }}
                        isExpanded={isSidebarOpen || !isDesktop}
                    />
                    <SidebarItem
                        icon={<Trophy size={20} />}
                        label="Peringkat"
                        isActive={activeTab === 'leaderboard'}
                        onClick={() => { setActiveTab('leaderboard'); if (!isDesktop) setSidebarOpen(false); }}
                        isExpanded={isSidebarOpen || !isDesktop}
                    />
                    <SidebarItem
                        icon={<MapPin size={20} />}
                        label="Lokasi Setor"
                        isActive={activeTab === 'drop-points'}
                        onClick={() => { setActiveTab('drop-points'); if (!isDesktop) setSidebarOpen(false); }}
                        isExpanded={isSidebarOpen || !isDesktop}
                    />
                    <SidebarItem
                        icon={<Droplet size={20} />}
                        label="Konfirmasi Setor"
                        isActive={activeTab === 'deposits'}
                        onClick={() => { setActiveTab('deposits'); if (!isDesktop) setSidebarOpen(false); }}
                        isExpanded={isSidebarOpen || !isDesktop}
                        badge={depositRequests.filter(r => r.status === 'pending').length}
                    />
                    <SidebarItem
                        icon={<QrCode size={20} />}
                        label="Konfirmasi Pesanan"
                        isActive={activeTab === 'orders'}
                        onClick={() => { setActiveTab('orders'); if (!isDesktop) setSidebarOpen(false); }}
                        isExpanded={isSidebarOpen || !isDesktop}
                    />
                </nav>

                <div className="p-4 border-t border-gray-800">
                    <button onClick={handleLogout} className="w-full flex items-center gap-3 text-gray-400 hover:text-white transition-colors p-2 rounded-lg hover:bg-gray-800 text-left">
                        <LogOut size={20} />
                        {(isSidebarOpen || !isDesktop) && <span>Keluar</span>}
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={`flex-1 transition-all duration-300 overflow-y-auto min-h-screen
                ${isDesktop ? (isSidebarOpen ? 'ml-64' : 'ml-20') : 'ml-0'}`}
            >

                {/* Top Header */}
                <header className="flex justify-between items-center mb-8 bg-white/80 backdrop-blur-md sticky top-0 z-10 p-4 md:p-8 border-b border-gray-100">
                    <div className="flex items-center gap-4">
                        {!isDesktop && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                <MoreVertical size={24} className="rotate-90 md:rotate-0" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-xl md:text-2xl font-bold text-gray-900 capitalize">{activeTab.replace('-', ' ')}</h1>
                            <p className="text-gray-500 text-xs md:text-sm hidden sm:block">Kelola aplikasi Jelantah Point</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        {isDesktop && isSidebarOpen === false && (
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                                <LayoutDashboard size={20} />
                            </button>
                        )}
                        <div className="flex items-center gap-3 sm:border-l sm:border-gray-200 sm:pl-6 pl-2">
                            <div className="hidden sm:flex flex-col items-end">
                                <span className="text-sm font-bold text-gray-800 leading-none capitalize">{currentUser?.name || currentUser?.username || 'Administrator'}</span>
                                <span className="text-[11px] text-[#A3D921] font-bold mt-1 tracking-wide uppercase">{userRole || 'Admin'}</span>
                            </div>
                            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-white rounded-full overflow-hidden border-2 border-gray-100 shadow-sm flex items-center justify-center text-gray-400 hover:border-[#A3D921] transition-colors cursor-pointer">
                                {currentUser?.image ? (
                                    <img src={currentUser.image} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <Users size={18} />
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 md:p-8">

                    {/* Content Views */}
                    {activeTab === 'dashboard' && (
                        <DashboardView
                            totalProducts={products.length}
                            totalUsers={users.length}
                        />
                    )}
                    {activeTab === 'products' && (
                        <ProductsView
                            products={products}
                            onAdd={() => handleOpenProductModal()}
                            onEdit={(p: any) => handleOpenProductModal(p)}
                            onDelete={handleDeleteProduct}
                            userRole={userRole}
                        />
                    )}
                    {activeTab === 'users' && (
                        <UsersView
                            users={users}
                            onAdd={() => { setEditingUser(null); setShowUserModal(true); setShowPassword(false); }}
                            onEdit={(u: any) => { setEditingUser(u); setShowUserModal(true); setShowPassword(false); }}
                            onDelete={handleDeleteUser}
                            userRole={userRole}
                        />
                    )}
                    {activeTab === 'leaderboard' && (
                        <LeaderboardView
                            leaderboard={leaderboard}
                            onEdit={(entry: any) => { setEditingLeaderboard(entry); setShowLeaderboardModal(true); }}
                            userRole={userRole}
                        />
                    )}
                    {activeTab === 'drop-points' && (
                        <DropPointsView
                            dropPoints={dropPoints}
                            onAdd={() => { setEditingDropPoint(null); setShowDropPointModal(true); }}
                            onEdit={(dp: any) => { setEditingDropPoint(dp); setShowDropPointModal(true); }}
                            onDelete={handleDeleteDropPoint}
                            userRole={userRole}
                        />
                    )}
                    {activeTab === 'deposits' && (
                        <DepositsView
                            requests={depositRequests}
                            onConfirm={confirmDepositRequest}
                            onReject={rejectDepositRequest}
                            userRole={userRole}
                        />
                    )}
                    {activeTab === 'orders' && (
                        <OrdersView
                            transactionCode={transactionCode}
                            setTransactionCode={setTransactionCode}
                            searchedTransaction={searchedTransaction}
                            transactionError={transactionError}
                            isSearching={isSearching}
                            isConfirming={isConfirming}
                            onSearch={handleSearchTransaction}
                            onConfirm={handleConfirmTransaction}
                            onCancel={handleCancelTransaction}
                        />
                    )}

                </div>

            </main>

            {/* --- Modals --- */}

            {/* Product Modal */}
            {showProductModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingProduct ? 'Edit Produk' : 'Tambah Produk Baru'}
                            </h3>
                            <button onClick={() => setShowProductModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProduct} className="p-6 space-y-4 overflow-y-auto">
                            {/* Image Upload Section */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">Foto Produk</label>
                                <div className="flex items-start gap-4">
                                    {/* Image Preview */}
                                    <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50 flex items-center justify-center">
                                        {productImagePreview ? (
                                            <img
                                                src={productImagePreview}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="text-center text-gray-400">
                                                <Package size={32} className="mx-auto mb-1" />
                                                <p className="text-xs">No Image</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Upload Button */}
                                    <div className="flex-1">
                                        <label className="cursor-pointer">
                                            <div className="border-2 border-gray-300 border-dashed rounded-xl p-4 hover:border-[#A3D921] transition-colors text-center">
                                                <div className="text-gray-600">
                                                    <Upload className="mx-auto mb-2" size={24} />
                                                    <p className="text-sm font-medium">Klik untuk upload foto</p>
                                                    <p className="text-xs text-gray-400 mt-1">PNG, JPG hingga 5MB</p>
                                                </div>
                                            </div>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                className="hidden"
                                            />
                                        </label>
                                        {productImagePreview && (
                                            <button
                                                type="button"
                                                onClick={() => setProductImagePreview('')}
                                                className="mt-2 text-sm text-red-600 hover:text-red-700 flex items-center gap-1"
                                            >
                                                <X size={16} /> Hapus Foto
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Produk</label>
                                <input name="name" type="text" defaultValue={editingProduct?.name} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none" />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi Produk</label>
                                <textarea
                                    name="description"
                                    defaultValue={editingProduct?.description}
                                    rows={3}
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none resize-none"
                                    placeholder="Masukkan deskripsi produk..."
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Poin (Harga)</label>
                                    <input name="points" type="number" defaultValue={editingProduct?.points} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Stok</label>
                                    <input name="stock" type="number" defaultValue={editingProduct?.stock || 0} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select name="category" defaultValue={editingProduct?.category} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none">
                                    <option value="Kebersihan">Kebersihan</option>
                                    <option value="Perawatan">Perawatan</option>
                                    <option value="Bahan Bakar">Bahan Bakar</option>
                                    <option value="Pertanian">Pertanian</option>
                                    <option value="Lainnya">Lainnya</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowProductModal(false)} className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-medium">Batal</button>
                                <button type="submit" className="px-6 py-2 rounded-xl bg-[#A3D921] hover:bg-[#92C41D] text-white font-bold flex items-center gap-2">
                                    <Save size={18} /> Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* User Modal */}
            {showUserModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingUser ? 'Edit Pengguna' : 'Tambah Pengguna'}
                            </h3>
                            <button onClick={() => setShowUserModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveUser} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
                                <input name="name" type="text" defaultValue={editingUser?.name} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input name="email" type="email" defaultValue={editingUser?.email} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kata Sandi</label>
                                <div className="relative">
                                    <input
                                        name="password"
                                        type={showPassword ? 'text' : 'password'}
                                        defaultValue={editingUser?.password}
                                        placeholder="••••••••"
                                        className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Saldo Poin</label>
                                <input name="points" type="number" defaultValue={editingUser?.points} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none" />
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowUserModal(false)} className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-medium">Batal</button>
                                <button type="submit" className="px-6 py-2 rounded-xl bg-[#A3D921] hover:bg-[#92C41D] text-white font-bold flex items-center gap-2">
                                    <Save size={18} /> Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Leaderboard Modal */}
            {showLeaderboardModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900">
                                Edit Peringkat - {editingLeaderboard?.userName}
                            </h3>
                            <button onClick={() => setShowLeaderboardModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveLeaderboard} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Poin Bulanan (Otomatis dari User)</label>
                                <input
                                    type="number"
                                    value={editingLeaderboard?.monthlyPoints}
                                    disabled
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 cursor-not-allowed outline-none"
                                />
                                <p className="text-xs text-gray-500 mt-1">Poin disinkronkan otomatis dengan data pengguna</p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                <select name="category" defaultValue={editingLeaderboard?.category} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none">
                                    <option value="Eco Warrior">Eco Warrior</option>
                                    <option value="Green Champion">Green Champion</option>
                                    <option value="Earth Saver">Earth Saver</option>
                                    <option value="Nature Hero">Nature Hero</option>
                                    <option value="Planet Protector">Planet Protector</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowLeaderboardModal(false)} className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-medium">Batal</button>
                                <button type="submit" className="px-6 py-2 rounded-xl bg-[#A3D921] hover:bg-[#92C41D] text-white font-bold flex items-center gap-2">
                                    <Save size={18} /> Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Drop Point Modal */}
            {showDropPointModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg flex flex-col max-h-[90vh] animate-fade-in-up">
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 flex-shrink-0">
                            <h3 className="text-xl font-bold text-gray-900">
                                {editingDropPoint ? 'Edit Lokasi Setor' : 'Tambah Lokasi Setor'}
                            </h3>
                            <button onClick={() => setShowDropPointModal(false)} className="text-gray-400 hover:text-gray-600">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSaveDropPoint} className="p-6 space-y-4 overflow-y-auto">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nama Lokasi</label>
                                <input name="name" type="text" defaultValue={editingDropPoint?.name} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Area / Kecamatan</label>
                                <select name="area" defaultValue={editingDropPoint?.area || ''} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none">
                                    <option value="" disabled>Pilih Area</option>
                                    {AREAS.map(area => (
                                        <option key={area} value={area}>{area}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
                                <textarea name="address" defaultValue={editingDropPoint?.address} rows={3} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none resize-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Kontak (HP/WA)</label>
                                <input name="phone" type="text" defaultValue={editingDropPoint?.phone} required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Jam Operasional</label>
                                <input name="hours" type="text" defaultValue={editingDropPoint?.hours} placeholder="Senin - Jumat: 08:00 - 16:00" required className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                                    <input name="latitude" type="number" step="any" defaultValue={editingDropPoint?.latitude} placeholder="-7.xxxx" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                                    <input name="longitude" type="number" step="any" defaultValue={editingDropPoint?.longitude} placeholder="109.xxxx" className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none" />
                                </div>
                                <p className="col-span-2 text-xs text-gray-500">
                                    Tips: Buka <a href="https://www.google.com/maps" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Maps</a>, klik kanan pada lokasi, dan salin koordinat (angka pertama Latitude, kedua Longitude).
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                <select name="status" defaultValue={editingDropPoint?.status || 'Buka'} className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none">
                                    <option value="Buka">Buka</option>
                                    <option value="Tutup">Tutup</option>
                                </select>
                            </div>

                            <div className="pt-4 flex justify-end gap-3">
                                <button type="button" onClick={() => setShowDropPointModal(false)} className="px-6 py-2 rounded-xl text-gray-600 hover:bg-gray-100 font-medium">Batal</button>
                                <button type="submit" className="px-6 py-2 rounded-xl bg-[#A3D921] hover:bg-[#92C41D] text-white font-bold flex items-center gap-2">
                                    <Save size={18} /> Simpan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
}

// --- Sub Components ---

function SidebarItem({ icon, label, isActive, onClick, isExpanded, badge }: any) {
    return (
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#A3D921] text-gray-900 font-bold shadow-md' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`${isActive ? 'text-gray-900' : ''}`}>{icon}</div>
                {isExpanded && <span>{label}</span>}
            </div>
            {badge > 0 && isExpanded && (
                <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                    {badge}
                </span>
            )}
        </button>
    );
}

function DashboardView({ totalProducts, totalUsers }: any) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-blue-50 text-blue-500 p-3 rounded-xl"><Users size={24} /></div>
                    <span className="text-xs font-bold text-green-500 bg-green-50 px-2 py-1 rounded">+12%</span>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">Total Pengguna</h3>
                <p className="text-3xl font-bold text-gray-900">{totalUsers}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-purple-50 text-purple-500 p-3 rounded-xl"><Package size={24} /></div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">Total Produk</h3>
                <p className="text-3xl font-bold text-gray-900">{totalProducts}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-yellow-50 text-yellow-500 p-3 rounded-xl"><Droplet size={24} /></div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">Total Jelantah</h3>
                <p className="text-3xl font-bold text-gray-900">1,240 L</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-4">
                    <div className="bg-red-50 text-red-500 p-3 rounded-xl"><Clock size={24} /></div>
                </div>
                <h3 className="text-gray-400 text-sm font-medium">Setoran Pending</h3>
                <p className="text-3xl font-bold text-gray-900">
                    {useData().depositRequests.filter(r => r.status === 'pending').length}
                </p>
            </div>
        </div>
    );
}

function ProductsView({ products, onAdd, onEdit, onDelete, userRole }: any) {
    const isModerator = userRole === 'moderator';
    return (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Cari produk..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] w-full sm:w-64" />
                </div>
                {!isModerator && (
                    <button onClick={onAdd} className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition shadow-lg shadow-gray-900/20">
                        <Plus size={18} /> Tambah Produk
                    </button>
                )}
            </div>

            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs md:text-sm uppercase tracking-wider">
                        <tr>
                            <th className="px-4 md:px-6 py-4 font-semibold">Nama Produk</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">Kategori</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">Stok</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">Poin</th>
                            {!isModerator && <th className="px-4 md:px-6 py-4 font-semibold text-right">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {products.map((product: any) => (
                            <tr key={product.id} className="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                                <td className="px-4 md:px-6 py-4 font-medium text-gray-900">{product.name}</td>
                                <td className="px-4 md:px-6 py-4 text-gray-500 text-xs md:text-sm">
                                    <span className="bg-gray-100 px-2 py-1 rounded text-[10px] md:text-xs font-bold uppercase">{product.category}</span>
                                </td>
                                <td className="px-4 md:px-6 py-4 text-gray-500 text-sm">{product.stock}</td>
                                <td className="px-4 md:px-6 py-4 font-bold text-[#A3D921] text-sm md:text-base">{product.points}</td>
                                {!isModerator && (
                                    <td className="px-4 md:px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 md:gap-2">
                                            <button onClick={() => onEdit(product)} className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16} /></button>
                                            <button onClick={() => onDelete(product.id)} className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function UsersView({ users, onAdd, onEdit, onDelete, userRole }: any) {
    const isModerator = userRole === 'moderator';
    const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({});

    const togglePasswordVisibility = (userId: number) => {
        setVisiblePasswords(prev => ({
            ...prev,
            [userId]: !prev[userId]
        }));
    };

    return (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Cari pengguna..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] w-full sm:w-64" />
                </div>
                {!isModerator && (
                    <button onClick={onAdd} className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition shadow-lg shadow-gray-900/20">
                        <Plus size={18} /> Tambah Pengguna
                    </button>
                )}
            </div>

            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                <table className="w-full text-left min-w-[1400px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs md:text-sm uppercase tracking-wider">
                        <tr>
                            <th className="px-4 md:px-6 py-4 font-semibold sticky left-0 bg-gray-50 z-10">Nama Lengkap</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">Email</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">Role</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">Password</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">No. Telepon</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">Alamat Lengkap</th>
                            <th className="px-4 md:px-6 py-4 font-semibold text-right">Point Masuk</th>
                            <th className="px-4 md:px-6 py-4 font-semibold text-right">Point Keluar</th>
                            <th className="px-4 md:px-6 py-4 font-semibold text-right">Point Total</th>
                            {!isModerator && <th className="px-4 md:px-6 py-4 font-semibold text-right sticky right-0 bg-gray-50 z-10">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((user: any) => {
                            // Calculate point masuk (earn) and point keluar (redeem)
                            const pointMasuk = user.pointHistory?.filter((h: any) => h.type === 'earn')
                                .reduce((sum: number, h: any) => sum + h.amount, 0) || 0;
                            const pointKeluar = user.pointHistory?.filter((h: any) => h.type === 'redeem')
                                .reduce((sum: number, h: any) => sum + h.amount, 0) || 0;
                            const isPasswordVisible = visiblePasswords[user.id] || false;

                            return (
                                <tr key={user.id} className="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                                    <td className="px-4 md:px-6 py-4 font-medium text-gray-900 sticky left-0 bg-white hover:bg-gray-50 z-10">{user.name}</td>
                                    <td className="px-4 md:px-6 py-4 text-gray-500 text-sm">{user.email}</td>
                                    <td className="px-4 md:px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-bold uppercase ${user.role === 'Admin' ? 'bg-yellow-100 text-yellow-700' :
                                                user.role === 'Moderator' ? 'bg-blue-100 text-blue-700' :
                                                    'bg-gray-100 text-gray-700'
                                            }`}>
                                            {user.role || 'User'}
                                        </span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex items-center gap-2 max-w-[200px]">
                                            <span className="font-mono text-sm text-gray-700 truncate">
                                                {isPasswordVisible ? user.password || '-' : '••••••••'}
                                            </span>
                                            <button
                                                onClick={() => togglePasswordVisibility(user.id)}
                                                className="p-1 text-gray-400 hover:text-gray-600 transition flex-shrink-0"
                                                title={isPasswordVisible ? 'Sembunyikan' : 'Tampilkan'}
                                            >
                                                {isPasswordVisible ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-gray-700 text-sm">
                                        {user.phone || user.contact || '-'}
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-gray-700 text-sm max-w-[250px]">
                                        <div className="truncate" title={user.address || 'Belum diisi'}>
                                            {user.address || '-'}
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 font-bold text-green-600 text-sm md:text-base text-right">
                                        +{pointMasuk.toLocaleString()}
                                    </td>
                                    <td className="px-4 md:px-6 py-4 font-bold text-red-600 text-sm md:text-base text-right">
                                        -{pointKeluar.toLocaleString()}
                                    </td>
                                    <td className="px-4 md:px-6 py-4 font-bold text-[#A3D921] text-sm md:text-base text-right">
                                        {user.points.toLocaleString()}
                                    </td>
                                    {!isModerator && (
                                        <td className="px-4 md:px-6 py-4 text-right sticky right-0 bg-white hover:bg-gray-50 z-10">
                                            <div className="flex items-center justify-end gap-1 md:gap-2">
                                                <button onClick={() => onEdit(user)} className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16} /></button>
                                                <button onClick={() => onDelete(user.id)} className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    )}
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function LeaderboardView({ leaderboard, onEdit, userRole }: any) {
    const isModerator = userRole === 'moderator';
    return (
        <div className="space-y-4">
            {/* Info Banner */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
                <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-full">
                        <Trophy size={20} className="text-blue-600" />
                    </div>
                    <div>
                        <h3 className="font-bold text-blue-900 mb-1">Peringkat Otomatis</h3>
                        <p className="text-sm text-blue-700">
                            Peringkat dan poin bulanan disinkronkan otomatis dengan data pengguna.
                            Ketika Anda mengubah poin pengguna di tab "Pengguna", peringkat akan otomatis diperbarui.
                            {isModerator ? 'Anda tidak memiliki akses untuk mengubah kategori.' : 'Anda hanya bisa mengubah kategori di sini.'}
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-2xl font-bold text-gray-900">Peringkat Bulanan</h2>
                    <p className="text-gray-500 text-sm mt-1">Kelola peringkat dan kategori pengguna</p>
                </div>

                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <table className="w-full text-left min-w-[700px]">
                        <thead className="bg-gray-50 text-gray-500 text-xs md:text-sm uppercase tracking-wider">
                            <tr>
                                <th className="px-4 md:px-6 py-4 font-semibold">Peringkat</th>
                                <th className="px-4 md:px-6 py-4 font-semibold">Nama Pengguna</th>
                                <th className="px-4 md:px-6 py-4 font-semibold">Poin Bulanan</th>
                                <th className="px-4 md:px-6 py-4 font-semibold">Kategori</th>
                                <th className="px-4 md:px-6 py-4 font-semibold">Bulan</th>
                                {!isModerator && <th className="px-4 md:px-6 py-4 font-semibold text-right">Aksi</th>}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {leaderboard.map((entry: any) => (
                                <tr key={entry.id} className="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                                    <td className="px-4 md:px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm md:text-base">
                                            {entry.rank <= 3 && <Trophy size={16} className="text-yellow-500" />}
                                            <span className="font-bold text-gray-900">#{entry.rank}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 font-medium text-gray-900 text-sm md:text-base">{entry.userName}</td>
                                    <td className="px-4 md:px-6 py-4 font-bold text-[#A3D921] text-sm md:text-base">{entry.monthlyPoints.toLocaleString()}</td>
                                    <td className="px-4 md:px-6 py-4">
                                        <span className="bg-[#F4FADC] text-[#A3D921] px-2 md:px-3 py-1 rounded-full text-[10px] md:text-xs font-bold whitespace-nowrap">{entry.category}</span>
                                    </td>
                                    <td className="px-4 md:px-6 py-4 text-gray-500 text-xs md:text-sm">{entry.month}</td>
                                    {!isModerator && (
                                        <td className="px-4 md:px-6 py-4 text-right">
                                            <button onClick={() => onEdit(entry)} className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                                                <Edit2 size={16} />
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}

function DropPointsView({ dropPoints, onAdd, onEdit, onDelete, userRole }: any) {
    const isModerator = userRole === 'moderator';
    return (
        <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input type="text" placeholder="Cari lokasi..." className="pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] w-full sm:w-64" />
                </div>
                {!isModerator && (
                    <button onClick={onAdd} className="bg-gray-900 text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-black transition shadow-lg shadow-gray-900/20">
                        <Plus size={18} /> Tambah Lokasi
                    </button>
                )}
            </div>

            <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-gray-50 text-gray-500 text-xs md:text-sm uppercase tracking-wider">
                        <tr>
                            <th className="px-4 md:px-6 py-4 font-semibold">Nama Lokasi</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">Area</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">Alamat</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">Kontak</th>
                            <th className="px-4 md:px-6 py-4 font-semibold">Status</th>
                            {!isModerator && <th className="px-4 md:px-6 py-4 font-semibold text-right">Aksi</th>}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {dropPoints?.map((dp: any) => (
                            <tr key={dp.id} className="hover:bg-gray-50 transition border-b border-gray-50 last:border-0">
                                <td className="px-4 md:px-6 py-4 font-medium text-gray-900 text-sm md:text-base">{dp.name}</td>
                                <td className="px-4 md:px-6 py-4 text-gray-500 text-xs md:text-sm">{dp.area || '-'}</td>
                                <td className="px-4 md:px-6 py-4 text-gray-500 text-[10px] md:text-xs max-w-[150px] md:max-w-xs truncate" title={dp.address}>{dp.address}</td>
                                <td className="px-4 md:px-6 py-4 text-gray-500 text-xs md:text-sm">{dp.phone}</td>
                                <td className="px-4 md:px-6 py-4">
                                    <span className={`px-2 py-1 rounded-full text-[10px] md:text-xs font-bold ${dp.status === 'Buka'
                                        ? 'bg-green-100 text-green-700'
                                        : 'bg-red-100 text-red-700'
                                        }`}>
                                        {dp.status}
                                    </span>
                                </td>
                                {!isModerator && (
                                    <td className="px-4 md:px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1 md:gap-2">
                                            <button onClick={() => onEdit(dp)} className="p-1.5 md:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"><Edit2 size={16} /></button>
                                            <button onClick={() => onDelete(dp.id)} className="p-1.5 md:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                )}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

function DepositsView({ requests, onConfirm, onReject }: any) {
    const pendingRequests = requests.filter((r: any) => r.status === 'pending');
    const historyRequests = requests.filter((r: any) => r.status !== 'pending');

    return (
        <div className="space-y-8 animate-fade-in-up">
            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Menunggu Verifikasi</h2>
                    <p className="text-sm text-gray-500">Konfirmasi setoran untuk memberikan poin ke pengguna</p>
                </div>

                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <table className="w-full text-left min-w-[1000px]">
                        <thead className="bg-gray-50 text-gray-400 text-[10px] uppercase font-black tracking-[0.2em]">
                            <tr>
                                <th className="px-6 py-5">User & Waktu</th>
                                <th className="px-6 py-5 text-center">Detail Setoran</th>
                                <th className="px-6 py-5 text-center">Metode & Lokasi</th>
                                <th className="px-6 py-5 text-center">Kontak Pengguna</th>
                                <th className="px-6 py-5 text-right">Aksi Verifikasi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {pendingRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-20 text-center">
                                        <div className="flex flex-col items-center opacity-30">
                                            <Droplet size={48} className="mb-4" />
                                            <p className="font-bold uppercase tracking-widest text-sm text-gray-400">Belum ada setoran masuk</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                pendingRequests.map((req: any) => (
                                    <tr key={req.id} className="hover:bg-gray-50/50 transition-colors group">
                                        <td className="px-6 py-5">
                                            <div className="font-black text-gray-900 text-lg leading-tight mb-1">{req.userName}</div>
                                            <div className="text-[10px] text-gray-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                                                <Clock size={10} /> {req.date}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex items-center justify-center gap-4">
                                                {/* Photo Thumbnail */}
                                                <div className="w-16 h-16 bg-gray-100 rounded-2xl overflow-hidden border border-gray-200 flex-shrink-0 relative group/photo cursor-zoom-in">
                                                    {req.image ? (
                                                        <img src={req.image} alt="Oil" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Camera size={20} className="text-gray-300" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="text-center">
                                                    <div className="text-2xl font-black text-gray-900 leading-none">{req.amount}<span className="text-sm font-bold text-gray-400 ml-1">L</span></div>
                                                    <div className="text-[10px] font-black text-[#A3D921] mt-1 bg-[#A3D921]/10 px-2 py-0.5 rounded-full inline-block">+{req.points.toLocaleString()} PTS</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider mb-2 ${req.method === 'courier' ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-orange-50 text-orange-600 border border-orange-100'}`}>
                                                    {req.method === 'courier' ? 'Jemput Kurir' : 'Antar Drop Point'}
                                                </span>
                                                <div className="text-xs text-center text-gray-500 font-medium max-w-[200px] leading-relaxed">
                                                    {req.method === 'courier' ? req.address : req.location}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-5">
                                            <div className="flex flex-col items-center">
                                                {req.contact ? (
                                                    <a href={`https://wa.me/${req.contact.replace(/\D/g, '')}`} target="_blank" className="bg-green-50 text-green-600 px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 hover:bg-green-100 transition shadow-sm">
                                                        <Phone size={14} /> {req.contact}
                                                    </a>
                                                ) : (
                                                    <span className="text-gray-300 italic text-xs">No contact</span>
                                                )}
                                                {req.note && <div className="mt-2 text-[10px] bg-yellow-50 text-yellow-700 px-3 py-1 rounded-lg border border-yellow-100 font-medium max-w-[150px] truncate text-center">Note: {req.note}</div>}
                                            </div>
                                        </td>
                                        <td className="px-6 py-5 text-right">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => onConfirm(req.id)}
                                                    className="bg-gray-900 hover:bg-black text-white px-5 py-2.5 rounded-2xl text-xs font-black transition-all flex items-center gap-2 shadow-xl shadow-gray-200 transform active:scale-95"
                                                >
                                                    <Check size={14} strokeWidth={4} /> Konfirmasi
                                                </button>
                                                <button
                                                    onClick={() => onReject(req.id)}
                                                    className="bg-red-50 hover:bg-red-100 text-red-600 w-11 h-11 rounded-2xl flex items-center justify-center transition-all transform active:scale-95"
                                                    title="Tolak"
                                                >
                                                    <X size={18} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="bg-white border border-gray-100 rounded-3xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-xl font-bold text-gray-900">Riwayat Setoran</h2>
                </div>
                <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-200">
                    <table className="w-full text-left min-w-[800px]">
                        <thead className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4 font-semibold">Tanggal</th>
                                <th className="px-6 py-4 font-semibold">User</th>
                                <th className="px-6 py-4 font-semibold">Volume</th>
                                <th className="px-6 py-4 font-semibold">Poin</th>
                                <th className="px-6 py-4 font-semibold">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {historyRequests.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-10 text-center text-gray-400 italic">
                                        Belum ada riwayat setoran
                                    </td>
                                </tr>
                            ) : (
                                historyRequests.slice(0, 10).map((req: any) => (
                                    <tr key={req.id} className="text-sm">
                                        <td className="px-6 py-4 text-gray-500">{req.date}</td>
                                        <td className="px-6 py-4 font-medium text-gray-900">{req.userName}</td>
                                        <td className="px-6 py-4 text-gray-700">{req.amount} L</td>
                                        <td className="px-6 py-4 font-bold text-[#A3D921]">+{req.points}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${req.status === 'confirmed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                {req.status === 'confirmed' ? 'Diterima' : 'Ditolak'}
                                            </span>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}


function OrdersView({
    transactionCode,
    setTransactionCode,
    searchedTransaction,
    transactionError,
    isSearching,
    isConfirming,
    onSearch,
    onConfirm,
    onCancel
}: any) {
    return (
        <div className="space-y-6">
            {/* Search Section */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-blue-50 p-3 rounded-xl text-blue-500">
                        <QrCode size={24} />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-gray-900">Konfirmasi Pesanan</h2>
                        <p className="text-sm text-gray-500">Masukkan kode transaksi untuk mencari pesanan</p>
                    </div>
                </div>

                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="flex-1">
                            <input
                                type="text"
                                value={transactionCode}
                                onChange={(e) => setTransactionCode(e.target.value.toUpperCase())}
                                onKeyDown={(e) => e.key === 'Enter' && onSearch()}
                                placeholder="JB-XXXXXX"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-[#A3D921] focus:border-transparent outline-none font-mono text-lg uppercase"
                            />
                        </div>
                        <button
                            onClick={onSearch}
                            disabled={isSearching || !transactionCode.trim()}
                            className="px-6 py-3 bg-[#A3D921] hover:bg-[#92C41D] text-white font-bold rounded-xl flex items-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                        >
                            <Search size={20} />
                            {isSearching ? 'Mencari...' : 'Cari'}
                        </button>
                    </div>

                    {transactionError && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-start gap-3">
                            <X size={20} className="flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-medium">{transactionError}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Transaction Details */}
            {searchedTransaction && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up">
                    {/* Header */}
                    <div className={`p-6 ${searchedTransaction.status === 'completed' ? 'bg-green-100' :
                        searchedTransaction.status === 'cancelled' ? 'bg-red-100' :
                            'bg-[#A3D921]'
                        }`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={`p-3 rounded-full ${searchedTransaction.status === 'completed' ? 'bg-green-300' :
                                    searchedTransaction.status === 'cancelled' ? 'bg-red-300' :
                                        'bg-white/20'
                                    }`}>
                                    <QrCode size={24} className={
                                        searchedTransaction.status === 'completed' ? 'text-green-800' :
                                            searchedTransaction.status === 'cancelled' ? 'text-red-800' :
                                                'text-white'
                                    } />
                                </div>
                                <div>
                                    <h3 className={`text-xl font-bold ${searchedTransaction.status === 'completed' ? 'text-green-900' :
                                        searchedTransaction.status === 'cancelled' ? 'text-red-900' :
                                            'text-white'
                                        }`}>
                                        {searchedTransaction.status === 'completed' ? 'Transaksi Sudah Dikonfirmasi' :
                                            searchedTransaction.status === 'cancelled' ? 'Transaksi Ditolak' :
                                                'Detail Transaksi'}
                                    </h3>
                                    <p className={`text-sm ${searchedTransaction.status === 'completed' ? 'text-green-700' :
                                        searchedTransaction.status === 'cancelled' ? 'text-red-700' :
                                            'text-white/90'
                                        }`}>
                                        Kode: {searchedTransaction.id}
                                    </p>
                                </div>
                            </div>
                            {searchedTransaction.status === 'completed' && (
                                <div className="bg-green-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <Check size={16} />
                                    Selesai
                                </div>
                            )}
                            {searchedTransaction.status === 'cancelled' && (
                                <div className="bg-red-700 text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2">
                                    <X size={16} />
                                    Ditolak
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Details */}
                    <div className="p-6 space-y-6">
                        {/* Customer Info */}
                        <div className="grid grid-cols-2 gap-4 pb-6 border-b border-gray-100">
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Nama Member</p>
                                <p className="text-sm font-bold text-gray-900">{searchedTransaction.userName}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400 uppercase font-bold mb-1">Tanggal Penukaran</p>
                                <p className="text-sm font-bold text-gray-900">
                                    {new Date(searchedTransaction.date).toLocaleDateString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>

                        {/* Items */}
                        <div>
                            <h4 className="text-sm font-bold text-gray-400 uppercase mb-4">Barang yang Ditukar</h4>
                            <div className="space-y-3">
                                {searchedTransaction.items.map((item: any, idx: number) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                                        <div className="flex items-center gap-3">
                                            <div className="w-12 h-12 bg-white rounded-lg flex items-center justify-center border border-gray-100">
                                                <Package size={20} className="text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-gray-900">{item.name}</p>
                                                <p className="text-xs text-gray-500">
                                                    {item.quantity} x {item.points} Poin
                                                </p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-[#A3D921]">{item.quantity * item.points}</p>
                                            <p className="text-xs text-gray-400">Poin</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Total */}
                        <div className="bg-gray-900 text-white p-6 rounded-xl flex items-center justify-between">
                            <span className="font-bold text-lg">Total Poin Ditukar</span>
                            <span className="font-bold text-2xl">{searchedTransaction.totalPoints.toLocaleString()}</span>
                        </div>

                        {/* Confirmation Info */}
                        {searchedTransaction.status === 'completed' && searchedTransaction.confirmedAt && (
                            <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl">
                                <p className="text-sm font-medium">
                                    ✓ Dikonfirmasi pada: {new Date(searchedTransaction.confirmedAt).toLocaleString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        )}
                        {searchedTransaction.status === 'cancelled' && searchedTransaction.confirmedAt && (
                            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">
                                <p className="text-sm font-medium">
                                    ✗ Ditolak pada: {new Date(searchedTransaction.confirmedAt).toLocaleString('id-ID', {
                                        day: 'numeric',
                                        month: 'long',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        )}

                        {/* Action */}
                        {searchedTransaction.status === 'pending' && (
                            <div className="pt-6 border-t border-gray-100">
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={onCancel}
                                        disabled={isConfirming}
                                        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
                                    >
                                        <X size={20} />
                                        {isConfirming ? 'Memproses...' : 'Tolak Pesanan'}
                                    </button>
                                    <button
                                        onClick={onConfirm}
                                        disabled={isConfirming}
                                        className="w-full bg-[#A3D921] hover:bg-[#92C41D] text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition shadow-lg hover:shadow-xl"
                                    >
                                        <Check size={20} />
                                        {isConfirming ? 'Memproses...' : 'Konfirmasi Pengambilan'}
                                    </button>
                                </div>
                                <p className="text-center text-xs text-gray-400 mt-3">
                                    Setelah diproses, kode transaksi akan hangus dan tidak dapat digunakan lagi
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Empty State */}
            {!searchedTransaction && !transactionError && (
                <div className="bg-white p-12 rounded-2xl shadow-sm border border-gray-100 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <QrCode size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-400 mb-2">Belum ada transaksi dicari</h3>
                    <p className="text-sm text-gray-400">Masukkan kode transaksi untuk melihat detail pesanan</p>
                </div>
            )}
        </div>
    );
}

