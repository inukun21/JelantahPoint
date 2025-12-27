'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Droplet, Menu, X, User as UserIcon } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function Navbar() {
  const pathname = usePathname();
  const { isLoggedIn, currentUser } = useData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  // Hide navbar on admin pages
  if (pathname?.startsWith('/admin')) return null;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Setor', path: '/setor' },
    { name: 'Tukar', path: '/tukar' },
    { name: 'Peringkat', path: '/peringkat' },
    { name: 'Drop Point', path: '/drop-point' },
    { name: 'Edukasi', path: '/edukasi' },
    ...(isLoggedIn ? [{ name: 'Profil', path: '/profil' }] : []),
  ];


  return (
    <nav
      className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled || isMenuOpen ? 'bg-white/90 backdrop-blur-md shadow-sm py-3 md:py-4' : 'bg-transparent py-4 md:py-6'
        }`}
    >
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 max-w-7xl">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 sm:gap-2 group">
            <div className="bg-[#A3D921] p-1.5 sm:p-2 rounded-full text-white transition-transform duration-300 group-hover:scale-110">
              <Droplet size={20} className="sm:w-6 sm:h-6" fill="currentColor" />
            </div>
            <span className={`text-base sm:text-xl font-bold tracking-tight transition-colors ${scrolled || isMenuOpen ? 'text-gray-900' : 'text-gray-900'}`}>
              Jelantah<span className="text-[#A3D921]">Point</span>
            </span>
          </Link>

          {/* Desktop menu */}
          <div className="hidden lg:flex items-center space-x-4 xl:space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`text-sm font-medium transition duration-300 hover:text-[#A3D921] relative group whitespace-nowrap ${pathname === link.path ? 'text-[#A3D921]' : 'text-gray-600'
                  }`}
              >
                {link.name}
                <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-[#A3D921] transition-all duration-300 group-hover:w-full ${pathname === link.path ? 'w-full' : ''}`}></span>
              </Link>
            ))}
          </div>

          {/* CTA Button / Profile */}
          <div className="hidden lg:flex items-center gap-2 xl:gap-4">
            {isLoggedIn ? (
              <>
                <Link
                  href="/setor"
                  className="bg-[#A3D921] hover:bg-[#92C41D] text-white font-bold py-2 px-4 xl:py-2.5 xl:px-6 rounded-full transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-sm whitespace-nowrap"
                >
                  Setor Sekarang
                </Link>
                <Link href="/profil" className="w-9 h-9 xl:w-10 xl:h-10 rounded-full border-2 border-[#A3D921] overflow-hidden hover:scale-105 transition shadow-sm flex-shrink-0">
                  {currentUser?.image ? (
                    <img src={currentUser.image} alt="Profil" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[#A3D921]">
                      <UserIcon size={20} />
                    </div>
                  )}
                </Link>
              </>
            ) : (
              <Link
                href="/registrasi"
                className="hidden lg:flex items-center gap-2 bg-gray-900 hover:bg-black text-white font-bold py-2 px-4 xl:py-2.5 xl:px-6 rounded-full transition duration-300 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 active:translate-y-0 text-sm whitespace-nowrap"
              >
                <UserIcon size={18} />
                Masuk / Daftar
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="lg:hidden flex items-center gap-2 sm:gap-3">
            {isLoggedIn && (
              <Link href="/profil" className="w-8 h-8 sm:w-9 sm:h-9 rounded-full border-2 border-[#A3D921] overflow-hidden flex-shrink-0">
                {currentUser?.image ? (
                  <img src={currentUser.image} alt="Profil" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[#A3D921]">
                    <UserIcon size={16} className="sm:w-[18px] sm:h-[18px]" />
                  </div>
                )}
              </Link>
            )}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 focus:outline-none p-1 sm:p-2"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X size={24} className="sm:w-7 sm:h-7" /> : <Menu size={24} className="sm:w-7 sm:h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-white shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
      >
        <div className="px-4 py-5 space-y-3 flex flex-col items-center">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              href={link.path}
              className={`text-base font-medium transition duration-300 ${pathname === link.path ? 'text-[#A3D921]' : 'text-gray-700 hover:text-[#A3D921]'
                }`}
              onClick={() => setIsMenuOpen(false)}
            >
              {link.name}
            </Link>
          ))}
          <div className="pt-3 w-full px-4 sm:px-8">
            {isLoggedIn ? (
              <Link
                href="/setor"
                className="block w-full text-center bg-[#A3D921] text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform"
                onClick={() => setIsMenuOpen(false)}
              >
                Setor Sekarang
              </Link>
            ) : (
              <Link
                href="/registrasi"
                onClick={() => setIsMenuOpen(false)}
                className="block w-full text-center bg-gray-900 text-white font-bold py-3 rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2"
              >
                <UserIcon size={20} />
                Masuk / Daftar
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav >
  );
}