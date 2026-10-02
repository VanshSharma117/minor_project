import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db } from './db.js';
import { calculateMatchScore } from './matchingService.js';
import { askAIMentor, generateFacultyEscalationSummary } from './aiService.js';
import { broadcastMessage } from './socket.js';
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
  Announcement
} from './types.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'edupilot_campus_secret_key_2026';

// Middleware for JWT Authentication
export interface AuthenticatedRequest extends Request {
  user?: User;
}

export function authMiddleware(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; email: string; role: string };
    const user = db.getUserById(decoded.id);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: User not found' });
    }
    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Invalid token' });
  }
}

// Role-based authorization middleware
export function requireRole(...roles: Array<'student' | 'faculty' | 'admin'>) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Forbidden: You do not have permission to access this resource' });
    }
    next();
  };
}

// ==========================================
// 1. AUTHENTICATION & REGISTRATION
// ==========================================

router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'College email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.getUserByEmail(cleanEmail);

    if (!user) {
      return res.status(401).json({ error: 'Invalid college email or password.' });
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid college email or password.' });
    }

    // Role validation: selected role must match actual account role
    if (role && user.role !== role) {
      const actualRoleTitle = user.role === 'admin' ? 'Admin' : user.role === 'faculty' ? 'Faculty' : 'Student';
      return res.status(403).json({
        error: `These credentials belong to a ${actualRoleTitle} account. Please select ${actualRoleTitle} and try again.`,
        actualRole: user.role
      });
    }

    // Verification check (unless admin)
    if (user.role !== 'admin' && user.verificationStatus !== 'Verified') {
      if (user.verificationStatus === 'Pending') {
        return res.status(403).json({
          error: 'Your account is awaiting college verification.',
          status: 'Pending'
        });
      }
      if (user.verificationStatus === 'Suspended') {
        return res.status(403).json({
          error: 'Your account has been suspended by administration. Please visit the Dean of Academics office.',
          status: 'Suspended'
        });
      }
      if (user.verificationStatus === 'Rejected') {
        return res.status(403).json({
          error: 'Your registration was declined. Please verify your enrollment credentials with your department.',
          status: 'Rejected'
        });
      }
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    let profile: StudentProfile | FacultyProfile | undefined;
    if (user.role === 'student') {
      profile = db.getStudentProfile(user.id);
    } else if (user.role === 'faculty') {
      profile = db.getFacultyProfile(user.id);
    }

    db.addAuditLog(user.id, user.name, user.role, 'User Login', `Logged in from IP: ${req.ip || '127.0.0.1'}`);

    return res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        verificationStatus: user.verificationStatus,
        avatarUrl: user.avatarUrl
      },
      profile
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Internal server error during authentication' });
  }
});

