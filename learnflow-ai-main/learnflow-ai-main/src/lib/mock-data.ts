export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  avatar?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  instructor: string;
  thumbnail: string;
  progress: number;
  totalLessons: number;
  completedLessons: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Lesson {
  id: string;
  courseId: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  order: number;
  completed: boolean;
}

export interface CognitiveLoadEntry {
  timestamp: number;
  loadScore: number;
  facialStress: number;
  blinkRate: number;
  gazeDistraction: number;
  interactionDifficulty: number;
}

export interface VideoInteraction {
  pauseCount: number;
  rewindCount: number;
  playbackSpeed: number;
  completionPercentage: number;
}

export interface AISuggestion {
  id: string;
  type: 'hint' | 'break' | 'advance' | 'replay';
  message: string;
  icon: string;
}

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Machine Learning',
    description: 'Learn the fundamentals of machine learning, including supervised and unsupervised learning, neural networks, and practical applications.',
    instructor: 'Dr. Sarah Chen',
    thumbnail: '',
    progress: 65,
    totalLessons: 12,
    completedLessons: 8,
    category: 'AI & ML',
    difficulty: 'intermediate',
  },
  {
    id: '2',
    title: 'Data Structures & Algorithms',
    description: 'Master essential data structures and algorithms for technical interviews and real-world problem solving.',
    instructor: 'Prof. James Wilson',
    thumbnail: '',
    progress: 30,
    totalLessons: 20,
    completedLessons: 6,
    category: 'Computer Science',
    difficulty: 'advanced',
  },
  {
    id: '3',
    title: 'Web Development Bootcamp',
    description: 'Full-stack web development from HTML/CSS to React and Node.js. Build real projects.',
    instructor: 'Emily Rodriguez',
    thumbnail: '',
    progress: 90,
    totalLessons: 15,
    completedLessons: 13,
    category: 'Web Dev',
    difficulty: 'beginner',
  },
  {
    id: '4',
    title: 'Statistics for Data Science',
    description: 'Statistical foundations every data scientist needs: probability, distributions, hypothesis testing.',
    instructor: 'Dr. Michael Park',
    thumbnail: '',
    progress: 10,
    totalLessons: 10,
    completedLessons: 1,
    category: 'Data Science',
    difficulty: 'intermediate',
  },
];

export const mockLessons: Record<string, Lesson[]> = {
  '1': [
    { id: 'l1', courseId: '1', title: 'What is Machine Learning?', description: 'An overview of ML concepts and applications in the real world.', videoUrl: 'https://www.youtube.com/embed/ukzFI9rgwfU', duration: '15:30', order: 1, completed: true },
    { id: 'l2', courseId: '1', title: 'Supervised vs Unsupervised Learning', description: 'Understanding the key differences between learning paradigms.', videoUrl: 'https://www.youtube.com/embed/W01tIRP_Rqs', duration: '22:15', order: 2, completed: true },
    { id: 'l3', courseId: '1', title: 'Linear Regression Deep Dive', description: 'Mathematical foundations and implementation of linear regression.', videoUrl: 'https://www.youtube.com/embed/7ArmBVF2dCs', duration: '28:00', order: 3, completed: false },
    { id: 'l4', courseId: '1', title: 'Classification Algorithms', description: 'Decision trees, random forests, and SVMs explained.', videoUrl: 'https://www.youtube.com/embed/aircAruvnKk', duration: '35:10', order: 4, completed: false },
    { id: 'l5', courseId: '1', title: 'Neural Networks Basics', description: 'Introduction to neural networks and backpropagation.', videoUrl: 'https://www.youtube.com/embed/aircAruvnKk', duration: '40:00', order: 5, completed: false },
  ],
  '2': [
    { id: 'l6', courseId: '2', title: 'Arrays and Linked Lists', description: 'Fundamental linear data structures.', videoUrl: 'https://www.youtube.com/embed/RBSGKlAvoiM', duration: '20:00', order: 1, completed: true },
    { id: 'l7', courseId: '2', title: 'Stacks and Queues', description: 'LIFO and FIFO data structures in practice.', videoUrl: 'https://www.youtube.com/embed/wjI1WNcIntg', duration: '18:30', order: 2, completed: true },
    { id: 'l8', courseId: '2', title: 'Trees and Graphs', description: 'Non-linear data structures for complex problems.', videoUrl: 'https://www.youtube.com/embed/oSWTXtMglKE', duration: '32:00', order: 3, completed: false },
  ],
  '3': [
    { id: 'l9', courseId: '3', title: 'HTML & CSS Fundamentals', description: 'Building blocks of the web.', videoUrl: 'https://www.youtube.com/embed/UB1O30fR-EE', duration: '25:00', order: 1, completed: true },
    { id: 'l10', courseId: '3', title: 'JavaScript Essentials', description: 'Core JS concepts every developer needs.', videoUrl: 'https://www.youtube.com/embed/hdI2bqOjy3c', duration: '30:00', order: 2, completed: true },
  ],
  '4': [
    { id: 'l11', courseId: '4', title: 'Probability Basics', description: 'Foundational probability concepts.', videoUrl: 'https://www.youtube.com/embed/uzkc-qNVoOk', duration: '22:00', order: 1, completed: true },
    { id: 'l12', courseId: '4', title: 'Distributions', description: 'Normal, binomial, and Poisson distributions.', videoUrl: 'https://www.youtube.com/embed/zeJD6dqJ5lo', duration: '28:00', order: 2, completed: false },
  ],
};

