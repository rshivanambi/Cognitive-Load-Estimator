import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock, CheckCircle2, PlayCircle, BookOpen, Award } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/lib/auth-context';
import { downloadCertificate } from '@/lib/generate-certificate';

export default function CoursePage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;
      try {
        const res = await fetch(`http://localhost:5000/api/course/${courseId}/status/${user.id}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, user]);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64">Loading...</div></DashboardLayout>;
  if (!data?.course) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Course not found</p>
        </div>
      </DashboardLayout>
    );
  }

  const { course, lessons } = data;
  const progress = lessons.length > 0 
    ? Math.round((lessons.filter((l: any) => l.completed).length / lessons.length) * 100) 
    : 0;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate('/dashboard')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Dashboard
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          {/* Course Header */}
          <div className="bg-card rounded-xl shadow-card overflow-hidden mb-6">
            <div className="gradient-primary p-6 text-primary-foreground">
              <span className="text-xs uppercase tracking-wider opacity-70">{course.category}</span>
              <h1 className="text-2xl font-display font-bold mt-1">{course.title}</h1>
              <p className="mt-2 opacity-90 text-sm">{course.description}</p>
              <div className="flex items-center gap-4 mt-4 text-sm">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4" /> {course.total_lessons} Lessons
                </span>
                <span>Instructor: {course.instructor}</span>
              </div>
            </div>
            <div className="p-4 flex items-center gap-3">
              <Progress value={progress} className="flex-1 h-2.5" />
              <span className="text-sm font-medium">{progress}% complete</span>
            </div>
          </div>

          {/* Lessons */}
          <h2 className="text-lg font-display font-semibold mb-4">Lessons</h2>
          <div className="space-y-3">
            {lessons.map((lesson: any, i: number) => (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="bg-card rounded-xl shadow-card p-4 flex items-center gap-4 hover:shadow-elevated transition-shadow"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                     <h3 className="text-sm font-semibold">
                       Lesson {lesson.lesson_order}: {lesson.title}
                     </h3>
                     <span className="text-xs font-bold text-primary">{lesson.watch_percentage}%</span>
                  </div>
                  <p className="text-xs text-muted-foreground mb-2 truncate">{lesson.description}</p>
                  <Progress value={lesson.watch_percentage} className="h-1.5" />
                </div>
                <div className="flex items-center gap-3 shrink-0 ml-4">
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" /> {lesson.duration}
                  </span>
                  <Button
                    size="sm"
                    variant={lesson.watch_percentage >= 90 ? 'secondary' : 'default'}
                    className={lesson.watch_percentage < 90 ? 'gradient-primary text-primary-foreground border-0' : ''}
                    onClick={() => navigate(`/lesson/${lesson.id}`)}
                  >
                    {lesson.watch_percentage > 0 ? (lesson.watch_percentage >= 90 ? 'Review' : 'Continue') : 'Start'}
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Final Course Assessment Section */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="mt-8 bg-card rounded-xl shadow-card border border-primary/20 p-6 flex flex-col sm:flex-row items-center gap-6 justify-between hover:shadow-elevated transition-shadow">
             <div>
                <h3 className="text-xl font-display font-bold flex items-center gap-2 text-primary">
                   <Award className="w-5 h-5" /> Final Course Assessment
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                   Challenge yourself by taking a dynamically AI-generated quiz covering all topics in this course. Powered by Phi-3.
                </p>
             </div>
             <Button size="lg" className="gradient-primary text-primary-foreground border-0 whitespace-nowrap" onClick={() => navigate(`/course/${courseId}/test`)}>
                Take Final Test
             </Button>
          </motion.div>

          {/* Certificate Unlock */}
          {progress === 100 && (
             <motion.div 
               initial={{ opacity: 0, scale: 0.95 }} 
               animate={{ opacity: 1, scale: 1 }}
               className="mt-8 relative p-[1px] rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 overflow-hidden"
             >
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-30 mix-blend-overlay"></div>
                <div className="relative bg-card/95 backdrop-blur-xl rounded-2xl p-8 text-center">
                   <div className="mx-auto w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(251,191,36,0.3)] mb-4">
                      <Award className="w-8 h-8 text-white" />
                   </div>
                   <h2 className="text-2xl font-display font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-500 to-yellow-600 mb-2">Congratulations! Course Completed</h2>
                   <p className="text-muted-foreground text-sm max-w-md mx-auto mb-6">
                      You've successfully completed all sections of this course. Your certificate of completion is now available to download.
                   </p>
                   <Button 
                      className="bg-gradient-to-r from-amber-500 to-yellow-600 border-0 hover:opacity-90 shadow-lg px-8"
                      onClick={() => downloadCertificate(user?.name || 'Student', course.title, new Date().toLocaleDateString())}
                   >
                      Download Certificate (PDF)
                   </Button>
                </div>
             </motion.div>
          )}
        </motion.div>
      </div>
    </DashboardLayout>
  );
}
