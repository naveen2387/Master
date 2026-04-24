import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Users,
  Building2,
  Clock,
  CalendarDays,
  DollarSign,
  BarChart3,
  Briefcase,
  LogOut,
  Bot,
  Shield,
} from 'lucide-react';

const roleLabels: Record<string, string> = {
  admin: 'Management Admin',
  senior_manager: 'Senior Manager',
  hr_recruiter: 'HR Recruiter',
  employee: 'Employee',
};

export default function Sidebar() {
  const { user, logout } = useAuth();
  const role = user?.role || 'employee';

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'senior_manager', 'hr_recruiter', 'employee'] },
    { to: '/employees', icon: Users, label: 'Employees', roles: ['admin', 'senior_manager', 'hr_recruiter'] },
    { to: '/departments', icon: Building2, label: 'Departments', roles: ['admin', 'senior_manager'] },
    { to: '/attendance', icon: Clock, label: 'Attendance', roles: ['admin', 'senior_manager', 'hr_recruiter', 'employee'] },
    { to: '/leaves', icon: CalendarDays, label: 'Leave Mgmt', roles: ['admin', 'senior_manager', 'hr_recruiter', 'employee'] },
    { to: '/payroll', icon: DollarSign, label: 'Payroll', roles: ['admin', 'hr_recruiter', 'employee'] },
    { to: '/performance', icon: BarChart3, label: 'Performance', roles: ['admin', 'senior_manager', 'employee'] },
    { to: '/recruitment', icon: Briefcase, label: 'Recruitment', roles: ['admin', 'hr_recruiter'] },
    { to: '/ai-screening', icon: Bot, label: 'AI Screening', roles: ['admin', 'hr_recruiter'] },
  ];

  const filtered = navItems.filter((item) => item.roles.includes(role));

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-indigo-950 to-indigo-900 text-white flex flex-col z-50">
      <div className="p-6 border-b border-indigo-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">AI-HRMS</h1>
            <p className="text-xs text-indigo-300">Smart HR Platform</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        <div className="space-y-1">
          {filtered.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-indigo-600/80 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-indigo-200 hover:bg-indigo-800/50 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      <div className="p-4 border-t border-indigo-800/50">
        <div className="flex items-center gap-3 mb-3 px-2">
          <div className="w-9 h-9 bg-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
            {user?.full_name?.charAt(0) || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.full_name}</p>
            <p className="text-xs text-indigo-300 truncate">{roleLabels[role]}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-indigo-200 hover:text-white hover:bg-indigo-800/50 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </aside>
  );
}
