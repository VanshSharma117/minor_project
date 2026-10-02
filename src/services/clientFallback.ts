import {
  User,
  StudentProfile,
  FacultyProfile,
  Department,
  MentorshipRequest,
  Mentorship,
  Goal,
  Task,
  Appointment,
  Notification,
  Announcement,
  AuditLog,
  SystemSettings
} from '../types';

export interface ClientDataStore {
  users: User[];
  studentProfiles: StudentProfile[];
  facultyProfiles: FacultyProfile[];
  departments: Department[];
  mentorshipRequests: MentorshipRequest[];
  mentorships: Mentorship[];
  goals: Goal[];
  tasks: Task[];
  appointments: Appointment[];
  notifications: Notification[];
  announcements: Announcement[];
  auditLogs: AuditLog[];
  settings: SystemSettings;
}

const initialUsers: User[] = [
  {
    id: 'user-stu-1',
    name: 'Aarav Sharma',
    email: 'student@edupilot.local',
    role: 'student',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-fac-1',
    name: 'Dr. Kavita Sharma',
    email: 'faculty@edupilot.local',
    role: 'faculty',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString()
  },
  {
    id: 'user-adm-1',
    name: 'Prof. Rajesh Malhotra',
    email: 'admin@edupilot.local',
    role: 'admin',
    verificationStatus: 'Verified',
    avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=250',
    createdAt: new Date().toISOString()
  }
];

const initialStudentProfile: StudentProfile = {
  userId: 'user-stu-1',
  studentId: 'EN-2023-CE-042',
  department: 'Computer Engineering',
  semester: 6,
  division: 'A',
  phone: '+91 98765 43210',
  cgpa: 8.85,
  skills: ['React', 'TypeScript', 'Node.js', 'Machine Learning', 'Python'],
  interests: ['Generative AI', 'Full Stack Development', 'Distributed Systems'],
  careerGoal: 'AI Research Scientist & Distributed Systems Architect',
  projectInterests: ['Autonomous Campus Routing', 'Edge AI Acceleration'],
  preferredMentoringAreas: ['AI/ML Capstone', 'Full Stack Web', 'Higher Studies Prep'],
  profileCompletion: 95,
  activeMentorId: 'user-fac-1'
};

const initialFacultyProfile: FacultyProfile = {
  userId: 'user-fac-1',
  facultyId: 'FAC-CE-104',
  designation: 'Associate Professor',
  department: 'Computer Engineering',
  expertise: ['Machine Learning', 'Cloud Architecture', 'Natural Language Processing'],
  researchAreas: ['Applied Deep Learning in Healthcare', 'Decentralized Edge AI'],
  mentoringAreas: ['Capstone Project Guidance', 'Higher Studies Guidance', 'Research Publications'],
  yearsExperience: 12,
  bio: 'Ph.D. in Computer Science with 12+ years in predictive algorithms and distributed architectures. Guides undergraduate capstone projects.',
  availability: 'Available',
  acceptingRequests: true,
  maxMentoringCapacity: 5,
  currentMentoringCount: 2,
  officeLocation: 'Academic Block B, Room 408',
  meetingMode: 'Hybrid',
  officeHours: 'Monday & Thursday, 2:00 PM – 4:00 PM'
};

