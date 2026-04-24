import { useEffect, useState } from 'react';
import api from '../services/api';
import type { PerformanceReview } from '../types';
import { BarChart3, Star, Target } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export default function Performance() {
  const [reviews, setReviews] = useState<PerformanceReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/performance/').then((r) => {
      setReviews(r.data);
      setLoading(false);
    });
  }, []);

  const avgRating = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const ratingDistribution = [1, 2, 3, 4, 5].map((r) => ({
    rating: `${r}★`,
    count: reviews.filter((rev) => Math.floor(rev.rating) === r).length,
  }));

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < Math.round(rating) ? 'text-amber-400 fill-amber-400' : 'text-gray-200'}`}
      />
    ));
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Performance Reviews</h1>
        <p className="text-gray-500">Track and evaluate employee performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Total Reviews</p>
            <p className="text-xl font-bold">{reviews.length}</p>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">Avg Rating</p>
            <div className="flex items-center gap-1">
              <p className="text-xl font-bold text-amber-600">{avgRating.toFixed(1)}</p>
              <span className="text-sm text-gray-400">/ 5.0</span>
            </div>
          </div>
        </div>
        <div className="card flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
            <Target className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm text-gray-500">High Performers</p>
            <p className="text-xl font-bold text-emerald-600">
              {reviews.filter((r) => r.rating >= 4).length}
            </p>
          </div>
        </div>
      </div>

      {/* Rating distribution chart */}
      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Rating Distribution</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ratingDistribution}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="rating" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
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
                <th>Rating</th>
                <th>Goals</th>
                <th>Strengths</th>
                <th>Areas to Improve</th>
              </tr>
            </thead>
            <tbody>
              {reviews.map((rev) => (
                <tr key={rev.id}>
                  <td>Emp #{rev.employee_id}</td>
                  <td>
                    <span className="badge bg-indigo-100 text-indigo-700">{rev.review_period}</span>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {renderStars(rev.rating)}
                      <span className="ml-1 text-sm font-medium">{rev.rating}</span>
                    </div>
                  </td>
                  <td>
                    <span className="text-sm">
                      {rev.goals_met}/{rev.goals_total}
                    </span>
                  </td>
                  <td className="text-sm text-gray-600 max-w-xs truncate">{rev.strengths || '—'}</td>
                  <td className="text-sm text-gray-600 max-w-xs truncate">{rev.improvements || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
