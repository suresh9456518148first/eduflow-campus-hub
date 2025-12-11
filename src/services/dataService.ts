// Data Service for EduFlow
// Handles all CRUD operations with localStorage as mock database

const STORAGE_KEYS = {
  STUDENTS: 'eduflow_students',
  IDEAS: 'eduflow_ideas',
  MARKETPLACE: 'eduflow_marketplace',
  COMPLAINTS: 'eduflow_complaints',
  EVENTS: 'eduflow_events',
  PAPERS: 'eduflow_papers',
  USER: 'eduflow_current_user',
  REGISTRATIONS: 'eduflow_registrations',
  MESSAGES: 'eduflow_messages',
} as const;

// Initialize data from JSON files if not in localStorage
export async function initializeData() {
  const students = await import('@/data/sampleStudents.json');
  const ideas = await import('@/data/sampleIdeas.json');
  const marketplace = await import('@/data/sampleMarketplace.json');
  const complaints = await import('@/data/sampleComplaints.json');
  const events = await import('@/data/sampleEvents.json');
  const papers = await import('@/data/samplePapers.json');
  
  if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students.default));
  }
  if (!localStorage.getItem(STORAGE_KEYS.IDEAS)) {
    localStorage.setItem(STORAGE_KEYS.IDEAS, JSON.stringify(ideas.default));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MARKETPLACE)) {
    localStorage.setItem(STORAGE_KEYS.MARKETPLACE, JSON.stringify(marketplace.default));
  }
  if (!localStorage.getItem(STORAGE_KEYS.COMPLAINTS)) {
    localStorage.setItem(STORAGE_KEYS.COMPLAINTS, JSON.stringify(complaints.default));
  }
  if (!localStorage.getItem(STORAGE_KEYS.EVENTS)) {
    localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events.default));
  }
  if (!localStorage.getItem(STORAGE_KEYS.PAPERS)) {
    localStorage.setItem(STORAGE_KEYS.PAPERS, JSON.stringify(papers.default));
  }
  if (!localStorage.getItem(STORAGE_KEYS.REGISTRATIONS)) {
    localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify([]));
  }
  if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
  }
}

// Generic CRUD helpers
function getData<T>(key: string): T[] {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
}

function setData<T>(key: string, data: T[]): void {
  localStorage.setItem(key, JSON.stringify(data));
}

// Students
export function getStudents() {
  return getData<any>(STORAGE_KEYS.STUDENTS);
}

export function getStudentById(id: string) {
  return getStudents().find(s => s.id === id);
}

export function updateStudentXP(id: string, xpToAdd: number) {
  const students = getStudents();
  const index = students.findIndex(s => s.id === id);
  if (index !== -1) {
    students[index].xp += xpToAdd;
    setData(STORAGE_KEYS.STUDENTS, students);
  }
  return students[index];
}

// Ideas
export function getIdeas() {
  return getData<any>(STORAGE_KEYS.IDEAS);
}

export function addIdea(idea: any) {
  const ideas = getIdeas();
  const newIdea = {
    ...idea,
    id: `idea-${Date.now()}`,
    supports: 0,
    comments: 0,
    createdAt: new Date().toISOString()
  };
  ideas.unshift(newIdea);
  setData(STORAGE_KEYS.IDEAS, ideas);
  return newIdea;
}

export function supportIdea(ideaId: string) {
  const ideas = getIdeas();
  const index = ideas.findIndex(i => i.id === ideaId);
  if (index !== -1) {
    ideas[index].supports += 1;
    setData(STORAGE_KEYS.IDEAS, ideas);
  }
  return ideas[index];
}

// Marketplace
export function getMarketplaceItems() {
  return getData<any>(STORAGE_KEYS.MARKETPLACE);
}

export function addMarketplaceItem(item: any) {
  const items = getMarketplaceItems();
  const newItem = {
    ...item,
    id: `market-${Date.now()}`,
    rating: 0,
    reviews: 0,
    createdAt: new Date().toISOString()
  };
  items.unshift(newItem);
  setData(STORAGE_KEYS.MARKETPLACE, items);
  return newItem;
}

// Complaints
export function getComplaints() {
  return getData<any>(STORAGE_KEYS.COMPLAINTS);
}