const initialFacultyList: Array<{ user: User; profile: FacultyProfile }> = [
  {
    user: initialUsers[1],
    profile: initialFacultyProfile
  },
  {
    user: {
      id: 'user-fac-2',
      name: 'Dr. Anand Patel',
      email: 'anand.patel@edupilot.local',
      role: 'faculty',
      verificationStatus: 'Verified',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
      createdAt: new Date().toISOString()
    },
    profile: {
      userId: 'user-fac-2',
      facultyId: 'FAC-IT-208',
      designation: 'Professor & Dean',
      department: 'Information Technology',
      expertise: ['Cybersecurity', 'Cryptographic Protocols', 'Blockchain Architecture'],
      researchAreas: ['Zero Knowledge Proofs', 'Smart Contract Auditing'],
      mentoringAreas: ['Research Publications', 'Internship & Career Guidance', 'Patent Drafting'],
      yearsExperience: 18,
      bio: 'Senior researcher in decentralized network security with multiple IEEE publications.',
      availability: 'Available',
      acceptingRequests: true,
      maxMentoringCapacity: 6,
      currentMentoringCount: 3,
      officeLocation: 'Admin Tower, Suite 302',
      meetingMode: 'In-person',
      officeHours: 'Tuesday & Friday, 11:00 AM – 1:00 PM'
    }
  },
  {
    user: {
      id: 'user-fac-3',
      name: 'Prof. Meera Sen',
      email: 'meera.sen@edupilot.local',
      role: 'faculty',
      verificationStatus: 'Verified',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=250',
      createdAt: new Date().toISOString()
    },
    profile: {
      userId: 'user-fac-3',
      facultyId: 'FAC-DS-312',
      designation: 'Assistant Professor',
      department: 'Data Science & AI',
      expertise: ['Deep Learning', 'Computer Vision', 'Data Mining'],
      researchAreas: ['Vision Transformers for Remote Sensing'],
      mentoringAreas: ['Capstone Project Guidance', 'Competitive Hackathons', 'Skill Development'],
      yearsExperience: 7,
      bio: 'Mentors students on computer vision projects and publication preparations.',
      availability: 'Available',
      acceptingRequests: true,
      maxMentoringCapacity: 4,
      currentMentoringCount: 1,
      officeLocation: 'Block C, Lab 102',
      meetingMode: 'Hybrid',
      officeHours: 'Wednesday, 1:00 PM – 3:30 PM'
    }
  }
];

