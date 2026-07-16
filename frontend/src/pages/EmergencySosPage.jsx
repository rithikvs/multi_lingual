import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, BellRing, Compass, MapPin, PhoneCall, ShieldCheck, Wifi, Zap } from 'lucide-react';
import PageShell from '../components/ui/PageShell';

const steps = [
  'Obtaining GPS',
  'Sending Live Location',
  'Sending SMS',
  'Calling Emergency Contacts',
  'Emergency Alert Sent Successfully'
];

const EmergencySosPage = () => {
  const [countdown, setCountdown] = useState(5);
  const [isArmed, setIsArmed] = useState(false);
  const [isActive, setIsActive] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    if (!isArmed || isActive) return undefined;

    if (countdown <= 0) {
      setIsActive(true);
      setStepIndex(0);
      return undefined;
    }

    const timer = window.setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [countdown, isArmed, isActive]);

  useEffect(() => {
    if (!isActive) return undefined;

    const timer = window.setTimeout(() => {
      setStepIndex((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 900);

    if (stepIndex >= steps.length - 1) {
      window.clearTimeout(timer);
      return undefined;
    }

    return () => window.clearTimeout(timer);
  }, [isActive, stepIndex]);

  const handleActivate = () => {
    setIsArmed(true);
    setCountdown(5);
    setIsActive(false);
    setStepIndex(0);
  };

  const handleCancel = () => {
    setIsArmed(false);
    setIsActive(false);
    setCountdown(5);
    setStepIndex(0);
  };

  const statusLabel = useMemo(() => {
    if (isActive) return 'Emergency alert in progress';
    if (isArmed) return `Activating in ${countdown}s`;
    return 'Ready to dispatch';
  }, [countdown, isActive, isArmed]);

  return (
    <PageShell
      eyebrow="Critical response"
      title="Emergency SOS"
      subtitle="A calm, trusted system for dispatching support in seconds."
      actions={[
        <button key="cancel" onClick={handleCancel} className="rounded-full border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:text-red-600">
          Cancel
        </button>
      ]}
    >
      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[32px] border border-slate-200/80 bg-gradient-to-br from-slate-50 via-white to-blue-50 p-6 shadow-[0_20px_80px_rgba(37,99,235,0.08)] sm:p-8">
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 inline-flex items-center rounded-full border border-red-100 bg-red-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-red-600">
              <AlertTriangle size={14} className="mr-2" />
              Immediate help
            </div>
            <motion.button
              whileHover={{ scale: isArmed || isActive ? 1 : 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleActivate}
              aria-label="Activate emergency SOS"
              className={`relative flex h-56 w-56 items-center justify-center rounded-full border-none bg-gradient-to-br from-red-500 via-red-600 to-rose-600 text-white shadow-[0_0_0_12px_rgba(239,68,68,0.16),0_30px_80px_rgba(239,68,68,0.28)] ${isArmed || isActive ? 'animate-pulse' : ''}`}
            >
              <span className="absolute inset-[-18px] rounded-full border border-red-200/70" />
              <span className="absolute inset-[-36px] rounded-full border border-red-100/60" />
              <span className="text-center">
                <div className="text-3xl font-semibold">SOS</div>
                <div className="mt-2 text-xs font-medium uppercase tracking-[0.3em] text-red-50/90">Press now</div>
              </span>
            </motion.button>

            <div className="mt-6 w-full max-w-md">
              <div className="flex items-center justify-between text-sm font-medium text-slate-600">
                <span>{statusLabel}</span>
                <span className="text-slate-400">{isArmed || isActive ? `${countdown}s` : 'Ready'}</span>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-red-500 to-rose-500 transition-all"
                  style={{ width: `${Math.max(8, (countdown / 5) * 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">Dispatch progress</p>
                <p className="text-lg font-semibold text-slate-900">{steps[stepIndex]}</p>
              </div>
              <div className="rounded-full bg-emerald-50 p-2 text-emerald-600">
                <ShieldCheck size={18} />
              </div>
            </div>
            <div className="mt-4 space-y-3">
              {steps.map((label, index) => (
                <div key={label} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm">
                  <div className={`h-2.5 w-2.5 rounded-full ${index <= stepIndex ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                  <span className={index <= stepIndex ? 'font-semibold text-slate-800' : 'text-slate-500'}>{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <MapPin size={16} className="text-blue-600" /> Current location
              </div>
              <p className="mt-2 text-sm text-slate-500">12.9716° N, 77.5946° E</p>
              <p className="mt-1 text-xs text-slate-400">GPS accuracy • ±3m</p>
            </div>
            <div className="rounded-[24px] border border-slate-200/80 bg-white p-4 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Wifi size={16} className="text-emerald-600" /> Network status
              </div>
              <p className="mt-2 text-sm text-slate-500">Stable mobile data</p>
              <p className="mt-1 text-xs text-slate-400">Battery 86% • 4 contacts online</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-[28px] border border-slate-200/80 bg-slate-900 p-6 text-white shadow-[0_20px_80px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Emergency instructions</p>
            <h2 className="mt-2 text-xl font-semibold">Stay calm and follow the guided response flow.</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-200">Keep your phone unlocked</div>
            <div className="rounded-2xl border border-white/10 bg-white/10 px-3 py-2 text-sm text-slate-200">Speak clearly if you can</div>
          </div>
        </div>
      </div>
    </PageShell>
  );
};

export default EmergencySosPage;
