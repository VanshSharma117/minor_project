import { StudentProfile, FacultyProfile, MatchScoreBreakdown, User } from './types.js';

/**
 * Calculates EduPilot Match Score between student profile and faculty profile
 * Weights:
 * - 40% Expertise Match
 * - 25% Student Interest / Goal Match
 * - 15% Faculty Availability
 * - 10% Department Match
 * - 10% Research / Mentoring Area Match
 */
export function calculateMatchScore(
  student: StudentProfile,
  faculty: FacultyProfile,
  facultyUser: User
): MatchScoreBreakdown {
  const matchingTags: string[] = [];

  // Concept and synonym expansion
  const areRelated = (a: string, b: string) => {
    if (a.includes(b) || b.includes(a)) return true;
    const synonyms: Record<string, string[]> = {
      'ai/ml': ['machine learning', 'artificial intelligence', 'data science', 'deep learning', 'python'],
      'machine learning': ['ai/ml', 'artificial intelligence', 'data science', 'python', 'algorithms'],
      'artificial intelligence': ['ai/ml', 'machine learning', 'data science', 'generative ai'],
      'web development': ['react', 'node.js', 'full stack development', 'javascript', 'typescript'],
      'cloud': ['cloud computing', 'distributed systems', 'devops', 'docker', 'kubernetes'],
      'cybersecurity': ['cryptography', 'network security', 'blockchain', 'ethical hacking'],
      'embedded': ['iot', 'robotics', 'microcontroller', 'vlsi', 'arm'],
      'telecom': ['wireless', 'signal processing', '5g', 'communications']
    };

    for (const [key, list] of Object.entries(synonyms)) {
      if ((a.includes(key) || key.includes(a)) && list.some(item => b.includes(item) || item.includes(b))) return true;
      if ((b.includes(key) || key.includes(b)) && list.some(item => a.includes(item) || item.includes(a))) return true;
    }
    return false;
  };

  // 1. Expertise Match (40%)
  const studentSkills = student.skills.map(s => s.toLowerCase().trim());
  const facultyExpertise = faculty.expertise.map(e => e.toLowerCase().trim());

  let expertiseCommonCount = 0;
  for (const skill of studentSkills) {
    for (const exp of facultyExpertise) {
      if (areRelated(skill, exp)) {
        expertiseCommonCount += 1.2;
        if (!matchingTags.includes(skill)) matchingTags.push(skill);
      }
    }
  }
  const maxPossibleExpertise = Math.max(studentSkills.length, 1);
  const expertiseScore = Math.min(100, Math.round((expertiseCommonCount / maxPossibleExpertise) * 110));

  // 2. Student Interest & Career Goal Match (25%)
  const studentInterests = student.interests.map(i => i.toLowerCase().trim());
  const studentGoal = student.careerGoal.toLowerCase();
  let interestMatches = 0;

  for (const interest of studentInterests) {
    for (const exp of facultyExpertise) {
      if (areRelated(interest, exp)) {
        interestMatches += 1.5;
        if (!matchingTags.includes(interest)) matchingTags.push(interest);
      }
    }
    for (const mentorArea of faculty.mentoringAreas) {
      if (areRelated(interest, mentorArea.toLowerCase())) {
        interestMatches += 1.2;
      }
    }
  }

  // Check career goal against faculty expertise / mentoring
  for (const exp of facultyExpertise) {
    if (areRelated(studentGoal, exp)) {
      interestMatches += 2.0;
    }
  }

  const interestGoalScore = Math.min(100, Math.round((interestMatches / Math.max(studentInterests.length, 1)) * 60));

  // 3. Faculty Availability (15%)
  let availabilityScore = 0;
  if (faculty.acceptingRequests) {
    if (faculty.availability === 'Available') {
      availabilityScore = 100;
    } else if (faculty.availability === 'Busy') {
      availabilityScore = 55;
    } else {
      availabilityScore = 10;
    }
  } else {
    availabilityScore = 0;
  }

  // Capacity penalty if full
  if (faculty.currentMentoringCount >= faculty.maxMentoringCapacity) {
    availabilityScore = Math.min(availabilityScore, 10);
  }

  // 4. Department Match (10%)
  const studentDept = student.department.toLowerCase().trim();
  const facultyDept = faculty.department.toLowerCase().trim();
  const departmentScore = (studentDept === facultyDept || studentDept.includes(facultyDept) || facultyDept.includes(studentDept))
    ? 100
    : 40; // Cross-department interdisciplinary mentoring gets base 40%

  // 5. Research & Mentoring Area Match (10%)
  const studentPrefAreas = student.preferredMentoringAreas.map(a => a.toLowerCase().trim());
  const facultyMentoringAreas = faculty.mentoringAreas.map(a => a.toLowerCase().trim());
  const facultyResearch = faculty.researchAreas.map(r => r.toLowerCase().trim());

  let areaMatches = 0;
  for (const pref of studentPrefAreas) {
    if (facultyMentoringAreas.some(m => m.includes(pref) || pref.includes(m))) {
      areaMatches++;
      if (!matchingTags.includes(pref)) matchingTags.push(pref);
    }
    if (facultyResearch.some(r => r.includes(pref) || pref.includes(r))) {
      areaMatches++;
    }
  }
  const mentoringAreaScore = Math.min(100, Math.round((areaMatches / Math.max(studentPrefAreas.length, 1)) * 75));

  // Weighted sum: 40% + 25% + 15% + 10% + 10%
  const overallScore = Math.round(
    expertiseScore * 0.40 +
    interestGoalScore * 0.25 +
    availabilityScore * 0.15 +
    departmentScore * 0.10 +
    mentoringAreaScore * 0.10
  );

  return {
    facultyId: faculty.userId,
    facultyName: facultyUser.name,
    facultyDepartment: faculty.department,
    designation: faculty.designation,
    overallScore: Math.min(99, Math.max(25, overallScore)),
    expertiseScore,
    interestGoalScore,
    availabilityScore,
    departmentScore,
    mentoringAreaScore,
    matchingTags: Array.from(new Set(matchingTags)).slice(0, 5),
    availability: faculty.availability,
    acceptingRequests: faculty.acceptingRequests,
    currentMentoringCount: faculty.currentMentoringCount,
    maxMentoringCapacity: faculty.maxMentoringCapacity
  };
}
