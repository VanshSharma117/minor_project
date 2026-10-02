/**
 * =======================================================================
 * EduPilot AI Campus Data Store Architecture Notice:
 * -----------------------------------------------------------------------
 * Note: Data is currently stored in-memory for this deployment/demo version.
 * - All registered users, profiles, tasks, messages, and requests are held in memory.
 * - Data will reset to the campus seed state whenever the backend restarts.
 * - This architecture is lightweight and optimal for college project evaluations,
 *   demonstrations, and viva presentations without external database dependencies.
 * - For production multi-instance environments, a persistent database such as
 *   MongoDB or PostgreSQL can be integrated in future phases.
 * =======================================================================
 */

import bcrypt from 'bcryptjs';
import {
  User,
  StudentProfile,
  FacultyProfile,
  Department,
  MentorshipRequest,
  Mentorship,
  Message,
  Goal,
  Task,
  Appointment,
  Notification,
  Announcement,
  AuditLog,
  SystemSettings
} from './types.js';

// Pre-computed hashes for demo speed:
const salt = bcrypt.genSaltSync(10);
const studentPasswordHash = bcrypt.hashSync('Student@123', salt);
const facultyPasswordHash = bcrypt.hashSync('Faculty@123', salt);
const adminPasswordHash = bcrypt.hashSync('Admin@123', salt);

class InMemoryDatabase {
  users: User[] = [];
  studentProfiles: Map<string, StudentProfile> = new Map();
  facultyProfiles: Map<string, FacultyProfile> = new Map();
  departments: Department[] = [];
  mentorshipRequests: MentorshipRequest[] = [];
  mentorships: Mentorship[] = [];
  messages: Message[] = [];
  goals: Goal[] = [];
  tasks: Task[] = [];
  appointments: Appointment[] = [];
  notifications: Notification[] = [];
  announcements: Announcement[] = [];
  auditLogs: AuditLog[] = [];
  settings: SystemSettings = {
    allowedDomains: ['college.edu', 'edupilot.local', 'campus.edu'],
    maxMentorshipsPerStudent: 2,
    currentAcademicSemester: 'Odd Semester 2026 (Sem 3/5/7)',
    registrationsOpen: true,
    requireAdminVerification: true,
    aiAssistanceEnabled: true
  };

  constructor() {
    this.seedInitialData();
  }

