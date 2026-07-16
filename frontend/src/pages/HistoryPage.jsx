import React from 'react';
import { Activity, Clock3, MapPin, ShieldCheck, TimerReset } from 'lucide-react';
import PageShell from '../components/ui/PageShell';

const events = [
  { title: 'Medical assistance dispatched', time: '08:12', status: 'Resolved', type: 'SOS', location: 'MG Road' },
  { title: 'Location shared with contacts', time: '14:34', status: 'Shared', type: 'Location', location: 'Koramangala' },
  { title: 'Emergency call completed', time: '19:05', status: 'Completed', type: 'Call', location: 'HSR Layout' }
];

const HistoryPage = () => (
  <PageShell
    eyebrow="Response history"
    title="Emergency History"
    subtitle="Review incidents, response outcomes, and critical timelines."
  >
    <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Activity size={16} className="text-blue-600" /> Timeline
        </div>
        <div className="mt-5 space-y-4">
          {events.map((event) => (
            <div key={event.time} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-900">{event.title}</p>
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">{event.status}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-3 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1"><Clock3 size={14} /> {event.time}</span>
                <span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> {event.type}</span>
                <span className="inline-flex items-center gap-1"><MapPin size={14} /> {event.location}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
        <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <TimerReset size={16} className="text-emerald-600" /> Analytics
        </div>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Avg. response time</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">1m 42s</p>
          </div>
          <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm text-slate-500">Monthly alerts</p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">14</p>
          </div>
        </div>
        <div className="mt-4 h-48 rounded-[24px] border border-slate-200 bg-gradient-to-br from-blue-50 via-slate-50 to-emerald-50 p-4">
          <div className="flex h-full items-end gap-3">
            {[40, 65, 52, 80, 74, 92].map((height, index) => (
              <div key={height} className="flex-1 rounded-t-2xl bg-gradient-to-t from-blue-600 to-emerald-500" style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
    </div>
  </PageShell>
);

export default HistoryPage;
