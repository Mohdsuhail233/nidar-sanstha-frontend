import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../App';
import { FormCount, Role, Customer } from '../types';
import {
  PlusCircle,
  Search,
  FileText,
  Clock,
  ArrowRight,
  Loader2,
  UserPlus,
  CalendarDays,
  TrendingUp,
  Users,
  ChevronRight,
  ShieldCheck,
  Activity,
  Cpu
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [counts, setCounts] = useState<FormCount | null>(null);
  const [recentPatients, setRecentPatients] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [countsRes, patientsRes] = await Promise.all([
          api.get('/form/my-count'),
          user?.role !== Role.FIELD_STAFF ? api.get('/form/all') : Promise.resolve({ data: [] })
        ]);
        setCounts(countsRes.data);
        if (user?.role !== Role.FIELD_STAFF) {
          setRecentPatients(Array.isArray(patientsRes.data) ? patientsRes.data.slice(0, 5) : []);
        }
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [user]);

  const stats = [
    {
      label: "Today's Forms",
      value: counts?.today || 0,
      icon: <Clock size={24} />,
      color: "bg-blue-50 text-blue-500",
      badge: "Today"
    },
    {
      label: "Monthly Progress",
      value: counts?.monthly || 0,
      icon: <CalendarDays size={24} />,
      color: "bg-indigo-50 text-indigo-500",
      badge: "This Month"
    },
    {
      label: "Total Registrations",
      value: counts?.total || 0,
      icon: <TrendingUp size={24} />,
      color: "bg-emerald-50 text-emerald-500",
      badge: "Overall"
    },
  ];

  const quickActions = [
    { label: 'New Patient', path: '/customers/create', icon: <PlusCircle size={22} />, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FIELD_STAFF] },
    { label: 'Search Data', path: '/customers/list', icon: <Search size={22} />, roles: [Role.SUPER_ADMIN, Role.ADMIN] },
    { label: 'Daily Survey', path: '/surveys/list', icon: <FileText size={22} />, roles: [Role.SUPER_ADMIN, Role.ADMIN, Role.FIELD_STAFF] },
    { label: 'Staff Entry', path: '/staff/create', icon: <UserPlus size={22} />, roles: [Role.SUPER_ADMIN, Role.ADMIN] },
  ].filter(action => action.roles.includes(user!.role));

  const formattedDate = new Intl.DateTimeFormat('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date());

  const isFieldStaff = user?.role === Role.FIELD_STAFF;

  return (
    <div className="space-y-10 animate-in fade-in duration-700 max-w-7xl mx-auto px-4 pb-20">

      {/* HEADER SECTION - NO NAME, ONLY ID & ACTIVE DOT */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-gray-100 pb-10">
        <div className="flex items-center gap-6">
          {/* Tech Chip Icon */}
          <img 
            src="/DUA E KHAIR Logo.png" 
            alt="Dua-E-Khair Foundation Logo" 
            className="w-16 h-16 rounded-[1.5rem] object-contain shadow-2xl transition-transform hover:scale-105"
          />

          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-gray-900 tracking-tighter uppercase">
                ID: <span className="text-blue-600 tracking-widest">{user?.employeeId || 'NIDAR-NODE'}</span>
              </h1>
            </div>

            <div className="flex items-center gap-4">
              {/* Green Dot Indicator */}
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
                <span className="text-[10px] uppercase font-black text-emerald-600 tracking-widest">Active</span>
              </div>

              <span className="text-gray-200">|</span>

              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Node: <span className="text-gray-900">Operational</span>
              </p>

              <span className="text-gray-200 hidden md:inline">|</span>

              <span className="hidden md:inline bg-gray-100 px-2 py-0.5 rounded text-[10px] text-gray-500 font-black uppercase border border-gray-200">
                {user?.role?.replace('ROLE_', '').replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 px-6 py-4 bg-white border border-gray-100 rounded-2xl shadow-sm text-gray-500 font-black text-xs uppercase tracking-widest">
          <CalendarDays size={18} className="text-blue-500" />
          {formattedDate}
        </div>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col gap-6 hover:shadow-xl hover:-translate-y-1 transition-all group">
            <div className={`w-12 h-12 ${stat.color} rounded-2xl flex items-center justify-center`}>
              {stat.icon}
            </div>
            <div>
              <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">{stat.label}</p>
              <div className="flex items-center gap-4">
                <h3 className="text-5xl font-black text-gray-900">
                  {loading ? <Loader2 className="animate-spin text-gray-200" size={32} /> : stat.value}
                </h3>
                <span className="bg-blue-50 text-blue-600 text-[9px] font-black uppercase px-2 py-1 rounded-md border border-blue-100">
                  {stat.badge}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* RECENT DATA & QUICK ACTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {!isFieldStaff ? (
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between px-2">
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-widest flex items-center gap-3">
                <Users size={24} className="text-blue-500" />
                Patient Data
              </h2>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-sm overflow-hidden p-2">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black text-gray-400 uppercase tracking-widest">
                    <th className="px-6 py-5">Node Entry</th>
                    <th className="px-6 py-5">Serial Hash</th>
                    <th className="px-6 py-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {recentPatients.map(p => (
                    <tr key={p.id} className="group hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-5 font-bold text-gray-800 uppercase text-sm">{p.name}</td>
                      <td className="px-6 py-5 text-xs font-black text-blue-600 tracking-tighter">{p.memberIdNo || 'ID-PENDING'}</td>
                      <td className="px-6 py-5 text-right">
                        <Link to={`/customers/view/${p.id}`} className="inline-flex p-2 bg-gray-50 rounded-xl text-gray-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                          <ChevronRight size={18} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-gray-900 rounded-[3rem] p-12 text-white shadow-2xl flex flex-col justify-center gap-6 relative overflow-hidden group">
              <ShieldCheck size={140} className="absolute -right-10 -bottom-10 opacity-10 group-hover:scale-110 transition-transform duration-700" />
              <Activity size={48} className="text-blue-500" />
              <h2 className="text-4xl font-black uppercase tracking-tighter leading-none">Field Terminal <br />Operational</h2>
              <p className="font-bold text-gray-400 text-lg max-w-md leading-relaxed italic">
                "Operational registry visibility restricted. Node access granted for decentralized data entry and survey synchronization only."
              </p>
              <Link to="/customers/create" className="inline-flex items-center gap-3 bg-blue-600 text-white w-fit px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg active:scale-95 transition-all">
                <PlusCircle size={18} /> New Patient Entry
              </Link>
            </div>
          </div>
        )}

        <div className="lg:col-span-4 space-y-10">
          <section className="space-y-6">
            <h2 className="text-sm font-black text-gray-400 uppercase tracking-widest px-2 text-center md:text-left">Quick Commands</h2>
            <div className="grid grid-cols-1 gap-4">
              {quickActions.map((action, i) => (
                <Link
                  key={i}
                  to={action.path}
                  className="group p-5 bg-white border border-gray-100 rounded-3xl shadow-sm hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-gray-50 text-gray-400 group-hover:bg-blue-50 group-hover:text-blue-500 rounded-xl transition-all">
                      {action.icon}
                    </div>
                    <span className="font-black text-gray-700 group-hover:text-blue-600 transition-colors text-[11px] uppercase tracking-widest">{action.label}</span>
                  </div>
                  <ArrowRight size={18} className="text-gray-100 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </Link>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;