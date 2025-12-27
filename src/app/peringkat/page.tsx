'use client';

import { useData } from '@/context/DataContext';
import { Trophy, Medal, Award, TrendingUp } from 'lucide-react';

export default function LeaderboardPage() {
    const { leaderboard } = useData();

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Trophy size={32} className="text-yellow-500" />;
            case 2:
                return <Medal size={32} className="text-gray-400" />;
            case 3:
                return <Medal size={32} className="text-orange-600" />;
            default:
                return <Award size={32} className="text-gray-300" />;
        }
    };

    const getRankBadgeColor = (rank: number) => {
        switch (rank) {
            case 1:
                return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
            case 2:
                return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
            case 3:
                return 'bg-gradient-to-r from-orange-400 to-orange-600 text-white';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const currentMonth = leaderboard[0]?.month || 'Desember 2024';

    return (
        <div className="min-h-screen bg-neutral-50 py-12 md:py-20">
            <div className="container mx-auto px-4 max-w-5xl">

                {/* Header */}
                <div className="text-center mb-12 animate-fade-in-up">
                    <div className="inline-block bg-[#A3D921]/10 p-4 rounded-full mb-4">
                        <TrendingUp size={48} className="text-[#A3D921]" />
                    </div>
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-3">
                        Peringkat Bulanan
                    </h1>
                    <p className="text-gray-500 text-lg">{currentMonth}</p>
                    <p className="text-gray-400 mt-2">Pengguna terbaik berdasarkan poin yang ditukar</p>
                </div>

                {/* Top 3 Podium */}
                <div className="grid grid-cols-3 gap-4 mb-12 max-w-3xl mx-auto animate-fade-in-up animate-delay-100">
                    {/* Rank 2 */}
                    {leaderboard[1] && (
                        <div className="flex flex-col items-center pt-12">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-gray-200 to-gray-400 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                    <span className="text-2xl font-bold text-white">2</span>
                                </div>
                                <div className="absolute -top-2 -right-2">
                                    <Medal size={24} className="text-gray-400" />
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 text-center mb-1">{leaderboard[1].userName}</h3>
                            <p className="text-xs text-gray-500 mb-2">{leaderboard[1].category}</p>
                            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                <span className="text-[#A3D921] font-bold">{leaderboard[1].monthlyPoints.toLocaleString()} pts</span>
                            </div>
                        </div>
                    )}

                    {/* Rank 1 */}
                    {leaderboard[0] && (
                        <div className="flex flex-col items-center">
                            <div className="relative mb-4">
                                <div className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-full flex items-center justify-center border-4 border-white shadow-xl animate-pulse">
                                    <span className="text-3xl font-bold text-white">1</span>
                                </div>
                                <div className="absolute -top-3 -right-3">
                                    <Trophy size={32} className="text-yellow-500" />
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 text-center text-lg mb-1">{leaderboard[0].userName}</h3>
                            <p className="text-xs text-gray-500 mb-2">{leaderboard[0].category}</p>
                            <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 px-5 py-2 rounded-full shadow-lg">
                                <span className="text-white font-bold text-lg">{leaderboard[0].monthlyPoints.toLocaleString()} pts</span>
                            </div>
                        </div>
                    )}

                    {/* Rank 3 */}
                    {leaderboard[2] && (
                        <div className="flex flex-col items-center pt-12">
                            <div className="relative mb-4">
                                <div className="w-20 h-20 bg-gradient-to-br from-orange-300 to-orange-600 rounded-full flex items-center justify-center border-4 border-white shadow-lg">
                                    <span className="text-2xl font-bold text-white">3</span>
                                </div>
                                <div className="absolute -top-2 -right-2">
                                    <Medal size={24} className="text-orange-600" />
                                </div>
                            </div>
                            <h3 className="font-bold text-gray-900 text-center mb-1">{leaderboard[2].userName}</h3>
                            <p className="text-xs text-gray-500 mb-2">{leaderboard[2].category}</p>
                            <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                                <span className="text-[#A3D921] font-bold">{leaderboard[2].monthlyPoints.toLocaleString()} pts</span>
                            </div>
                        </div>
                    )}
                </div>

                {/* Full Leaderboard Table */}
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden animate-fade-in-up animate-delay-200">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-2xl font-bold text-gray-900">Semua Peringkat</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Peringkat</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Nama</th>
                                    <th className="px-6 py-4 text-left text-sm font-bold text-gray-500 uppercase tracking-wider">Kategori</th>
                                    <th className="px-6 py-4 text-right text-sm font-bold text-gray-500 uppercase tracking-wider">Poin Bulanan</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {leaderboard.map((entry) => (
                                    <tr key={entry.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${getRankBadgeColor(entry.rank)}`}>
                                                    {entry.rank}
                                                </div>
                                                {entry.rank <= 3 && (
                                                    <div className="hidden sm:block">
                                                        {getRankIcon(entry.rank)}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{entry.userName}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-block bg-[#F4FADC] text-[#A3D921] px-3 py-1 rounded-full text-sm font-medium">
                                                {entry.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <span className="text-lg font-bold text-gray-900">{entry.monthlyPoints.toLocaleString()}</span>
                                            <span className="text-gray-500 ml-1">pts</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Info Card */}
                <div className="mt-8 bg-gradient-to-r from-[#A3D921]/10 to-[#A3D921]/5 rounded-2xl p-6 border border-[#A3D921]/20">
                    <h3 className="font-bold text-gray-900 mb-2">💡 Cara Naik Peringkat</h3>
                    <p className="text-gray-600 text-sm mb-3">
                        Kumpulkan poin sebanyak-banyaknya dengan menyetor minyak jelantah dan tukarkan poin untuk mendapatkan hadiah.
                        Peringkat diperbarui <span className="font-bold text-[#A3D921]">otomatis secara real-time</span> berdasarkan total poin Anda!
                    </p>
                    <div className="bg-white/50 rounded-lg p-3 text-xs text-gray-600">
                        <p className="font-semibold mb-1">Kategori Berdasarkan Poin:</p>
                        <ul className="space-y-1">
                            <li>🏆 <span className="font-medium">Eco Warrior</span>: 500+ poin</li>
                            <li>🥇 <span className="font-medium">Green Champion</span>: 200+ poin</li>
                            <li>🥈 <span className="font-medium">Earth Saver</span>: 100+ poin</li>
                            <li>🥉 <span className="font-medium">Nature Hero</span>: 50+ poin</li>
                            <li>🌱 <span className="font-medium">Planet Protector</span>: 0-49 poin</li>
                        </ul>
                    </div>
                </div>

            </div>
        </div>
    );
}
