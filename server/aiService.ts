import { GoogleGenAI } from '@google/genai';
import { StudentProfile } from './types.js';

let genAIClient: GoogleGenAI | null = null;

function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!genAIClient) {
    genAIClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return genAIClient;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AIResponse {
  reply: string;
  suggestedAction?: 'escalate_to_faculty' | 'create_roadmap' | 'view_mentors';
  recommendedFacultyArea?: string;
  mentoringSummary?: {
    goal: string;
    currentSkills: string[];
    needsHelpWith: string;
    recommendedMentoringArea: string;
  };
}

export async function askAIMentor(
  messages: ChatMessage[],
  studentProfile: StudentProfile,
  studentName: string
): Promise<AIResponse> {
  const lastUserMessage = messages[messages.length - 1]?.content || '';
  const lowerMsg = lastUserMessage.toLowerCase();

  // Detect escalation triggers: needs official thesis approval, faculty signature, lab access, marks dispute, formal project guide
  const escalationKeywords = [
    'faculty guide', 'official approval', 'sign my', 'signature', 'thesis approval',
    'lab equipment', 'grade appeal', 'recommendation letter', 'lor', 'marks dispute',
    'attendance issue', 'sponsor letter', 'faculty mentor'
  ];
  const shouldEscalate = escalationKeywords.some(keyword => lowerMsg.includes(keyword)) ||
    (lowerMsg.includes('project') && (lowerMsg.includes('approve') || lowerMsg.includes('review my code')));

  const ai = getGenAI();

  if (ai) {
    try {
      const systemInstruction = `You are "EduPilot AI", an academic AI mentoring assistant for an internal college campus platform.
CRITICAL GUIDELINE: AI assists faculty; it does not replace faculty.
You provide preliminary guidance, learning roadmaps, technical explanations, skill-gap analysis, and project ideation.
You NEVER claim to have the authority of faculty or college administration.
For official college policies, approvals, grading, and faculty allocation, always advise consulting human faculty.

Current Student Context:
- Name: ${studentName}
- Department: ${studentProfile.department}
- Semester: ${studentProfile.semester}
- Current Skills: ${studentProfile.skills.join(', ')}
- Interests: ${studentProfile.interests.join(', ')}
- Career Goal: ${studentProfile.careerGoal}
- Preferred Mentoring Areas: ${studentProfile.preferredMentoringAreas.join(', ')}

Style & Format:
- Use clear bullet points, actionable steps, and encouraging academic tone.
- Keep responses concise (under 250 words unless detailed roadmap requested).
- If the student requests official academic approvals or specialized research direction, explicitly suggest escalating to a verified faculty mentor.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: [
          { role: 'user', parts: [{ text: `Conversation history:\n${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}\n\nStudent question: ${lastUserMessage}` }] }
        ],
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      const replyText = response.text || "I am here to guide your academic progress. Let me know if you would like me to connect you with a faculty mentor.";

      let mentoringSummary;
      if (shouldEscalate || lowerMsg.includes('mentor') || lowerMsg.includes('faculty')) {
        mentoringSummary = {
          goal: studentProfile.careerGoal || 'Academic & Project Guidance',
          currentSkills: studentProfile.skills.slice(0, 4),
          needsHelpWith: lastUserMessage.slice(0, 100),
          recommendedMentoringArea: studentProfile.preferredMentoringAreas[0] || 'Technical Project Mentorship'
        };
      }

      return {
        reply: replyText,
        suggestedAction: shouldEscalate ? 'escalate_to_faculty' : undefined,
        recommendedFacultyArea: studentProfile.preferredMentoringAreas[0] || 'Engineering Mentorship',
        mentoringSummary
      };
    } catch (err) {
      console.warn('Gemini API call failed, falling back to built-in campus AI engine:', err);
    }
  }

  // Fallback intelligent campus mentoring engine
  let reply = '';
  let suggestedAction: AIResponse['suggestedAction'] = undefined;
  let mentoringSummary;

  if (lowerMsg.includes('roadmap') || lowerMsg.includes('learn') || lowerMsg.includes('path') || lowerMsg.includes('become')) {
    reply = `Based on your semester (${studentProfile.semester}) in ${studentProfile.department} and your goal to become a **${studentProfile.careerGoal || 'Software Engineer'}**, here is a recommended structured learning roadmap:

1. **Foundations**: Deepen core programming in ${studentProfile.skills.slice(0, 2).join(' and ') || 'C++ & Python'} with Data Structures & Algorithms.
2. **Applied Skills**: Build 2 end-to-end projects aligned with your interests in ${studentProfile.interests.slice(0, 2).join(' & ') || 'Web & AI'}.
3. **System Architecture**: Learn Git version control, REST APIs, and database fundamentals.
4. **Capstone Preparation**: Select a minor or major project topic aligned with faculty research domains.
5. **Interview & Placement Readiness**: LeetCode medium problem sets, technical mock interviews, and resume refinement.

*Note: For official capstone topic approval, discuss this roadmap with your department faculty mentor.*`;
  } else if (lowerMsg.includes('project') || lowerMsg.includes('idea')) {
    reply = `Here are 3 tailored project ideas for ${studentProfile.department} students aiming for ${studentProfile.careerGoal}:

• **Autonomous Smart Campus Navigator**: Integrates graph search algorithms and campus IoT sensors.
• **AI-Assisted Automated Code Reviewer**: Utilizes NLP to detect security vulnerabilities and styling bugs.
• **Decentralized Academic Credential Verification**: A secure verifiable credential ledger for university transcripts.

Each project demonstrates mastery of ${studentProfile.skills.slice(0, 2).join(', ')} while matching department capstone requirements.`;
  } else if (lowerMsg.includes('skill') || lowerMsg.includes('gap')) {
    reply = `**Skill-Gap Analysis for ${studentName}**:
• **Your Current Strengths**: ${studentProfile.skills.join(', ')}
• **Recommended Target Skills**: System Design, Cloud Deployments (Docker, CI/CD), and Production Testing.
• **Immediate Next Step**: Build an end-to-end portfolio project bridging your frontend and backend skills.`;
  } else if (lowerMsg.includes('internship') || lowerMsg.includes('resume')) {
    reply = `For campus internship preparation during Semester ${studentProfile.semester}:
1. **GitHub Portfolio**: Ensure your top 2 repositories have clean READMEs, architecture diagrams, and live demos.
2. **Core Subjects**: Review Operating Systems, DBMS, Computer Networks, and OOP concepts.
3. **Campus Placement Cell**: Check deadline notices published by the Admin portal.
4. **Faculty LOR**: If applying for research internships (e.g., IITs or abroad), prepare a summary to request a recommendation from your faculty mentor.`;
  } else if (shouldEscalate) {
    suggestedAction = 'escalate_to_faculty';
    reply = `This inquiry involves formal academic permissions or in-depth lab research direction. 

**Campus Notice:**
"AI assists faculty; it does not replace faculty."

I recommend escalating this to a verified faculty mentor in your department (${studentProfile.department}). I have prepared a student mentoring summary you can attach directly to your mentorship request token.`;
    mentoringSummary = {
      goal: studentProfile.careerGoal,
      currentSkills: studentProfile.skills,
      needsHelpWith: lastUserMessage,
      recommendedMentoringArea: studentProfile.preferredMentoringAreas[0] || 'Academic Guidance'
    };
  } else {
    reply = `Hello ${studentName}! As your EduPilot AI Mentor, I am here to help you navigate your coursework in ${studentProfile.department}, explore projects, and prepare for career opportunities.

You can ask me to:
• **"Create my learning roadmap"**
• **"Help me choose a project"**
• **"Analyze my skill gaps"**
• **"Help me prepare for an internship"**

Whenever you need specialized human guidance or project approval, click **"Find a Faculty Mentor"** anytime.`;
  }

  return {
    reply,
    suggestedAction,
    recommendedFacultyArea: studentProfile.preferredMentoringAreas[0] || 'Technical Mentorship',
    mentoringSummary
  };
}

export function generateFacultyEscalationSummary(studentProfile: StudentProfile, query: string) {
  return {
    goal: studentProfile.careerGoal || 'Software Engineer',
    currentSkills: studentProfile.skills,
    needsHelpWith: query || 'Project architecture review and technical milestone planning',
    recommendedMentoringArea: studentProfile.preferredMentoringAreas[0] || 'Project & Career Guidance'
  };
}
