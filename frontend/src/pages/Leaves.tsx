import { useEffect, useState } from 'react';
import api from '../services/api';
import type { LeaveRequest } from '../types';
import { useAuth } from '../context/AuthContext';
import { Plus, Check, X } from 'lucide-react';

export default function Leaves() {
  const { user } = useAuth();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    leave_type: 'Annual',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const fetchLeaves = () => {
    api.get('/leaves/').then((r) => {
      setLeaves(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchLeaves(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/leaves/', form);
    setShowForm(false);
    setForm({ leave_type: 'Annual', start_date: '', end_date: '', reason: '' });
    fetchLeaves();
  };

  const handleApprove = async (id: number) => {
    await api.put(`/leaves/${id}/approve`);
    fetchLeaves();
  };

  const handleReject = async (id: number) => {
    await api.put(`/leaves/${id}/reject`);
    fetchLeaves();
  };

  const statusColors: Record<string, string> = {
    pending: 'badge-warning',
    approved: 'badge-success',
    rejected: 'badge-danger',
  };

  const canApprove = user?.role !== 'employee';

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Leave Management</h1>
          <p className="text-gray-500">Manage leave requests</p>
        </div>
        {user?.role === 'employee' && (
          <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Request Leave
          </button>
        )}
      </div>

      {showForm && (
        <div className="card mb-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">New Leave Request</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Leave Type</label>
              <select
                value={form.leave_type}
                onChange={(e) => setForm({ ...form, leave_type: e.target.value })}
                className="input-field"
              >
                <option>Annual</option>
                <option>Sick</option>
                <option>Personal</option>
                <option>Maternity</option>
                <option>Bereavement</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
              <input
                type="text"
                value={form.reason}
                onChange={(e) => setForm({ ...form, reason: e.target.value })}
                className="input-field"
                placeholder="Reason for leave"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                className="input-field"
                required
              />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Submit Request</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="table-container bg-white">
          <table className="data-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Type</th>
                <th>Start</th>
                <th>End</th>
                <th>Reason</th>
                <th>Status</th>
                {canApprove && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {leaves.map((leave) => (
                <tr key={leave.id}>
                  <td>Emp #{leave.employee_id}</td>
                  <td>
                    <span className="badge bg-indigo-100 text-indigo-700">{leave.leave_type}</span>
                  </td>
                  <td>{leave.start_date}</td>
                  <td>{leave.end_date}</td>
                  <td className="text-gray-500">{leave.reason || '—'}</td>
                  <td>
                    <span className={statusColors[leave.status] || 'badge'}>{leave.status}</span>
                  </td>
                  {canApprove && (
                    <td>
                      {leave.status === 'pending' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApprove(leave.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleReject(leave.id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {leaves.length === 0 && (
                <tr>
                  <td colSpan={canApprove ? 7 : 6} className="text-center py-8 text-gray-400">
                    No leave requests found
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
