import React, { useEffect, useState } from 'react';
import { Sidebar } from '../../components/Layout/Sidebar';
import { ShieldAlert, Users, Calendar, DollarSign, AlertCircle, FileCheck } from 'lucide-react';
import api from '../../services/api';

interface Stats {
  totalUsers: number;
  totalCompanions: number;
  verifiedCompanions: number;
  pendingKYC: number;
  todayBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalRevenue: number;
  totalCommission: number;
  companionEarnings: number;
  pendingPayouts: number;
  openReports: number;
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get('/admin/analytics')
      .then((res) => {
        if (res.data.success) setStats(res.data.data);
      })
      .catch((e) => console.error('Failed to load admin analytics', e))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="flex bg-slate-50 min-h-[calc(100vh-4rem)]">
      <Sidebar type="admin" />

      <main className="flex-grow p-6 space-y-6 max-w-5xl">
        <div className="bg-white border border-slate-200 p-6 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold text-slate-800 flex items-center gap-1.5 font-sans">
            <Shield className="text-brand-600" size={22} /> Platform Operations Control Room
          </h2>
          <p className="text-xs text-slate-500 mt-1">Global administrative overview of users, bookings, safety parameters, and financial records.</p>
        </div>

        {loading ? (
          <div className="text-center text-xs text-slate-400 py-16 animate-pulse">Syncing metrics database...</div>
        ) : stats ? (
          <div className="space-y-6">
            {/* Action Warnings */}
            {(stats.pendingKYC > 0 || stats.openReports > 0 || stats.pendingPayouts > 0) && (
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-amber-800 flex items-center gap-1.5">
                  <AlertCircle size={16} /> Attention Required
                </h4>
                <ul className="text-[11px] text-amber-700 list-disc pl-5 font-semibold space-y-1">
                  {stats.pendingKYC > 0 && <li>There are {stats.pendingKYC} companion KYC requests awaiting audit approval.</li>}
                  {stats.openReports > 0 && <li>There are {stats.openReports} open member safety complaints awaiting investigation.</li>}
                  {stats.pendingPayouts > 0 && <li>There are {stats.pendingPayouts} companion withdrawal payouts awaiting settlement.</li>}
                </ul>
              </div>
            )}

            {/* Grid Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {/* Total Users */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider">Total Users</span>
                  <Users size={16} />
                </div>
                <div className="text-xl font-black text-slate-800">{stats.totalUsers}</div>
              </div>

              {/* Total Companions */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider">Verified hosts</span>
                  <Users size={16} />
                </div>
                <div className="text-xl font-black text-slate-800">
                  {stats.verifiedCompanions} / {stats.totalCompanions}
                </div>
              </div>

              {/* Revenue */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider">Total Revenue</span>
                  <DollarSign size={16} />
                </div>
                <div className="text-xl font-black text-slate-800">₹{stats.totalRevenue.toFixed(0)}</div>
              </div>

              {/* Commission */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1 flex flex-col justify-between">
                <div className="flex justify-between items-center text-emerald-500">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-slate-400">Platform cut</span>
                  <DollarSign size={16} />
                </div>
                <div className="text-xl font-black text-emerald-600">₹{stats.totalCommission.toFixed(0)}</div>
              </div>
            </div>

            {/* Sub statistics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
                <div className="text-[9px] uppercase font-extrabold text-slate-400">Today Bookings</div>
                <div className="text-lg font-bold text-slate-850">{stats.todayBookings} Outings</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
                <div className="text-[9px] uppercase font-extrabold text-slate-400">Completed Sessions</div>
                <div className="text-lg font-bold text-slate-850">{stats.completedBookings} Outings</div>
              </div>
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-1">
                <div className="text-[9px] uppercase font-extrabold text-slate-400">Cancelled Bookings</div>
                <div className="text-lg font-bold text-slate-850">{stats.cancelledBookings} Outings</div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-xs text-slate-400 text-center">Failed to fetch platform metrics.</div>
        )}
      </main>
    </div>
  );
};

// Help icon helper
const Shield: React.FC<{ size: number; className?: string }> = ({ size, className }) => {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z"/></svg>
  );
};
