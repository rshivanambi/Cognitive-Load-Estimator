import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, TrendingUp, Clock, Award, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';
import { downloadCertificate } from '@/lib/generate-certificate';

interface EnrolledCourse {
  course_id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  difficulty: string;
  progress: number;
  completed_lessons: number;
  total_lessons: number;
}

interface CatalogCourse {
  id: string;
  title: string;
  description: string;
  instructor: string;
  category: string;
  difficulty: string;
  total_lessons: number;
}

const difficultyColor = {
  beginner: 'bg-success/10 text-success',
  intermediate: 'bg-warning/10 text-warning',
  advanced: 'bg-destructive/10 text-destructive',
};

export default function StudentDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [availableCourses, setAvailableCourses] = useState<CatalogCourse[]>([]);
  const [stats, setStats] = useState({
    coursesEnrolled: 0,
    avgProgress: 0,
    minutesLearned: 0,
    certificates: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        // Fetch dashboard data
        const dashRes = await fetch(`http://localhost:5000/api/student/dashboard/${user.id}`);
        const dashData = await dashRes.json();
        setEnrolledCourses(dashData.enrollments);
        
        let totalMins = 0;
        let totalCompleted = 0;
        dashData.enrollments.forEach((e: any) => {
            totalMins += (e.progress * e.total_lessons) * 1.5; // Dummy estimate of minutes 
            if (e.progress === 100) totalCompleted += 1;
        });

        setStats({
           ...dashData.stats,
           minutesLearned: Math.round(totalMins),
           certificates: totalCompleted
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleEnroll = async (courseId: string) => {
    try {
      const res = await fetch('http://localhost:5000/api/student/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user?.id, courseId })
      });
      if (res.ok) {
        toast({ title: "Success!", description: "Enrolled in course successfully." });
        navigate(`/course/${courseId}`);
      }
    } catch (err) {
      toast({ title: "Error", description: "Failed to enroll.", variant: "destructive" });
    }
  };

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64">Loading dashboard...</div></DashboardLayout>;

  const statItems = [
    { label: 'Courses Enrolled', value: stats.coursesEnrolled, icon: BookOpen, color: 'text-primary' },
    { label: 'Avg. Progress', value: `${stats.avgProgress}%`, icon: TrendingUp, color: 'text-success' },
    { label: 'Minutes Learned', value: stats.minutesLearned, icon: Clock, color: 'text-info' },
    { label: 'Certificates', value: stats.certificates, icon: Award, color: 'text-warning' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-2xl font-display font-bold mb-1">
            Welcome back, {user?.name || 'Student'} 👋
          </h1>
          <p className="text-muted-foreground mb-6">
            {enrolledCourses.length > 0 ? 'Continue your learning journey' : 'Start your learning journey today'}
          </p>
        </motion.div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {statItems.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-card rounded-xl shadow-card p-4"
            >
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Enrolled Courses */}
        {enrolledCourses.length > 0 && (
          <>
            <h2 className="text-lg font-display font-semibold mb-4 text-primary underline underline-offset-8">Your Active Courses</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-2 gap-5 mb-10">
              {enrolledCourses.map((course, i) => (
                <motion.div
                  key={course.course_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + i * 0.1 }}
                  className="bg-card rounded-xl shadow-card overflow-hidden hover:shadow-elevated transition-shadow cursor-pointer group"
                  onClick={() => navigate(`/course/${course.course_id}`)}
                >
                  <div className="h-32 gradient-primary relative flex items-end p-4">
                    <span className={`absolute top-3 right-3 text-xs font-medium px-2.5 py-1 rounded-full ${difficultyColor[course.difficulty as keyof typeof difficultyColor]}`}>
                      {course.difficulty}
                    </span>
                    <div>
                      <span className="text-xs text-primary-foreground/70">{course.category}</span>
                      <h3 className="text-lg font-display font-bold text-primary-foreground leading-tight">
                        {course.title}
                      </h3>
                    </div>
                  </div>
                  <div className="p-4">
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{course.description}</p>
                    <div className="flex items-center gap-3 mb-3">
                      <Progress value={course.progress} className="flex-1 h-2" />
                      <span className="text-xs font-medium">{Math.round(course.progress)}%</span>
                    </div>
                    <Button size="sm" className="w-full gradient-primary text-primary-foreground border-0">
                      Continue Learning
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        )}

        {/* Certificates Section */}
        {stats.certificates > 0 && (
          <div className="mt-10">
            <h2 className="text-lg font-display font-semibold mb-4 text-warning flex items-center gap-2">
              <Award className="w-5 h-5" /> Your Earned Certificates
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {enrolledCourses.filter(c => c.progress === 100).map(course => (
                  <motion.div key={course.course_id} className="bg-card rounded-xl shadow-card p-4 border border-warning/30 hover:border-warning/60 transition-colors flex flex-col items-center justify-center text-center">
                     <Award className="w-12 h-12 text-warning mb-3" />
                     <h3 className="font-bold text-sm mb-1">{course.title}</h3>
                     <p className="text-xs text-muted-foreground mb-3">Completed on {new Date().toLocaleDateString()}</p>
                     <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full text-xs" 
                        onClick={() => downloadCertificate(user?.name || 'Student', course.title, new Date().toLocaleDateString())}
                     >
                        Download PDF
                     </Button>
                  </motion.div>
               ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
