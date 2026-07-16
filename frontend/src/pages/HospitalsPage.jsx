import React from 'react';
import { HeartPulse, MapPin, Phone, Star, ThumbsUp } from 'lucide-react';
import PageShell from '../components/ui/PageShell';

const hospitals = [
  {
    name: 'City General Hospital',
    rating: '4.9',
    distance: '2.1 km',
    open: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?auto=format&fit=crop&w=900&q=80'
  },
  {
    name: 'Northcare Medical Center',
    rating: '4.7',
    distance: '4.8 km',
    open: true,
    available: true,
    image: 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=900&q=80'
  }
];

const HospitalsPage = () => (
  <PageShell
    eyebrow="Critical support"
    title="Nearby Hospitals"
    subtitle="Access trusted medical facilities quickly and keep the nearest option pinned."
  >
    <div className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
      <div className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <HeartPulse size={16} className="text-red-600" /> Emergency ready
        </div>
        <div className="mt-4 space-y-3">
          {hospitals.map((hospital, index) => (
            <div key={hospital.name} className={`rounded-[24px] border p-4 ${index === 0 ? 'border-blue-200 bg-blue-50' : 'border-slate-200 bg-slate-50'}`}>
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{hospital.name}</p>
                <div className={`rounded-full px-3 py-1 text-xs font-semibold ${hospital.available ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-200 text-slate-600'}`}>
                  {hospital.available ? 'Emergency available' : 'Limited'}
                </div>
              </div>
              <div className="mt-3 flex items-center gap-3 text-sm text-slate-600">
                <span className="inline-flex items-center gap-1"><Star size={14} className="text-amber-500" /> {hospital.rating}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={14} className="text-blue-600" /> {hospital.distance}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <img src={hospitals[0].image} alt="Hospital entrance" className="h-56 w-full rounded-[24px] object-cover" />
        <div className="mt-4 flex items-center justify-between">
          <div>
            <p className="text-xl font-semibold text-slate-900">{hospitals[0].name}</p>
            <p className="text-sm text-slate-500">Open now • Trauma unit available</p>
          </div>
          <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-700">Nearest</div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <button className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
            <Phone size={16} /> Call now
          </button>
          <button className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
            <ThumbsUp size={16} /> Directions
          </button>
        </div>
      </div>
    </div>
  </PageShell>
);

export default HospitalsPage;
