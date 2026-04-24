import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Employee, Department } from '../types';
import { Search, Phone } from 'lucide-react';

export default function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchEmployees = () => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (deptFilter) params.department_id = deptFilter;
    api.get('/employees/', { params }).then((r) => {
      setEmployees(r.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    api.get('/departments/').then((r) => setDepartments(r.data));
    fetchEmployees();
  }, []);

  useEffect(() => {
    const timer = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(timer);
  }, [search, deptFilter]);

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Employees</h1>
          <p className="text-gray-500">Manage your workforce</p>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search employees..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="input-field w-full sm:w-48"
          >
            <option value="">All Departments</option>
            {departments.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Table */}
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
                <th>ID</th>
                <th>Department</th>
                <th>Designation</th>
                <th>Contact</th>
                <th>Joined</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {employees.map((emp) => (
                <tr key={emp.id} className="animate-fade-in">
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center text-sm font-semibold">
                        {emp.user?.full_name?.charAt(0) || '?'}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{emp.user?.full_name}</p>
                        <p className="text-xs text-gray-500">{emp.user?.email}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge bg-gray-100 text-gray-700">{emp.employee_id}</span>
                  </td>
                  <td>{emp.department?.name || '—'}</td>
                  <td>{emp.designation || '—'}</td>
                  <td>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      {emp.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3" />
                          {emp.phone}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="text-sm">{emp.date_of_joining || '—'}</td>
                  <td>
                    <span className={`badge ${emp.user?.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {emp.user?.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
              {employees.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-400">
                    No employees found
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