export function handleClientMockRequest(endpoint: string, options: RequestInit = {}): any {
  const method = (options.method || 'GET').toUpperCase();
  const body = options.body ? JSON.parse(options.body as string) : {};

  // Auth: Login
  if (endpoint === '/auth/login' && method === 'POST') {
    const { email, password, role } = body;
    const cleanEmail = (email || '').trim().toLowerCase();

    let matchedUser = initialUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (!matchedUser) {
      if (cleanEmail.includes('student')) matchedUser = initialUsers[0];
      else if (cleanEmail.includes('faculty')) matchedUser = initialUsers[1];
      else if (cleanEmail.includes('admin')) matchedUser = initialUsers[2];
    }

    if (!matchedUser) {
      throw new Error('Invalid college email or password.');
    }

    // Role check
    if (role && matchedUser.role !== role) {
      const actualRoleTitle = matchedUser.role === 'admin' ? 'Admin' : matchedUser.role === 'faculty' ? 'Faculty' : 'Student';
      throw new Error(`These credentials belong to a ${actualRoleTitle} account. Please select ${actualRoleTitle} and try again.`);
    }

    const token = `mock-token-${matchedUser.id}-${Date.now()}`;
    localStorage.setItem('edupilot_token', token);
    localStorage.setItem('edupilot_mock_user', JSON.stringify(matchedUser));

    const profile = matchedUser.role === 'student' ? initialStudentProfile : matchedUser.role === 'faculty' ? initialFacultyProfile : undefined;

    return {
      token,
      user: matchedUser,
      profile
    };
  }

  // Auth: Get Me
  if (endpoint === '/auth/me') {
    const savedUserJson = localStorage.getItem('edupilot_mock_user');
    if (savedUserJson) {
      const user = JSON.parse(savedUserJson);
      const profile = user.role === 'student' ? initialStudentProfile : user.role === 'faculty' ? initialFacultyProfile : undefined;
      return { user, profile };
    }
    return { user: initialUsers[0], profile: initialStudentProfile };
  }

  // Auth: Demo Switch
  if (endpoint === '/auth/demo-switch' && method === 'POST') {
    const targetRole = body.role || 'student';
    const user = initialUsers.find(u => u.role === targetRole) || initialUsers[0];
    const profile = user.role === 'student' ? initialStudentProfile : user.role === 'faculty' ? initialFacultyProfile : undefined;
    localStorage.setItem('edupilot_token', `mock-token-${user.id}`);
    localStorage.setItem('edupilot_mock_user', JSON.stringify(user));
    return { token: `mock-token-${user.id}`, user, profile };
  }

  // Registrations
  if (endpoint.startsWith('/auth/register/')) {
    return {
      message: 'Registration submitted successfully. Your account will be available after college verification.',
      userId: `user-registered-${Date.now()}`,
      verificationStatus: 'Pending'
    };
  }

  // Faculty Mentors Directory
  if (endpoint.startsWith('/faculty') && method === 'GET') {
    return initialFacultyList;
  }

  // Student Profile
  if (endpoint === '/student/profile') {
    return { user: initialUsers[0], profile: initialStudentProfile };
  }

  // Student Requests
  if (endpoint === '/student/requests') {
    return [
      {
        id: 'req-demo-1',
        studentId: 'user-stu-1',
        facultyId: 'user-fac-1',
        status: 'Approved',
        studentName: 'Aarav Sharma',
        facultyName: 'Dr. Kavita Sharma',
        topic: 'AI Capstone Guidance',
        message: 'Requesting guidance for real-time edge AI deployment.',
        mentorshipArea: 'AI/ML Capstone',
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Mentorships
  if (endpoint.includes('/mentorships')) {
    return [
      {
        id: 'mentorship-1',
        studentId: 'user-stu-1',
        facultyId: 'user-fac-1',
        status: 'Active',
        topic: 'AI Capstone Guidance',
        startDate: new Date().toISOString(),
        studentName: 'Aarav Sharma',
        facultyName: 'Dr. Kavita Sharma',
        facultyTitle: 'Associate Professor',
        department: 'Computer Engineering'
      }
    ];
  }

  // Tasks
  if (endpoint.includes('/tasks')) {
    return [
      {
        id: 'task-1',
        mentorshipId: 'mentorship-1',
        title: 'Submit Literature Review Draft',
        description: 'Prepare survey on latest transformer models for the faculty guide.',
        status: 'Completed',
        dueDate: new Date(Date.now() + 86400000 * 3).toISOString()
      },
      {
        id: 'task-2',
        mentorshipId: 'mentorship-1',
        title: 'Architecture Diagram & Dataset Pipeline',
        description: 'Provide end-to-end data ingestion schematic.',
        status: 'In Progress',
        dueDate: new Date(Date.now() + 86400000 * 7).toISOString()
      }
    ];
  }

  // Goals
  if (endpoint.includes('/goals')) {
    return [
      {
        id: 'goal-1',
        mentorshipId: 'mentorship-1',
        title: 'Publish Conference Paper Draft',
        status: 'In Progress',
        progress: 60
      },
      {
        id: 'goal-2',
        mentorshipId: 'mentorship-1',
        title: 'Deploy Prototype on Campus Cloud',
        status: 'Pending',
        progress: 25
      }
    ];
  }

  // Messages
  if (endpoint.includes('/messages')) {
    return [
      {
        id: 'msg-1',
        senderId: 'user-fac-1',
        receiverId: 'user-stu-1',
        senderName: 'Dr. Kavita Sharma',
        content: 'Hi Aarav, reviewed your capstone milestones. Great progress on the dataset pipeline!',
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
      }
    ];
  }

  // Notifications
  if (endpoint.includes('/notifications')) {
    return [
      {
        id: 'notif-1',
        userId: 'user-stu-1',
        title: 'Milestone Review Completed',
        message: 'Dr. Kavita Sharma approved your Literature Review deliverable.',
        read: false,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // Announcements
  if (endpoint.includes('/announcements')) {
    return [
      {
        id: 'ann-1',
        title: 'Capstone Proposal Submissions Open',
        content: 'All Sem 6 & 8 students must register faculty mentors by end of the month.',
        authorName: 'Academic Directorate',
        pinned: true,
        createdAt: new Date().toISOString()
      }
    ];
  }

  // AI Mentor Chat
  if (endpoint === '/student/ai-chat' && method === 'POST') {
    const question = body.message || '';
    return {
      reply: `As your EduPilot AI Mentor, I can help you with "${question}". For detailed project sign-offs and credits, you can also schedule a meeting with your assigned mentor Dr. Kavita Sharma.`,
      suggestedActions: [
        'Review research milestones in Tasks',
        'Book an appointment with faculty mentor',
        'Generate AI study roadmap'
      ]
    };
  }

  // Admin: Analytics
  if (endpoint.includes('/admin/analytics')) {
    return {
      totalUsers: 142,
      activeMentorships: 38,
      verifiedFaculty: 24,
      verifiedStudents: 116,
      pendingRequests: 7
    };
  }

  // Admin: Users
  if (endpoint.includes('/admin/users')) {
    return initialUsers;
  }

  // Default fallback object
  return { success: true, message: 'Static deployment operation successful.' };
}
