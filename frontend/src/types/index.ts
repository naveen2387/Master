export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'senior_manager' | 'hr_recruiter' | 'employee';
  is_active: boolean;
  avatar_url?: string;
  created_at?: string;
}

export interface Department {
  id: number;
  name: string;
  description?: string;
  manager_id?: number;
  created_at?: string;
}

export interface Employee {
  id: number;
  user_id: number;
  employee_id: string;
  department_id?: number;
  designation?: string;
  phone?: string;
  date_of_birth?: string;
  date_of_joining?: string;
  salary: number;
  address?: string;
  emergency_contact?: string;
  skills?: string;
  created_at?: string;
  updated_at?: string;
  user?: User;
  department?: Department;
}

export interface Attendance {
  id: number;
  employee_id: number;
  date: string;
  check_in?: string;
  check_out?: string;
  status: string;
  hours_worked: number;
  notes?: string;
}

export interface LeaveRequest {
  id: number;
  employee_id: number;
  leave_type: string;
  start_date: string;
  end_date: string;
  reason?: string;
  status: string;
  approved_by?: number;
  created_at?: string;
}

export interface Payroll {
  id: number;
  employee_id: number;
  month: number;
  year: number;
  basic_salary: number;
  allowances: number;
  deductions: number;
  tax: number;
  net_salary: number;
  status: string;
  paid_date?: string;
  created_at?: string;
}

export interface PerformanceReview {
  id: number;
  employee_id: number;
  reviewer_id: number;
  review_period: string;
  rating: number;
  goals_met: number;
  goals_total: number;
  strengths?: string;
  improvements?: string;
  comments?: string;
  created_at?: string;
}

export interface JobPosting {
  id: number;
  title: string;
  department_id?: number;
  description: string;
  requirements?: string;
  location?: string;
  salary_range?: string;
  employment_type: string;
  is_active: boolean;
  posted_by: number;
  created_at?: string;
  closing_date?: string;
}

export interface JobApplication {
  id: number;
  job_id: number;
  candidate_name: string;
  candidate_email: string;
  candidate_phone?: string;
  resume_text?: string;
  cover_letter?: string;
  status: string;
  ai_score?: number;
  ai_summary?: string;
  ai_strengths?: string;
  ai_weaknesses?: string;
  screening_notes?: string;
  created_at?: string;
  updated_at?: string;
}

export interface DashboardStats {
  total_employees: number;
  total_departments: number;
  present_today: number;
  absent_today: number;
  pending_leaves: number;
  open_positions: number;
  total_applications: number;
  avg_performance: number;
  payroll_this_month: number;
  new_hires_this_month: number;
  attendance_rate: number;
  turnover_rate: number;
}

export interface EmployeeDashboard {
  employee_id: string;
  designation?: string;
  department_id?: number;
  attendance_this_month: number;
  pending_leaves: number;
  latest_rating?: number;
  latest_salary?: number;
}
