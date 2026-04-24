import { useEffect, useState } from 'react';
import api from '../services/api';
import type { JobApplication, JobPosting } from '../types';
import { Bot, FileSearch, AlertTriangle, CheckCircle, Send, Sparkles } from 'lucide-react';

export default function AIScreening() {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [screening, setScreening] = useState<number | null>(null);
  const [showApply, setShowApply] = useState(false);
  const [applyForm, setApplyForm] = useState({
    job_id: '',
    candidate_name: '',
    candidate_email: '',
    candidate_phone: '',
    resume_text: '',
    cover_letter: '',
  });

  const fetchApplications = () => {
    const params: Record<string, string> = {};
    if (selectedJob) params.job_id = selectedJob;
    api.get('/recruitment/applications', { params }).then((r) => {
      setApplications(r.data);
      setLoading(false);
    });
  };

  useEffect(() => {
    api.get('/recruitment/jobs').then((r) => setJobs(r.data));
    fetchApplications();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [selectedJob]);

  const handleScreen = async (appId: number) => {
    setScreening(appId);
    try {
      await api.post(`/recruitment/applications/${appId}/screen`);
      fetchApplications();
    } finally {
      setScreening(null);
    }
  };

  const handleApply = async (e: React.FormEvent) => {
    e.preventDefault();
    await api.post('/recruitment/applications', {
      ...applyForm,
      job_id: parseInt(applyForm.job_id),
    });
    setShowApply(false);
    setApplyForm({ job_id: '', candidate_name: '', candidate_email: '', candidate_phone: '', resume_text: '', cover_letter: '' });
    fetchApplications();
  };

  const getScoreColor = (score: number | null | undefined) => {
    if (!score) return 'text-gray-400';
    if (score >= 70) return 'text-emerald-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-red-600';
  };

  const getScoreBg = (score: number | null | undefined) => {
    if (!score) return 'bg-gray-50';
    if (score >= 70) return 'bg-emerald-50';
    if (score >= 40) return 'bg-amber-50';
    return 'bg-red-50';
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Resume Screening</h1>
          <p className="text-gray-500">Automated candidate evaluation powered by AI</p>
        </div>
        <button onClick={() => setShowApply(!showApply)} className="btn-primary flex items-center gap-2">
          <Send className="w-4 h-4" />
          Submit Application
        </button>
      </div>

      {/* AI Info Banner */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl p-6 mb-6 text-white">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="w-6 h-6" />
          <h3 className="text-lg font-semibold">AI-Powered Screening</h3>
        </div>
        <p className="text-indigo-100 text-sm max-w-2xl">
          Our AI engine analyzes resumes against job requirements, evaluating skills match, experience level,
          education background, and resume quality. Click "Screen with AI" on any application to get instant insights.
        </p>
      </div>

      {/* Application Form */}
      {showApply && (
        <div className="card mb-6 animate-fade-in">
          <h3 className="text-lg font-semibold mb-4">Submit New Application</h3>
          <form onSubmit={handleApply} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Position</label>
              <select value={applyForm.job_id} onChange={(e) => setApplyForm({ ...applyForm, job_id: e.target.value })} className="input-field" required>
                <option value="">Select a job</option>
                {jobs.filter(j => j.is_active).map((j) => (
                  <option key={j.id} value={j.id}>{j.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Candidate Name</label>
              <input type="text" value={applyForm.candidate_name} onChange={(e) => setApplyForm({ ...applyForm, candidate_name: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={applyForm.candidate_email} onChange={(e) => setApplyForm({ ...applyForm, candidate_email: e.target.value })} className="input-field" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input type="text" value={applyForm.candidate_phone} onChange={(e) => setApplyForm({ ...applyForm, candidate_phone: e.target.value })} className="input-field" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Resume (paste text)</label>
              <textarea
                value={applyForm.resume_text}
                onChange={(e) => setApplyForm({ ...applyForm, resume_text: e.target.value })}
                className="input-field h-32"
                placeholder="Paste resume content here for AI screening..."
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Cover Letter (optional)</label>
              <textarea value={applyForm.cover_letter} onChange={(e) => setApplyForm({ ...applyForm, cover_letter: e.target.value })} className="input-field h-20" />
            </div>
            <div className="md:col-span-2 flex gap-2">
              <button type="submit" className="btn-primary">Submit Application</button>
              <button type="button" onClick={() => setShowApply(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Filters */}
      <div className="card mb-6">
        <div className="flex items-center gap-4">
          <select value={selectedJob} onChange={(e) => setSelectedJob(e.target.value)} className="input-field w-64">
            <option value="">All Jobs</option>
            {jobs.map((j) => (
              <option key={j.id} value={j.id}>{j.title}</option>
            ))}
          </select>
          <span className="text-sm text-gray-500">{applications.length} applications</span>
        </div>
      </div>

      {/* Applications */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="w-8 h-8 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((app) => (
            <div key={app.id} className={`card hover:shadow-md transition-shadow ${getScoreBg(app.ai_score)}`}>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* Candidate Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-sm font-semibold text-indigo-600">
                      {app.candidate_name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">{app.candidate_name}</h4>
                      <p className="text-sm text-gray-500">{app.candidate_email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className={`badge ${
                      app.status === 'shortlisted' ? 'badge-success' :
                      app.status === 'rejected' ? 'badge-danger' :
                      app.status === 'screening' ? 'badge-info' :
                      'badge-warning'
                    }`}>
                      {app.status}
                    </span>
                    {app.candidate_phone && (
                      <span className="text-xs text-gray-500">{app.candidate_phone}</span>
                    )}
                  </div>
                </div>

                {/* AI Score */}
                <div className="flex items-center gap-6">
                  {app.ai_score !== null && app.ai_score !== undefined ? (
                    <div className="text-center">
                      <div className={`text-3xl font-bold ${getScoreColor(app.ai_score)}`}>
                        {app.ai_score}
                      </div>
                      <p className="text-xs text-gray-500">AI Score</p>
                    </div>
                  ) : (
                    <div className="text-center text-gray-400">
                      <Bot className="w-8 h-8 mx-auto mb-1" />
                      <p className="text-xs">Not screened</p>
                    </div>
                  )}

                  <button
                    onClick={() => handleScreen(app.id)}
                    disabled={screening === app.id}
                    className="btn-primary flex items-center gap-2 whitespace-nowrap"
                  >
                    {screening === app.id ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Bot className="w-4 h-4" />
                        Screen with AI
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* AI Analysis Results */}
              {app.ai_summary && (
                <div className="mt-4 pt-4 border-t border-gray-200 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">AI Summary</p>
                    <p className="text-sm text-gray-700">{app.ai_summary}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-emerald-600 uppercase mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Strengths
                    </p>
                    <p className="text-sm text-gray-700">{app.ai_strengths}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-600 uppercase mb-1 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Areas of Concern
                    </p>
                    <p className="text-sm text-gray-700">{app.ai_weaknesses}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
          {applications.length === 0 && (
            <div className="card text-center py-12 text-gray-400">
              <FileSearch className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p>No applications found. Submit an application or select a different job.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
