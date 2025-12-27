'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { User, Settings, Clock, LogOut, Award, Droplet, Leaf, Edit2, ArrowUpRight, ArrowDownLeft, ChevronRight, CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { useSocket } from '@/context/SocketContext';

export default function ProfilPage() {
  const { currentUser, logout, isLoggedIn, updateUser, refreshData } = useData();
  const { socket } = useSocket();

  useEffect(() => {
    if (socket) {
      const handleUpdate = () => {
        console.log('ProfilPage: Received update event, refreshing data...');
        refreshData();
      };

      socket.on('user:updated', handleUpdate);
      socket.on('deposit:updated', handleUpdate);
      socket.on('db:updated', handleUpdate);

      return () => {
        socket.off('user:updated', handleUpdate);
        socket.off('deposit:updated', handleUpdate);
        socket.off('db:updated', handleUpdate);
      };
    }
  }, [socket, refreshData]);

  const [activeTab, setActiveTab] = useState('overview');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [profileImage, setProfileImage] = useState<string>(currentUser?.image || '');
  const [transactions, setTransactions] = useState<any[]>([]);

  // Fetch transactions on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch('/api/transactions');
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };
    fetchTransactions();
  }, []);

  // If not logged in, redirect or show message
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Silakan Masuk Terlebih Dahulu</h2>
          <Link href="/registrasi" className="bg-[#A3D921] px-6 py-3 rounded-full font-bold">Masuk / Daftar</Link>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
    window.location.href = '/';
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setProfileImage(base64String);
        if (currentUser) {
          updateUser({ ...currentUser, image: base64String });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentUser) return;

    const formData = new FormData(e.currentTarget);
    const updatedUser = {
      ...currentUser,
      name: formData.get('name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
    };

    updateUser(updatedUser);
    alert('Profil berhasil diperbarui!');
  };

  // Use currentUser data directly from database
  const userData = {
    name: currentUser?.name || 'Pengguna',
    email: currentUser?.email || '-',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    totalPoints: currentUser?.points || 0,
    memberTier: (currentUser?.points || 0) > 5000 ? 'Eco Warrior' : (currentUser?.points || 0) > 2000 ? 'Green Champion' : 'Member',
    joinDate: currentUser?.joinDate || 'Januari 2024',
    stats: {
      totalLitres: currentUser?.totalDeposited || 0,
      co2Saved: currentUser?.co2Saved || 0,
      transactions: currentUser?.pointHistory?.length || 0
    },
    pointsHistory: currentUser?.pointHistory || []
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/3 animate-fade-in-up">
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 text-center sticky top-24">
              <div className="relative w-32 h-32 mx-auto mb-6 group">
                <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden border-4 border-white shadow-lg relative">
                  {profileImage || currentUser?.image ? (
                    <img src={profileImage || currentUser?.image} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <User size={64} />
                  )}
                  <label className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <Edit2 size={24} className="text-white" />
                    <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                  </label>
                </div>
                <div className="absolute bottom-0 right-0 bg-[#A3D921] p-2 rounded-full text-white border-4 border-white shadow-md pointer-events-none">
                  <Edit2 size={16} />
                </div>
              </div>

              <h2 className="text-2xl font-bold text-gray-900 mb-1">{userData.name}</h2>
              <p className="text-gray-500 mb-6">{userData.memberTier}</p>

              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#F4FADC] p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Poin</p>
                  <p key={userData.totalPoints} className="text-xl font-bold text-[#A3D921] animate-in fade-in zoom-in duration-500">
                    {userData.totalPoints.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-50 p-4 rounded-2xl">
                  <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">Total Setor</p>
                  <p className="text-xl font-bold text-gray-900">{userData.stats.totalLitres} L</p>
                </div>
              </div>

              <div className="space-y-2 text-left">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`w-full p-4 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'overview' ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  <Award size={20} /> Ikhtisar & Poin
                </button>
                <button
                  onClick={() => setActiveTab('settings')}
                  className={`w-full p-4 rounded-xl flex items-center gap-3 transition-colors ${activeTab === 'settings' ? 'bg-gray-900 text-white' : 'hover:bg-gray-50 text-gray-600'}`}
                >
                  <Settings size={20} /> Pengaturan Akun
                </button>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="w-full p-4 rounded-xl flex items-center gap-3 hover:bg-red-50 text-red-500 transition-colors"
                >
                  <LogOut size={20} /> Keluar
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full md:w-2/3 animate-fade-in-up animate-delay-100">
            {activeTab === 'overview' ? (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-green-100 p-4 rounded-full text-green-600">
                      <Leaf size={28} />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Dampak Lingkungan</p>
                      <h3 className="text-2xl font-bold text-gray-900">{userData.stats.co2Saved} kg</h3>
                      <p className="text-xs text-gray-400">CO2 dicegah</p>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="bg-blue-100 p-4 rounded-full text-blue-600">
                      <Clock size={28} />
                    </div>
                    <div>
                      <p className="text-gray-500 text-sm">Bergabung Sejak</p>
                      <h3 className="text-2xl font-bold text-gray-900">{userData.joinDate}</h3>
                      <p className="text-xs text-gray-400">{userData.stats.transactions} Transaksi</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Riwayat Poin</h3>
                    <button className="text-sm text-[#A3D921] font-bold hover:underline">Lihat Semua</button>
                  </div>

                  <div className="space-y-4">
                    {userData.pointsHistory.length === 0 ? (
                      <p className="text-gray-400 text-center py-4">Belum ada riwayat transaksi</p>
                    ) : (
                      userData.pointsHistory.map((item) => {
                        // Find matching transaction for redeem type
                        let matchedTransaction = null;

                        if (item.type === 'redeem') {
                          const itemDate = new Date(item.date);
                          const itemTimestamp = item.id; // Use pointHistory entry ID as timestamp

                          // Filter candidates: same user, same amount, same day
                          const candidates = transactions.filter(t => {
                            if (t.userId !== currentUser?.id || t.totalPoints !== item.amount) {
                              return false;
                            }

                            const transactionDate = new Date(t.date);
                            return transactionDate.getFullYear() === itemDate.getFullYear() &&
                              transactionDate.getMonth() === itemDate.getMonth() &&
                              transactionDate.getDate() === itemDate.getDate();
                          });

                          // Find closest match by timestamp
                          if (candidates.length > 0) {
                            matchedTransaction = candidates.reduce((closest, current) => {
                              const currentTimestamp = new Date(current.date).getTime();
                              const closestTimestamp = new Date(closest.date).getTime();
                              const diff1 = Math.abs(currentTimestamp - itemTimestamp);
                              const diff2 = Math.abs(closestTimestamp - itemTimestamp);
                              return diff1 < diff2 ? current : closest;
                            });
                          }
                        }

                        return (
                          <div key={item.id} className="p-4 rounded-2xl hover:bg-gray-50 transition border border-gray-100 hover:border-gray-200">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${item.type === 'earn' ? 'bg-[#F4FADC] text-[#A3D921]' : 'bg-red-50 text-red-500'}`}>
                                  {item.type === 'earn' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900">{item.description}</p>
                                  <p className="text-xs text-gray-500">{item.date}</p>
                                  {matchedTransaction && (
                                    <div className="mt-2 flex items-center gap-2 flex-wrap">
                                      <span className="text-xs text-gray-400 font-mono">Kode: {matchedTransaction.id}</span>
                                      {matchedTransaction.status === 'completed' ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold">
                                          <CheckCircle2 size={14} />
                                          Berhasil Diambil
                                        </span>
                                      ) : matchedTransaction.status === 'cancelled' ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded-full text-xs font-bold">
                                          <XCircle size={14} />
                                          Ditolak
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-bold">
                                          <Clock3 size={14} />
                                          Menunggu Konfirmasi
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className={`font-bold ${item.type === 'earn' ? 'text-[#A3D921]' : 'text-red-500'}`}>
                                {item.type === 'earn' ? '+' : ''}{(item.amount || 0).toLocaleString()}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Informasi Pribadi</h3>
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Nama Lengkap</label>
                      <input
                        name="name"
                        type="text"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] focus:border-transparent bg-gray-50"
                        defaultValue={userData.name}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-700 font-medium mb-2">Email</label>
                      <input
                        type="email"
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] focus:border-transparent bg-gray-50"
                        defaultValue={userData.email}
                        readOnly
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Nomor Telepon</label>
                    <input
                      name="phone"
                      type="tel"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] focus:border-transparent bg-gray-50"
                      defaultValue={userData.phone}
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-medium mb-2">Alamat Lengkap</label>
                    <textarea
                      name="address"
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] focus:border-transparent bg-gray-50 shadow-inner"
                      rows={3}
                      defaultValue={userData.address}
                    ></textarea>
                  </div>
                  <div className="pt-4 flex justify-end">
                    <button type="submit" className="bg-[#A3D921] hover:bg-[#92C41D] text-white font-bold py-3 px-8 rounded-xl transition duration-300 shadow-md transform active:scale-95">
                      Simpan Perubahan
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in-up">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <LogOut size={32} className="text-red-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Keluar</h3>
            <p className="text-gray-500 mb-6">
              Apakah Anda yakin ingin keluar dari akun Anda?
            </p>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition"
              >
                Batal
              </button>
              <button
                onClick={handleLogout}
                className="py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 transition shadow-lg"
              >
                Ya, Keluar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}