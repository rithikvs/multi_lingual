import React from 'react';
import { motion } from 'framer-motion';

const MetricCard = ({ label, value, icon: Icon, accent = 'blue', note }) => {
  const accentClasses = {
    blue: 'from-blue-600/10 to-blue-500/5 text-blue-700',
    green: 'from-emerald-600/10 to-emerald-500/5 text-emerald-700',
    red: 'from-red-600/10 to-red-500/5 text-red-700',
    amber: 'from-amber-600/10 to-amber-500/5 text-amber-700',
    slate: 'from-slate-600/10 to-slate-500/5 text-slate-700'
  };

  return (
    <motion.article
      whileHover={{ y: -4, scale: 1.01 }}
      className="rounded-[24px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
    >
      <div className={`inline-flex rounded-2xl bg-gradient-to-br ${accentClasses[accent]} p-3`}>
        <Icon size={20} />
      </div>
      <div className="mt-4">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
        {note ? <p className="mt-2 text-sm text-slate-500">{note}</p> : null}
      </div>
    </motion.article>
  );
};

export default MetricCard;
