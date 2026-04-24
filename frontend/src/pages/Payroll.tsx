import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Payroll as PayrollType } from '../types';
import { DollarSign, TrendingUp, FileText } from 'lucide-react';

const monthNames = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function Payroll() {
  const [records, setRecords] = useState<PayrollType[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payroll/').then((r) => {
      setRecords(r.data);
      setLoading(false);
    });
  }, []);

  const totalNet = records.reduce((sum, r) => sum + r.net_salary, 0);

  const statusColors: Record<string, string> = {
    draft: 'badge bg-gray-100 text-gray-700',
    processed: 'badge-warning',
    paid: 'badge-success',
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Payroll</h1>
          <p className="text-gray-500">Salary and compensation management</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <FileText className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Records</p>
            <p className="text-xl font-bold">{records.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <DollarSign className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Net Pay</p>
            <p className="text-xl font-bold text-emerald-600">${totalNet.toLocaleString()}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <TrendingUp className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Salary</p>
            <p className="text-xl font-bold text-amber-600">
              ${records.length > 0 ? Math.round(totalNet / records.length).toLocaleString() : 0}
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
                <th>Employee</th>
                <th>Period</th>
                <th>Basic</th>
                <th>Allowances</th>
                <th>Deductions</th>
                <th>Tax</th>
                <th>Net Salary</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {records.map((rec) => (
                <tr key={rec.id}>
                  <td>Emp #{rec.employee_id}</td>
                  <td>{monthNames[rec.month]} {rec.year}</td>
                  <td>${rec.basic_salary.toLocaleString()}</td>
                  <td className="text-emerald-600">+${rec.allowances.toLocaleString()}</td>
                  <td className="text-red-600">-${rec.deductions.toLocaleString()}</td>
                  <td className="text-red-600">-${rec.tax.toLocaleString()}</td>
                  <td className="font-semibold">${rec.net_salary.toLocaleString()}</td>
                  <td>
                    <span className={statusColors[rec.status] || 'badge'}>{rec.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
