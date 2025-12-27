'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Truck, MapPin, Camera, Calendar, MapPinned, Phone, ChevronRight, UploadCloud, Check } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function SetorPage() {
  const { dropPoints, isLoggedIn, currentUser, addDepositRequest } = useData();
  const [oilAmount, setOilAmount] = useState(1);
  const [location, setLocation] = useState('');
  const [note, setNote] = useState('');
  const [confirmation, setConfirmation] = useState(false);

  // New state variables
  const [depositMethod, setDepositMethod] = useState<'courier' | 'drop_point'>('courier');
  const [pickupAddress, setPickupAddress] = useState('');
  const [pickupDate, setPickupDate] = useState('');
  const [contactNumber, setContactNumber] = useState('');

  const calculatePoints = (amount: number) => {
    // 1L minyak jelantah = 100 poin
    return Math.floor(amount * 100);
  };

  // New state for photo
  const [oilPhoto, setOilPhoto] = useState<string | null>(null);

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOilPhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isLoggedIn || !currentUser) {
      alert('Silakan masuk terlebih dahulu untuk menyetor.');
      return;
    }

    // Validate inputs based on method
    if (depositMethod === 'courier') {
      if (!pickupAddress || !pickupDate || !contactNumber) {
        alert('Mohon lengkapi data penjemputan');
        return;
      }
    } else {
      if (!location) {
        alert('Mohon pilih lokasi drop point');
        return;
      }
    }

    // Points to be awarded after confirmation
    const pointsToAward = calculatePoints(oilAmount);

    // Create deposit request
    addDepositRequest({
      userId: currentUser.id,
      userName: currentUser.name,
      userEmail: currentUser.email,
      amount: oilAmount,
      points: pointsToAward,
      method: depositMethod,
      location: depositMethod === 'drop_point' ? location : undefined,
      address: depositMethod === 'courier' ? pickupAddress : undefined,
      contact: contactNumber,
      image: oilPhoto || undefined,
      note: note
    });

    setConfirmation(true);
  };

  if (confirmation) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[2.5rem] shadow-2xl p-8 md:p-12 max-w-md w-full text-center animate-fade-in-up border border-gray-100">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="text-[#A3D921] w-12 h-12" strokeWidth={3} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Setoran Berhasil!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Permintaan setoran <span className="font-extrabold text-[#A3D921]">{oilAmount} liter</span> minyak jelantah telah kami terima dan menunggu verifikasi.
          </p>

          <div className="bg-gray-50 rounded-3xl p-6 mb-8 border border-gray-100/50">
            <div className="flex justify-between items-center mb-3">
              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Metode</span>
              <span className="font-bold text-gray-900">{depositMethod === 'courier' ? 'Penjemputan Kurir' : 'Antar ke Drop Point'}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm font-bold uppercase tracking-wider">Estimasi Poin</span>
              <div className="flex items-center gap-1.5">
                <div className="bg-[#A3D921]/10 p-1 rounded-md">
                  <Check className="text-[#A3D921] w-4 h-4" strokeWidth={3} />
                </div>
                <span className="font-black text-[#A3D921] text-2xl">{calculatePoints(oilAmount).toLocaleString()}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Link href="/profil" className="w-full bg-[#A3D921] hover:bg-[#92C41D] text-white font-black py-4 px-6 rounded-2xl transition duration-300 shadow-lg shadow-[#A3D921]/20">
              Lihat Profil Saya
            </Link>
            <Link href="/" className="w-full bg-white hover:bg-gray-50 text-gray-500 font-bold py-4 px-6 rounded-2xl border border-gray-200 transition duration-300">
              Kembali ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-12 md:py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="text-center mb-12 animate-fade-in-up">
          <div className="inline-block bg-[#A3D921]/10 text-[#A3D921] px-5 py-2 rounded-full font-black text-xs uppercase tracking-widest mb-4 border border-[#A3D921]/20">
            ♻️ Mulai Berkontribusi
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight">Setor Jelantah</h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto font-medium">
            Lengkapi data di bawah ini untuk menukarkan minyak jelantah Anda menjadi poin bermanfaat.
          </p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl p-6 md:p-12 mb-8 max-w-3xl mx-auto border border-gray-100 animate-fade-in-up animate-delay-100">
          <form onSubmit={handleSubmit}>
            {/* Volume Input */}
            <div className="mb-12">
              <label className="block text-gray-900 font-black mb-6 text-xl text-center uppercase tracking-wider">Volume Jelantah</label>
              <div className="flex items-center justify-center bg-gray-50 rounded-[2rem] p-4 border-2 border-gray-100 max-w-md mx-auto shadow-inner">
                <button
                  type="button"
                  className="w-14 h-14 flex items-center justify-center bg-white rounded-2xl shadow-md hover:bg-gray-100 text-gray-600 font-black text-2xl transition active:scale-95 border border-gray-100"
                  onClick={() => setOilAmount(Math.max(0.5, oilAmount - 0.5))}
                >
                  -
                </button>
                <div className="flex-1 flex items-center justify-center gap-3">
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    className="w-28 text-center bg-transparent border-none text-5xl font-black text-gray-900 focus:ring-0 p-0"
                    value={oilAmount}
                    onChange={(e) => setOilAmount(parseFloat(e.target.value) || 0)}
                  />
                  <span className="text-gray-400 font-bold text-2xl">Liter</span>
                </div>
                <button
                  type="button"
                  className="w-14 h-14 flex items-center justify-center bg-[#A3D921] rounded-2xl shadow-lg hover:bg-[#92C41D] text-white font-black text-2xl transition active:scale-95"
                  onClick={() => setOilAmount(oilAmount + 0.5)}
                >
                  +
                </button>
              </div>

              {/* Live Points Feedback */}
              <div className="mt-8 flex flex-col items-center animate-bounce-slow">
                <div className="bg-[#A3D921] text-white px-6 py-2 rounded-full font-black text-lg shadow-xl shadow-[#A3D921]/30">
                  +{calculatePoints(oilAmount).toLocaleString()} POIN
                </div>
                <p className="text-center text-xs text-gray-400 mt-3 font-bold uppercase tracking-widest leading-loose">Minimal setoran 0.5 liter • 1L = 100 Poin</p>
              </div>
            </div>

            {/* Photo Upload */}
            <div className="mb-12">
              <label className="block text-gray-900 font-black mb-6 text-xl text-center uppercase tracking-wider">Foto Kondisi Jelantah</label>
              <label className={`block border-2 border-dashed rounded-[2.5rem] p-4 text-center transition-all duration-300 cursor-pointer overflow-hidden ${oilPhoto ? 'border-[#A3D921] bg-green-50/30' : 'border-gray-200 hover:bg-gray-50 hover:border-[#A3D921] group'}`}>
                <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                {oilPhoto ? (
                  <div className="relative group">
                    <img src={oilPhoto} alt="Jelantah Preview" className="w-full h-64 object-cover rounded-[2rem] shadow-lg" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-[2rem]">
                      <span className="text-white font-bold flex items-center gap-2">
                        <Camera size={24} /> Ganti Foto
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center">
                    <div className="bg-white p-6 rounded-[2rem] mb-5 shadow-xl group-hover:scale-110 transition duration-500">
                      <UploadCloud className="h-10 w-10 text-[#A3D921]" />
                    </div>
                    <span className="text-gray-900 font-black text-xl mb-1">Upload Foto</span>
                    <span className="text-sm text-gray-400 font-bold uppercase tracking-widest">Format JPG, PNG (Max 5MB)</span>
                  </div>
                )}
              </label>
            </div>

            {/* Deposit Method Selection */}
            <div className="mb-10">
              <label className="block text-gray-800 font-bold mb-4 text-lg">Pilih Metode</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Option 1: Courier */}
                <div
                  className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col items-center text-center border-2 ${depositMethod === 'courier'
                    ? 'border-[#A3D921] bg-[#F4FADC] shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                    }`}
                  onClick={() => setDepositMethod('courier')}
                >
                  <div className={`p-4 rounded-full mb-4 ${depositMethod === 'courier' ? 'bg-[#A3D921] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <Truck size={28} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">Dijemput Kurir</h3>
                  <p className="text-sm text-gray-500">Kami jemput ke lokasi Anda</p>
                  {depositMethod === 'courier' && (
                    <div className="absolute top-4 right-4 text-[#A3D921]">
                      <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                    </div>
                  )}
                </div>

                {/* Option 2: Drop Point */}
                <div
                  className={`relative rounded-2xl p-6 cursor-pointer transition-all duration-300 flex flex-col items-center text-center border-2 ${depositMethod === 'drop_point'
                    ? 'border-[#A3D921] bg-[#F4FADC] shadow-md'
                    : 'border-gray-100 bg-white hover:border-gray-200 hover:shadow-md'
                    }`}
                  onClick={() => setDepositMethod('drop_point')}
                >
                  <div className={`p-4 rounded-full mb-4 ${depositMethod === 'drop_point' ? 'bg-[#A3D921] text-white' : 'bg-gray-100 text-gray-500'}`}>
                    <MapPin size={28} />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-1">Antar ke Drop Point</h3>
                  <p className="text-sm text-gray-500">Antar ke lokasi terdekat</p>
                  {depositMethod === 'drop_point' && (
                    <div className="absolute top-4 right-4 text-[#A3D921]">
                      <CheckCircle2 size={24} fill="currentColor" className="text-white" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Conditional Inputs */}
            <div className="bg-gray-50 rounded-2xl p-6 md:p-8 animate-fade-in-up">
              {depositMethod === 'courier' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">Alamat Lengkap</label>
                    <div className="relative">
                      <div className="absolute top-3.5 left-4 text-gray-400">
                        <MapPinned size={20} />
                      </div>
                      <textarea
                        className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] focus:border-transparent transition bg-white"
                        rows={3}
                        placeholder="Masukkan alamat lengkap penjemputan..."
                        value={pickupAddress}
                        onChange={(e) => setPickupAddress(e.target.value)}
                        required
                      ></textarea>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Tanggal Penjemputan</label>
                      <div className="relative">
                        <div className="absolute top-3.5 left-4 text-gray-400">
                          <Calendar size={20} />
                        </div>
                        <input
                          type="date"
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] focus:border-transparent transition bg-white"
                          value={pickupDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-gray-700 font-semibold mb-2">Nomor WhatsApp</label>
                      <div className="relative">
                        <div className="absolute top-3.5 left-4 text-gray-400">
                          <Phone size={20} />
                        </div>
                        <input
                          type="tel"
                          className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] focus:border-transparent transition bg-white"
                          placeholder="Contoh: 08123456789"
                          value={contactNumber}
                          onChange={(e) => setContactNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {depositMethod === 'drop_point' && (
                <div>
                  <label className="block text-gray-700 font-semibold mb-3">Pilih Lokasi Drop Point</label>
                  <div className="relative">
                    <div className="absolute top-3.5 left-4 text-gray-400">
                      <MapPin size={20} />
                    </div>
                    <select
                      className="w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] focus:border-transparent transition bg-white appearance-none"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      required
                    >
                      <option value="">-- Pilih lokasi terdekat --</option>
                      {dropPoints
                        .filter(dp => dp.status === 'Buka')
                        .map((dp) => (
                          <option key={dp.id} value={dp.name}>
                            {dp.name} ({dp.distance}) - {dp.area || 'N/A'}
                          </option>
                        ))}
                    </select>
                    <div className="absolute top-4 right-4 pointer-events-none text-gray-400">
                      <ChevronRight className="rotate-90" size={20} />
                    </div>
                  </div>
                  <div className="mt-3 text-right">
                    <Link href="/drop-point" className="text-[#A3D921] hover:text-[#88B61C] font-semibold text-sm flex items-center justify-end gap-1">
                      Lihat peta lokasi <ChevronRight size={16} />
                    </Link>
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 mb-8">
              <label className="block text-gray-700 font-semibold mb-2">Catatan (Opsional)</label>
              <textarea
                className="w-full p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#A3D921] focus:border-transparent transition bg-gray-50 focus:bg-white"
                rows={2}
                placeholder="Tambahkan catatan khusus jika ada..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
              ></textarea>
            </div>

            <button
              type="submit"
              className="w-full bg-[#A3D921] hover:bg-[#92C41D] text-white font-bold py-4 px-6 rounded-xl transition duration-300 text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2"
            >
              {depositMethod === 'courier' ? 'Jadwalkan Penjemputan' : 'Dapatkan Kode Setor'} <ChevronRight size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function CheckCircle2({ size, className, fill }: { size?: number, className?: string, fill?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size || 24}
      height={size || 24}
      viewBox="0 0 24 24"
      fill={fill || "none"}
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m9 12 2 2 4-4" stroke="white" />
    </svg>
  )
}