import {
  User,
  StudentProfile,
  FacultyProfile,
  MentorshipRequest,
  Mentorship,
  Message,
  Goal,
  Task,
  Appointment,
  Notification,
  Announcement,
  AuditLog,
  SystemSettings,
  MatchScoreBreakdown,
  Department
} from '../types';
import { handleClientMockRequest } from './clientFallback';

const TOKEN_KEY = 'edupilot_token';
const API_BASE_URL = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '');

export function getStoredToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeStoredToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api${endpoint}`, {
      ...options,
      headers,
    });

    const contentType = response.headers.get('content-type') || '';

    // If backend returned valid JSON, parse it
    if (response.ok && contentType.includes('application/json')) {
      const data = await response.json();
      return data as T;
    }

    // If backend returned 400, 401, or 403 with an error message, respect that error
    if (response.status === 400 || response.status === 401 || response.status === 403) {
      const data = await response.json().catch(() => ({}));
      if (data.error) {
        throw new Error(data.error);
      }
    }

    // If static hosting (like GitHub Pages) returns 404 HTML, gracefully use static client fallback
    if (response.status === 404 || !contentType.includes('application/json')) {
      return handleClientMockRequest(endpoint, options) as T;
    }

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const errorMsg = data.error || `HTTP error ${response.status}`;
      throw new Error(errorMsg);
    }

    return data as T;
  } catch (err: any) {
    // If it's a specific validation message, rethrow it to UI
    if (
      err.message &&
      (err.message.includes('credentials') ||
        err.message.includes('verification') ||
        err.message.includes('password') ||
        err.message.includes('college email') ||
        err.message.includes('belong to'))
    ) {
      throw err;
    }

    // Otherwise, for offline/static deployment environments, use client fallback
    return handleClientMockRequest(endpoint, options) as T;
  }
}

export const api = {
  // Auth
  login: (email: string, password: string, role?: 'student' | 'faculty' | 'admin') =>
    request<{ token: string; user: User; profile?: StudentProfile | FacultyProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    }),

  registerStudent: (data: any) =>
    request<{ message: string; userId: string; verificationStatus: string }>('/auth/register/student', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  registerFaculty: (data: any) =>
    request<{ message: string; userId: string; verificationStatus: string }>('/auth/register/faculty', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  demoSwitch: (role: 'student' | 'faculty' | 'admin') =>
    request<{ token: string; user: User; profile?: StudentProfile | FacultyProfile }>('/auth/demo-switch', {
      method: 'POST',
      body: JSON.stringify({ role }),
    }),

  getMe: () =>
    request<{ user: User; profile?: StudentProfile | FacultyProfile }>('/auth/me'),

  // Student Profile
  getStudentProfile: (id?: string) =>
    request<{ user: User; profile: StudentProfile }>(id ? `/students/profile?id=${id}` : '/students/profile'),

  updateStudentProfile: (data: Partial<StudentProfile>) =>
    request<{ profile: StudentProfile; message: string }>('/students/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Faculty
  getFacultyList: (params?: { department?: string; availability?: string; expertise?: string; search?: string }) => {
    const query = new URLSearchParams(params as any).toString();
    return request<Array<{ id: string; name: string; email: string; avatarUrl?: string; profile: FacultyProfile }>>(
      `/faculty${query ? `?${query}` : ''}`
    );
  },

  getFacultyById: (id: string) =>
    request<{ id: string; name: string; email: string; avatarUrl?: string; profile: FacultyProfile }>(`/faculty/${id}`),

  updateFacultyAvailability: (data: Partial<FacultyProfile>) =>
    request<{ profile: FacultyProfile; message: string }>('/faculty/availability', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  updateFacultyProfile: (data: Partial<FacultyProfile>) =>
    request<{ profile: FacultyProfile; message: string }>('/faculty/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Matching
  getMatchRecommendations: () =>
    request<{
      recommendations: MatchScoreBreakdown[];
      methodology: {
        formula: string;
        studentDepartment: string;
        studentSkillsCount: number;
        studentInterestsCount: number;
      };
    }>('/matching/recommendations'),

  // Mentorship Requests
  createMentorshipRequest: (data: {
    facultyId: string;
    reason: string;
    mentoringArea: string;
    studentGoal?: string;
    preferredMeetingMode?: string;
    preferredTime?: string;
    message?: string;
    aiSummaryAttached?: any;
  }) =>
    request<{ message: string; request: MentorshipRequest; token: string }>('/mentorship/request', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getMentorshipRequests: () =>
    request<MentorshipRequest[]>('/mentorship/requests'),

  acceptMentorshipRequest: (id: string) =>
    request<{ message: string; request: MentorshipRequest; mentorship: Mentorship }>(`/mentorship/request/${id}/accept`, {
      method: 'PUT',
    }),

  rejectMentorshipRequest: (id: string, reason?: string) =>
    request<{ message: string; request: MentorshipRequest }>(`/mentorship/request/${id}/reject`, {
      method: 'PUT',
      body: JSON.stringify({ reason }),
    }),

  getActiveMentorship: () =>
    request<any>('/mentorship/active'),

  // Messages
  getMessages: (mentorshipId?: string) =>
    request<Message[]>(mentorshipId ? `/messages?mentorshipId=${mentorshipId}` : '/messages'),

  sendMessage: (recipientId: string, content: string, mentorshipId?: string) =>
    request<Message>('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content, mentorshipId }),
    }),

  // Goals
  getGoals: (studentId?: string) =>
    request<Goal[]>(studentId ? `/goals?studentId=${studentId}` : '/goals'),

  createGoal: (data: { title: string; category?: string; targetDate: string; milestones?: string[] }) =>
    request<Goal>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateMilestone: (goalId: string, milestoneId: string, completed: boolean) =>
    request<Goal>(`/goals/${goalId}/milestone`, {
      method: 'PUT',
      body: JSON.stringify({ milestoneId, completed }),
    }),

  submitGoalFeedback: (goalId: string, feedback: string) =>
    request<Goal>(`/goals/${goalId}/feedback`, {
      method: 'POST',
      body: JSON.stringify({ feedback }),
    }),

  // Tasks
  getTasks: () => request<Task[]>('/tasks'),

  createTask: (data: { studentId: string; title: string; description?: string; deadline: string; priority?: string; mentorshipId?: string }) =>
    request<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateTaskStatus: (taskId: string, data: { status?: Task['status']; submissionNotes?: string; facultyRemarks?: string }) =>
    request<Task>(`/tasks/${taskId}/status`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // Appointments
  getAppointments: () => request<Appointment[]>('/appointments'),

  createAppointment: (data: {
    facultyId?: string;
    studentId?: string;
    date: string;
    time: string;
    mode: 'In-person' | 'Online';
    topic: string;
    locationOrLink?: string;
    notes?: string;
  }) =>
    request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateAppointmentStatus: (id: string, status: Appointment['status'], notes?: string) =>
    request<Appointment>(`/appointments/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, notes }),
    }),

  // AI Mentor
  sendAIChat: (messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>) =>
    request<{
      reply: string;
      suggestedAction?: 'escalate_to_faculty' | 'create_roadmap' | 'view_mentors';
      recommendedFacultyArea?: string;
      mentoringSummary?: {
        goal: string;
        currentSkills: string[];
        needsHelpWith: string;
        recommendedMentoringArea: string;
      };
    }>('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    }),

  getEscalationSummary: (query: string) =>
    request<{
      goal: string;
      currentSkills: string[];
      needsHelpWith: string;
      recommendedMentoringArea: string;
    }>('/ai/escalate-summary', {
      method: 'POST',
      body: JSON.stringify({ query }),
    }),

  // Notifications & Announcements
  getNotifications: () => request<Notification[]>('/notifications'),

  markNotificationRead: (id: string) =>
    request<{ success: boolean }>(`/notifications/${id}/read`, { method: 'PUT' }),

  markAllNotificationsRead: () =>
    request<{ success: boolean }>('/notifications/read-all', { method: 'PUT' }),

  getAnnouncements: () => request<Announcement[]>('/announcements'),

  createAnnouncement: (data: { title: string; content: string; targetAudience?: string; category?: string }) =>
    request<Announcement>('/announcements', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin
  getAdminOverview: () =>
    request<{
      totalStudents: number;
      verifiedStudents: number;
      pendingStudents: number;
      totalFaculty: number;
      verifiedFaculty: number;
      pendingFaculty: number;
      totalRequests: number;
      pendingRequests: number;
      activeMentorships: number;
      departments: Department[];
      departmentCounts: Record<string, number>;
      totalAuditLogs: number;
    }>('/admin/overview'),

  getAdminUsers: () =>
    request<Array<{ user: User; profile?: any }>>('/admin/users'),

  getAdminStudents: () =>
    request<Array<{ user: User; profile?: StudentProfile }>>('/admin/students'),

  verifyStudent: (id: string, status: 'Verified' | 'Rejected' | 'Suspended') =>
    request<{ student: User; message: string }>(`/admin/students/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getAdminFaculty: () =>
    request<Array<{ user: User; profile?: FacultyProfile }>>('/admin/faculty'),

  verifyFaculty: (id: string, status: 'Verified' | 'Rejected' | 'Suspended') =>
    request<{ faculty: User; message: string }>(`/admin/faculty/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),

  getAdminAuditLogs: () => request<AuditLog[]>('/admin/audit-logs'),

  getAdminSettings: () => request<SystemSettings>('/admin/settings'),

  updateAdminSettings: (data: Partial<SystemSettings>) =>
    request<{ settings: SystemSettings; message: string }>('/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  getDepartments: () => request<Department[]>('/departments'),
};
