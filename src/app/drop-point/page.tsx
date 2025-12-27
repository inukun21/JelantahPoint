'use client';

import { useState } from 'react';
import Link from 'next/link';
import Map from '@/components/map';
import LoadingSpinner from '@/components/loading-spinner';
import { Search, MapPin, Navigation, Phone, Filter } from 'lucide-react';
import { DropPoint } from '@/lib/types';
import { useData } from '@/context/DataContext';

import { AREAS } from '@/lib/constants';

const areas = [
  'Semua Area',
  ...AREAS
];

export default function DropPointPage() {
  const { dropPoints } = useData();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedArea, setSelectedArea] = useState<string>('Semua Area');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedPointId, setSelectedPointId] = useState<number | null>(null);

  // Filter drop points based on search term and area
  const filteredDropPoints = dropPoints.filter(point => {
    const matchesSearch = point.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      point.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = selectedArea === 'Semua Area' || point.area === selectedArea;
    return matchesSearch && matchesArea;
  });

  const handleOpenGoogleMaps = (lat: number | undefined, lng: number | undefined) => {
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-8 pt-24">
      {/* Header Section */}
      <div className="bg-white shadow-sm py-8 mb-6">
        <div className="container mx-auto px-4 text-center">
          <div className="inline-block p-3 bg-yellow-400 rounded-full mb-4 shadow-sm">
            <MapPin className="text-white w-8 h-8" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Peta Drop Point</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Temukan lokasi drop point terdekat untuk menyetor minyak jelantah Anda
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 max-w-7xl">
        {/* Search and Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Cari nama lokasi atau alamat..."
                className="w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center text-gray-500 mr-2">
              <Filter className="w-4 h-4 mr-1" />
              <span className="text-sm">Filter:</span>
            </div>
            {areas.map((area) => (
              <button
                key={area}
                onClick={() => setSelectedArea(area)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition duration-200 ${selectedArea === area
                  ? 'bg-green-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                {area}
              </button>
            ))}
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Menampilkan {filteredDropPoints.length} lokasi drop point
          </div>
        </div>

        {/* Main Content: Map and List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[800px] lg:h-[600px]">
          {/* Map Section */}
          <div className="lg:col-span-2 h-[400px] lg:h-full bg-gray-200 rounded-xl overflow-hidden shadow-lg border border-gray-200 relative z-0">
            <Map
              dropPoints={filteredDropPoints}
              selectedPointId={selectedPointId}
              onSelectPoint={setSelectedPointId}
            />
          </div>

          {/* List Section */}
          <div className="lg:col-span-1 h-full overflow-y-auto pr-2 custom-scrollbar">
            {isLoading ? (
              <LoadingSpinner />
            ) : (
              <div className="space-y-4">
                {filteredDropPoints.length > 0 ? (
                  filteredDropPoints.map((point) => (
                    <div
                      key={point.id}
                      className={`bg-white border rounded-xl p-5 hover:shadow-md transition duration-300 cursor-pointer ${selectedPointId === point.id ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-200'
                        }`}
                      onClick={() => setSelectedPointId(point.id)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-lg text-gray-900">{point.name}</h3>
                        <span className="text-sm font-semibold text-green-600 bg-green-50 px-2 py-1 rounded">
                          {point.distance}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-yellow-500 text-sm">★ 4.8</span>
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${point.status === 'Buka' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                          }`}>
                          {point.status}
                        </span>
                      </div>

                      <div className="flex items-start text-gray-500 text-sm mb-2">
                        <MapPin className="w-4 h-4 mt-0.5 mr-2 flex-shrink-0" />
                        <p>{point.address}</p>
                      </div>

                      <div className="flex items-center text-gray-500 text-sm mb-2">
                        <span className="w-4 h-4 mr-2 flex items-center justify-center font-bold text-xs border border-gray-400 rounded-full">🕒</span>
                        <p>{point.hours}</p>
                      </div>

                      <div className="flex items-center text-gray-500 text-sm mb-4">
                        <Phone className="w-4 h-4 mr-2 flex-shrink-0" />
                        <p>{point.phone}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-4">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenGoogleMaps(point.latitude, point.longitude);
                          }}
                          className="flex items-center justify-center py-2 px-4 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition text-sm"
                        >
                          <Navigation className="w-4 h-4 mr-2" />
                          Arah
                        </button>
                        <button
                          className="flex items-center justify-center py-2 px-4 border border-gray-300 hover:bg-gray-50 text-gray-700 rounded-lg font-medium transition text-sm"
                        >
                          <Phone className="w-4 h-4 mr-2" />
                          Hubungi
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <p className="text-gray-500">Tidak ada drop point yang ditemukan.</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}