import React from 'react';
import { Compass, LocateFixed, RefreshCw, Send, Share2, Sparkles } from 'lucide-react';
import PageShell from '../components/ui/PageShell';

const LiveLocationPage = () => (
  <PageShell
    eyebrow="Live monitoring"
    title="Live Location"
    subtitle="Track your position in real time with precise, resilient positioning."
    actions={[
      <button key="refresh" className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-200 hover:text-blue-700">
        Refresh location
      </button>
    ]}
  >
    <div className="grid gap-6 xl:grid-cols-[1.1fr_0.5fr]">
      <div className="relative overflow-hidden rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-slate-100 to-slate-200 p-4 shadow-[0_20px_80px_rgba(15,23,42,0.08)]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(37,99,235,0.14),transparent_30%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.14),transparent_20%)]" />
        <div className="relative h-[420px] rounded-[24px] border border-white/70 bg-white/80 backdrop-blur">
          <div className="absolute inset-0 opacity-25 [background-image:linear-gradient(to_right,rgba(15,23,42,0.08)_1px,transparent_1px),linear-gradient(to_bottom,rgba(15,23,42,0.08)_1px,transparent_1px)] [background-size:36px_36px]" />
          <div className="absolute left-[28%] top-[35%] h-16 w-16 rounded-full border-4 border-blue-600/20" />
          <div className="absolute left-[28%] top-[35%] flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-white shadow-[0_16px_40px_rgba(37,99,235,0.35)]">
            <LocateFixed size={22} />
          </div>
          <div className="absolute bottom-5 left-5 rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-lg">
            <p className="text-sm font-semibold text-slate-900">Current route</p>
            <p className="text-sm text-slate-500">Near MG Road • 2.4 km away</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Position status</p>
              <p className="text-xl font-semibold text-slate-900">Stable signal</p>
            </div>
            <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
              <Compass size={18} />
            </div>
          </div>
          <div className="mt-4 space-y-3 text-sm text-slate-600">
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
              <span>Coordinates</span>
              <span className="font-semibold text-slate-800">12.9716, 77.5946</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
              <span>Speed</span>
              <span className="font-semibold text-slate-800">0.4 km/h</span>
            </div>
            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-2">
              <span>Accuracy</span>
              <span className="font-semibold text-slate-800">±3m</span>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
            <Sparkles size={16} className="text-blue-600" /> Sharing controls
          </div>
          <div className="mt-4 grid gap-3">
            <button className="flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
              <RefreshCw size={16} /> Refresh
            </button>
            <button className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700">
              <Share2 size={16} /> Share location
            </button>
            <button className="flex items-center justify-center gap-2 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100">
              <Send size={16} /> Send to contacts
            </button>
          </div>
        </div>
      </div>
    </div>
  </PageShell>
);

export default LiveLocationPage;
