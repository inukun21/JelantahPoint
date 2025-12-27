'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Mail, Lock, ArrowRight, Droplet, CheckCircle2, AtSign } from 'lucide-react';
import { useData } from '@/context/DataContext';

export default function RegistrationPage() {
    const router = useRouter();
    const { addUser, login } = useData();
    const [isLogin, setIsLogin] = useState(true);
    const [formData, setFormData] = useState({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1000));

        if (isLogin) {
            // LOGIN LOGIC
            const success = login(formData.username, formData.password);
            if (success) {
                router.push('/profil');
            } else {
                setError('Username atau password salah.');
            }
        } else {
            // REGISTER LOGIC
            if (formData.password !== formData.confirmPassword) {
                setError('Kata sandi konfirmasi tidak cocok.');
                setIsLoading(false);
                return;
            }

            const newUser = {
                id: Date.now(),
                username: formData.username,
                name: formData.fullName,
                email: formData.email,
                points: 0,
                role: 'User' as const,
                password: formData.password,
            };

            addUser(newUser);
            login(formData.username, formData.password);
            router.push('/profil');
        }

        setIsLoading(false);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-4 flex items-center justify-center relative overflow-hidden bg-gray-50/50">
            {/* Background Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
                <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-[#A3D921]/5 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#A3D921]/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <div className="w-full max-w-md">
                <div className="bg-white border border-gray-100 rounded-[2.5rem] shadow-2xl shadow-gray-200/50 overflow-hidden backdrop-blur-sm">
                    {/* Header */}
                    <div className="bg-[#A3D921] p-10 text-center relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10 pattern-dots" />
                        <div className="relative z-10 flex flex-col items-center">
                            <div className="bg-white p-4 rounded-3xl shadow-xl mb-4 group hover:scale-110 transition-transform duration-500">
                                <Droplet size={36} className="text-[#A3D921]" fill="currentColor" />
                            </div>
                            <h1 className="text-3xl font-black text-gray-900 mb-1 tracking-tight">
                                {isLogin ? 'Selamat Datang' : 'Buat Akun'}
                            </h1>
                            <p className="text-gray-800 font-medium opacity-80">
                                {isLogin ? 'Masuk ke Jelantah Point' : 'Bergabung dengan Jelantah Point'}
                            </p>
                        </div>
                    </div>

                    <div className="p-10">
                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-2xl flex items-center gap-2 animate-shake">
                                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* USERNAME - Always visible */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Username</label>
                                <div className="relative group">
                                    <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#A3D921] transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="username"
                                        required
                                        value={formData.username}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#A3D921]/10 focus:border-[#A3D921] transition-all font-medium text-gray-700 placeholder:text-gray-300"
                                        placeholder="Masukkan username"
                                    />
                                </div>
                            </div>

                            {/* NAMA LENGKAP - Register only */}
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                                    <div className="relative group">
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#A3D921] transition-colors" size={20} />
                                        <input
                                            type="text"
                                            name="fullName"
                                            required
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#A3D921]/10 focus:border-[#A3D921] transition-all font-medium text-gray-700 placeholder:text-gray-300"
                                            placeholder="Masukkan nama lengkap"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* EMAIL - Register only */}
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Email</label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#A3D921] transition-colors" size={20} />
                                        <input
                                            type="email"
                                            name="email"
                                            required
                                            value={formData.email}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#A3D921]/10 focus:border-[#A3D921] transition-all font-medium text-gray-700 placeholder:text-gray-300"
                                            placeholder="nama@email.com"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* PASSWORD */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Kata Sandi</label>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#A3D921] transition-colors" size={20} />
                                    <input
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#A3D921]/10 focus:border-[#A3D921] transition-all font-medium text-gray-700 placeholder:text-gray-300"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {/* CONFIRM PASSWORD - Register only */}
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest ml-1">Konfirmasi Sandi</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-[#A3D921] transition-colors" size={20} />
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:outline-none focus:ring-4 focus:ring-[#A3D921]/10 focus:border-[#A3D921] transition-all font-medium text-gray-700 placeholder:text-gray-300"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-[1.25rem] shadow-xl shadow-gray-200 hover:shadow-2xl transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                                >
                                    {isLoading ? (
                                        <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>
                                            <span className="relative z-10">{isLogin ? 'Masuk Sekarang' : 'Daftar Sekarang'}</span>
                                            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform relative z-10" />
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>

                        <div className="mt-10 text-center">
                            <p className="text-gray-400 font-medium">
                                {isLogin ? 'Belum punya akun?' : 'Sudah punya akun?'}
                                <button
                                    onClick={() => {
                                        setIsLogin(!isLogin);
                                        setError('');
                                    }}
                                    className="text-[#A3D921] font-black ml-2 hover:underline focus:outline-none"
                                >
                                    {isLogin ? 'Daftar disini' : 'Masuk disini'}
                                </button>
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-10 flex items-center justify-center gap-4 text-gray-400 text-sm font-bold uppercase tracking-widest">
                    <span>&copy; {new Date().getFullYear()} Jelantah Point</span>
                    <div className="w-1.5 h-1.5 bg-gray-200 rounded-full" />
                    <span>Privacy Policy</span>
                </div>
            </div>
        </div>
    );
}

