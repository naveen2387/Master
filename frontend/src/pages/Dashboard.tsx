import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import type { DashboardStats, EmployeeDashboard } from '../types';
import {
  Users,
  Building2,
  Clock,
  CalendarDays,
  Briefcase,
  DollarSign,
  BarChart3,
  TrendingUp,
  UserPlus,
  FileText,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from 'recharts';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [empStats, setEmpStats] = useState<EmployeeDashboard | null>(null);

  useEffect(() => {
    if (user?.role === 'employee') {
      api.get('/dashboard/employee-stats').then((r) => setEmpStats(r.data));
    }
    api.get('/dashboard/stats').then((r) => setStats(r.data));
  }, [user]);

  if (!stats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
      </div>
    );
  }

  const attendanceData = [
    { name: 'Present', value: stats.present_today, color: '#10b981' },
    { name: 'Absent', value: stats.absent_today, color: '#ef4444' },
  ];

  const monthlyData = [
    { month: 'Jan', employees: 45, hires: 3 },
    { month: 'Feb', employees: 48, hires: 5 },
    { month: 'Mar', employees: 52, hires: 4 },
    { month: 'Apr', employees: 55, hires: 6 },
    { month: 'May', employees: 58, hires: 3 },
    { month: 'Jun', employees: stats.total_employees, hires: stats.new_hires_this_month },
  ];

  const performanceData = [
    { dept: 'Engineering', rating: 4.2 },
    { dept: 'Marketing', rating: 3.8 },
    { dept: 'Sales', rating: 4.0 },
    { dept: 'Finance', rating: 4.1 },
    { dept: 'Product', rating: 3.9 },
    { dept: 'HR', rating: 4.3 },
  ];

  const isAdmin = user?.role === 'admin';
  const isManager = user?.role === 'senior_manager';
  const isHR = user?.role === 'hr_recruiter';
  const isEmployee = user?.role === 'employee';

  return (
    <div className="animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Welcome back, {user?.full_name?.split(' ')[0]}
        </h1>
        <p className="text-gray-500 mt-1">
          Here's what's happening in your organization today
        </p>
      </div>

      {/* Employee-specific dashboard */}
      {isEmployee && empStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard icon={Clock} label="Attendance This Month" value={empStats.attendance_this_month} color="bg-blue-500" />
          <StatCard icon={CalendarDays} label="Pending Leaves" value={empStats.pending_leaves} color="bg-amber-500" />
          <StatCard icon={BarChart3} label="Performance Rating" value={empStats.latest_rating?.toFixed(1) || 'N/A'} color="bg-emerald-500" />
          <StatCard icon={DollarSign} label="Latest Salary" value={empStats.latest_salary ? `$${empStats.latest_salary.toLocaleString()}` : 'N/A'} color="bg-purple-500" />
        </div>
      )}

      {/* Admin / Manager stats */}
      {(isAdmin || isManager || isHR) && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Users} label="Total Employees" value={stats.total_employees} color="bg-indigo-500" />
            <StatCard icon={Building2} label="Departments" value={stats.total_departments} color="bg-cyan-500" />
            <StatCard icon={Clock} label="Present Today" value={stats.present_today} color="bg-emerald-500" />
            <StatCard icon={CalendarDays} label="Pending Leaves" value={stats.pending_leaves} color="bg-amber-500" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard icon={Briefcase} label="Open Positions" value={stats.open_positions} color="bg-purple-500" />
            <StatCard icon={FileText} label="Applications" value={stats.total_applications} color="bg-pink-500" />
            <StatCard icon={TrendingUp} label="Avg Performance" value={stats.avg_performance.toFixed(1)} color="bg-teal-500" />
            <StatCard icon={UserPlus} label="New Hires (Month)" value={stats.new_hires_this_month} color="bg-orange-500" />
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Attendance Pie */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Today's Attendance</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={attendanceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    dataKey="value"
                    label={({ name, value }) => `${name}: ${value}`}
                  >
                    {attendanceData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Employee Growth */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Employee Growth</h3>
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Area type="monotone" dataKey="employees" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Department Performance */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Department Performance</h3>
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={performanceData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="dept" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 5]} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="rating" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Payroll Summary */}
            {(isAdmin || isHR) && (
              <div className="card">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Payroll Summary</h3>
                <div className="flex flex-col items-center justify-center h-64">
                  <DollarSign className="w-16 h-16 text-indigo-200 mb-4" />
                  <p className="text-4xl font-bold text-gray-900">
                    ${stats.payroll_this_month.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">Total payroll this month</p>
                  <div className="flex gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-lg font-semibold text-emerald-600">{stats.total_employees}</p>
                      <p className="text-xs text-gray-500">Employees</p>
                    </div>
                    <div className="text-center">
                      <p className="text-lg font-semibold text-indigo-600">
                        ${stats.total_employees > 0 ? Math.round(stats.payroll_this_month / stats.total_employees).toLocaleString() : 0}
                      </p>
                      <p className="text-xs text-gray-500">Avg/Employee</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div className="card flex items-center gap-4 hover:shadow-md transition-shadow">
      <div className={`${color} w-12 h-12 rounded-xl flex items-center justify-center shrink-0`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-sm text-gray-500">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}
