import { useEffect, useState } from 'react';
import api from '../services/api';
import type { JobPosting } from '../types';
import { Briefcase, Plus, MapPin, DollarSign, Clock, XCircle } from 'lucide-react';

export default function Recruitment() {
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({
    title: '',
    description: '',
    requirements: '',
    location: '',
    salary_range: '',
    employment_type: 'full-time',
  });

  const fetchJobs = () => {
    api.get('/recruitment/jobs').then((r) => {
      setJobs(r.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchJobs(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/recruitment/jobs', form);
    setShowForm(false);
    setForm({ title: '', description: '', requirements: '', location: '', salary_range: '', employment_type: 'full-time' });
    fetchJobs();
  };

  const handleClose = async (id: number) => {
    await api.put(`/recruitment/jobs/${id}/close`);
    fetchJobs();
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Recruitment</h1>
          <p className="text-gray-500">Manage job postings and openings</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Post New Job
        </button>
      </div>

      {showForm && (
        <div className="card mb-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Create Job Posting</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
              <input type="text" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
              <input type="text" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className="input-field" placeholder="e.g., Remote, New York" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Salary Range</label>
              <input type="text" value={form.salary_range} onChange={(e) => setForm({ ...form, salary_range: e.target.value })} className="input-field" placeholder="e.g., $80k - $120k" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select value={form.employment_type} onChange={(e) => setForm({ ...form, employment_type: e.target.value })} className="input-field">
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="internship">Internship</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-field h-24" required />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Requirements</label>
              <textarea value={form.requirements} onChange={(e) => setForm({ ...form, requirements: e.target.value })} className="input-field h-24" />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Create Posting</button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div key={job.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <div className="w-11 h-11 bg-indigo-100 rounded-xl flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-indigo-600" />
                </div>
                <span className={`badge ${job.is_active ? 'badge-success' : 'badge-danger'}`}>
                  {job.is_active ? 'Active' : 'Closed'}
                </span>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{job.title}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{job.description}</p>
              <div className="space-y-2 text-sm text-gray-600">
                {job.location && (
                  <div className="flex items-center gap-2"><MapPin className="w-4 h-4 text-gray-400" />{job.location}</div>
                )}
                {job.salary_range && (
                  <div className="flex items-center gap-2"><DollarSign className="w-4 h-4 text-gray-400" />{job.salary_range}</div>
                )}
                <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-gray-400" />{job.employment_type}</div>
              </div>
              {job.is_active && (
                <button onClick={() => handleClose(job.id)} className="mt-4 text-sm text-red-600 hover:text-red-800 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> Close Position
                </button>
              )}
            </div>
          ))}
          {jobs.length === 0 && (
            <div className="col-span-full text-center py-12 text-gray-400">
              No job postings yet. Create one to get started.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