export function addComplaint(complaint: any) {
  const complaints = getComplaints();
  const year = new Date().getFullYear();
  const count = complaints.filter((c: any) => c.id.includes(String(year))).length + 1;
  const ticketId = `EDU-${year}-${String(count).padStart(4, '0')}`;
  
  const newComplaint = {
    ...complaint,
    id: ticketId,
    status: 'OPEN',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    responses: []
  };
  complaints.unshift(newComplaint);
  setData(STORAGE_KEYS.COMPLAINTS, complaints);
  return newComplaint;
}

export function updateComplaintStatus(id: string, status: string, response?: string) {
  const complaints = getComplaints();
  const index = complaints.findIndex(c => c.id === id);
  if (index !== -1) {
    complaints[index].status = status;
    complaints[index].updatedAt = new Date().toISOString();
    if (response) {
      complaints[index].responses.push({
        by: 'Faculty Admin',
        message: response,
        at: new Date().toISOString()
      });
    }
    setData(STORAGE_KEYS.COMPLAINTS, complaints);
  }
  return complaints[index];
}

// Events
export function getEvents() {
  return getData<any>(STORAGE_KEYS.EVENTS);
}

export function getRegistrations() {
  return getData<any>(STORAGE_KEYS.REGISTRATIONS);
}

export function registerForEvent(eventId: string, userId: string) {
  const registrations = getRegistrations();
  const existing = registrations.find((r: any) => r.eventId === eventId && r.userId === userId);
  if (!existing) {
    registrations.push({
      eventId,
      userId,
      registeredAt: new Date().toISOString()
    });
    setData(STORAGE_KEYS.REGISTRATIONS, registrations);
    
    // Update event registration count
    const events = getEvents();
    const eventIndex = events.findIndex(e => e.id === eventId);
    if (eventIndex !== -1) {
      events[eventIndex].registrations += 1;
      setData(STORAGE_KEYS.EVENTS, events);
    }
  }
  return !existing;
}

export function isRegisteredForEvent(eventId: string, userId: string) {
  const registrations = getRegistrations();
  return registrations.some((r: any) => r.eventId === eventId && r.userId === userId);
}

// Papers
export function getPapers() {
  return getData<any>(STORAGE_KEYS.PAPERS);
}

export function addPaper(paper: any) {
  const papers = getPapers();
  const newPaper = {
    ...paper,
    id: `paper-${Date.now()}`,
    downloads: 0,
    uploadedAt: new Date().toISOString()
  };
  papers.unshift(newPaper);
  setData(STORAGE_KEYS.PAPERS, papers);
  return newPaper;
}

export function incrementDownload(paperId: string) {
  const papers = getPapers();
  const index = papers.findIndex(p => p.id === paperId);
  if (index !== -1) {
    papers[index].downloads += 1;
    setData(STORAGE_KEYS.PAPERS, papers);
  }
  return papers[index];
}

// Messages (for marketplace)
export function getMessages() {
  return getData<any>(STORAGE_KEYS.MESSAGES);
}

export function addMessage(message: any) {
  const messages = getMessages();
  messages.push({
    ...message,
    id: `msg-${Date.now()}`,
    sentAt: new Date().toISOString()
  });
  setData(STORAGE_KEYS.MESSAGES, messages);
}

// Current User (demo simulation)
export function getCurrentUser() {
  const user = localStorage.getItem(STORAGE_KEYS.USER);
  return user ? JSON.parse(user) : getStudents()[0]; // Default to first student
}

export function setCurrentUser(userId: string) {
  const student = getStudentById(userId);
  if (student) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(student));
  }
  return student;
}

// Leaderboard
export function getLeaderboard(limit = 10) {
  const students = getStudents();
  return students
    .sort((a: any, b: any) => b.xp - a.xp)
    .slice(0, limit);
}

// Statistics for dashboard
export function getDashboardStats() {
  const ideas = getIdeas();
  const marketplace = getMarketplaceItems();
  const complaints = getComplaints();
  const events = getEvents();
  const students = getStudents();
  
  const currentUser = getCurrentUser();
  const lowAttendanceCount = currentUser 
    ? Object.values(currentUser.attendance).filter((v: any) => v < 75).length 
    : 0;
  
  return {
    ideasCount: ideas.length,
    marketplaceCount: marketplace.length,
    openComplaints: complaints.filter((c: any) => c.status === 'OPEN').length,
    upcomingEvents: events.filter((e: any) => e.isUpcoming).length,
    attendanceWarnings: lowAttendanceCount,
    totalStudents: students.length
  };
}

// Reset all data
export function resetAllData() {
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  initializeData();
}
