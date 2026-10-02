export type UserRole = 'student' | 'faculty' | 'admin';

export type VerificationStatus = 'Pending' | 'Verified' | 'Rejected' | 'Suspended';

export type MentorshipRequestStatus = 'Pending' | 'Accepted' | 'Rejected' | 'Expired' | 'Active' | 'Completed';

export type AppointmentStatus = 'Requested' | 'Confirmed' | 'Completed' | 'Cancelled';

export type TaskStatus = 'Pending' | 'In Progress' | 'Completed';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  verificationStatus: VerificationStatus;
  createdAt?: string;
  avatarUrl?: string;
}

export interface StudentProfile {
  userId: string;
  studentId: string;
  department: string;
  semester: number;
  division: string;
  phone: string;
  cgpa: number;
  skills: string[];
  interests: string[];
  careerGoal: string;
  projectInterests: string[];
  preferredMentoringAreas: string[];
  profileCompletion: number;
  activeMentorId?: string;
}

export interface FacultyProfile {
  userId: string;
  facultyId: string;
  department: string;
  designation: string;
  expertise: string[];
  researchAreas: string[];
  mentoringAreas: string[];
  yearsExperience: number;
  bio: string;
  availability: 'Available' | 'Busy' | 'Unavailable';
  acceptingRequests: boolean;
  maxMentoringCapacity: number;
  currentMentoringCount: number;
  officeLocation: string;
  meetingMode: 'In-person' | 'Online' | 'Hybrid';
  officeHours: string;
}

export interface Department {
  id: string;
  code: string;
  name: string;
  headOfDepartment: string;
  totalFaculty: number;
  totalStudents: number;
}

export interface MentorshipRequest {
  id: string;
  token: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  studentDepartment: string;
  studentSemester: number;
  facultyId: string;
  facultyName: string;
  facultyDepartment: string;
  reason: string;
  mentoringArea: string;
  studentGoal: string;
  preferredMeetingMode: 'In-person' | 'Online' | 'Hybrid';
  preferredTime: string;
  message: string;
  aiSummaryAttached?: {
    goal: string;
    currentSkills: string[];
    needsHelpWith: string;
    recommendedMentoringArea: string;
  };
  status: MentorshipRequestStatus;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Mentorship {
  id: string;
  studentId: string;
  studentName: string;
  facultyId: string;
  facultyName: string;
  facultyDepartment: string;
  requestToken: string;
  status: 'Active' | 'Completed' | 'Terminated';
  startDate: string;
  mentoringArea: string;
  nextMeetingDate?: string;
}

export interface Message {
  id: string;
  mentorshipId?: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  recipientId: string;
  recipientName: string;
  content: string;
  timestamp: string;
  read: boolean;
}

export interface Milestone {
  id: string;
  title: string;
  completed: boolean;
  targetDate?: string;
}

export interface Goal {
  id: string;
  studentId: string;
  facultyId?: string;
  title: string;
  category: string;
  targetDate: string;
  progressPercentage: number;
  milestones: Milestone[];
  facultyFeedback?: string;
  createdAt: string;
}

export interface Task {
  id: string;
  mentorshipId?: string;
  studentId: string;
  facultyId: string;
  facultyName: string;
  title: string;
  description: string;
  deadline: string;
  priority: 'Low' | 'Medium' | 'High';
  status: TaskStatus;
  submissionNotes?: string;
  facultyRemarks?: string;
  createdAt: string;
}

export interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  facultyId: string;
  facultyName: string;
  date: string;
  time: string;
  mode: 'In-person' | 'Online';
  topic: string;
  locationOrLink: string;
  status: AppointmentStatus;
  notes?: string;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'mentorship' | 'task' | 'meeting' | 'announcement' | 'ai' | 'verification';
  read: boolean;
  link?: string;
  createdAt: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  authorName: string;
  targetAudience: 'All' | 'Students' | 'Faculty';
  category: 'General' | 'Projects' | 'Internships' | 'Mentoring Hours';
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  role: UserRole;
  action: string;
  details: string;
}

export interface SystemSettings {
  allowedDomains: string[];
  maxMentorshipsPerStudent: number;
  currentAcademicSemester: string;
  registrationsOpen: boolean;
  requireAdminVerification: boolean;
  aiAssistanceEnabled: boolean;
}

export interface MatchScoreBreakdown {
  facultyId: string;
  facultyName: string;
  facultyDepartment: string;
  designation: string;
  overallScore: number;
  expertiseScore: number;
  interestGoalScore: number;
  availabilityScore: number;
  departmentScore: number;
  mentoringAreaScore: number;
  matchingTags: string[];
  availability: 'Available' | 'Busy' | 'Unavailable';
  acceptingRequests: boolean;
  currentMentoringCount: number;
  maxMentoringCapacity: number;
}
