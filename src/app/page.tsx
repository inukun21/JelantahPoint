'use client';

import Link from 'next/link';
import { Droplet, Users, Leaf, Gift, MapPin, Award, TrendingUp, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useSocket } from '@/context/SocketContext';

export default function HomePage() {
  const { socket } = useSocket();
  const [stats, setStats] = useState({
    activeUsers: 0,
    totalCollectedLiter: 0,
    co2Saved: 0,
    rewardsExchanged: 0
  });

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/stats');
      const data = await res.json();
      if (res.ok) {
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  useEffect(() => {
    fetchStats();

    if (socket) {
      // Listen for database updates
      socket.on('db:updated', fetchStats);

      return () => {
        socket.off('db:updated', fetchStats);
      };
    }
  }, [socket]);

  return (
    <div className="min-h-screen bg-neutral-50">
      {/* Hero Section */}
      <section className="bg-[#F9F9F0] py-16 md:py-24 lg:py-32 px-3 sm:px-4">
        <div className="container mx-auto max-w-6xl text-center">
          <div className="inline-block bg-[#E8F5D6] text-green-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-xs sm:text-sm mb-4 sm:mb-6 border border-green-200">
            ♻️ Program Jejak Jelantah DKR Jeruklegi
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-extrabold text-gray-900 mb-4 sm:mb-6 leading-tight px-2">
            Setor Jelantah, <br />
            <span className="text-[#A3D921]">Tukar Manfaat!</span>
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 mb-8 sm:mb-10 max-w-3xl mx-auto leading-relaxed px-2 sm:px-4">
            Inisiatif DKR Jeruklegi untuk mengubah limbah minyak jelantah menjadi poin berharga.
            Tukar dengan sembako dan kebutuhan rumah tangga. Mari bersama lindungi lingkungan!
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-2 sm:px-4">
            <Link
              href="/setor"
              className="bg-[#A3D921] hover:bg-[#92C41D] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition duration-300 flex items-center justify-center gap-2 text-base sm:text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Mulai Setor Jelantah <ArrowRight size={20} />
            </Link>
            <Link
              href="/edukasi"
              className="bg-white hover:bg-gray-50 text-gray-700 font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl border border-gray-200 transition duration-300 flex items-center justify-center gap-2 text-base sm:text-lg shadow-sm hover:shadow-md"
            >
              Pelajari Lebih Lanjut
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative -mt-12 sm:-mt-16 pb-16 sm:pb-20 px-3 sm:px-4 z-10">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col items-center text-center hover:transform hover:scale-105 transition duration-300">
              <div className="bg-[#A3D921] p-3 sm:p-4 rounded-full mb-3 sm:mb-4 text-white">
                <Droplet size={28} className="sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {stats.totalCollectedLiter.toLocaleString('id-ID')}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 font-medium">Liter Terkumpul</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col items-center text-center hover:transform hover:scale-105 transition duration-300">
              <div className="bg-[#A3D921] p-3 sm:p-4 rounded-full mb-3 sm:mb-4 text-white">
                <Users size={28} className="sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {stats.activeUsers.toLocaleString('id-ID')}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 font-medium">Pengguna Aktif</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col items-center text-center hover:transform hover:scale-105 transition duration-300">
              <div className="bg-[#A3D921] p-3 sm:p-4 rounded-full mb-3 sm:mb-4 text-white">
                <Leaf size={28} className="sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {stats.co2Saved.toLocaleString('id-ID')} kg
              </h3>
              <p className="text-sm sm:text-base text-gray-500 font-medium">CO2 Tersimpan</p>
            </div>
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl flex flex-col items-center text-center hover:transform hover:scale-105 transition duration-300">
              <div className="bg-[#A3D921] p-3 sm:p-4 rounded-full mb-3 sm:mb-4 text-white">
                <Gift size={28} className="sm:w-8 sm:h-8" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-1">
                {stats.rewardsExchanged.toLocaleString('id-ID')}
              </h3>
              <p className="text-sm sm:text-base text-gray-500 font-medium">Poin Ditukar</p>
            </div>
          </div>
        </div>
      </section>

      {/* Jejak Jelantah Section */}
      <section className="py-16 sm:py-20 px-3 sm:px-4 bg-[#F9F9F0]">
        <div className="container mx-auto max-w-6xl">
          <div className="flex flex-col md:flex-row items-center gap-8 sm:gap-12">
            <div className="w-full md:w-1/2 flex justify-center">
              <div className="w-full max-w-[320px] sm:max-w-md md:max-w-none bg-white p-2 sm:p-3 md:p-4 rounded-2xl shadow-lg hover:shadow-xl transition duration-300">
                <div className="aspect-video bg-gray-200 rounded-xl flex items-center justify-center text-gray-400 min-h-[180px] sm:min-h-[220px] md:min-h-[260px] lg:min-h-[320px]">
                  <span className="text-xs sm:text-sm md:text-base lg:text-lg px-2 text-center">Foto Kegiatan DKR Jeruklegi</span>
                </div>
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <div className="inline-block bg-[#E8F5D6] text-green-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full font-medium text-xs sm:text-sm mb-4 sm:mb-6 border border-green-200">
                🌱 Aksi Nyata
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">
                Jejak Jelantah <br /> <span className="text-[#A3D921]">DKR Jeruklegi</span>
              </h2>
              <p className="text-gray-600 text-base sm:text-lg mb-4 sm:mb-6 leading-relaxed">
                Dewan Kerja Ranting (DKR) Jeruklegi bergerak nyata dalam upaya pelestarian lingkungan melalui program Jejak Jelantah.
                Kami mengedukasi dan memfasilitasi masyarakat untuk mengelola limbah minyak jelantah menjadi sumber daya yang bermanfaat.
              </p>
              <ul className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="text-[#A3D921] mt-1 flex-shrink-0 w-5 h-5" />
                  <span className="text-sm sm:text-base text-gray-700">Edukasi pengelolaan limbah rumah tangga</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="text-[#A3D921] mt-1 flex-shrink-0 w-5 h-5" />
                  <span className="text-sm sm:text-base text-gray-700">Pemberdayaan anggota pramuka peduli lingkungan</span>
                </li>
                <li className="flex items-start gap-2 sm:gap-3">
                  <CheckCircle2 className="text-[#A3D921] mt-1 flex-shrink-0 w-5 h-5" />
                  <span className="text-sm sm:text-base text-gray-700">Kontribusi nyata untuk Cilacap hijau</span>
                </li>
              </ul>
              <Link
                href="/edukasi"
                className="inline-flex bg-[#A3D921] hover:bg-[#92C41D] text-white font-bold py-3 sm:py-4 px-6 sm:px-8 rounded-xl transition duration-300 items-center justify-center gap-2 text-base sm:text-lg shadow-lg hover:shadow-xl"
              >
                Lihat Kegiatan Kami <ArrowRight size={20} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-20 px-3 sm:px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">Fitur Unggulan</h2>
            <p className="text-gray-500 text-base sm:text-lg max-w-2xl mx-auto px-4">
              Platform lengkap untuk memudahkan Anda berkontribusi pada lingkungan
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6 md:gap-8">
            <div className="p-5 sm:p-6 border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition bg-white">
              <div className="bg-[#A3D921] w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white mb-4 sm:mb-6">
                <Droplet size={24} className="sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Setor Mudah</h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                Setor jelantah dengan mudah melalui kurir jemput atau drop point terdekat
              </p>
            </div>
            <div className="p-5 sm:p-6 border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition bg-white">
              <div className="bg-[#FFD166] w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white mb-4 sm:mb-6">
                <Gift size={24} className="sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Tukar Poin</h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                Tukar poin dengan sembako dan kebutuhan rumah tangga pilihan Anda
              </p>
            </div>
            <div className="p-5 sm:p-6 border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition bg-white">
              <div className="bg-[#A3D921] w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white mb-4 sm:mb-6">
                <MapPin size={24} className="sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Peta Drop Point</h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                Temukan lokasi drop point terdekat dengan peta interaktif
              </p>
            </div>
            <div className="p-5 sm:p-6 border border-gray-100 rounded-2xl shadow-md hover:shadow-lg transition bg-white">
              <div className="bg-[#FFD166] w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-white mb-4 sm:mb-6">
                <Award size={24} className="sm:w-7 sm:h-7" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">Reward & Badge</h3>
              <p className="text-sm sm:text-base text-gray-500 leading-relaxed">
                Dapatkan badge eksklusif dan naik di leaderboard sebagai Pahlawan Dapur Hijau
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 sm:py-20 px-3 sm:px-4 bg-gray-50">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">Cara Kerja</h2>
            <p className="text-gray-500 text-base sm:text-lg px-4">
              Empat langkah mudah untuk mulai berkontribusi
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-10 md:gap-12 max-w-5xl mx-auto">
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#A3D921] rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">1</div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Daftar & Login</h3>
                <p className="text-sm sm:text-base text-gray-500">Buat akun dengan email, Google, atau nomor HP Anda untuk mulai menggunakan aplikasi.</p>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#A3D921] rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">2</div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Setor Jelantah</h3>
                <p className="text-sm sm:text-base text-gray-500">Isi form, upload foto, dan pilih metode penjemputan atau antar sendiri ke drop point.</p>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#A3D921] rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">3</div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Dapatkan Poin</h3>
                <p className="text-sm sm:text-base text-gray-500">Setelah diverifikasi, poin otomatis masuk ke akun Anda (1 Liter = 100 Poin).</p>
              </div>
            </div>
            <div className="flex gap-4 sm:gap-6">
              <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-[#A3D921] rounded-full flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-lg">4</div>
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">Tukar Hadiah</h3>
                <p className="text-sm sm:text-base text-gray-500">Jelajahi katalog dan tukar poin dengan sembako atau barang kebutuhan lainnya.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-20 px-3 sm:px-4 bg-[#A3D921]">
        <div className="container mx-auto max-w-4xl text-center">
          <div className="flex justify-center mb-4 sm:mb-6">
            <TrendingUp className="text-white w-10 h-10 sm:w-12 sm:h-12" />
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
            Siap Menjadi Pahlawan Dapur Hijau?
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-white mb-8 sm:mb-10 opacity-90 max-w-2xl mx-auto px-4">
            Bergabunglah dengan ribuan pengguna lain yang sudah berkontribusi untuk lingkungan yang lebih bersih dan berkelanjutan.
          </p>
          <button className="bg-[#FFD166] hover:bg-[#FFC040] text-gray-900 font-bold py-3 sm:py-4 px-8 sm:px-10 rounded-full text-base sm:text-lg shadow-lg hover:shadow-xl transition duration-300 transform hover:-translate-y-1 flex items-center gap-2 mx-auto">
            Daftar Sekarang Gratis <ArrowRight size={20} />
          </button>
        </div>
      </section>


      {/* Footer */}
      <footer className="bg-[#111827] text-white py-12 sm:py-16 px-3 sm:px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 md:gap-12 mb-10 sm:mb-12">
            <div className="col-span-1 sm:col-span-2">
              <div className="flex items-center gap-2 mb-4 sm:mb-6">
                <Droplet className="text-[#A3D921]" size={28} />
                <span className="text-xl sm:text-2xl font-bold">JelantahPoint</span>
              </div>
              <p className="text-gray-400 text-sm sm:text-base max-w-md mb-4 sm:mb-6 leading-relaxed">
                Program Jejak Jelantah - Inisiasi Dewan Kerja Ranting (DKR) Jeruklegi.
                Mengubah limbah menjadi berkah untuk lingkungan yang lebih baik.
              </p>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-[#A3D921]">Navigasi</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><Link href="/" className="hover:text-white transition">Beranda</Link></li>
                <li><Link href="/setor" className="hover:text-white transition">Setor Jelantah</Link></li>
                <li><Link href="/tukar" className="hover:text-white transition">Tukar Poin</Link></li>
                <li><Link href="/drop-point" className="hover:text-white transition">Lokasi Drop Point</Link></li>
                <li><Link href="/edukasi" className="hover:text-white transition">Edukasi</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-bold mb-4 sm:mb-6 text-[#A3D921]">Mitra</h4>
              <ul className="space-y-2 sm:space-y-3 text-gray-400 text-sm sm:text-base">
                <li><a href="#" className="hover:text-white transition">Perusahaan Biodiesel</a></li>
                <li><a href="#" className="hover:text-white transition">UMKM & Toko</a></li>
                <li><a href="#" className="hover:text-white transition">Komunitas Hijau</a></li>
                <li><a href="#" className="hover:text-white transition">Jadi Mitra</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 flex flex-col md:flex-row justify-between items-center text-gray-500 text-xs sm:text-sm gap-4">
            <p className="text-center md:text-left">&copy; 2024 JelantahPoint & DKR Jeruklegi. All rights reserved.</p>
            <div className="flex gap-4 sm:gap-6">
              <a href="#" className="hover:text-white transition">Kebijakan Privasi</a>
              <a href="#" className="hover:text-white transition">Syarat & Ketentuan</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}