  seedInitialData() {
    // 1. Departments
    this.departments = [
      {
        id: 'dept-1',
        code: 'CE',
        name: 'Computer Engineering',
        headOfDepartment: 'Dr. Ramesh Kulkarni',
        totalFaculty: 18,
        totalStudents: 360
      },
      {
        id: 'dept-2',
        code: 'IT',
        name: 'Information Technology',
        headOfDepartment: 'Dr. Sunita Mehta',
        totalFaculty: 15,
        totalStudents: 300
      },
      {
        id: 'dept-3',
        code: 'EXTC',
        name: 'Electronics & Telecommunication',
        headOfDepartment: 'Dr. Arvind Joshi',
        totalFaculty: 14,
        totalStudents: 280
      }
    ];

    // 2. Admin User
    const adminUser: User = {
      id: 'user-admin-1',
      name: 'Dr. Vikram Malhotra (Dean of Academics)',
      email: 'admin@edupilot.local',
      passwordHash: adminPasswordHash,
      role: 'admin',
      verificationStatus: 'Verified',
      createdAt: '2026-08-01T09:00:00Z',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    };
    this.users.push(adminUser);

    // 3. Faculty Users (8 Faculty Members)
    const facultyData = [
      {
        id: 'user-fac-1',
        name: 'Dr. Rahul Sharma',
        email: 'faculty@edupilot.local', // Primary demo faculty!
        department: 'Computer Engineering',
        designation: 'Associate Professor',
        expertise: ['Machine Learning', 'Artificial Intelligence', 'Data Science', 'Python', 'Algorithms'],
        researchAreas: ['Explainable AI in Healthcare', 'Deep Reinforcement Learning'],
        mentoringAreas: ['Projects', 'Research', 'Career Planning', 'Higher Studies'],
        yearsExperience: 12,
        bio: 'Ph.D. in Computer Science with 12+ years of research and teaching experience. Passionate about guiding undergraduate research and AI projects.',
        availability: 'Available' as const,
        acceptingRequests: true,
        maxMentoringCapacity: 4,
        currentMentoringCount: 2,
        officeLocation: 'Academic Block B, Room 304',
        meetingMode: 'Hybrid' as const,
        officeHours: 'Mon & Thu: 2:00 PM - 4:30 PM',
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'user-fac-2',
        name: 'Dr. Priya Patel',
        email: 'priya.patel@edupilot.local',
        department: 'Computer Engineering',
        designation: 'Assistant Professor',
        expertise: ['Full Stack Development', 'Cloud Computing', 'React', 'Node.js', 'Distributed Systems'],
        researchAreas: ['Cloud Native Microservices', 'Serverless Scalability'],
        mentoringAreas: ['Web Development Projects', 'Internship Readiness', 'System Design'],
        yearsExperience: 8,
        bio: 'Former senior engineer at tech lead level, now guiding students on scalable industry-grade web and cloud engineering.',
        availability: 'Available' as const,
        acceptingRequests: true,
        maxMentoringCapacity: 4,
        currentMentoringCount: 1,
        officeLocation: 'Lab Complex 2, Room 108',
        meetingMode: 'In-person' as const,
        officeHours: 'Tue & Fri: 11:00 AM - 1:00 PM',
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'user-fac-3',
        name: 'Dr. Amit Shah',
        email: 'amit.shah@edupilot.local',
        department: 'Information Technology',
        designation: 'Professor',
        expertise: ['Cybersecurity', 'Cryptography', 'Blockchain', 'Network Security'],
        researchAreas: ['Post-Quantum Cryptography', 'Zero-Knowledge Proofs'],
        mentoringAreas: ['Security Auditing', 'Research Publications', 'Capture-The-Flag (CTF)'],
        yearsExperience: 16,
        bio: 'Senior academic and consultant in network security and cryptography protocols with dozens of international publications.',
        availability: 'Busy' as const,
        acceptingRequests: true,
        maxMentoringCapacity: 3,
        currentMentoringCount: 2,
        officeLocation: 'IT Block 1, Room 412',
        meetingMode: 'Online' as const,
        officeHours: 'Wed: 3:00 PM - 5:00 PM',
        avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'user-fac-4',
        name: 'Prof. Ananya Sen',
        email: 'ananya.sen@edupilot.local',
        department: 'Information Technology',
        designation: 'Assistant Professor',
        expertise: ['DevOps', 'CI/CD Pipelines', 'Kubernetes', 'Linux Systems', 'Docker'],
        researchAreas: ['Autonomous Cloud Infrastructure Orchestration'],
        mentoringAreas: ['DevOps Projects', 'Open Source Contribution', 'Placements'],
        yearsExperience: 6,
        bio: 'Passionate about bridging academic computer science with contemporary cloud orchestration practices.',
        availability: 'Available' as const,
        acceptingRequests: true,
        maxMentoringCapacity: 3,
        currentMentoringCount: 0,
        officeLocation: 'IT Block 2, Room 205',
        meetingMode: 'Hybrid' as const,
        officeHours: 'Mon & Wed: 10:00 AM - 12:00 PM',
        avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'user-fac-5',
        name: 'Dr. Arvind Joshi',
        email: 'arvind.joshi@edupilot.local',
        department: 'Electronics & Telecommunication',
        designation: 'Professor & HOD',
        expertise: ['Embedded Systems', 'IoT', 'Robotics', 'VLSI Design', 'ARM Architecture'],
        researchAreas: ['Industrial IoT Sensor Networks', 'Low Power Edge Computing'],
        mentoringAreas: ['Hardware Projects', 'Robotics Competitions', 'Patents'],
        yearsExperience: 20,
        bio: 'Department Head with two decades of experience in hardware-software co-design, microcontrollers, and embedded robotics.',
        availability: 'Unavailable' as const,
        acceptingRequests: false,
        maxMentoringCapacity: 2,
        currentMentoringCount: 2,
        officeLocation: 'EXTC Block, HOD Cabin 101',
        meetingMode: 'In-person' as const,
        officeHours: 'Fri: 3:00 PM - 4:30 PM',
        avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'user-fac-6',
        name: 'Prof. Sneha Verma',
        email: 'sneha.verma@edupilot.local',
        department: 'Electronics & Telecommunication',
        designation: 'Assistant Professor',
        expertise: ['Wireless Communications', 'Signal Processing', '5G/6G Networks', 'MATLAB'],
        researchAreas: ['MIMO Beamforming', 'Software Defined Radios'],
        mentoringAreas: ['Research Papers', 'Telecom Projects', 'Master Degree Prep'],
        yearsExperience: 7,
        bio: 'Dedicated educator specializing in wireless protocol implementations, spectrum sensing, and signal processing algorithms.',
        availability: 'Available' as const,
        acceptingRequests: true,
        maxMentoringCapacity: 4,
        currentMentoringCount: 1,
        officeLocation: 'EXTC Block, Room 204',
        meetingMode: 'Hybrid' as const,
        officeHours: 'Tue & Thu: 1:30 PM - 3:30 PM',
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'user-fac-7',
        name: 'Dr. Rajesh Nair',
        email: 'rajesh.nair@edupilot.local',
        department: 'Computer Engineering',
        designation: 'Professor',
        expertise: ['Computer Vision', 'Generative AI', 'Image Processing', 'PyTorch'],
        researchAreas: ['Medical Imaging Diagnostics', '3D Scene Reconstruction'],
        mentoringAreas: ['Research Projects', 'Conference Publications', 'Ph.D. Guidance'],
        yearsExperience: 18,
        bio: 'Senior researcher with multiple patents in computer vision and medical anomaly detection using neural networks.',
        availability: 'Busy' as const,
        acceptingRequests: true,
        maxMentoringCapacity: 3,
        currentMentoringCount: 2,
        officeLocation: 'Academic Block B, Room 402',
        meetingMode: 'In-person' as const,
        officeHours: 'Mon: 11:00 AM - 1:00 PM',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'user-fac-8',
        name: 'Prof. Meera Kulkarni',
        email: 'meera.kulkarni@edupilot.local',
        department: 'Information Technology',
        designation: 'Assistant Professor',
        expertise: ['Database Systems', 'Big Data Analytics', 'SQL', 'Apache Spark', 'Data Warehousing'],
        researchAreas: ['Stream Processing Optimization', 'Distributed Query Engines'],
        mentoringAreas: ['Data Engineering', 'Placement Preparation', 'Project Mentorship'],
        yearsExperience: 9,
        bio: 'Focuses on enterprise data pipelines, real-time streaming architectures, and high-performance relational query engines.',
        availability: 'Available' as const,
        acceptingRequests: true,
        maxMentoringCapacity: 4,
        currentMentoringCount: 0,
        officeLocation: 'IT Block 2, Room 303',
        meetingMode: 'Hybrid' as const,
        officeHours: 'Thu & Fri: 2:00 PM - 4:00 PM',
        avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80'
      }
    ];

    facultyData.forEach((fac, index) => {
      const user: User = {
        id: fac.id,
        name: fac.name,
        email: fac.email,
        passwordHash: facultyPasswordHash,
        role: 'faculty',
        verificationStatus: 'Verified',
        createdAt: '2026-08-05T10:00:00Z',
        avatarUrl: fac.avatarUrl
      };
      this.users.push(user);

      const profile: FacultyProfile = {
        userId: fac.id,
        facultyId: `FAC-${fac.department.substring(0, 2).toUpperCase()}-2026-${(index + 101).toString()}`,
        department: fac.department,
        designation: fac.designation,
        expertise: fac.expertise,
        researchAreas: fac.researchAreas,
        mentoringAreas: fac.mentoringAreas,
        yearsExperience: fac.yearsExperience,
        bio: fac.bio,
        availability: fac.availability,
        acceptingRequests: fac.acceptingRequests,
        maxMentoringCapacity: fac.maxMentoringCapacity,
        currentMentoringCount: fac.currentMentoringCount,
        officeLocation: fac.officeLocation,
        meetingMode: fac.meetingMode,
        officeHours: fac.officeHours
      };
      this.facultyProfiles.set(fac.id, profile);
    });

    // 4. Student Users (10 Students)
    const studentData = [
      {
        id: 'user-stu-1',
        name: 'Aarav Mehta',
        email: 'student@edupilot.local', // Primary demo student!
        studentId: 'STU-CE-2024-042',
        department: 'Computer Engineering',
        semester: 6,
        division: 'A',
        phone: '+91 98201 12345',
        cgpa: 8.85,
        skills: ['C++', 'Python', 'React', 'Machine Learning', 'Data Structures', 'SQL'],
        interests: ['AI/ML', 'Web Development', 'Cloud Computing'],
        careerGoal: 'Software Engineer & AI Researcher',
        projectInterests: ['Federated Learning on Edge Devices', 'Autonomous Drone Navigation'],
        preferredMentoringAreas: ['Projects', 'Career Planning', 'Research'],
        profileCompletion: 92,
        activeMentorId: 'user-fac-1',
        avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        status: 'Verified' as const
      },
      {
        id: 'user-stu-2',
        name: 'Rohan Gupta',
        email: 'rohan.gupta@edupilot.local',
        studentId: 'STU-CE-2024-055',
        department: 'Computer Engineering',
        semester: 6,
        division: 'B',
        phone: '+91 98202 23456',
        cgpa: 8.4,
        skills: ['JavaScript', 'TypeScript', 'Node.js', 'React', 'Docker'],
        interests: ['Full Stack Systems', 'DevOps', 'Distributed Databases'],
        careerGoal: 'Full Stack Cloud Architect',
        projectInterests: ['Microservices E-Commerce Platform', 'Real-time Canvas Collaboration'],
        preferredMentoringAreas: ['Web Development Projects', 'Internship Readiness'],
        profileCompletion: 85,
        activeMentorId: 'user-fac-2',
        avatarUrl: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&auto=format&fit=crop&q=80',
        status: 'Verified' as const
      },
      {
        id: 'user-stu-3',
        name: 'Ananya Iyer',
        email: 'ananya.iyer@edupilot.local',
        studentId: 'STU-IT-2023-018',
        department: 'Information Technology',
        semester: 8,
        division: 'A',
        phone: '+91 98203 34567',
        cgpa: 9.1,
        skills: ['Python', 'Cybersecurity', 'Wireshark', 'Cryptography', 'Linux'],
        interests: ['Ethical Hacking', 'Blockchain', 'Network Defense'],
        careerGoal: 'Information Security Specialist',
        projectInterests: ['Decentralized Identity Verification', 'Zero Trust Campus Network'],
        preferredMentoringAreas: ['Security Auditing', 'Research Publications'],
        profileCompletion: 95,
        activeMentorId: 'user-fac-3',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        status: 'Verified' as const
      },
      {
        id: 'user-stu-4',
        name: 'Kavya Nair',
        email: 'kavya.nair@edupilot.local',
        studentId: 'STU-EXTC-2025-089',
        department: 'Electronics & Telecommunication',
        semester: 4,
        division: 'C',
        phone: '+91 98204 45678',
        cgpa: 7.9,
        skills: ['C', 'Arduino', 'Raspberry Pi', 'IoT', 'Circuit Design'],
        interests: ['Embedded Robotics', 'Smart Agriculture IoT', 'VLSI'],
        careerGoal: 'Embedded Firmware Engineer',
        projectInterests: ['Smart Irrigation Node Network', 'Autonomous Rover Obstacle Avoidance'],
        preferredMentoringAreas: ['Hardware Projects', 'Robotics Competitions'],
        profileCompletion: 80,
        activeMentorId: 'user-fac-5',
        avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        status: 'Verified' as const
      },
      {
        id: 'user-stu-5',
        name: 'Vikram Singhania',
        email: 'vikram.singhania@edupilot.local',
        studentId: 'STU-CE-2024-112',
        department: 'Computer Engineering',
        semester: 6,
        division: 'A',
        phone: '+91 98205 56789',
        cgpa: 8.2,
        skills: ['Python', 'OpenCV', 'PyTorch', 'TensorFlow', 'Deep Learning'],
        interests: ['Computer Vision', 'Generative Art', 'Autonomous Vehicles'],
        careerGoal: 'Computer Vision Research Engineer',
        projectInterests: ['Low-light Road Anomaly Detection', 'Real-time Sign Language Translator'],
        preferredMentoringAreas: ['Research Projects', 'Conference Publications'],
        profileCompletion: 88,
        activeMentorId: 'user-fac-7',
        avatarUrl: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        status: 'Verified' as const
      },
      {
        id: 'user-stu-6',
        name: 'Sneha Deshmukh',
        email: 'sneha.deshmukh@edupilot.local',
        studentId: 'STU-IT-2025-045',
        department: 'Information Technology',
        semester: 4,
        division: 'B',
        phone: '+91 98206 67890',
        cgpa: 8.6,
        skills: ['Java', 'SQL', 'Python', 'Data Analytics', 'Tableau'],
        interests: ['Data Engineering', 'Business Intelligence', 'FinTech Analytics'],
        careerGoal: 'Data Engineer / Analytics Consultant',
        projectInterests: ['High-throughput Stock Market Trend Pipeline', 'Campus Attendance Forecasting'],
        preferredMentoringAreas: ['Data Engineering', 'Placement Preparation'],
        profileCompletion: 78,
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        status: 'Verified' as const
      },
      {
        id: 'user-stu-7',
        name: 'Tanmay Kulkarni',
        email: 'tanmay.kulkarni@edupilot.local',
        studentId: 'STU-EXTC-2024-034',
        department: 'Electronics & Telecommunication',
        semester: 6,
        division: 'A',
        phone: '+91 98207 78901',
        cgpa: 8.1,
        skills: ['MATLAB', 'Wireless Signal Processing', 'C++', 'Python', 'Simulink'],
        interests: ['5G Network Slicing', 'RF Engineering', 'Satellite Comms'],
        careerGoal: 'Telecommunications Engineer',
        projectInterests: ['Beamforming Array Simulator', 'Low Cost Ground Satellite Receiver'],
        preferredMentoringAreas: ['Research Papers', 'Telecom Projects'],
        profileCompletion: 74,
        activeMentorId: 'user-fac-6',
        avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        status: 'Verified' as const
      },
      {
        id: 'user-stu-8',
        name: 'Pooja Verma',
        email: 'pooja.verma@edupilot.local',
        studentId: 'STU-CE-2026-201',
        department: 'Computer Engineering',
        semester: 2,
        division: 'C',
        phone: '+91 98208 89012',
        cgpa: 7.8,
        skills: ['C', 'Python', 'Basic Web', 'Git'],
        interests: ['App Development', 'Problem Solving', 'Hackathons'],
        careerGoal: 'Mobile Application Developer',
        projectInterests: ['Campus Event Management Mobile App'],
        preferredMentoringAreas: ['Career Planning', 'Programming Fundamentals'],
        profileCompletion: 68,
        avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        status: 'Pending' as const // For admin verification testing!
      },
      {
        id: 'user-stu-9',
        name: 'Aditya Rao',
        email: 'aditya.rao@edupilot.local',
        studentId: 'STU-IT-2026-215',
        department: 'Information Technology',
        semester: 2,
        division: 'B',
        phone: '+91 98209 90123',
        cgpa: 7.5,
        skills: ['Python', 'HTML/CSS', 'JavaScript'],
        interests: ['Cloud Architecture', 'Linux Scripting'],
        careerGoal: 'DevOps Engineer',
        projectInterests: ['Automated Server Provisioning Script'],
        preferredMentoringAreas: ['DevOps Projects', 'Open Source Contribution'],
        profileCompletion: 60,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        status: 'Pending' as const // For admin verification testing!
      },
      {
        id: 'user-stu-10',
        name: 'Isha Bansal',
        email: 'isha.bansal@edupilot.local',
        studentId: 'STU-EXTC-2023-012',
        department: 'Electronics & Telecommunication',
        semester: 8,
        division: 'A',
        phone: '+91 98210 01234',
        cgpa: 8.9,
        skills: ['Embedded C', 'FPGA', 'Verilog', 'ARM Cortex', 'Altium Designer'],
        interests: ['Semiconductor Hardware', 'ASIC Verification', 'PCB Layout'],
        careerGoal: 'VLSI Silicon Engineer',
        projectInterests: ['FPGA Accelerated FFT Processor'],
        preferredMentoringAreas: ['Hardware Projects', 'Patents'],
        profileCompletion: 90,
        avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        status: 'Verified' as const
      }
    ];

    studentData.forEach(stu => {
      const user: User = {
        id: stu.id,
        name: stu.name,
        email: stu.email,
        passwordHash: studentPasswordHash,
        role: 'student',
        verificationStatus: stu.status,
        createdAt: '2026-08-10T12:00:00Z',
        avatarUrl: stu.avatarUrl
      };
      this.users.push(user);

      const profile: StudentProfile = {
        userId: stu.id,
        studentId: stu.studentId,
        department: stu.department,
        semester: stu.semester,
        division: stu.division,
        phone: stu.phone,
        cgpa: stu.cgpa,
        skills: stu.skills,
        interests: stu.interests,
        careerGoal: stu.careerGoal,
        projectInterests: stu.projectInterests,
        preferredMentoringAreas: stu.preferredMentoringAreas,
        profileCompletion: stu.profileCompletion,
        activeMentorId: stu.activeMentorId
      };
      this.studentProfiles.set(stu.id, profile);
    });

    // 5. Mentorship Requests (10 Requests with EP-MENT-2026 tokens)
    this.mentorshipRequests = [
      {
        id: 'req-1',
        token: 'EP-MENT-2026-00482',
        studentId: 'user-stu-1',
        studentName: 'Aarav Mehta',
        studentEmail: 'student@edupilot.local',
        studentDepartment: 'Computer Engineering',
        studentSemester: 6,
        facultyId: 'user-fac-1',
        facultyName: 'Dr. Rahul Sharma',
        facultyDepartment: 'Computer Engineering',
        reason: 'Seeking faculty supervision for my final year major project on Federated Edge ML and paper submission to IEEE conference.',
        mentoringArea: 'Projects & Research',
        studentGoal: 'Publish peer-reviewed research paper and pursue MS in AI',
        preferredMeetingMode: 'Hybrid',
        preferredTime: 'Thursday afternoons between 2:30 PM - 4:00 PM',
        message: 'Respected Dr. Sharma, I have reviewed your publications on Explainable AI and would be honored to receive your mentorship for my capstone implementation.',
        aiSummaryAttached: {
          goal: 'Software Engineer & AI Researcher',
          currentSkills: ['C++', 'Python', 'Machine Learning', 'Data Structures'],
          needsHelpWith: 'Research methodology, model quantization, and thesis outline',
          recommendedMentoringArea: 'Projects & Research'
        },
        status: 'Accepted',
        createdAt: '2026-08-15T14:30:00Z',
        updatedAt: '2026-08-16T10:15:00Z'
      },
      {
        id: 'req-2',
        token: 'EP-MENT-2026-00483',
        studentId: 'user-stu-2',
        studentName: 'Rohan Gupta',
        studentEmail: 'rohan.gupta@edupilot.local',
        studentDepartment: 'Computer Engineering',
        studentSemester: 6,
        facultyId: 'user-fac-2',
        facultyName: 'Dr. Priya Patel',
        facultyDepartment: 'Computer Engineering',
        reason: 'Guidance on designing scalable microservices architecture and preparing for tier-1 product firm off-campus placements.',
        mentoringArea: 'Web Development Projects',
        studentGoal: 'Full Stack Cloud Architect',
        preferredMeetingMode: 'In-person',
        preferredTime: 'Tuesday 11:30 AM',
        message: 'Dear Prof. Patel, I would love your advice on decoupling monolithic APIs and benchmarking container latency for my portfolio project.',
        status: 'Accepted',
        createdAt: '2026-08-17T09:00:00Z',
        updatedAt: '2026-08-18T11:00:00Z'
      },
      {
        id: 'req-3',
        token: 'EP-MENT-2026-00484',
        studentId: 'user-stu-6',
        studentName: 'Sneha Deshmukh',
        studentEmail: 'sneha.deshmukh@edupilot.local',
        studentDepartment: 'Information Technology',
        studentSemester: 4,
        facultyId: 'user-fac-1',
        facultyName: 'Dr. Rahul Sharma',
        facultyDepartment: 'Computer Engineering',
        reason: 'Seeking interdisciplinary guidance on predictive analytics in financial datasets.',
        mentoringArea: 'Data Science & Machine Learning',
        studentGoal: 'Data Engineer / Analytics Consultant',
        preferredMeetingMode: 'Online',
        preferredTime: 'Monday 3:00 PM',
        message: 'Hello Sir, although I am in IT, your work in predictive modeling aligns directly with my semester project.',
        status: 'Pending',
        createdAt: '2026-09-25T11:20:00Z',
        updatedAt: '2026-09-25T11:20:00Z'
      },
      {
        id: 'req-4',
        token: 'EP-MENT-2026-00485',
        studentId: 'user-stu-3',
        studentName: 'Ananya Iyer',
        studentEmail: 'ananya.iyer@edupilot.local',
        studentDepartment: 'Information Technology',
        studentSemester: 8,
        facultyId: 'user-fac-3',
        facultyName: 'Dr. Amit Shah',
        facultyDepartment: 'Information Technology',
        reason: 'Zero-knowledge proofs applied to academic credentials verification.',
        mentoringArea: 'Security Auditing & Cryptography',
        studentGoal: 'Information Security Specialist',
        preferredMeetingMode: 'Online',
        preferredTime: 'Wednesday 3:30 PM',
        message: 'Respected Dr. Shah, requesting your continued mentorship for our final semester blockchain security audit.',
        status: 'Accepted',
        createdAt: '2026-08-12T16:00:00Z',
        updatedAt: '2026-08-13T10:00:00Z'
      },
      {
        id: 'req-5',
        token: 'EP-MENT-2026-00486',
        studentId: 'user-stu-4',
        studentName: 'Kavya Nair',
        studentEmail: 'kavya.nair@edupilot.local',
        studentDepartment: 'Electronics & Telecommunication',
        studentSemester: 4,
        facultyId: 'user-fac-5',
        facultyName: 'Dr. Arvind Joshi',
        facultyDepartment: 'Electronics & Telecommunication',
        reason: 'Embedded hardware rover prototype guidance for National Robotics League.',
        mentoringArea: 'Hardware Projects',
        studentGoal: 'Embedded Firmware Engineer',
        preferredMeetingMode: 'In-person',
        preferredTime: 'Friday 3:30 PM',
        message: 'Respected HOD Sir, our team has cleared the preliminary design round and needs lab component access guidance.',
        status: 'Accepted',
        createdAt: '2026-08-14T11:00:00Z',
        updatedAt: '2026-08-15T09:30:00Z'
      },
      {
        id: 'req-6',
        token: 'EP-MENT-2026-00487',
        studentId: 'user-stu-5',
        studentName: 'Vikram Singhania',
        studentEmail: 'vikram.singhania@edupilot.local',
        studentDepartment: 'Computer Engineering',
        studentSemester: 6,
        facultyId: 'user-fac-7',
        facultyName: 'Dr. Rajesh Nair',
        facultyDepartment: 'Computer Engineering',
        reason: 'Deep neural network acceleration on low-power hardware for road anomaly segmentation.',
        mentoringArea: 'Research Projects',
        studentGoal: 'Computer Vision Research Engineer',
        preferredMeetingMode: 'In-person',
        preferredTime: 'Monday 11:30 AM',
        message: 'Respected Sir, seeking your guidance on dataset annotation and conference track selection.',
        status: 'Accepted',
        createdAt: '2026-08-19T10:00:00Z',
        updatedAt: '2026-08-20T12:00:00Z'
      },
      {
        id: 'req-7',
        token: 'EP-MENT-2026-00488',
        studentId: 'user-stu-10',
        studentName: 'Isha Bansal',
        studentEmail: 'isha.bansal@edupilot.local',
        studentDepartment: 'Electronics & Telecommunication',
        studentSemester: 8,
        facultyId: 'user-fac-5',
        facultyName: 'Dr. Arvind Joshi',
        facultyDepartment: 'Electronics & Telecommunication',
        reason: 'FPGA timing constraint optimization and patent filing assistance.',
        mentoringArea: 'Hardware Projects & Patents',
        studentGoal: 'VLSI Silicon Engineer',
        preferredMeetingMode: 'In-person',
        preferredTime: 'Friday 4:00 PM',
        message: 'Respected Sir, our ASIC design simulation passed successfully. Requesting patent review.',
        status: 'Rejected',
        rejectionReason: 'Capacity filled for this semester. Recommended connecting with Prof. Sneha Verma or utilizing EduPilot AI for initial patent document drafting.',
        createdAt: '2026-08-22T14:00:00Z',
        updatedAt: '2026-08-23T16:30:00Z'
      },
      {
        id: 'req-8',
        token: 'EP-MENT-2026-00489',
        studentId: 'user-stu-1',
        studentName: 'Aarav Mehta',
        studentEmail: 'student@edupilot.local',
        studentDepartment: 'Computer Engineering',
        studentSemester: 6,
        facultyId: 'user-fac-4',
        facultyName: 'Prof. Ananya Sen',
        facultyDepartment: 'Information Technology',
        reason: 'Setting up automated CI/CD pipeline and multi-node Kubernetes cluster for our AI model inference.',
        mentoringArea: 'DevOps Projects',
        studentGoal: 'Software Engineer & AI Researcher',
        preferredMeetingMode: 'Hybrid',
        preferredTime: 'Wednesday 10:30 AM',
        message: 'Hello Professor Sen, we want our capstone project deployment to follow production DevOps practices.',
        status: 'Pending',
        createdAt: '2026-09-28T10:15:00Z',
        updatedAt: '2026-09-28T10:15:00Z'
      },
      {
        id: 'req-9',
        token: 'EP-MENT-2026-00490',
        studentId: 'user-stu-7',
        studentName: 'Tanmay Kulkarni',
        studentEmail: 'tanmay.kulkarni@edupilot.local',
        studentDepartment: 'Electronics & Telecommunication',
        studentSemester: 6,
        facultyId: 'user-fac-6',
        facultyName: 'Prof. Sneha Verma',
        facultyDepartment: 'Electronics & Telecommunication',
        reason: 'Signal processing algorithms for 5G beamforming simulator project.',
        mentoringArea: 'Telecom Projects & Research',
        studentGoal: 'Telecommunications Engineer',
        preferredMeetingMode: 'Hybrid',
        preferredTime: 'Tuesday 2:00 PM',
        message: 'Respected Maam, requesting your mentorship on phase-array calibration math in MATLAB.',
        status: 'Accepted',
        createdAt: '2026-08-25T11:00:00Z',
        updatedAt: '2026-08-26T09:00:00Z'
      },
      {
        id: 'req-10',
        token: 'EP-MENT-2026-00491',
        studentId: 'user-stu-6',
        studentName: 'Sneha Deshmukh',
        studentEmail: 'sneha.deshmukh@edupilot.local',
        studentDepartment: 'Information Technology',
        studentSemester: 4,
        facultyId: 'user-fac-8',
        facultyName: 'Prof. Meera Kulkarni',
        facultyDepartment: 'Information Technology',
        reason: 'Large-scale Apache Spark streaming pipeline optimization for real-time analytics.',
        mentoringArea: 'Data Engineering',
        studentGoal: 'Data Engineer / Analytics Consultant',
        preferredMeetingMode: 'Hybrid',
        preferredTime: 'Thursday 3:00 PM',
        message: 'Dear Professor, I would appreciate your guidance on windowing techniques in Spark Structured Streaming.',
        status: 'Pending',
        createdAt: '2026-09-30T15:00:00Z',
        updatedAt: '2026-09-30T15:00:00Z'
      }
    ];

    // 6. Active Mentorships (5 Active Relationships)
    this.mentorships = [
      {
        id: 'ment-1',
        studentId: 'user-stu-1',
        studentName: 'Aarav Mehta',
        facultyId: 'user-fac-1',
        facultyName: 'Dr. Rahul Sharma',
        facultyDepartment: 'Computer Engineering',
        requestToken: 'EP-MENT-2026-00482',
        status: 'Active',
        startDate: '2026-08-16',
        mentoringArea: 'Projects & Research (Explainable AI)',
        nextMeetingDate: '2026-10-08 14:30'
      },
      {
        id: 'ment-2',
        studentId: 'user-stu-2',
        studentName: 'Rohan Gupta',
        facultyId: 'user-fac-2',
        facultyName: 'Dr. Priya Patel',
        facultyDepartment: 'Computer Engineering',
        requestToken: 'EP-MENT-2026-00483',
        status: 'Active',
        startDate: '2026-08-18',
        mentoringArea: 'Web Development & Cloud Architecture',
        nextMeetingDate: '2026-10-07 11:30'
      },
      {
        id: 'ment-3',
        studentId: 'user-stu-3',
        studentName: 'Ananya Iyer',
        facultyId: 'user-fac-3',
        facultyName: 'Dr. Amit Shah',
        facultyDepartment: 'Information Technology',
        requestToken: 'EP-MENT-2026-00484',
        status: 'Active',
        startDate: '2026-08-13',
        mentoringArea: 'Security Auditing & Cryptography',
        nextMeetingDate: '2026-10-08 15:30'
      },
      {
        id: 'ment-4',
        studentId: 'user-stu-4',
        studentName: 'Kavya Nair',
        facultyId: 'user-fac-5',
        facultyName: 'Dr. Arvind Joshi',
        facultyDepartment: 'Electronics & Telecommunication',
        requestToken: 'EP-MENT-2026-00485',
        status: 'Active',
        startDate: '2026-08-15',
        mentoringArea: 'Embedded Hardware & Robotics',
        nextMeetingDate: '2026-10-10 15:30'
      },
      {
        id: 'ment-5',
        studentId: 'user-stu-7',
        studentName: 'Tanmay Kulkarni',
        facultyId: 'user-fac-6',
        facultyName: 'Prof. Sneha Verma',
        facultyDepartment: 'Electronics & Telecommunication',
        requestToken: 'EP-MENT-2026-00490',
        status: 'Active',
        startDate: '2026-08-26',
        mentoringArea: 'Telecom Projects & 5G Beamforming',
        nextMeetingDate: '2026-10-09 14:00'
      }
    ];

    // 7. Messages in Mentorship 1 (Aarav Mehta & Dr. Rahul Sharma)
    this.messages = [
      {
        id: 'msg-1',
        mentorshipId: 'ment-1',
        senderId: 'user-fac-1',
        senderName: 'Dr. Rahul Sharma',
        senderRole: 'faculty',
        recipientId: 'user-stu-1',
        recipientName: 'Aarav Mehta',
        content: 'Hello Aarav. Welcome to the mentorship program. I have approved your request. Let us review your dataset selection this Thursday.',
        timestamp: '2026-08-16T10:30:00Z',
        read: true
      },
      {
        id: 'msg-2',
        mentorshipId: 'ment-1',
        senderId: 'user-stu-1',
        senderName: 'Aarav Mehta',
        senderRole: 'student',
        recipientId: 'user-fac-1',
        recipientName: 'Dr. Rahul Sharma',
        content: 'Thank you very much, Dr. Sharma! I have prepared the preliminary data preprocessing pipeline and benchmarked baseline accuracy.',
        timestamp: '2026-08-16T11:00:00Z',
        read: true
      },
      {
        id: 'msg-3',
        mentorshipId: 'ment-1',
        senderId: 'user-fac-1',
        senderName: 'Dr. Rahul Sharma',
        senderRole: 'faculty',
        recipientId: 'user-stu-1',
        recipientName: 'Aarav Mehta',
        content: 'Excellent. Please complete the model comparison matrix task I assigned on your dashboard before our Thursday review.',
        timestamp: '2026-08-18T14:20:00Z',
        read: true
      },
      {
        id: 'msg-4',
        mentorshipId: 'ment-1',
        senderId: 'user-stu-1',
        senderName: 'Aarav Mehta',
        senderRole: 'student',
        recipientId: 'user-fac-1',
        recipientName: 'Dr. Rahul Sharma',
        content: 'I have uploaded the preliminary loss curve charts and added notes on quantization trade-offs.',
        timestamp: '2026-09-30T16:45:00Z',
        read: false
      }
    ];

    // 8. Goals & Roadmaps
    this.goals = [
      {
        id: 'goal-1',
        studentId: 'user-stu-1',
        facultyId: 'user-fac-1',
        title: 'Master Federated Learning & Publish Capstone Paper',
        category: 'Research & Project',
        targetDate: '2026-12-15',
        progressPercentage: 75,
        milestones: [
          { id: 'm-1', title: 'Literature survey of top 10 IEEE papers', completed: true, targetDate: '2026-08-30' },
          { id: 'm-2', title: 'Build synthetic non-IID edge data simulator', completed: true, targetDate: '2026-09-15' },
          { id: 'm-3', title: 'Implement FedAvg with differential privacy', completed: true, targetDate: '2026-09-30' },
          { id: 'm-4', title: 'Draft paper manuscript for conference review', completed: false, targetDate: '2026-10-25' },
          { id: 'm-5', title: 'Final oral project demonstration', completed: false, targetDate: '2026-11-20' }
        ],
        facultyFeedback: 'Great momentum so far. Ensure the differential privacy epsilon budget is mathematically justified in section 4.',
        createdAt: '2026-08-18T10:00:00Z'
      },
      {
        id: 'goal-2',
        studentId: 'user-stu-1',
        title: 'Complete LeetCode Top 150 & System Design Fundamentals',
        category: 'Career & Placement',
        targetDate: '2026-11-30',
        progressPercentage: 60,
        milestones: [
          { id: 'm-6', title: 'Master Dynamic Programming and Graph traversals', completed: true, targetDate: '2026-09-01' },
          { id: 'm-7', title: 'Solve 100 Medium LeetCode problems', completed: true, targetDate: '2026-09-25' },
          { id: 'm-8', title: 'Complete High-Level System Design (Caching, CDN, DB Sharding)', completed: false, targetDate: '2026-10-20' },
          { id: 'm-9', title: 'Conduct 3 peer mock interviews', completed: false, targetDate: '2026-11-10' }
        ],
        createdAt: '2026-08-20T11:00:00Z'
      }
    ];

    // 9. Tasks
    this.tasks = [
      {
        id: 'task-1',
        mentorshipId: 'ment-1',
        studentId: 'user-stu-1',
        facultyId: 'user-fac-1',
        facultyName: 'Dr. Rahul Sharma',
        title: 'Benchmark Quantization Loss on Edge Testbed',
        description: 'Run 8-bit post-training quantization on PyTorch model and measure CPU inference speed versus floating-point accuracy.',
        deadline: '2026-10-10',
        priority: 'High',
        status: 'In Progress',
        submissionNotes: 'Initial test on Raspberry Pi 4 completed; testing on Jetson Nano underway.',
        facultyRemarks: 'Verify memory bandwidth consumption during peak inference bursts.',
        createdAt: '2026-09-28T14:00:00Z'
      },
      {
        id: 'task-2',
        mentorshipId: 'ment-1',
        studentId: 'user-stu-1',
        facultyId: 'user-fac-1',
        facultyName: 'Dr. Rahul Sharma',
        title: 'Draft Methodology Section for Conference Paper',
        description: 'Formulate the mathematical equations for client weighting and aggregation under asynchronous client dropout.',
        deadline: '2026-10-15',
        priority: 'Medium',
        status: 'Pending',
        createdAt: '2026-10-01T09:30:00Z'
      },
      {
        id: 'task-3',
        mentorshipId: 'ment-1',
        studentId: 'user-stu-1',
        facultyId: 'user-fac-1',
        facultyName: 'Dr. Rahul Sharma',
        title: 'Complete Literature Survey Table',
        description: 'Summarize 12 related papers highlighting their limitations in non-IID data distribution.',
        deadline: '2026-09-15',
        priority: 'High',
        status: 'Completed',
        submissionNotes: 'Compiled comprehensive comparative LaTeX table with references.',
        facultyRemarks: 'Thorough and well-referenced. Approved.',
        createdAt: '2026-08-20T11:00:00Z'
      }
    ];

    // 10. Appointments
    this.appointments = [
      {
        id: 'apt-1',
        studentId: 'user-stu-1',
        studentName: 'Aarav Mehta',
        facultyId: 'user-fac-1',
        facultyName: 'Dr. Rahul Sharma',
        date: '2026-10-08',
        time: '02:30 PM - 03:30 PM',
        mode: 'In-person',
        topic: 'Mid-term Capstone Evaluation & Conference Submission Review',
        locationOrLink: 'Academic Block B, Room 304',
        status: 'Confirmed',
        notes: 'Bring laptop with live edge inference demo.',
        createdAt: '2026-09-29T10:00:00Z'
      },
      {
        id: 'apt-2',
        studentId: 'user-stu-2',
        studentName: 'Rohan Gupta',
        facultyId: 'user-fac-2',
        facultyName: 'Dr. Priya Patel',
        date: '2026-10-07',
        time: '11:30 AM - 12:30 PM',
        mode: 'In-person',
        topic: 'API Rate Limiting & Docker Cluster Review',
        locationOrLink: 'Lab Complex 2, Room 108',
        status: 'Confirmed',
        createdAt: '2026-09-30T11:00:00Z'
      }
    ];

    // 11. Announcements
    this.announcements = [
      {
        id: 'ann-1',
        title: 'Campus Final Year Project Mentoring Week 2026',
        content: 'All Semester 6 & 8 students must lock in their faculty mentor through EduPilot AI by October 15. Ensure your mentorship request tokens are approved.',
        authorName: 'Dr. Vikram Malhotra (Dean of Academics)',
        targetAudience: 'All',
        category: 'Projects',
        createdAt: '2026-09-28T09:00:00Z'
      },
      {
        id: 'ann-2',
        title: 'Summer Research Internship Opportunity with IIT Bombay & DRDO',
        content: 'Students with active faculty research mentorship in AI/ML, Embedded Systems, or Cryptography may apply through the Department office.',
        authorName: 'Dean of Academics',
        targetAudience: 'Students',
        category: 'Internships',
        createdAt: '2026-09-25T11:00:00Z'
      },
      {
        id: 'ann-3',
        title: 'Faculty Mentoring Office Hours Protocol',
        content: 'Faculty members are requested to update their weekly available slots and maximum student capacity under the EduPilot Availability tab.',
        authorName: 'Academic Directorate',
        targetAudience: 'Faculty',
        category: 'Mentoring Hours',
        createdAt: '2026-09-20T14:00:00Z'
      }
    ];

    // 12. Notifications for Student Aarav Mehta
    this.notifications = [
      {
        id: 'notif-1',
        userId: 'user-stu-1',
        title: 'Mentorship Request Accepted',
        message: 'Dr. Rahul Sharma accepted your mentorship request (EP-MENT-2026-00482).',
        type: 'mentorship',
        read: false,
        link: '/student/my-mentor',
        createdAt: '2026-08-16T10:15:00Z'
      },
      {
        id: 'notif-2',
        userId: 'user-stu-1',
        title: 'New Task Assigned',
        message: 'Dr. Rahul Sharma assigned a new task: "Benchmark Quantization Loss on Edge Testbed".',
        type: 'task',
        read: false,
        link: '/student/tasks',
        createdAt: '2026-09-28T14:00:00Z'
      },
      {
        id: 'notif-3',
        userId: 'user-stu-1',
        title: 'Meeting Confirmed',
        message: 'Upcoming in-person review scheduled for Oct 08 at 02:30 PM in Room 304.',
        type: 'meeting',
        read: true,
        link: '/student/appointments',
        createdAt: '2026-09-29T10:00:00Z'
      },
      {
        id: 'notif-4',
        userId: 'user-fac-1',
        title: 'New Mentorship Request',
        message: 'Sneha Deshmukh submitted request EP-MENT-2026-00484.',
        type: 'mentorship',
        read: false,
        link: '/faculty/requests',
        createdAt: '2026-09-25T11:20:00Z'
      },
      {
        id: 'notif-5',
        userId: 'user-admin-1',
        title: 'Pending Verifications',
        message: '2 new student accounts awaiting institutional identity verification.',
        type: 'verification',
        read: false,
        link: '/admin/students/verification',
        createdAt: '2026-10-01T08:00:00Z'
      }
    ];

    // 13. Audit Logs
    this.auditLogs = [
      {
        id: 'log-1',
        timestamp: '2026-08-01T09:00:00Z',
        userId: 'user-admin-1',
        userName: 'Dr. Vikram Malhotra',
        role: 'admin',
        action: 'System Initialization',
        details: 'Configured campus email domain filters: college.edu, edupilot.local'
      },
      {
        id: 'log-2',
        timestamp: '2026-08-05T10:00:00Z',
        userId: 'user-admin-1',
        userName: 'Dr. Vikram Malhotra',
        role: 'admin',
        action: 'Faculty Verified',
        details: 'Verified credentials for Dr. Rahul Sharma (FAC-CE-2026-101)'
      },
      {
        id: 'log-3',
        timestamp: '2026-08-10T12:00:00Z',
        userId: 'user-admin-1',
        userName: 'Dr. Vikram Malhotra',
        role: 'admin',
        action: 'Student Verified',
        details: 'Verified enrollment ID for Aarav Mehta (STU-CE-2024-042)'
      },
      {
        id: 'log-4',
        timestamp: '2026-08-15T14:30:00Z',
        userId: 'user-stu-1',
        userName: 'Aarav Mehta',
        role: 'student',
        action: 'Mentorship Request Created',
        details: 'Generated token EP-MENT-2026-00482 for Dr. Rahul Sharma'
      },
      {
        id: 'log-5',
        timestamp: '2026-08-16T10:15:00Z',
        userId: 'user-fac-1',
        userName: 'Dr. Rahul Sharma',
        role: 'faculty',
        action: 'Mentorship Request Accepted',
        details: 'Approved token EP-MENT-2026-00482; established active mentorship ment-1'
      }
    ];
  }

