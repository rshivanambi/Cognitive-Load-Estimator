import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';
import { useToast } from '@/hooks/use-toast';

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

export default function CoursesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [availableCourses, setAvailableCourses] = useState<CatalogCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const dashRes = await fetch(`http://localhost:5000/api/student/dashboard/${user.id}`);
        const dashData = await dashRes.json();
        const enrolledIds = new Set(dashData.enrollments.map((e: any) => e.course_id));

        const coursesRes = await fetch('http://localhost:5000/api/courses');
        const coursesData = await coursesRes.json();
        
        setAvailableCourses(coursesData.filter((c: any) => !enrolledIds.has(c.id)));
      } catch (err) {
        console.error('Failed to fetch courses:', err);
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

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64">Loading Courses...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-2xl font-display font-bold">Course Catalog</h1>
          <p className="text-muted-foreground">Discover and enroll in new courses</p>
        </motion.div>

        {availableCourses.length === 0 ? (
           <div className="text-center p-12 bg-muted rounded-xl">
             <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-20" />
             <p className="text-muted-foreground">You are enrolled in all available courses!</p>
           </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {availableCourses.map((course, i) => (
              <motion.div
                key={course.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * i }}
                className="bg-card rounded-xl shadow-card p-5 flex flex-col hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${difficultyColor[course.difficulty as keyof typeof difficultyColor]}`}>
                    {course.difficulty}
                  </span>
                  <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">{course.category}</span>
                </div>
                <h3 className="font-display font-bold text-lg mb-2 leading-tight">{course.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-3 mb-5 flex-grow">{course.description}</p>
                <div className="flex items-center justify-between border-t pt-4 mt-auto">
                  <span className="text-xs font-medium text-muted-foreground">{course.total_lessons} Lessons</span>
                  <Button size="sm" className="gradient-primary border-0 h-8" onClick={() => handleEnroll(course.id)}>
                    <PlusCircle className="w-3 h-3 mr-1"/> Enroll 
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
