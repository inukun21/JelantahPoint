'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Leaf, Recycle, Lightbulb, Users, Info, ArrowRight, Search, Clock, Calendar, Share2, Bookmark } from 'lucide-react';

interface EdukasiItem {
  id: number;
  title: string;
  description: string;
  content: string;
  icon: React.ReactNode;
  category: string;
  readTime: string;
  date: string;
}

export default function EdukasiPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState<EdukasiItem | null>(null);
  const [activeCategory, setActiveCategory] = useState('Semua');

  const edukasiItems: EdukasiItem[] = [
    {
      id: 1,
      title: 'Bahaya Minyak Jelantah bagi Lingkungan',
      description: 'Membuang minyak jelantah sisa penggorengan ke saluran air dapat menyumbat pipa dan mencemari ekosistem air.',
      content: `
        <p>Minyak jelantah sering kali dianggap sebagai limbah sepele yang bisa dibuang begitu saja ke wastafel. Namun, tahukah Anda dampak buruk yang ditimbulkannya? Ketika minyak jelantah masuk ke saluran pembuangan, ia akan mendingin dan mengeras, membentuk gumpalan lemak yang keras seperti batu (fatbergs).</p>
        
        <h3>1. Menyumbat Saluran Air</h3>
        <p>Gumpalan lemak hasil pembuangan minyak jelantah dapat menyumbat pipa di rumah Anda hingga saluran air kota. Hal ini sering menjadi penyebab utama banjir lokal karena air hujan tidak dapat mengalir dengan semestinya.</p>
        
        <h3>2. Mencemari Sumber Air</h3>
        <p>Satu liter minyak jelantah dapat mencemari hingga satu juta liter air tanah. Lapisan minyak yang tipis di atas permukaan air akan menghalangi oksigen masuk ke dalam air, yang sangat berbahaya bagi ikan dan organisme air lainnya.</p>
        
        <h3>3. Merusak Ekosistem Tanah</h3>
        <p>Jika minyak jelantah terbuang ke tanah, ia akan menyumbat pori-pori tanah, membuat tanah menjadi keras dan tidak subur karena cacing dan mikroorganisme tanah tidak bisa mendapatkan udara.</p>
        
        <p>Mari mulai bijak dengan tidak membuang minyak jelantah sembarangan. Simpan dalam wadah dan setorkan ke Jelantah Point terdekat!</p>
      `,
      icon: <Leaf className="text-green-600" size={32} />,
      category: 'Lingkungan',
      readTime: '3 min baca',
      date: '24 Des 2025'
    },
    {
      id: 2,
      title: 'Cara Mengolah Jelantah Jadi Sabun',
      description: 'Panduan langkah demi langkah membuat sabun cuci tangan dari minyak jelantah yang sudah dimurnikan.',
      content: `
        <p>Mengubah limbah menjadi produk berguna adalah inti dari gaya hidup Zero Waste. Minyak jelantah bisa diolah menjadi sabun cuci piring atau sabun cuci tangan yang efektif through a process called saponification.</p>
        
        <h3>Bahan yang Dibutuhkan:</h3>
        <ul>
          <li>500g Minyak jelantah yang sudah disaring</li>
          <li>80g Soda api (NaOH)</li>
          <li>200ml Air bersih</li>
          <li>Pewangi (essential oil) secukupnya</li>
          <li>Arang aktif untuk menjernihkan minyak</li>
        </ul>
        
        <h3>Langkah Pembuatan:</h3>
        <ol>
          <li><strong>Penjernihan:</strong> Rendam minyak jelantah dengan arang aktif selama 24 jam untuk menghilangkan bau tengik.</li>
          <li><strong>Larutan Soda:</strong> Masukkan soda api ke dalam air (HATI-HATI! Selalu soda ke air, bukan sebaliknya). Aduk hingga larut dan biarkan dingin.</li>
          <li><strong>Pencampuran:</strong> Tuangkan larutan soda ke dalam minyak secara perlahan sambil adat terus menggunakan blender tangan hingga mengental (trace).</li>
          <li><strong>Pencetakan:</strong> Tambahkan pewangi, lalu tuang ke dalam cetakan. Diamkan selama 24-48 jam.</li>
          <li><strong>Curing:</strong> Simpan sabun di tempat kering selama 4 minggu sebelum digunakan agar pH-nya stabil.</li>
        </ol>
        <p>Selamat mencoba membuat sabun ramah lingkungan sendiri di rumah!</p>
      `,
      icon: <Recycle className="text-blue-600" size={32} />,
      category: 'DIY',
      readTime: '5 min baca',
      date: '20 Des 2025'
    },
    {
      id: 3,
      title: 'Nilai Ekonomis dari Limbah Dapur',
      description: 'Bagaimana sampah dapur seperti kulit buah dan minyak jelantah bisa menjadi sumber pendapatan tambahan.',
      content: `
        <p>Limbah dapur bukan lagi sampah yang tidak berharga. Dengan pengelolaan yang tepat, Anda bisa mengubahnya menjadi tabungan atau pendapatan tambahan.</p>
        
        <h3>Minyak Jelantah: Emas Cair</h3>
        <p>Industri biodiesel sangat membutuhkan minyak jelantah sebagai bahan baku. Di Jelantah Point, setiap liter yang Anda setorkan dihargai dengan poin yang bisa ditukar dengan berbagai hadiah menarik atau bahkan uang tunai melalui kemitraan kami.</p>
        
        <h3>Eco-Enzyme dari Kulit Buah</h3>
        <p>Kulit buah segar jangan dibuang. Campur dengan gula merah dan air (perbandingan 3:1:10) dan fermentasikan selama 3 bulan. Hasilnya adalah cairan pembersih serbaguna yang bernilai ekonomi tinggi.</p>
        
        <p>Dengan memilah sampah dari dapur, Anda tidak hanya menyelamatkan bumi, tapi juga mempertebal dompet Anda.</p>
      `,
      icon: <Lightbulb className="text-yellow-500" size={32} />,
      category: 'Ekonomi',
      readTime: '4 min baca',
      date: '15 Des 2025'
    },
    {
      id: 4,
      title: 'Tips Menyimpan Minyak Jelantah',
      description: 'Cara aman dan benar menyimpan minyak sisa sebelum disetorkan ke bank sampah atau drop point.',
      content: `
        <p>Agar minyak jelantah Anda tetap layak untuk didaur ulang menjadi biodiesel, cara penyimpanannya harus diperhatikan dengan baik.</p>
        
        <h3>Jangan dicampur air</h3>
        <p>Pastikan minyak tidak tercampur dengan air atau kuah masakan. Air akan mempercepat proses oksidasi yang membuat minyak cepat busuk dan berjamur.</p>
        
        <h3>Saring sebelum disimpan</h3>
        <p>Gunakan saringan halus untuk membuang sisa-sisa gorengan (remah-remah). Sisa makanan yang tertinggal dalam minyak akan membusuk dan merusak kualitas minyak.</p>
        
        <h3>Wadah yang tepat</h3>
        <p>Gunakan wadah plastik atau kaca yang memiliki tutup rapat. Simpan di tempat yang sejuk dan tidak terkena sinar matahari langsung.</p>
      `,
      icon: <Info className="text-purple-500" size={32} />,
      category: 'Tips',
      readTime: '2 min baca',
      date: '10 Des 2025'
    }
  ];

  const categories = ['Semua', 'Lingkungan', 'DIY', 'Ekonomi', 'Teknologi', 'Tips'];

  const filteredItems = useMemo(() => {
    return edukasiItems.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = activeCategory === 'Semua' || item.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, activeCategory]);

  return (
    <div className="min-h-screen bg-[#FDFDFD] pb-20 pt-24">
      <div className="container mx-auto px-4 max-w-6xl">

        {!selectedArticle ? (
          <>
            {/* List View */}
            <div className="text-center mb-16 animate-fade-in-up">
              <div className="inline-block bg-[#F4FADC] text-[#A3D921] px-4 py-1.5 rounded-full font-bold text-xs uppercase tracking-widest mb-4 border border-[#A3D921]/20">
                📚 Belajar Bareng
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6 tracking-tight">
                Edukasi Lingkungan
              </h1>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto mb-10">
                Wawasan cerdas untuk gaya hidup berkelanjutan. Ubah limbah menjadi berkah dimulai dari pengetahuan.
              </p>

              {/* Search Bar */}
              <div className="max-w-xl mx-auto relative group">
                <div className="absolute inset-y-0 left-5 flex items-center pointer-events-none">
                  <Search className="text-gray-400 group-focus-within:text-[#A3D921] transition-colors" size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Cari ide atau artikel..."
                  className="w-full pl-14 pr-6 py-5 rounded-[2rem] border border-gray-100 focus:outline-none focus:ring-4 focus:ring-[#A3D921]/10 focus:border-[#A3D921] shadow-xl shadow-gray-100/50 transition-all bg-white text-gray-700 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            {/* Categories */}
            <div className="flex flex-wrap justify-center gap-3 mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all duration-300 ${activeCategory === cat
                      ? 'bg-gray-900 text-white shadow-lg scale-105'
                      : 'bg-white text-gray-500 hover:bg-gray-50 border border-gray-100 shadow-sm'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {filteredItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="bg-white rounded-[2.5rem] p-8 shadow-sm hover:shadow-2xl hover:shadow-gray-200/50 transition-all duration-500 border border-gray-50 group flex flex-col h-full animate-fade-in-up"
                  style={{ animationDelay: `${200 + idx * 50}ms` }}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className="bg-[#F8F9FA] p-5 rounded-3xl group-hover:bg-[#F4FADC] group-hover:scale-110 transition-all duration-500">
                      {item.icon}
                    </div>
                    <span className="text-[10px] font-black bg-gray-900 text-white px-3 py-1.5 rounded-full uppercase tracking-widest">
                      {item.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-gray-900 mb-4 group-hover:text-[#A3D921] transition-colors leading-tight">
                    {item.title}
                  </h3>

                  <p className="text-gray-500 mb-8 leading-relaxed text-sm flex-1">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-gray-400">
                      <Clock size={14} />
                      <span className="text-[11px] font-bold">{item.readTime}</span>
                    </div>
                    <button
                      onClick={() => setSelectedArticle(item)}
                      className="text-[#A3D921] font-black text-sm flex items-center gap-1 hover:gap-3 transition-all"
                    >
                      Baca Artikel <ArrowRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          /* Article Detail View */
          <div className="max-w-4xl mx-auto animate-fade-in-up">
            {/* Back Button */}
            <button
              onClick={() => setSelectedArticle(null)}
              className="group flex items-center gap-2 text-gray-500 font-bold mb-10 hover:text-gray-900 transition-colors"
            >
              <div className="p-2 bg-white rounded-xl shadow-sm group-hover:bg-gray-100 transition-colors">
                <ArrowRight size={20} className="rotate-180" />
              </div>
              Kembali ke Daftar
            </button>

            {/* Article Header */}
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <span className="bg-[#F4FADC] text-[#A3D921] px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest leading-none">
                  {selectedArticle.category}
                </span>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold ring-1 ring-gray-100 px-3 py-1.5 rounded-full bg-white">
                  <Calendar size={14} />
                  {selectedArticle.date}
                </div>
                <div className="flex items-center gap-2 text-gray-400 text-xs font-bold ring-1 ring-gray-100 px-3 py-1.5 rounded-full bg-white">
                  <Clock size={14} />
                  {selectedArticle.readTime}
                </div>
              </div>

              <h1 className="text-4xl md:text-6xl font-black text-gray-900 mb-8 leading-tight tracking-tight">
                {selectedArticle.title}
              </h1>

              <div className="flex items-center justify-between p-6 bg-white border border-gray-50 rounded-3xl shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-[#A3D921] rounded-2xl flex items-center justify-center text-white font-bold text-xl">
                    JP
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">Tim Jelantah Point</p>
                    <p className="text-xs text-gray-400 font-bold">Kontributor Edukasi</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button className="p-3 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-2xl">
                    <Share2 size={20} />
                  </button>
                  <button className="p-3 text-gray-400 hover:text-gray-900 transition-colors bg-gray-50 rounded-2xl">
                    <Bookmark size={20} />
                  </button>
                </div>
              </div>
            </div>

            {/* Main Image Placeholder */}
            <div className="aspect-video w-full bg-gray-100 rounded-[3rem] mb-12 overflow-hidden relative shadow-inner">
              <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                <BookOpen size={80} strokeWidth={1} />
              </div>
            </div>

            {/* Article Content */}
            <article className="prose prose-lg max-w-none text-gray-600 leading-relaxed font-medium mb-16
              prose-headings:text-gray-900 prose-headings:font-black prose-headings:tracking-tight
              prose-h3:text-2xl prose-h3:mt-12 prose-h3:mb-6
              prose-p:mb-8 
              prose-ul:list-disc prose-ul:pl-6 prose-ul:mb-8
              prose-ol:list-decimal prose-ol:pl-6 prose-ol:mb-8
              prose-li:mb-2
              prose-strong:text-gray-900 prose-strong:font-black
            ">
              <div dangerouslySetInnerHTML={{ __html: selectedArticle.content }} />
            </article>

            {/* Recommendation Box */}
            <div className="bg-[#A3D921] rounded-[2.5rem] p-10 md:p-14 text-gray-900 shadow-2xl shadow-[#A3D921]/20">
              <div className="flex flex-col md:flex-row items-center gap-10">
                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-3xl font-black mb-4 leading-tight">Siap Untuk Memulai Perubahan?</h2>
                  <p className="text-gray-900/70 font-bold mb-8">
                    Terapkan ilmu yang baru saja Anda baca. Setorkan minyak jelantah Anda sekarang dan kumpulkan poinnya!
                  </p>
                  <div className="flex flex-wrap justify-center md:justify-start gap-4">
                    <Link href="/setor" className="bg-gray-900 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-transform active:scale-95">
                      Setor Minyak
                    </Link>
                    <button onClick={() => setSelectedArticle(null)} className="px-8 py-4 rounded-2xl font-black text-lg border-2 border-gray-900/10 hover:bg-gray-900/5 transition-colors">
                      Artikel Lainnya
                    </button>
                  </div>
                </div>
                <div className="hidden lg:block">
                  <div className="w-56 h-56 bg-white/20 backdrop-blur-xl rounded-[3rem] flex items-center justify-center -rotate-6">
                    <Recycle size={100} className="text-gray-900 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Footer CTA - Show only on list view */}
        {!selectedArticle && (
          <div className="bg-[#111827] rounded-[3rem] p-10 md:p-20 text-center text-white relative overflow-hidden shadow-2xl mt-12 animate-fade-in-up">
            <div className="relative z-10">
              <div className="bg-[#A3D921]/20 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-8 border border-[#A3D921]/30">
                <BookOpen className="text-[#A3D921]" size={40} />
              </div>
              <h2 className="text-3xl md:text-4xl font-black mb-6 tracking-tight">Ingin Kontribusi Artikel?</h2>
              <p className="text-gray-400 max-w-2xl mx-auto mb-10 text-lg font-medium">
                Punya pengalaman menarik seputar lingkungan? Kirim tulisanmu dan dapatkan <span className="text-[#A3D921] font-bold">500 Koin Berkah</span> jika dimuat!
              </p>
              <button className="bg-[#A3D921] hover:bg-[#92C41D] text-gray-900 font-black py-5 px-12 rounded-[1.25rem] transition-all duration-300 shadow-xl shadow-[#A3D921]/10 hover:scale-105 active:scale-95 text-xl">
                Ajukan Tulisan
              </button>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-[#A3D921] opacity-[0.03] rounded-full -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500 opacity-5 rounded-full translate-y-1/3 -translate-x-1/3"></div>
          </div>
        )}

        {/* Back Link */}
        {!selectedArticle && (
          <div className="text-center mt-12">
            <Link href="/" className="text-gray-400 hover:text-gray-900 font-bold transition-all flex items-center justify-center gap-2 group uppercase tracking-widest text-xs">
              <ArrowRight size={14} className="rotate-180 group-hover:-translate-x-1 transition-transform" />
              Kembali ke Beranda
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}