export const mockStudents: { id: string; name: string; email: string; avgLoad: number; engagement: number; coursesEnrolled: number; lastActive: string }[] = [
  { id: 's1', name: 'Alex Johnson', email: 'alex@example.com', avgLoad: 0.72, engagement: 85, coursesEnrolled: 3, lastActive: '2 hours ago' },
  { id: 's2', name: 'Maria Garcia', email: 'maria@example.com', avgLoad: 0.45, engagement: 92, coursesEnrolled: 2, lastActive: '30 minutes ago' },
  { id: 's3', name: 'David Kim', email: 'david@example.com', avgLoad: 0.88, engagement: 45, coursesEnrolled: 4, lastActive: '1 day ago' },
  { id: 's4', name: 'Sophie Brown', email: 'sophie@example.com', avgLoad: 0.35, engagement: 95, coursesEnrolled: 2, lastActive: '5 minutes ago' },
  { id: 's5', name: 'Raj Patel', email: 'raj@example.com', avgLoad: 0.61, engagement: 78, coursesEnrolled: 3, lastActive: '4 hours ago' },
];

export function generateCognitiveLoadData(minutes: number): CognitiveLoadEntry[] {
  const data: CognitiveLoadEntry[] = [];
  for (let i = 0; i < minutes; i++) {
    const base = 0.3 + Math.random() * 0.5;
    const facialStress = Math.min(1, Math.max(0, base + (Math.random() - 0.5) * 0.3));
    const blinkRate = Math.min(1, Math.max(0, base + (Math.random() - 0.5) * 0.4));
    const gazeDistraction = Math.min(1, Math.max(0, base + (Math.random() - 0.5) * 0.3));
    const interactionDifficulty = Math.min(1, Math.max(0, base + (Math.random() - 0.5) * 0.2));
    const loadScore = 0.35 * facialStress + 0.25 * blinkRate + 0.20 * gazeDistraction + 0.20 * interactionDifficulty;
    data.push({
      timestamp: i,
      loadScore: Math.round(loadScore * 100) / 100,
      facialStress: Math.round(facialStress * 100) / 100,
      blinkRate: Math.round(blinkRate * 100) / 100,
      gazeDistraction: Math.round(gazeDistraction * 100) / 100,
      interactionDifficulty: Math.round(interactionDifficulty * 100) / 100,
    });
  }
  return data;
}

export function getAISuggestions(loadScore: number): AISuggestion[] {
  if (loadScore > 0.7) {
    return [
      { id: '1', type: 'hint', message: 'This seems challenging. Would you like a simpler explanation?', icon: '💡' },
      { id: '2', type: 'replay', message: 'Try replaying the previous section for better understanding.', icon: '🔄' },
      { id: '3', type: 'break', message: 'Consider taking a short break to refresh your focus.', icon: '☕' },
    ];
  }
  if (loadScore > 0.4) {
    return [
      { id: '4', type: 'hint', message: "You're doing well! Keep going at this pace.", icon: '👍' },
    ];
  }
  return [
    { id: '5', type: 'advance', message: 'This topic seems easy for you. Ready for the next lesson?', icon: '🚀' },
    { id: '6', type: 'advance', message: 'Try the advanced exercises for a bigger challenge.', icon: '⭐' },
  ];
}
