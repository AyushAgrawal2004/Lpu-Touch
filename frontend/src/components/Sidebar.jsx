import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';
import {
  LayoutDashboard, Users, BookOpen, AlertTriangle, FileText,
  LogOut, GraduationCap, Calendar, ShieldAlert, ClipboardList,
  ChevronRight, Bell, Zap
} from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [hoveredLink, setHoveredLink] = useState(null);

  const teacherLinks = [
    { name: 'Dashboard',      path: '/teacher-dashboard',           icon: LayoutDashboard, end: true },
    { name: 'Timetable',      path: '/teacher-dashboard/timetable', icon: Calendar },
    { name: 'Assessments',    path: '/teacher-dashboard/tests',     icon: ClipboardList },
    { name: 'Attendance',     path: '/teacher-dashboard/attendance',icon: BookOpen },
    { name: 'Students',       path: '/teacher-dashboard/students',  icon: Users },
    { name: 'Discipline',     path: '/teacher-dashboard/discipline',icon: AlertTriangle },
    { name: 'Study Files',    path: '/teacher-dashboard/files',     icon: FileText },
  ];

  if (user?.role === 'teacher' && user?.isAdmin) {
    teacherLinks.push({ name: 'Admin Portal', path: '/teacher-dashboard/admin', icon: ShieldAlert });
  }

  const studentLinks = [
    { name: 'Dashboard',         path: '/student-dashboard',           icon: LayoutDashboard, end: true },
    { name: 'Timetable',         path: '/student-dashboard/timetable', icon: Calendar },
    { name: 'Assessments',       path: '/student-dashboard/tests',     icon: ClipboardList },
    { name: 'My Attendance',     path: '/student-dashboard/attendance',icon: BookOpen },
    { name: 'Notices',           path: '/student-dashboard/discipline',icon: AlertTriangle },
    { name: 'Study Materials',   path: '/student-dashboard/files',     icon: FileText },
  ];

  const links = user?.role === 'teacher' ? teacherLinks : studentLinks;
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="sidebar flex flex-col w-64 h-full flex-shrink-0">
      {/* Logo */}
      <div className="px-6 py-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, hsl(243 75% 65%), hsl(280 70% 60%))' }}>
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">LPU Touch</h1>
            <p className="text-xs mt-0.5" style={{ color: 'hsl(220 15% 55%)' }}>
              {user?.role === 'teacher' ? 'Faculty Portal' : 'Student Portal'}
            </p>
          </div>
        </div>
      </div>

      {/* User Info Banner */}
      <div className="mx-4 mb-5 p-3 rounded-xl" style={{ background: 'hsl(243 50% 20% / 0.5)', border: '1px solid hsl(243 50% 30% / 0.4)' }}>
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0"
            style={{ background: 'linear-gradient(135deg, hsl(243 75% 59%), hsl(280 70% 55%))' }}>
            {initials}
          </div>
          <div className="overflow-hidden">
            <p className="text-white text-sm font-semibold truncate leading-tight">{user?.name}</p>
            <p className="text-xs capitalize mt-0.5" style={{ color: 'hsl(220 15% 55%)' }}>
              {user?.isAdmin ? 'Administrator' : user?.role}
            </p>
          </div>
          {user?.isAdmin && (
            <div className="ml-auto">
              <Zap className="w-4 h-4" style={{ color: 'hsl(48 90% 65%)' }} />
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto px-3">
        <p className="text-xs font-semibold uppercase tracking-widest px-3 mb-3" style={{ color: 'hsl(220 15% 40%)' }}>
          Menu
        </p>
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.end}
                className={({ isActive }) =>
                  `sidebar-link ${isActive ? 'active' : ''}`
                }
                onMouseEnter={() => setHoveredLink(link.name)}
                onMouseLeave={() => setHoveredLink(null)}
              >
                <Icon className="w-4.5 h-4.5 mr-3 flex-shrink-0" style={{ width: '1.1rem', height: '1.1rem' }} />
                <span className="flex-1">{link.name}</span>
                <ChevronRight className="w-3.5 h-3.5 opacity-40" />
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer */}
      <div className="p-4 mt-2">
        <div className="h-px mb-4" style={{ background: 'hsl(243 50% 22% / 0.6)' }} />
        <button
          onClick={() => { logout(); navigate('/login'); }}
          className="sidebar-link w-full group"
          style={{ color: 'hsl(0 70% 70%)' }}
        >
          <LogOut className="mr-3 flex-shrink-0" style={{ width: '1.1rem', height: '1.1rem' }} />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
