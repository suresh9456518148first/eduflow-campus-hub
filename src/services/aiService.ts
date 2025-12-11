// AI Service for EduFlow Chatbot
// This service handles AI responses - currently using rule-based demo mode
// Can be easily switched to call a real AI API

import sampleStudents from '@/data/sampleStudents.json';
import samplePapers from '@/data/samplePapers.json';
import sampleEvents from '@/data/sampleEvents.json';
import sampleIdeas from '@/data/sampleIdeas.json';

interface AIResponse {
  message: string;
  links?: { text: string; url: string }[];
  data?: any;
}

// Rule-based responses for demo mode
const rules: { keywords: string[]; response: (query: string) => AIResponse }[] = [
  {
    keywords: ['attendance', 'absent', 'present', 'percentage'],
    response: (query) => {
      const student = sampleStudents[0]; // Demo with first student
      const subjects = Object.entries(student.attendance)
        .map(([sub, pct]) => `${sub}: ${pct}%`)
        .join(', ');
      return {
        message: `📊 Here's your attendance overview:\n\n${subjects}\n\nOverall average: ${Math.round(Object.values(student.attendance).reduce((a, b) => a + b, 0) / Object.values(student.attendance).length)}%\n\nNeed to generate a QR code for marking attendance?`,
        links: [{ text: 'Go to Attendance', url: '/attendance' }]
      };
    }
  },
  {
    keywords: ['complaint', 'raise', 'issue', 'problem', 'report'],
    response: () => ({
      message: `📝 To raise a complaint:\n\n1. Go to the Complaints page\n2. Click "Raise New Complaint"\n3. Select a category (Academics, Hostel, Mess, Exam, Other)\n4. Describe your issue in detail\n5. Attach any supporting files/photos\n6. Submit to get your ticket ID\n\nYou can track your complaint status anytime!`,
      links: [{ text: 'Raise Complaint', url: '/complaints' }]
    })
  },
  {
    keywords: ['pyq', 'paper', 'question', 'notes', 'study', 'download', 'material'],
    response: (query) => {
      const recentPapers = samplePapers.slice(0, 3);
      const paperList = recentPapers.map(p => `• ${p.title} (${p.downloads} downloads)`).join('\n');
      return {
        message: `📚 Here are some popular study materials:\n\n${paperList}\n\nYou can filter by branch, subject, and type in the Study Vault!`,
        links: [{ text: 'Browse Study Vault', url: '/study-vault' }]
      };
    }
  },
  {
    keywords: ['event', 'register', 'upcoming', 'fest', 'workshop'],
    response: () => {
      const upcomingEvents = sampleEvents.filter(e => e.isUpcoming).slice(0, 3);
      const eventList = upcomingEvents.map(e => `• ${e.title} - ${e.date}`).join('\n');
      return {
        message: `🎉 Upcoming events:\n\n${eventList}\n\nDon't miss out! Register early to secure your spot.`,
        links: [{ text: 'View All Events', url: '/events' }]
      };
    }
  },
  {
    keywords: ['idea', 'collaborate', 'project', 'support'],
    response: () => {
      const topIdeas = sampleIdeas.slice(0, 2);
      const ideaList = topIdeas.map(i => `• ${i.title} (${i.supports} supports)`).join('\n');
      return {
        message: `💡 Hot ideas in the Collaboration Hub:\n\n${ideaList}\n\nGot an innovative idea? Share it and get support from the community!`,
        links: [{ text: 'Explore Ideas', url: '/collaboration' }]
      };
    }
  },
  {
    keywords: ['marketplace', 'buy', 'sell', 'course', 'notes'],
    response: () => ({
      message: `🛒 The Marketplace is where students share and trade:\n\n• Course notes & study materials\n• Project templates & code\n• Design resources\n• Interview prep bundles\n\nBoth free and paid resources available!`,
      links: [{ text: 'Browse Marketplace', url: '/marketplace' }]
    })
  },
  {
    keywords: ['qr', 'scan', 'mark', 'location'],
    response: () => ({
      message: `📱 QR Attendance System:\n\n1. Go to Attendance page\n2. Select your subject session\n3. Click "Generate QR" to create your attendance QR\n4. For marking: Use "Mark Attendance" and scan/paste the QR data\n5. Location verification ensures you're in the classroom\n\nNote: QR codes expire after the session ends.`,
      links: [{ text: 'Go to Attendance', url: '/attendance' }]
    })
  },
  {
    keywords: ['xp', 'badge', 'points', 'leaderboard', 'rank'],
    response: () => ({
      message: `🏆 Gamification System:\n\n• Earn XP by:\n  - Posting ideas (+50 XP)\n  - Supporting others (+10 XP)\n  - Uploading resources (+30 XP)\n  - Attending events (+25 XP)\n\n• Badges:\n  - Contributor: 100+ XP\n  - Helper: Support 10 ideas\n  - Champion: Top 3 leaderboard\n  - Mentor: Help 5 students\n\nCheck your rank on the Dashboard!`,
      links: [{ text: 'View Dashboard', url: '/' }]
    })
  },
  {
    keywords: ['help', 'how', 'what', 'guide'],
    response: () => ({
      message: `👋 Hi! I'm EduFlow AI, your campus assistant!\n\nI can help you with:\n• 📊 Checking attendance\n• 📝 Raising complaints\n• 📚 Finding study materials\n• 🎉 Discovering events\n• 💡 Exploring ideas\n• 🛒 Marketplace queries\n• 📱 QR attendance\n• 🏆 XP & badges info\n\nJust ask me anything!`
    })
  }
];

export async function askAI(message: string): Promise<AIResponse> {
  // Simulate network delay for realistic feel
  await new Promise(resolve => setTimeout(resolve, 500 + Math.random() * 500));
  
  const lowerMessage = message.toLowerCase();
  
  // Find matching rule
  for (const rule of rules) {
    if (rule.keywords.some(kw => lowerMessage.includes(kw))) {
      return rule.response(message);
    }
  }
  
  // Default response
  return {
    message: `I'm not sure about that, but I can help you with:\n\n• Attendance & QR codes\n• Raising complaints\n• Study materials\n• Campus events\n• Collaboration ideas\n• Marketplace\n• XP & badges\n\nTry asking about any of these topics!`,
    links: [{ text: 'View Dashboard', url: '/' }]
  };
}

// For future: Connect to real AI API
// export async function askRealAI(message: string): Promise<AIResponse> {
//   const response = await fetch('/api/chat', {
//     method: 'POST',
//     headers: { 'Content-Type': 'application/json' },
//     body: JSON.stringify({ message })
//   });
//   return response.json();
// }
