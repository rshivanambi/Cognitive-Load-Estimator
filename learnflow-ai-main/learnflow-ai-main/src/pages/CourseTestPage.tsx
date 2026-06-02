import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, BrainCircuit, CheckCircle, XCircle } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth-context';

interface Question {
  question: string;
  options: string[];
  correctIndex: number;
}

export default function CourseTestPage() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [course, setCourse] = useState<any>(null);
  
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(true);
  const [genError, setGenError] = useState('');
  
  const [answers, setAnswers] = useState<number[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);

  const initTest = async (courseData?: any) => {
    setGenerating(true);
    setGenError('');
    try {
      let courseInfo = courseData;
      if (!courseInfo) {
        const cRes = await fetch(`http://localhost:5000/api/course/${courseId}/status/${user?.id}`);
        const cJson = await cRes.json();
        setCourse(cJson.course);
        setLoading(false);
        courseInfo = cJson.course;
      }

      const testRes = await fetch('http://localhost:5000/api/ai/course-test', {
         method: 'POST',
         headers: { 'Content-Type': 'application/json' },
         body: JSON.stringify({ courseTitle: courseInfo.title, courseDescription: courseInfo.description })
      });
      const testData = await testRes.json();
      
      if (testData.error) {
        setGenError('The AI failed to generate the test. Please try again.');
        return;
      }

      const qs: Question[] = testData.testContent;
      if (!qs || qs.length === 0) {
        setGenError('The AI returned an empty test. Please try again.');
        return;
      }
      setQuestions(qs);
      setAnswers(new Array(qs.length).fill(-1));
    } catch(err) {
      console.error(err);
      setGenError('Network error connecting to the AI server. Make sure it is running.');
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    const firstLoad = async () => {
      try {
        const cRes = await fetch(`http://localhost:5000/api/course/${courseId}/status/${user?.id}`);
        const cJson = await cRes.json();
        setCourse(cJson.course);
        setLoading(false);
        await initTest(cJson.course);
      } catch(err) {
        console.error(err);
        setLoading(false);
        setGenError('Failed to load course data.');
        setGenerating(false);
      }
    };
    if (user?.id) firstLoad();
  }, [courseId, user]);

  const selectAnswer = (qIndex: number, optIndex: number) => {
     if (submitted) return;
     const newAnswers = [...answers];
     newAnswers[qIndex] = optIndex;
     setAnswers(newAnswers);
  };

  const submitTest = () => {
     if (answers.includes(-1)) {
        alert("Please answer all questions before submitting!");
        return;
     }
     let s = 0;
     answers.forEach((ans, idx) => {
        if (ans === questions[idx].correctIndex) s++;
     });
     setScore(s);
     setSubmitted(true);
  };

  if (loading) return <DashboardLayout><div className="flex h-64 justify-center items-center">Loading course data...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(`/course/${courseId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Syllabus
        </Button>

        <div className="bg-card rounded-xl shadow-card overflow-hidden">
           <div className="gradient-primary p-6 text-primary-foreground text-center">
              <BrainCircuit className="w-12 h-12 mx-auto mb-3 opacity-90 animate-pulse" />
              <h1 className="text-3xl font-display font-bold">Final Assessment: {course.title}</h1>
              <p className="mt-2 opacity-90 text-sm">Powered by Phi-3 AI Dynamic Generation</p>
           </div>
           
           <div className="p-8">
              {generating ? (
                 <div className="text-center py-12">
                    <BrainCircuit className="w-10 h-10 mx-auto text-primary animate-spin mb-4" />
                    <p className="font-semibold text-lg">AI is writing your test...</p>
                    <p className="text-sm text-muted-foreground mt-2">Phi-3 is generating unique questions for this course. Please wait ~15 seconds.</p>
                 </div>
              ) : genError ? (
                 <div className="text-center py-12">
                    <XCircle className="w-12 h-12 mx-auto text-destructive mb-4" />
                    <p className="font-semibold text-lg text-destructive mb-2">Test Generation Failed</p>
                    <p className="text-sm text-muted-foreground mb-6">{genError}</p>
                    <Button onClick={() => initTest()} className="gradient-primary text-primary-foreground border-0">
                       Retry Generation
                    </Button>
                 </div>
              ) : questions.length === 0 ? (
                 <div className="text-center py-12">
                    <BrainCircuit className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground mb-4">No questions were generated. Try again.</p>
                    <Button onClick={() => initTest()} className="gradient-primary text-primary-foreground border-0">
                       Retry
                    </Button>
                 </div>
              ) : (
                 <div className="space-y-8">
                    {questions.map((q, qIndex) => (
                       <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: qIndex * 0.1 }} key={qIndex} className="bg-muted/30 p-6 rounded-xl border border-border">
                          <h3 className="font-semibold mb-4 text-lg">{qIndex + 1}. {q.question}</h3>
                          <div className="space-y-2">
                             {q.options.map((opt, optIndex) => {
                                const isSelected = answers[qIndex] === optIndex;
                                const isCorrect = q.correctIndex === optIndex;
                                
                                let btnClass = "w-full justify-start h-auto p-4 text-left font-normal ";
                                if (!submitted) {
                                   btnClass += isSelected ? "bg-primary/20 border-primary border" : "bg-card hover:bg-muted border border-transparent";
                                } else {
                                   if (isCorrect) btnClass += "bg-success/20 border-success border font-bold text-success-foreground";
                                   else if (isSelected && !isCorrect) btnClass += "bg-destructive/20 border-destructive border text-destructive-foreground";
                                   else btnClass += "bg-card opacity-50";
                                }

                                return (
                                   <Button key={optIndex} variant="outline" className={btnClass} onClick={() => selectAnswer(qIndex, optIndex)}>
                                      <div className="flex items-center justify-between w-full">
                                         <span>{opt}</span>
                                         {submitted && isCorrect && <CheckCircle className="w-5 h-5 text-success" />}
                                         {submitted && isSelected && !isCorrect && <XCircle className="w-5 h-5 text-destructive" />}
                                      </div>
                                   </Button>
                                );
                             })}
                          </div>
                       </motion.div>
                    ))}

                    <div className="pt-8 border-t flex flex-col items-center">
                       {submitted ? (
                          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="text-center">
                             <h2 className="text-3xl font-bold mb-2 text-primary">Score: {score} / {questions.length}</h2>
                             <p className="text-muted-foreground mb-6">
                                {score === questions.length ? "Perfect! You've mastered this course!" : "Great effort. Review the concepts and try again later!"}
                             </p>
                             <Button size="lg" className="gradient-primary text-primary-foreground border-0" onClick={() => navigate(`/course/${courseId}`)}>
                                Return to Syllabus
                             </Button>
                          </motion.div>
                       ) : (
                          <Button size="lg" className="w-full sm:w-auto px-12 gradient-primary text-primary-foreground border-0" onClick={submitTest}>
                             Submit Exam
                          </Button>
                       )}
                    </div>
                 </div>
              )}
           </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
