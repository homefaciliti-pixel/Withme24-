import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  User,
  Calendar,
  CreditCard,
  AlertOctagon,
  FileCheck,
  MapPin,
  History,
  Shield,
  Briefcase,
  LayoutDashboard,
} from 'lucide-react';

interface SidebarProps {
  type: 'customer' | 'companion' | 'admin';
}

export const Sidebar: React.FC<SidebarProps> = ({ type }) => {
  const activeClass = 'flex items-center gap-3 px-4 py-2.5 bg-brand-50 text-brand-700 text-xs font-bold rounded-lg border-l-4 border-brand-600 transition-all';
  const inactiveClass = 'flex items-center gap-3 px-4 py-2.5 text-slate-600 hover:bg-slate-50 hover:text-slate-900 text-xs font-medium rounded-lg transition-all';

  const customerLinks = [
    { label: 'Overview', path: '/dashboard', icon: LayoutDashboard },
    { label: 'My Bookings', path: '/dashboard/bookings', icon: Calendar },
    { label: 'Profile & Blocked', path: '/dashboard/profile', icon: User },
    { label: 'Safety Settings', path: '/safety', icon: Shield },
  ];

  const companionLinks = [
    { label: 'Overview', path: '/companion-dashboard', icon: LayoutDashboard },
    { label: 'My Bookings', path: '/companion-dashboard/bookings', icon: Calendar },
    { label: 'Edit Profile & Activities', path: '/companion-dashboard/profile', icon: Briefcase },
    { label: 'Calendar Availability', path: '/companion-dashboard/availability', icon: History },
    { label: 'Earnings & Payouts', path: '/companion-dashboard/earnings', icon: CreditCard },
    { label: 'KYC Verification', path: '/companion-dashboard/verification', icon: FileCheck },
  ];

  const adminLinks = [
    { label: 'Admin Panel Overview', path: '/admin', icon: LayoutDashboard },
    { label: 'KYC Document Requests', path: '/admin/kyc', icon: FileCheck },
    { label: 'Moderation Cases', path: '/admin/reports', icon: AlertOctagon },
    { label: 'Settle Payouts', path: '/admin/payouts', icon: CreditCard },
    { label: 'Auditing Logs', path: '/admin/audit-logs', icon: History },
    { label: 'Metadata Manager', path: '/admin/metadata', icon: MapPin },
  ];

  const links = type === 'admin' ? adminLinks : type === 'companion' ? companionLinks : customerLinks;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 hidden md:block shrink-0 min-h-[calc(100vh-4rem)] p-4 space-y-4">
      <div className="text-[10px] uppercase tracking-wider font-extrabold text-slate-400 px-4">
        {type} Panel
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.path}
              to={link.path}
              end
              className={({ isActive }) => (isActive ? activeClass : inactiveClass)}
            >
              <Icon size={16} />
              {link.label}
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};