  // Helper Methods
  getUserByEmail(email: string): User | undefined {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.users.find(u => u.id === id);
  }

  getStudentProfile(userId: string): StudentProfile | undefined {
    return this.studentProfiles.get(userId);
  }

  getFacultyProfile(userId: string): FacultyProfile | undefined {
    return this.facultyProfiles.get(userId);
  }

  getAllFaculty(): { user: User; profile: FacultyProfile }[] {
    const list: { user: User; profile: FacultyProfile }[] = [];
    for (const [userId, profile] of this.facultyProfiles.entries()) {
      const user = this.getUserById(userId);
      if (user && user.verificationStatus === 'Verified') {
        list.push({ user, profile });
      }
    }
    return list;
  }

  getAllStudents(): { user: User; profile?: StudentProfile }[] {
    return this.users
      .filter(u => u.role === 'student')
      .map(u => ({ user: u, profile: this.studentProfiles.get(u.id) }));
  }

  isEmailDomainAllowed(email: string): boolean {
    const domain = email.split('@')[1]?.toLowerCase();
    if (!domain) return false;
    return this.settings.allowedDomains.some(d => domain === d.toLowerCase() || domain.endsWith('.' + d.toLowerCase()));
  }

  addAuditLog(userId: string, userName: string, role: User['role'], action: string, details: string) {
    this.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName,
      role,
      action,
      details
    });
    // Keep max 200 logs in memory
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  addNotification(userId: string, title: string, message: string, type: Notification['type'], link?: string) {
    this.notifications.unshift({
      id: `notif-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      title,
      message,
      type,
      read: false,
      link,
      createdAt: new Date().toISOString()
    });
  }
}

export const db = new InMemoryDatabase();
