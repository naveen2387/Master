import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Attendance as AttendanceType } from '../types';
import { Clock, LogIn, LogOut, Calendar } from 'lucide-react';

export default function Attendance() {
  const [records, setRecords] = useState<AttendanceType[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendance = () => {
    api.get('/attendance/').then((r) => {
      setRecords(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchAttendance(); }, []);

  const statusColors: Record<string, string> = {
    present: 'badge-success',
    late: 'badge-warning',
    absent: 'badge-danger',
    half_day: 'badge-info',
    on_leave: 'badge-info',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Attendance</h1>
          <p className="text-gray-500">Track daily attendance records</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-xl font-bold">{records.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <LogIn className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Present</p>
            <p className="text-xl font-bold text-green-600">
              {records.filter((r) => r.status === 'present').length}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Late</p>
            <p className="text-xl font-bold text-amber-600">
              {records.filter((r) => r.status === 'late').length}
            </p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
            <LogOut className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Absent</p>
            <p className="text-xl font-bold text-red-600">
              {records.filter((r) => r.status === 'absent').length}
            </p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="table-container bg-white">
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Employee ID</th>
                <th>Check In</th>
                <th>Check Out</th>
                <th>Hours</th>
                <th>Status</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {rec.date}
                    </div>
                  </td>
                  <td>{rec.employee_id}</td>
                  <td>
                    {rec.check_in
                      ? new Date(rec.check_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td>
                    {rec.check_out
                      ? new Date(rec.check_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                      : '—'}
                  </td>
                  <td>
                    <span className="font-medium">{rec.hours_worked > 0 ? `${rec.hours_worked}h` : '—'}</span>
                  </td>
                  <td>
                    <span className={statusColors[rec.status] || 'badge bg-gray-100 text-gray-700'}>
                      {rec.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="text-gray-500 text-sm">{rec.notes || '—'}</td>
                </tr>
              ))}
              {records.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No attendance records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
