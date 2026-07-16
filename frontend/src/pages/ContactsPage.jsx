import React, { useMemo, useState } from 'react';
import { MessageSquare, Phone, PlusCircle, Search, ShieldCheck, Sparkles } from 'lucide-react';
import PageShell from '../components/ui/PageShell';

const contacts = [
  { id: 1, name: 'Dr. Maya Rao', relationship: 'Primary doctor', phone: '+91 98765 43210', priority: 'Critical', avatar: 'MR' },
  { id: 2, name: 'Arjun Nair', relationship: 'Brother', phone: '+91 87654 32109', priority: 'High', avatar: 'AN' },
  { id: 3, name: 'Priya Menon', relationship: 'Emergency contact', phone: '+91 76543 21098', priority: 'Medium', avatar: 'PM' }
];

const ContactsPage = () => {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => contacts.filter((contact) => `${contact.name} ${contact.relationship}`.toLowerCase().includes(query.toLowerCase())), [query]);

  return (
    <PageShell
      eyebrow="Trusted contacts"
      title="Emergency Contacts"
      subtitle="Keep your support network instantly reachable and clearly prioritized."
      actions={[
        <button key="add" className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
          <span className="mr-2 inline-flex">+</span>Add contact
        </button>
      ]}
    >
      <div className="rounded-[28px] border border-slate-200/80 bg-white p-5 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2">
            <Search size={18} className="text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search contacts"
              className="w-full bg-transparent text-sm text-slate-700 outline-none sm:w-72"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">All</button>
            <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">Critical</button>
            <button className="rounded-full border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600">High</button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          {filtered.map((contact) => (
            <div key={contact.id} className="rounded-[24px] border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-600 to-emerald-500 font-semibold text-white">
                    {contact.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{contact.name}</p>
                    <p className="text-sm text-slate-500">{contact.relationship}</p>
                  </div>
                </div>
                <div className="rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                  {contact.priority}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                {contact.phone}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700">
                  <Phone size={15} /> Call
                </button>
                <button className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-100">
                  <MessageSquare size={15} /> SMS
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="mt-6 rounded-[24px] border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
            No contacts matched your search. Try a different name or relationship.
          </div>
        ) : null}
      </div>
    </PageShell>
  );
};

export default ContactsPage;
