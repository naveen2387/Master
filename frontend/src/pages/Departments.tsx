import { useEffect, useState } from 'react';
import api from '../services/api';
import type { Department } from '../types';
import { Building2, Plus, Trash2 } from 'lucide-react';

export default function Departments() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchDepts = () => {
    api.get('/departments/').then((r) => {
      setDepartments(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchDepts(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/departments/', { name, description });
    setName('');
    setDescription('');
    setShowForm(false);
    fetchDepts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this department?')) return;
    await api.delete(`/departments/${id}`);
    fetchDepts();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Departments</h1>
          <p className="text-gray-500">Organize your company structure</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Add Department
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">New Department</h3>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Department name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input-field flex-1"
              required
            />
            <input
              type="text"
              placeholder="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field flex-1"
            />
            <button type="submit" className="btn-primary whitespace-nowrap">Create</button>
          </form>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept) => (
            <div key={dept.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-indigo-600" />
                </div>
                <button
                  onClick={() => handleDelete(dept.id)}
                  className="text-gray-400 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">{dept.name}</h3>
              <p className="text-sm text-gray-500 mt-1">{dept.description || 'No description'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