router.post('/auth/register/student', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      studentId,
      department,
      semester,
      division,
      phone,
      password,
      skills,
      interests,
      careerGoal
    } = req.body;

    if (!name || !email || !studentId || !department || !password) {
      return res.status(400).json({ error: 'Please provide all mandatory student fields' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check college domain
    if (!db.isEmailDomainAllowed(cleanEmail)) {
      return res.status(400).json({
        error: `This platform is restricted to verified college students and faculty. Allowed domains: ${db.settings.allowedDomains.join(', ')}`
      });
    }

    if (db.getUserByEmail(cleanEmail)) {
      return res.status(400).json({ error: 'An account with this college email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const userId = `user-stu-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name,
      email: cleanEmail,
      passwordHash,
      role: 'student',
      verificationStatus: 'Pending',
      createdAt: new Date().toISOString(),
      avatarUrl: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`
    };

    const newProfile: StudentProfile = {
      userId,
      studentId,
      department,
      semester: Number(semester) || 1,
      division: division || 'A',
      phone: phone || '',
      cgpa: 0,
      skills: Array.isArray(skills) ? skills : (skills ? skills.split(',').map((s: string) => s.trim()) : []),
      interests: Array.isArray(interests) ? interests : (interests ? interests.split(',').map((i: string) => i.trim()) : []),
      careerGoal: careerGoal || '',
      projectInterests: [],
      preferredMentoringAreas: ['Career Planning', 'Projects'],
      profileCompletion: 70
    };

    db.users.push(newUser);
    db.studentProfiles.set(userId, newProfile);

    db.addAuditLog(userId, name, 'student', 'Student Registered', `Registered with ID ${studentId} (Awaiting verification)`);
    db.addNotification('user-admin-1', 'New Student Verification', `${name} (${studentId}) registered and requires verification.`, 'verification', '/admin/students/verification');

    return res.status(201).json({
      message: 'Student registration submitted successfully. Your account is awaiting institutional verification by administration.',
      userId,
      verificationStatus: 'Pending'
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to process student registration' });
  }
});

router.post('/auth/register/faculty', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      facultyId,
      department,
      designation,
      expertise,
      researchAreas,
      mentoringAreas,
      availability,
      maxCapacity,
      password
    } = req.body;

    if (!name || !email || !facultyId || !department || !password) {
      return res.status(400).json({ error: 'Please provide all mandatory faculty registration fields' });
    }

    const cleanEmail = email.trim().toLowerCase();

    if (!db.isEmailDomainAllowed(cleanEmail)) {
      return res.status(400).json({
        error: `This platform is restricted to verified college students and faculty. Allowed domains: ${db.settings.allowedDomains.join(', ')}`
      });
    }

    if (db.getUserByEmail(cleanEmail)) {
      return res.status(400).json({ error: 'An account with this college email already exists' });
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    const userId = `user-fac-${Date.now()}`;
    const newUser: User = {
      id: userId,
      name,
      email: cleanEmail,
      passwordHash,
      role: 'faculty',
      verificationStatus: 'Pending',
      createdAt: new Date().toISOString(),
      avatarUrl: `https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80`
    };

    const newProfile: FacultyProfile = {
      userId,
      facultyId,
      department,
      designation: designation || 'Assistant Professor',
      expertise: Array.isArray(expertise) ? expertise : (expertise ? expertise.split(',').map((e: string) => e.trim()) : []),
      researchAreas: Array.isArray(researchAreas) ? researchAreas : (researchAreas ? researchAreas.split(',').map((r: string) => r.trim()) : []),
      mentoringAreas: Array.isArray(mentoringAreas) ? mentoringAreas : ['Projects', 'Career Planning'],
      yearsExperience: 5,
      bio: 'Faculty mentor in ' + department,
      availability: availability || 'Available',
      acceptingRequests: true,
      maxMentoringCapacity: Number(maxCapacity) || 4,
      currentMentoringCount: 0,
      officeLocation: 'Academic Complex',
      meetingMode: 'Hybrid',
      officeHours: 'Mon & Thu: 2:00 PM - 4:00 PM'
    };

    db.users.push(newUser);
    db.facultyProfiles.set(userId, newProfile);

    db.addAuditLog(userId, name, 'faculty', 'Faculty Registered', `Registered with Faculty ID ${facultyId} (Awaiting verification)`);
    db.addNotification('user-admin-1', 'New Faculty Verification', `${name} (${facultyId}) registered and requires verification.`, 'verification', '/admin/faculty/verification');

    return res.status(201).json({
      message: 'Faculty registration submitted successfully. Your account is awaiting institutional verification by administration.',
      userId,
      verificationStatus: 'Pending'
    });
  } catch (error: any) {
    return res.status(500).json({ error: 'Failed to process faculty registration' });
  }
});

// Demo account switcher for quick evaluation
router.post('/auth/demo-switch', (req: Request, res: Response) => {
  const { role } = req.body;
  let targetEmail = 'admin@edupilot.local';
  if (role === 'student') targetEmail = 'student@edupilot.local';
  else if (role === 'faculty') targetEmail = 'faculty@edupilot.local';

  const user = db.getUserByEmail(targetEmail);
  if (!user) {
    return res.status(404).json({ error: 'Demo account not found' });
  }

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  let profile: StudentProfile | FacultyProfile | undefined;
  if (user.role === 'student') {
    profile = db.getStudentProfile(user.id);
  } else if (user.role === 'faculty') {
    profile = db.getFacultyProfile(user.id);
  }

  return res.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
      avatarUrl: user.avatarUrl
    },
    profile
  });
});

router.get('/auth/me', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let profile: StudentProfile | FacultyProfile | undefined;
  if (user.role === 'student') {
    profile = db.getStudentProfile(user.id);
  } else if (user.role === 'faculty') {
    profile = db.getFacultyProfile(user.id);
  }

  return res.json({
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      verificationStatus: user.verificationStatus,
      avatarUrl: user.avatarUrl
    },
    profile
  });
});

// ==========================================
// 2. STUDENT APIS
// ==========================================

router.get('/students/profile', authMiddleware, requireRole('student', 'faculty', 'admin'), (req: AuthenticatedRequest, res: Response) => {
  const targetId = (req.query.id as string) || req.user!.id;
  const profile = db.getStudentProfile(targetId);
  const user = db.getUserById(targetId);

  if (!profile || !user) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  return res.json({ user, profile });
});

router.put('/students/profile', authMiddleware, requireRole('student'), (req: AuthenticatedRequest, res: Response) => {
  const profile = db.getStudentProfile(req.user!.id);
  if (!profile) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  const {
    phone,
    skills,
    interests,
    careerGoal,
    projectInterests,
    preferredMentoringAreas,
    semester,
    division
  } = req.body;

  if (phone !== undefined) profile.phone = phone;
  if (skills !== undefined) profile.skills = Array.isArray(skills) ? skills : skills.split(',').map((s: string) => s.trim());
  if (interests !== undefined) profile.interests = Array.isArray(interests) ? interests : interests.split(',').map((i: string) => i.trim());
  if (careerGoal !== undefined) profile.careerGoal = careerGoal;
  if (projectInterests !== undefined) profile.projectInterests = Array.isArray(projectInterests) ? projectInterests : projectInterests.split(',').map((p: string) => p.trim());
  if (preferredMentoringAreas !== undefined) profile.preferredMentoringAreas = Array.isArray(preferredMentoringAreas) ? preferredMentoringAreas : preferredMentoringAreas.split(',').map((m: string) => m.trim());
  if (semester !== undefined) profile.semester = Number(semester);
  if (division !== undefined) profile.division = division;

  // Calculate profile completion
  let score = 50;
  if (profile.skills.length > 0) score += 10;
  if (profile.interests.length > 0) score += 10;
  if (profile.careerGoal) score += 10;
  if (profile.projectInterests.length > 0) score += 10;
  if (profile.phone) score += 10;
  profile.profileCompletion = Math.min(100, score);

  db.addAuditLog(req.user!.id, req.user!.name, 'student', 'Profile Updated', `Updated skills and career goals`);

  return res.json({ profile, message: 'Profile updated successfully' });
});

// ==========================================
// 3. FACULTY DISCOVERY & MATCHING
// ==========================================

router.get('/faculty', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { department, expertise, availability, search } = req.query;
  let facultyList = db.getAllFaculty();

  if (department) {
    facultyList = facultyList.filter(f => f.profile.department.toLowerCase() === (department as string).toLowerCase());
  }

  if (availability) {
    facultyList = facultyList.filter(f => f.profile.availability.toLowerCase() === (availability as string).toLowerCase());
  }

  if (expertise) {
    const term = (expertise as string).toLowerCase();
    facultyList = facultyList.filter(f => f.profile.expertise.some(e => e.toLowerCase().includes(term)));
  }

  if (search) {
    const term = (search as string).toLowerCase();
    facultyList = facultyList.filter(f =>
      f.user.name.toLowerCase().includes(term) ||
      f.profile.department.toLowerCase().includes(term) ||
      f.profile.expertise.some(e => e.toLowerCase().includes(term)) ||
      f.profile.researchAreas.some(r => r.toLowerCase().includes(term))
    );
  }

  return res.json(facultyList.map(f => ({
    id: f.user.id,
    name: f.user.name,
    email: f.user.email,
    avatarUrl: f.user.avatarUrl,
    profile: f.profile
  })));
});

router.get('/faculty/:id', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const facultyUser = db.getUserById(req.params.id);
  const profile = db.getFacultyProfile(req.params.id);

  if (!facultyUser || !profile) {
    return res.status(404).json({ error: 'Faculty member not found' });
  }

  return res.json({
    id: facultyUser.id,
    name: facultyUser.name,
    email: facultyUser.email,
    avatarUrl: facultyUser.avatarUrl,
    profile
  });
});

// EduPilot 5-Factor Weighted Mentor Matching Engine
router.get('/matching/recommendations', authMiddleware, requireRole('student'), (req: AuthenticatedRequest, res: Response) => {
  const studentProfile = db.getStudentProfile(req.user!.id);
  if (!studentProfile) {
    return res.status(404).json({ error: 'Student profile not found' });
  }

  const allFaculty = db.getAllFaculty();
  const scoredFaculty = allFaculty.map(({ user, profile }) => {
    return calculateMatchScore(studentProfile, profile, user);
  });

  // Sort descending by overall score
  scoredFaculty.sort((a, b) => b.overallScore - a.overallScore);

  return res.json({
    recommendations: scoredFaculty,
    methodology: {
      formula: "Overall Score = 40% Expertise + 25% Goal/Interests + 15% Availability + 10% Department + 10% Research/Mentoring Area",
      studentDepartment: studentProfile.department,
      studentSkillsCount: studentProfile.skills.length,
      studentInterestsCount: studentProfile.interests.length
    }
  });
});

router.put('/faculty/availability', authMiddleware, requireRole('faculty'), (req: AuthenticatedRequest, res: Response) => {
  const profile = db.getFacultyProfile(req.user!.id);
  if (!profile) {
    return res.status(404).json({ error: 'Faculty profile not found' });
  }

  const { availability, acceptingRequests, maxMentoringCapacity, officeHours, meetingMode, officeLocation } = req.body;

  if (availability) profile.availability = availability;
  if (acceptingRequests !== undefined) profile.acceptingRequests = acceptingRequests;
  if (maxMentoringCapacity !== undefined) profile.maxMentoringCapacity = Number(maxMentoringCapacity);
  if (officeHours) profile.officeHours = officeHours;
  if (meetingMode) profile.meetingMode = meetingMode;
  if (officeLocation) profile.officeLocation = officeLocation;

  db.addAuditLog(req.user!.id, req.user!.name, 'faculty', 'Availability Updated', `Status: ${profile.availability}, Accepting: ${profile.acceptingRequests}`);

  return res.json({ profile, message: 'Faculty availability updated successfully' });
});

router.put('/faculty/profile', authMiddleware, requireRole('faculty'), (req: AuthenticatedRequest, res: Response) => {
  const profile = db.getFacultyProfile(req.user!.id);
  if (!profile) {
    return res.status(404).json({ error: 'Faculty profile not found' });
  }

  const { bio, expertise, researchAreas, mentoringAreas } = req.body;
  if (bio) profile.bio = bio;
  if (expertise) profile.expertise = Array.isArray(expertise) ? expertise : expertise.split(',').map((e: string) => e.trim());
  if (researchAreas) profile.researchAreas = Array.isArray(researchAreas) ? researchAreas : researchAreas.split(',').map((r: string) => r.trim());
  if (mentoringAreas) profile.mentoringAreas = Array.isArray(mentoringAreas) ? mentoringAreas : mentoringAreas.split(',').map((m: string) => m.trim());

  return res.json({ profile, message: 'Faculty profile updated' });
});

// ==========================================
// 4. MENTORSHIP REQUEST & TOKEN SYSTEM
// ==========================================

router.post('/mentorship/request', authMiddleware, requireRole('student'), (req: AuthenticatedRequest, res: Response) => {
  const student = req.user!;
  const studentProfile = db.getStudentProfile(student.id);

  if (!studentProfile) {
    return res.status(400).json({ error: 'Complete your student profile before requesting mentorship' });
  }

  // Check active mentorship limits (RULE 5)
  const activeCount = db.mentorships.filter(m => m.studentId === student.id && m.status === 'Active').length;
  if (activeCount >= db.settings.maxMentorshipsPerStudent) {
    return res.status(400).json({
      error: `You have reached the institutional maximum of ${db.settings.maxMentorshipsPerStudent} active mentorship relationships.`
    });
  }

  const {
    facultyId,
    reason,
    mentoringArea,
    studentGoal,
    preferredMeetingMode,
    preferredTime,
    message,
    aiSummaryAttached
  } = req.body;

  if (!facultyId || !reason || !mentoringArea) {
    return res.status(400).json({ error: 'Faculty ID, reason, and mentoring area are required' });
  }

  const facultyUser = db.getUserById(facultyId);
  const facultyProfile = db.getFacultyProfile(facultyId);

  if (!facultyUser || !facultyProfile) {
    return res.status(404).json({ error: 'Faculty member not found' });
  }

  // RULE 3 & RULE 4: Check if faculty is accepting and has capacity
  if (!facultyProfile.acceptingRequests) {
    return res.status(400).json({
      error: 'This faculty member is currently not accepting new mentorship requests. You can explore other faculty mentors or consult EduPilot AI.'
    });
  }

  if (facultyProfile.currentMentoringCount >= facultyProfile.maxMentoringCapacity) {
    return res.status(400).json({
      error: 'This faculty member has reached maximum student capacity for this semester. You can consult EduPilot AI for immediate guidance.'
    });
  }

  // Check if pending request already exists
  const existingPending = db.mentorshipRequests.find(
    r => r.studentId === student.id && r.facultyId === facultyId && r.status === 'Pending'
  );
  if (existingPending) {
    return res.status(400).json({
      error: `You already have a pending mentorship request (${existingPending.token}) with this faculty member.`
    });
  }

  // Generate unique Mentorship Request Token: EP-MENT-2026-XXXXX
  const randomSuffix = Math.floor(10000 + Math.random() * 90000);
  const token = `EP-MENT-2026-${randomSuffix}`;

  const newRequest: MentorshipRequest = {
    id: `req-${Date.now()}`,
    token,
    studentId: student.id,
    studentName: student.name,
    studentEmail: student.email,
    studentDepartment: studentProfile.department,
    studentSemester: studentProfile.semester,
    facultyId,
    facultyName: facultyUser.name,
    facultyDepartment: facultyProfile.department,
    reason,
    mentoringArea,
    studentGoal: studentGoal || studentProfile.careerGoal,
    preferredMeetingMode: preferredMeetingMode || 'Hybrid',
    preferredTime: preferredTime || 'Flexible',
    message: message || '',
    aiSummaryAttached,
    status: 'Pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.mentorshipRequests.unshift(newRequest);

  // Notify faculty
  db.addNotification(
    facultyId,
    'New Mentorship Request',
    `${student.name} (${studentProfile.department}) submitted request ${token} for ${mentoringArea}.`,
    'mentorship',
    '/faculty/requests'
  );

  // Add audit log
  db.addAuditLog(
    student.id,
    student.name,
    'student',
    'Mentorship Request Submitted',
    `Token: ${token} sent to ${facultyUser.name}`
  );

  return res.status(201).json({
    message: 'Mentorship request submitted successfully.',
    request: newRequest,
    token
  });
});

router.get('/mentorship/requests', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let requests: MentorshipRequest[] = [];

  if (user.role === 'student') {
    requests = db.mentorshipRequests.filter(r => r.studentId === user.id);
  } else if (user.role === 'faculty') {
    requests = db.mentorshipRequests.filter(r => r.facultyId === user.id);
  } else if (user.role === 'admin') {
    requests = db.mentorshipRequests;
  }

  return res.json(requests);
});

router.put('/mentorship/request/:id/accept', authMiddleware, requireRole('faculty'), (req: AuthenticatedRequest, res: Response) => {
  const request = db.mentorshipRequests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Mentorship request not found' });
  }

  if (request.facultyId !== req.user!.id) {
    return res.status(403).json({ error: 'You are not authorized to accept this request' });
  }

  if (request.status !== 'Pending') {
    return res.status(400).json({ error: `Request cannot be accepted because it is already ${request.status}` });
  }

  const facultyProfile = db.getFacultyProfile(req.user!.id);
  if (!facultyProfile) {
    return res.status(404).json({ error: 'Faculty profile not found' });
  }

  if (facultyProfile.currentMentoringCount >= facultyProfile.maxMentoringCapacity) {
    return res.status(400).json({ error: 'You have reached your maximum student capacity.' });
  }

  // Update request status
  request.status = 'Accepted';
  request.updatedAt = new Date().toISOString();

  // Create Active Mentorship
  const newMentorship: Mentorship = {
    id: `ment-${Date.now()}`,
    studentId: request.studentId,
    studentName: request.studentName,
    facultyId: request.facultyId,
    facultyName: request.facultyName,
    facultyDepartment: request.facultyDepartment,
    requestToken: request.token,
    status: 'Active',
    startDate: new Date().toISOString().split('T')[0],
    mentoringArea: request.mentoringArea
  };
  db.mentorships.push(newMentorship);

  // Update student active mentor and faculty count
  facultyProfile.currentMentoringCount += 1;
  const studentProfile = db.getStudentProfile(request.studentId);
  if (studentProfile) {
    studentProfile.activeMentorId = req.user!.id;
  }

  // Notify student
  db.addNotification(
    request.studentId,
    'Mentorship Request Accepted',
    `Your mentorship request (${request.token}) has been accepted by ${req.user!.name}.`,
    'mentorship',
    '/student/my-mentor'
  );

  db.addAuditLog(
    req.user!.id,
    req.user!.name,
    'faculty',
    'Mentorship Request Accepted',
    `Accepted request ${request.token} from ${request.studentName}`
  );

  return res.json({
    message: 'Mentorship request accepted and active workspace created.',
    request,
    mentorship: newMentorship
  });
});

router.put('/mentorship/request/:id/reject', authMiddleware, requireRole('faculty'), (req: AuthenticatedRequest, res: Response) => {
  const request = db.mentorshipRequests.find(r => r.id === req.params.id);
  if (!request) {
    return res.status(404).json({ error: 'Mentorship request not found' });
  }

  if (request.facultyId !== req.user!.id) {
    return res.status(403).json({ error: 'You are not authorized to respond to this request' });
  }

  const { reason } = req.body;
  request.status = 'Rejected';
  request.rejectionReason = reason || 'Faculty is currently at capacity or unable to take new topics this term.';
  request.updatedAt = new Date().toISOString();

  db.addNotification(
    request.studentId,
    'Mentorship Request Update',
    `Your mentorship request (${request.token}) was declined by ${req.user!.name}. Reason: ${request.rejectionReason}`,
    'mentorship',
    '/student/requests'
  );

  db.addAuditLog(
    req.user!.id,
    req.user!.name,
    'faculty',
    'Mentorship Request Rejected',
    `Declined request ${request.token} from ${request.studentName}`
  );

  return res.json({ message: 'Request rejected', request });
});

router.get('/mentorship/active', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  if (user.role === 'student') {
    const active = db.mentorships.find(m => m.studentId === user.id && m.status === 'Active');
    if (!active) {
      return res.json({ active: null });
    }
    const facultyUser = db.getUserById(active.facultyId);
    const facultyProfile = db.getFacultyProfile(active.facultyId);
    return res.json({ active, faculty: { user: facultyUser, profile: facultyProfile } });
  } else if (user.role === 'faculty') {
    const actives = db.mentorships.filter(m => m.facultyId === user.id && m.status === 'Active');
    const studentList = actives.map(m => {
      const studentUser = db.getUserById(m.studentId);
      const studentProfile = db.getStudentProfile(m.studentId);
      return { mentorship: m, student: { user: studentUser, profile: studentProfile } };
    });
    return res.json({ actives: studentList });
  }
  return res.json({ mentorships: db.mentorships });
});

// ==========================================
// 5. MESSAGING (STUDENT ↔ FACULTY)
// ==========================================

router.get('/messages', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { mentorshipId } = req.query;

  let msgs = db.messages.filter(m => m.senderId === user.id || m.recipientId === user.id);
  if (mentorshipId) {
    msgs = msgs.filter(m => m.mentorshipId === mentorshipId);
  }

  return res.json(msgs);
});

router.post('/messages', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { recipientId, content, mentorshipId } = req.body;

  if (!recipientId || !content) {
    return res.status(400).json({ error: 'Recipient and message content are required' });
  }

  const recipient = db.getUserById(recipientId);
  if (!recipient) {
    return res.status(404).json({ error: 'Recipient not found' });
  }

  const newMessage: Message = {
    id: `msg-${Date.now()}`,
    mentorshipId,
    senderId: user.id,
    senderName: user.name,
    senderRole: user.role,
    recipientId: recipient.id,
    recipientName: recipient.name,
    content,
    timestamp: new Date().toISOString(),
    read: false
  };

  db.messages.push(newMessage);

  // Broadcast in real-time to all connected Socket.IO clients
  broadcastMessage(newMessage);

  db.addNotification(
    recipient.id,
    `New message from ${user.name}`,
    content.slice(0, 80),
    'mentorship',
    user.role === 'student' ? '/faculty/messages' : '/student/messages'
  );

  return res.status(201).json(newMessage);
});

// ==========================================
// 6. GOALS & ROADMAP
// ==========================================

router.get('/goals', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const studentId = (req.query.studentId as string) || (user.role === 'student' ? user.id : undefined);

  if (!studentId && user.role !== 'admin') {
    return res.status(400).json({ error: 'Student ID required' });
  }

  const goals = studentId ? db.goals.filter(g => g.studentId === studentId) : db.goals;
  return res.json(goals);
});

router.post('/goals', authMiddleware, requireRole('student'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { title, category, targetDate, milestones } = req.body;

  if (!title || !targetDate) {
    return res.status(400).json({ error: 'Goal title and target date are required' });
  }

  const newGoal: Goal = {
    id: `goal-${Date.now()}`,
    studentId: user.id,
    title,
    category: category || 'Career & Technical',
    targetDate,
    progressPercentage: 0,
    milestones: Array.isArray(milestones) ? milestones.map((m: any, idx: number) => ({
      id: `m-${Date.now()}-${idx}`,
      title: typeof m === 'string' ? m : m.title,
      completed: false,
      targetDate: m.targetDate
    })) : [],
    createdAt: new Date().toISOString()
  };

  db.goals.push(newGoal);
  return res.status(201).json(newGoal);
});

router.put('/goals/:id/milestone', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const { milestoneId, completed } = req.body;
  const goal = db.goals.find(g => g.id === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });

  const milestone = goal.milestones.find(m => m.id === milestoneId);
  if (!milestone) return res.status(404).json({ error: 'Milestone not found' });

  milestone.completed = completed;
  const total = goal.milestones.length;
  const done = goal.milestones.filter(m => m.completed).length;
  goal.progressPercentage = total > 0 ? Math.round((done / total) * 100) : 0;

  return res.json(goal);
});

router.post('/goals/:id/feedback', authMiddleware, requireRole('faculty'), (req: AuthenticatedRequest, res: Response) => {
  const { feedback } = req.body;
  const goal = db.goals.find(g => g.id === req.params.id);
  if (!goal) return res.status(404).json({ error: 'Goal not found' });

  goal.facultyFeedback = feedback;
  db.addNotification(goal.studentId, 'Faculty Feedback on Goal', feedback.slice(0, 100), 'task', '/student/goals');

  return res.json(goal);
});

// ==========================================
// 7. TASK MANAGEMENT
// ==========================================

router.get('/tasks', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let tasks: Task[] = [];

  if (user.role === 'student') {
    tasks = db.tasks.filter(t => t.studentId === user.id);
  } else if (user.role === 'faculty') {
    tasks = db.tasks.filter(t => t.facultyId === user.id);
  } else {
    tasks = db.tasks;
  }

  return res.json(tasks);
});

router.post('/tasks', authMiddleware, requireRole('faculty'), (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { studentId, title, description, deadline, priority, mentorshipId } = req.body;

  if (!studentId || !title || !deadline) {
    return res.status(400).json({ error: 'Student, task title, and deadline are required' });
  }

  const newTask: Task = {
    id: `task-${Date.now()}`,
    mentorshipId,
    studentId,
    facultyId: user.id,
    facultyName: user.name,
    title,
    description: description || '',
    deadline,
    priority: priority || 'Medium',
    status: 'Pending',
    createdAt: new Date().toISOString()
  };

  db.tasks.unshift(newTask);

  db.addNotification(
    studentId,
    `New Task Assigned by ${user.name}`,
    `Task: ${title} (Deadline: ${deadline})`,
    'task',
    '/student/tasks'
  );

  return res.status(201).json(newTask);
});

router.put('/tasks/:id/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const task = db.tasks.find(t => t.id === req.params.id);
  if (!task) return res.status(404).json({ error: 'Task not found' });

  const { status, submissionNotes, facultyRemarks } = req.body;
  if (status) task.status = status;
  if (submissionNotes !== undefined) task.submissionNotes = submissionNotes;
  if (facultyRemarks !== undefined) task.facultyRemarks = facultyRemarks;

  if (req.user!.role === 'student' && status === 'Completed') {
    db.addNotification(
      task.facultyId,
      `Task Completed by Student`,
      `${req.user!.name} marked "${task.title}" as completed.`,
      'task',
      '/faculty/tasks'
    );
  }

  return res.json(task);
});

// ==========================================
// 8. APPOINTMENTS & MEETINGS
// ==========================================

router.get('/appointments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  let list = db.appointments;
  if (user.role === 'student') {
    list = list.filter(a => a.studentId === user.id);
  } else if (user.role === 'faculty') {
    list = list.filter(a => a.facultyId === user.id);
  }
  return res.json(list);
});

router.post('/appointments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const { facultyId, studentId, date, time, mode, topic, locationOrLink, notes } = req.body;

  let fId = facultyId;
  let sId = studentId;

  if (user.role === 'student') {
    sId = user.id;
  } else if (user.role === 'faculty') {
    fId = user.id;
  }

  const sUser = db.getUserById(sId);
  const fUser = db.getUserById(fId);

  if (!sUser || !fUser) {
    return res.status(400).json({ error: 'Invalid student or faculty participant' });
  }

  const newAppointment: Appointment = {
    id: `apt-${Date.now()}`,
    studentId: sId,
    studentName: sUser.name,
    facultyId: fId,
    facultyName: fUser.name,
    date,
    time,
    mode: mode || 'In-person',
    topic,
    locationOrLink: locationOrLink || 'Faculty Office',
    status: user.role === 'faculty' ? 'Confirmed' : 'Requested',
    notes,
    createdAt: new Date().toISOString()
  };

  db.appointments.unshift(newAppointment);

  const recipient = user.role === 'student' ? fId : sId;
  db.addNotification(
    recipient,
    `New Meeting ${user.role === 'faculty' ? 'Scheduled' : 'Requested'}`,
    `${topic} on ${date} at ${time}`,
    'meeting',
    user.role === 'student' ? '/faculty/appointments' : '/student/appointments'
  );

  return res.status(201).json(newAppointment);
});

router.put('/appointments/:id/status', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const apt = db.appointments.find(a => a.id === req.params.id);
  if (!apt) return res.status(404).json({ error: 'Appointment not found' });

  const { status, notes } = req.body;
  if (status) apt.status = status;
  if (notes) apt.notes = notes;

  return res.json(apt);
});

// ==========================================
// 9. AI MENTOR API
// ==========================================

router.post('/ai/chat', authMiddleware, requireRole('student'), async (req: AuthenticatedRequest, res: Response) => {
  try {
    const student = req.user!;
    const profile = db.getStudentProfile(student.id);

    if (!profile) {
      return res.status(400).json({ error: 'Student profile required for personalized AI mentoring' });
    }

    const { messages } = req.body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Conversation messages array is required' });
    }

    const aiResult = await askAIMentor(messages, profile, student.name);
    return res.json(aiResult);
  } catch (error: any) {
    return res.status(500).json({ error: 'Error generating AI mentor guidance' });
  }
});

router.post('/ai/escalate-summary', authMiddleware, requireRole('student'), (req: AuthenticatedRequest, res: Response) => {
  const student = req.user!;
  const profile = db.getStudentProfile(student.id);
  const { query } = req.body;

  if (!profile) return res.status(404).json({ error: 'Student profile not found' });

  const summary = generateFacultyEscalationSummary(profile, query);
  return res.json(summary);
});

// ==========================================
// 10. NOTIFICATIONS & ANNOUNCEMENTS
// ==========================================

router.get('/notifications', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const userNotifs = db.notifications.filter(n => n.userId === user.id);
  return res.json(userNotifs);
});

router.put('/notifications/:id/read', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const notif = db.notifications.find(n => n.id === req.params.id && n.userId === req.user!.id);
  if (notif) notif.read = true;
  return res.json({ success: true });
});

router.put('/notifications/read-all', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  db.notifications.forEach(n => {
    if (n.userId === req.user!.id) n.read = true;
  });
  return res.json({ success: true });
});

router.get('/announcements', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  const user = req.user!;
  const audience = user.role === 'student' ? ['All', 'Students'] : user.role === 'faculty' ? ['All', 'Faculty'] : ['All', 'Students', 'Faculty'];
  const filtered = db.announcements.filter(a => audience.includes(a.targetAudience));
  return res.json(filtered);
});

router.post('/announcements', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { title, content, targetAudience, category } = req.body;
  if (!title || !content) {
    return res.status(400).json({ error: 'Title and content are required' });
  }

  const newAnn: Announcement = {
    id: `ann-${Date.now()}`,
    title,
    content,
    authorName: req.user!.name,
    targetAudience: targetAudience || 'All',
    category: category || 'General',
    createdAt: new Date().toISOString()
  };

  db.announcements.unshift(newAnn);
  db.addAuditLog(req.user!.id, req.user!.name, 'admin', 'Campus Announcement Created', `Title: ${title} (Audience: ${targetAudience})`);

  return res.status(201).json(newAnn);
});

// ==========================================
// 11. INSTITUTION ADMIN APIS
// ==========================================

router.get('/admin/overview', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const totalStudents = db.users.filter(u => u.role === 'student').length;
  const verifiedStudents = db.users.filter(u => u.role === 'student' && u.verificationStatus === 'Verified').length;
  const pendingStudents = db.users.filter(u => u.role === 'student' && u.verificationStatus === 'Pending').length;

  const totalFaculty = db.users.filter(u => u.role === 'faculty').length;
  const verifiedFaculty = db.users.filter(u => u.role === 'faculty' && u.verificationStatus === 'Verified').length;
  const pendingFaculty = db.users.filter(u => u.role === 'faculty' && u.verificationStatus === 'Pending').length;

  const totalRequests = db.mentorshipRequests.length;
  const pendingRequests = db.mentorshipRequests.filter(r => r.status === 'Pending').length;
  const activeMentorships = db.mentorships.filter(m => m.status === 'Active').length;

  const departmentCounts: Record<string, number> = {};
  db.studentProfiles.forEach(sp => {
    departmentCounts[sp.department] = (departmentCounts[sp.department] || 0) + 1;
  });

  return res.json({
    totalStudents,
    verifiedStudents,
    pendingStudents,
    totalFaculty,
    verifiedFaculty,
    pendingFaculty,
    totalRequests,
    pendingRequests,
    activeMentorships,
    departments: db.departments,
    departmentCounts,
    totalAuditLogs: db.auditLogs.length
  });
});

router.get('/admin/students', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const list = db.getAllStudents();
  return res.json(list);
});

router.get('/admin/users', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const students = db.getAllStudents();
  const faculty = db.users
    .filter(u => u.role === 'faculty')
    .map(u => ({ user: u, profile: db.getFacultyProfile(u.id) }));
  return res.json([...students, ...faculty]);
});

router.put('/admin/students/:id/verify', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const student = db.getUserById(req.params.id);
  if (!student || student.role !== 'student') {
    return res.status(404).json({ error: 'Student not found' });
  }

  const { status } = req.body;
  student.verificationStatus = status;

  db.addAuditLog(req.user!.id, req.user!.name, 'admin', `Student ${status}`, `Student: ${student.name} (${student.email})`);
  db.addNotification(student.id, `Account Status Update: ${status}`, `Your institutional enrollment verification is now ${status}.`, 'verification');

  return res.json({ student, message: `Student status updated to ${status}` });
});

router.get('/admin/faculty', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const list = db.users
    .filter(u => u.role === 'faculty')
    .map(u => ({ user: u, profile: db.getFacultyProfile(u.id) }));
  return res.json(list);
});

router.put('/admin/faculty/:id/verify', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const faculty = db.getUserById(req.params.id);
  if (!faculty || faculty.role !== 'faculty') {
    return res.status(404).json({ error: 'Faculty not found' });
  }

  const { status } = req.body;
  faculty.verificationStatus = status;

  db.addAuditLog(req.user!.id, req.user!.name, 'admin', `Faculty ${status}`, `Faculty: ${faculty.name} (${faculty.email})`);
  db.addNotification(faculty.id, `Faculty Verification: ${status}`, `Your faculty status has been set to ${status}.`, 'verification');

  return res.json({ faculty, message: `Faculty status updated to ${status}` });
});

router.get('/admin/audit-logs', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.auditLogs);
});

router.get('/admin/settings', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.settings);
});

router.put('/admin/settings', authMiddleware, requireRole('admin'), (req: AuthenticatedRequest, res: Response) => {
  const { allowedDomains, maxMentorshipsPerStudent, currentAcademicSemester, registrationsOpen } = req.body;

  if (allowedDomains && Array.isArray(allowedDomains)) db.settings.allowedDomains = allowedDomains;
  if (maxMentorshipsPerStudent !== undefined) db.settings.maxMentorshipsPerStudent = Number(maxMentorshipsPerStudent);
  if (currentAcademicSemester) db.settings.currentAcademicSemester = currentAcademicSemester;
  if (registrationsOpen !== undefined) db.settings.registrationsOpen = registrationsOpen;

  db.addAuditLog(req.user!.id, req.user!.name, 'admin', 'System Settings Updated', `Configured allowed domains and mentorship limits`);

  return res.json({ settings: db.settings, message: 'Settings saved' });
});

router.get('/departments', authMiddleware, (req: AuthenticatedRequest, res: Response) => {
  return res.json(db.departments);
});

export default router;
