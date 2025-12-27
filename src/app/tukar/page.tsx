'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import html2canvas from 'html2canvas';
import { ShoppingBag, Star, AlertCircle, ArrowRight, CheckCircle2, ShoppingCart, Plus, Minus, X, Ticket, Download, Trash2, History } from 'lucide-react';
import { useData, Product } from '@/context/DataContext';

// Define TypeScript interfaces (Reusing/Extending from Context or local adapter)
interface CartItem extends Product {
  quantity: number;
}

interface Voucher {
  id: string; // Unique transaction ID
  items: CartItem[];
  date: string;
  totalPoints: number;
}

export default function TukarPage() {
  const { products, currentUser, deductUserPoints, isLoggedIn } = useData();
  const [userPoints, setUserPoints] = useState<number>(0);

  // Sync local points display with context
  useEffect(() => {
    if (currentUser) {
      setUserPoints(currentUser.points);
    } else {
      setUserPoints(0);
    }
  }, [currentUser]);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCartItems, setSelectedCartItems] = useState<number[]>([]);
  const [showCart, setShowCart] = useState<boolean>(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<Voucher | null>(null);
  const [showConfirmation, setShowConfirmation] = useState<boolean>(false);
  const [itemToBuyNow, setItemToBuyNow] = useState<Product | null>(null);
  const [error, setError] = useState<string | null>(null);
  const voucherRef = useRef<HTMLDivElement>(null);

  // Cart Logic
  const addToCart = (item: Product) => {
    if (!isLoggedIn) {
      setError("Silakan masuk/daftar terlebih dahulu.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    setCart(prev => {
      const existing = prev.find(p => p.id === item.id);
      if (existing) {
        return prev.map(p => p.id === item.id ? { ...p, quantity: p.quantity + 1 } : p);
      }
      return [...prev, { ...item, quantity: 1 }];
    });

    // Auto Select when adding
    if (!selectedCartItems.includes(item.id)) {
      setSelectedCartItems(prev => [...prev, item.id]);
    }
  };

  const removeFromCart = (itemId: number) => {
    setCart(prev => prev.filter(item => item.id !== itemId));
    setSelectedCartItems(prev => prev.filter(id => id !== itemId));
  };

  const updateQuantity = (itemId: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === itemId) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    }));
  };

  const toggleItemSelection = (id: number) => {
    setSelectedCartItems(prev =>
      prev.includes(id) ? prev.filter(itemId => itemId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedCartItems.length === cart.length) {
      setSelectedCartItems([]);
    } else {
      setSelectedCartItems(cart.map(item => item.id));
    }
  };

  // Calculate totals based on SELECTION
  const selectedItemsList = cart.filter(item => selectedCartItems.includes(item.id));
  const cartTotalPoints = selectedItemsList.reduce((acc, item) => acc + (item.points * item.quantity), 0);
  const totalCartItemsCount = cart.reduce((acc, item) => acc + item.quantity, 0); // Badge shows total regardless of selection
  const selectedItemsCount = selectedItemsList.length;

  // Exchange Logic
  const handleBuyNow = (item: Product) => {
    if (!isLoggedIn) {
      setError("Silakan masuk/daftar terlebih dahulu.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (userPoints < item.points) {
      setError(`Poin kurang! Perlu ${item.points} poin.`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    setItemToBuyNow(item);
    setShowConfirmation(true);
  };

  const handleCheckoutCart = () => {
    if (selectedItemsList.length === 0) {
      setError('Pilih minimal satu barang untuk ditukar.');
      setTimeout(() => setError(null), 3000);
      return;
    }
    if (userPoints < cartTotalPoints) {
      setError(`Poin kurang! Total ${cartTotalPoints} poin, Anda punya ${userPoints}.`);
      setTimeout(() => setError(null), 3000);
      return;
    }
    setItemToBuyNow(null); // Indicates cart checkout
    setShowConfirmation(true);
  };

  const confirmTransaction = async () => {
    const totalCost = itemToBuyNow ? itemToBuyNow.points : cartTotalPoints;
    const itemsToProcess = itemToBuyNow ? [{ ...itemToBuyNow, quantity: 1 }] : selectedItemsList;

    // Use Context deduct function
    const description = itemToBuyNow
      ? `Tukar ${itemToBuyNow.name}`
      : `Tukar ${selectedItemsList.length} Item`;

    // We need to cast or assure TS that deductUserPoints accepts 2 args now (it does in context)
    const success = await deductUserPoints(totalCost, description);

    if (success) {
      // Generate transaction code
      const transactionCode = `JB-${Math.floor(Math.random() * 1000000)}`;

      // Create transaction object
      const transactionData = {
        id: transactionCode,
        userId: currentUser?.id,
        userName: currentUser?.name || currentUser?.username,
        items: itemsToProcess.map(item => ({
          id: item.id,
          name: item.name,
          points: item.points,
          quantity: item.quantity
        })),
        totalPoints: totalCost,
        date: new Date().toISOString(),
        status: 'pending'
      };

      // Save transaction to database
      try {
        const response = await fetch('/api/transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData)
        });

        if (response.ok) {
          const savedTransaction = await response.json();

          // Create voucher with saved transaction code
          const newVoucher: Voucher = {
            id: savedTransaction.id,
            items: itemsToProcess,
            date: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
            totalPoints: totalCost
          };

          setGeneratedVoucher(newVoucher);
          setShowConfirmation(false);

          // Cleanup cart: Remove only the bought items
          if (!itemToBuyNow) {
            setCart(prev => prev.filter(item => !selectedCartItems.includes(item.id)));
            setSelectedCartItems([]);
          }

          setShowCart(false);
        } else {
          setError('Gagal menyimpan transaksi.');
        }
      } catch (error) {
        console.error('Error saving transaction:', error);
        setError('Terjadi kesalahan saat menyimpan transaksi.');
      }
    } else {
      setError('Poin tidak mencukupi.');
    }
  };


  const handleDownloadVoucher = async () => {
    if (!voucherRef.current) return;

    try {
      const canvas = await html2canvas(voucherRef.current, {
        scale: 3, // Increased scale
        backgroundColor: "#ffffff",
        useCORS: true,
        onclone: (clonedDoc) => {
          // Remove animation from the cloned element
          const clonedElement = clonedDoc.getElementById('voucher-card');
          if (clonedElement) {
            clonedElement.classList.remove('animate-fade-in-up');
            clonedElement.style.opacity = '1';
            clonedElement.style.transform = 'none';
            clonedElement.style.animation = 'none';
          }
        }
      });

      const image = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = image;
      link.download = `JeLantahpoint-Voucher-${generatedVoucher?.id || 'code'}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Gagal membuat gambar voucher:", err);
      setError("Gagal mengunduh voucher. Silakan coba lagi.");
    }
  };

  // Views
  if (generatedVoucher) {
    return (
      <div className="min-h-screen bg-neutral-50 py-12 flex items-center justify-center px-4">
        <div id="voucher-card" ref={voucherRef} className="max-w-md w-full bg-white rounded-3xl shadow-xl overflow-hidden relative animate-fade-in-up">
          <div className="bg-[#A3D921] p-6 text-center text-white relative overflow-hidden">
            <div className="relative z-10">
              <CheckCircle2 size={64} className="mx-auto mb-4" />
              <h2 className="text-2xl font-bold">Penukaran Berhasil!</h2>
              <p className="opacity-90">Poin Anda telah berhasil ditukarkan</p>
            </div>
            <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/20 rounded-full"></div>
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/20 rounded-full"></div>
          </div>

          <div className="p-6 relative">
            {/* Ticket "Cut" visuals */}
            <div className="absolute top-0 left-0 w-6 h-6 bg-neutral-50 rounded-br-full -translate-y-1/2 -translate-x-1/2"></div>
            <div className="absolute top-0 right-0 w-6 h-6 bg-neutral-50 rounded-bl-full -translate-y-1/2 translate-x-1/2"></div>

            <div className="border-b-2 border-dashed border-gray-200 pb-6 mb-6">
              <div className="flex justify-between text-gray-400 text-sm mb-2">
                <span>Kode Transaksi</span>
                <span>Tanggal</span>
              </div>
              <div className="flex justify-between font-bold text-gray-800">
                <span className="font-mono text-lg tracking-wider">{generatedVoucher.id}</span>
                <span>{generatedVoucher.date}</span>
              </div>
            </div>

            <div className="space-y-4 mb-8">
              {generatedVoucher.items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="bg-gray-100 p-2 rounded-lg text-gray-500">
                      <Ticket size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-800 text-sm">{item.name}</p>
                      <p className="text-xs text-gray-500">{item.quantity} x {item.points} Poin</p>
                    </div>
                  </div>
                  <div className="font-bold text-[#A3D921]">{item.points * item.quantity}</div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 rounded-xl p-4 flex justify-between items-center mb-6">
              <span className="font-bold text-gray-500">Total Ditukar</span>
              <span className="font-bold text-xl text-gray-900">{generatedVoucher.totalPoints} Poin</span>
            </div>

            <p className="text-center text-xs text-gray-400 mb-6">
              Tunjukkan kode atau voucher ini kepada petugas kami di Drop Point terdekat untuk pengambilan barang.
            </p>

            <div className="space-y-3" data-html2canvas-ignore="true">
              <button
                onClick={handleDownloadVoucher}
                className="w-full bg-gray-900 text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-black transition"
              >
                <Download size={18} /> Unduh Voucher
              </button>
              <button
                onClick={() => {
                  setGeneratedVoucher(null);
                  setItemToBuyNow(null);
                }}
                className="w-full border-2 border-gray-100 text-gray-600 py-3.5 rounded-xl font-bold hover:bg-gray-50 transition"
              >
                Tukar Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 md:py-20 relative">
      <div className="container mx-auto px-4 max-w-7xl">

        {/* Toast Implementation */}
        {error && (
          <div className="fixed top-8 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-6 py-3 rounded-full shadow-xl z-[60] animate-fade-in-up flex items-center gap-2">
            <AlertCircle size={20} />
            <span className="font-medium">{error}</span>
          </div>
        )}

        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-8">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Pusat Penukaran</h1>
            <p className="text-gray-500">Tukar poin jelantahmu dengan berbagai kebaikan.</p>
          </div>

          <div className="flex gap-4">
            <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
                <Star size={24} fill="currentColor" />
              </div>
              <div>
                <p className="text-gray-500 text-xs uppercase font-bold">Poin Kamu</p>
                <h3 className="text-2xl font-extrabold text-gray-900">{userPoints.toLocaleString()}</h3>
              </div>
            </div>

            <button className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-2 hover:bg-gray-50 transition">
              <History size={24} className="text-gray-400" />
            </button>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-24">
          {products.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-3xl p-5 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 group flex flex-col"
            >
              <div className="relative w-full h-48 bg-gray-50 rounded-2xl overflow-hidden mb-5 group-hover:bg-[#F9F9F0] transition-colors flex items-center justify-center">
                <ShoppingBag size={48} className="text-gray-300" />
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-gray-900 shadow-sm">
                  {item.category}
                </div>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-bold text-gray-900 leading-tight">{item.name}</h3>
                  <div className="flex items-center gap-1 text-[#A3D921] font-bold text-sm whitespace-nowrap bg-[#F4FADC] px-2 py-1 rounded-lg">
                    <Star size={14} fill="currentColor" />
                    <span>{item.points}</span>
                  </div>
                </div>

                <p className="text-gray-500 text-sm mb-6 line-clamp-2">{item.description}</p>

                <div className="mt-auto grid grid-cols-2 gap-3">
                  <button
                    onClick={() => addToCart(item)}
                    className="py-2.5 rounded-xl font-bold text-sm bg-gray-100 text-gray-600 hover:bg-gray-200 transition flex items-center justify-center gap-2"
                  >
                    <ShoppingCart size={16} /> + Keranjang
                  </button>
                  <button
                    onClick={() => handleBuyNow(item)}
                    className={`py-2.5 rounded-xl font-bold text-sm transition ${userPoints >= item.points
                      ? 'bg-gray-900 text-white hover:bg-[#A3D921]'
                      : 'bg-gray-100 text-gray-300 cursor-not-allowed'
                      }`}
                  >
                    Tukar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Floating Cart Button */}
        <button
          onClick={() => setShowCart(true)}
          className="fixed bottom-8 right-8 bg-[#A3D921] text-white p-4 rounded-full shadow-2xl hover:bg-[#92C41D] transition-transform hover:scale-105 z-40 flex items-center gap-2 pr-6 group"
        >
          <div className="relative">
            <ShoppingCart size={24} />
            {totalCartItemsCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border-2 border-[#A3D921]">
                {totalCartItemsCount}
              </span>
            )}
          </div>
          <span className="font-bold">Keranjang</span>
        </button>

        {/* Cart Drawer/Modal */}
        {showCart && (
          <div className="fixed inset-0 z-50 flex justify-end">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowCart(false)}></div>
            <div className="relative w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col animate-slide-in-right">
              <div className="flex justify-between items-center mb-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <ShoppingCart className="text-[#A3D921]" /> Keranjang
                  </h2>
                  <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2 py-1 rounded-full">{totalCartItemsCount} Item</span>
                </div>
                <button onClick={() => setShowCart(false)} className="p-2 hover:bg-gray-100 rounded-full">
                  <X size={24} className="text-gray-500" />
                </button>
              </div>

              {cart.length > 0 && (
                <div className="flex items-center mb-4 pb-4 border-b border-gray-100">
                  <input
                    type="checkbox"
                    checked={selectedCartItems.length === cart.length && cart.length > 0}
                    onChange={toggleSelectAll}
                    className="w-5 h-5 rounded border-gray-300 text-[#A3D921] focus:ring-[#A3D921] mr-3"
                  />
                  <span className="text-sm font-bold text-gray-600">Pilih Semua</span>
                </div>
              )}

              <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                    <ShoppingBag size={48} className="mb-4 opacity-50" />
                    <p>Keranjang kamu masih kosong</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className={`flex gap-3 bg-white p-3 rounded-2xl border transition-colors ${selectedCartItems.includes(item.id) ? 'border-[#A3D921] bg-[#F9FDF4]' : 'border-gray-100'}`}>
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedCartItems.includes(item.id)}
                          onChange={() => toggleItemSelection(item.id)}
                          className="w-5 h-5 rounded border-gray-300 text-[#A3D921] focus:ring-[#A3D921]"
                        />
                      </div>
                      <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
                        <ShoppingBag size={20} className="text-gray-300" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 line-clamp-1">{item.name}</h4>
                        <div className="flex items-center gap-1 text-[#A3D921] font-bold text-xs mb-2">
                          <Star size={12} fill="currentColor" />
                          <span>{item.points * item.quantity}</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50">
                            {item.quantity === 1 ? <Trash2 size={12} className="text-red-500" /> : <Minus size={12} />}
                          </button>
                          <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 bg-white rounded-md shadow-sm border border-gray-200 hover:bg-gray-50">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                      <button onClick={() => removeFromCart(item.id)} className="text-gray-300 hover:text-red-500 self-start p-1">
                        <X size={16} />
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className="border-t border-gray-100 pt-6 mt-4">
                <div className="flex justify-between items-center mb-4">
                  <span className="text-gray-500">Total Poin ({selectedItemsCount} Item)</span>
                  <span className="text-2xl font-bold text-[#A3D921]">{cartTotalPoints.toLocaleString()}</span>
                </div>
                <button
                  disabled={selectedItemsList.length === 0}
                  onClick={handleCheckoutCart}
                  className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 ${selectedItemsList.length > 0
                    ? 'bg-gray-900 text-white hover:bg-[#A3D921] shadow-lg hover:shadow-xl'
                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    } transition-all`}
                >
                  Tukar Sekarang <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal */}
        {showConfirmation && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-[70] animate-in fade-in">
            <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-600">
                <AlertCircle size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Konfirmasi Penukaran</h3>
              <p className="text-gray-500 mb-6">
                Anda akan menukarkan <span className="font-bold text-gray-900">{itemToBuyNow ? itemToBuyNow.points : cartTotalPoints} Poin</span>.
                Lanjutkan transaksi?
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setShowConfirmation(false)}
                  className="py-3 rounded-xl font-bold text-gray-600 bg-gray-100 hover:bg-gray-200"
                >
                  Batal
                </button>
                <button
                  onClick={confirmTransaction}
                  className="py-3 rounded-xl font-bold text-white bg-[#A3D921] hover:bg-[#92C41D] shadow-lg"
                >
                  Ya, Tukar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}