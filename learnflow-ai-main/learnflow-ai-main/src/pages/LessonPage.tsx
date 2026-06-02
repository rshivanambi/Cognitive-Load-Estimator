import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Pause, SkipBack, Gauge, BrainCircuit, Activity, Zap, ShieldAlert, Key } from 'lucide-react';
import DashboardLayout from '@/components/DashboardLayout';
import WebcamPreview from '@/components/WebcamPreview';
import CognitiveLoadIndicator from '@/components/CognitiveLoadIndicator';
import AIChatbot from '@/components/AIChatbot';
import { Button } from '@/components/ui/button';
import { mapEmotionsToLoad, EmotionScores } from '@/lib/ai-logic';
import { useAuth } from '@/lib/auth-context';

export default function LessonPage() {
  const { lessonId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [lesson, setLesson] = useState<any>(null);
  const [courseContext, setCourseContext] = useState('');
  const [loading, setLoading] = useState(true);
  
  const [cognitiveData, setCognitiveData] = useState<any[]>([]);
  const [facialLoad, setFacialLoad] = useState(0.45);
  const [interactionLoad, setInteractionLoad] = useState(0.2);
  const [combinedLoad, setCombinedLoad] = useState(0.35);
  const [sustainedHighLoad, setSustainedHighLoad] = useState(false);
  
  const [interactions, setInteractions] = useState({ pauses: 0, rewinds: 0, speed: 1 });
  const [ollamaSuggestion, setOllamaSuggestion] = useState('');
  const [ollamaQuiz, setOllamaQuiz] = useState('');
  
  // New Adaptation Engine State
  const [adaptation, setAdaptation] = useState({
      pacing_action: "normal",
      difficulty_action: "normal",
      modality_action: "normal",
      hint_action: "hide_hint",
      break_action: "none"
  });
  
  const loadHistory = useRef<number[]>([]);
  const mousePoints = useRef<{x: number, y: number, t: number}[]>([]);
  const lastMouseUpdate = useRef(0);
  const lastSuggestionTime = useRef(0);
  const lastEngineTime = useRef(0);
  const quizGenerated = useRef(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    const fetchLesson = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/lesson/${lessonId}`);
        if (!res.ok) throw new Error('Lesson not found');
        const l = await res.json();
        setLesson(l);
        setCourseContext(`Course ${l.courseId} - ${l.title}`);

        const cRes = await fetch(`http://localhost:5000/api/lesson/${lessonId}/comments`);
        if (cRes.ok) {
           const cData = await cRes.json();
           setComments(cData);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLesson();
  }, [lessonId]);

  const handlePostComment = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!newComment.trim() || !user) return;
     try {
        await fetch(`http://localhost:5000/api/lesson/${lessonId}/comments`, {
           method: 'POST',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ userId: user.id, content: newComment.trim() })
        });
        setNewComment('');
        const cRes = await fetch(`http://localhost:5000/api/lesson/${lessonId}/comments`);
        const cData = await cRes.json();
        setComments(cData);
     } catch(err) {
        console.error(err);
     }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now();
      mousePoints.current.push({ x: e.clientX, y: e.clientY, t: now });
      if (mousePoints.current.length > 50) mousePoints.current.shift();

      if (now - lastMouseUpdate.current > 1000) {
        let jitter = 0;
        if (mousePoints.current.length > 2) {
          const distances = [];
          for (let i = 1; i < mousePoints.current.length; i++) {
            const d = Math.sqrt(
              Math.pow(mousePoints.current[i].x - mousePoints.current[i-1].x, 2) +
              Math.pow(mousePoints.current[i].y - mousePoints.current[i-1].y, 2)
            );
            distances.push(d);
          }
          const avgDist = distances.reduce((a, b) => a + b, 0) / distances.length;
          const variance = distances.reduce((a, b) => a + Math.pow(b - avgDist, 2), 0) / distances.length;
          jitter = Math.min(1, variance / 500);
        }
        
        const iLoad = (jitter * 0.4) + (Math.min(1, interactions.pauses / 10) * 0.3) + (Math.min(1, interactions.rewinds / 5) * 0.3);
        setInteractionLoad(Math.round(iLoad * 100) / 100);
        lastMouseUpdate.current = now;
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [interactions]);

  useEffect(() => {
    const combined = (facialLoad * 0.5) + (interactionLoad * 0.5);
    setCombinedLoad(combined);

    loadHistory.current.push(combined);
    if (loadHistory.current.length > 300) loadHistory.current.shift();

    const avg = loadHistory.current.reduce((a, b) => a + b, 0) / loadHistory.current.length;
    
    if (loadHistory.current.length > 10 && avg > 0.75) {
      setSustainedHighLoad(true);
      if (!quizGenerated.current && courseContext) {
        quizGenerated.current = true;
        fetch('http://localhost:5000/api/ai/quiz', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ courseContext })
        })
        .then(res => res.json())
        .then(data => setOllamaQuiz(data.quizText))
        .catch(console.error);
      }
    } else {
      setSustainedHighLoad(false);
    }

    setCognitiveData((prev) => [...prev.slice(-29), {
      timestamp: prev.length,
      loadScore: combined,
      facialLoad,
      interactionLoad
    }]);

    const now = Date.now();
    // 30-sec adaptation engine ping
    if (now - lastEngineTime.current > 30000 && courseContext) {
      lastEngineTime.current = now;
      fetch('http://localhost:5000/api/ai/adaptation-engine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loadScore: combined, interactions, courseContext })
      })
      .then(res => res.json())
      .then(data => {
         setAdaptation(data);
         // Execute Pacing Action
         if (data.pacing_action === 'pause_video' && iframeRef.current?.contentWindow) {
             iframeRef.current.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
         }
      })
      .catch(console.error);

      // standard 1-liner suggestion
      fetch('http://localhost:5000/api/ai/suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loadScore: combined, interactions, courseContext })
      })
      .then(res => res.json())
      .then(data => setOllamaSuggestion(data.suggestion))
      .catch(console.error);
    }
  }, [facialLoad, interactionLoad, courseContext, interactions]);

  const handleEmotions = useCallback((emotions: EmotionScores) => {
    setFacialLoad(mapEmotionsToLoad(emotions));
  }, []);

  const handleFrame = useCallback(() => {}, []);

  const [watchProgress, setWatchProgress] = useState(0);

  // Simulated Watch Progress Tracker
  useEffect(() => {
    // Every 500ms, increase progress slightly to simulate watching a video
    const timer = setInterval(() => {
      setWatchProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 0.5; // reaches 100% in ~100 seconds for demo
      });
    }, 500);
    return () => clearInterval(timer);
  }, []);

  if (loading) return <DashboardLayout><div className="flex items-center justify-center h-64">Loading lesson...</div></DashboardLayout>;
  if (!lesson) return <DashboardLayout><div className="flex items-center justify-center h-64">Lesson not found</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate(`/course/${lesson.courseId}`)}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Course
        </Button>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left: Video & Info */}
          <div className="lg:col-span-2 space-y-4">
            
            {/* Break Adaptation Overlay */}
            <AnimatePresence>
              {adaptation.break_action === 'suggest_break' && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} 
                   className="bg-destructive/90 text-destructive-foreground p-3 rounded-xl shadow-lg flex items-center justify-center gap-3 backdrop-blur-md">
                   <ShieldAlert className="w-6 h-6 animate-pulse" />
                   <p className="font-bold">Your load is severely high. Video paused. Please take a 5-minute break!</p>
                </motion.div>
              )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl shadow-card overflow-hidden">
              <div className="aspect-video relative">
                <iframe 
                  ref={iframeRef}
                  src={`${lesson.videoUrl}?enablejsapi=1`} 
                  title={lesson.title} 
                  className="w-full h-full" 
                  allowFullScreen 
                />
              </div>
              
              <div className="px-4 pt-4 flex items-center justify-between text-sm">
                 <div className="flex items-center gap-2 text-muted-foreground w-1/2">
                    <span>Video Progress:</span>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                       <motion.div className="h-full gradient-primary" style={{ width: `${watchProgress}%` }} />
                    </div>
                    <span className="font-bold w-9 text-right">{Math.round(watchProgress)}%</span>
                 </div>
              </div>

              <div className="p-4 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-display font-bold flex items-center gap-2">
                    {lesson.title} 
                    {adaptation.difficulty_action === 'simplify' && <span className="text-[10px] bg-warning/20 text-warning px-2 py-0.5 rounded-full">Simplified View</span>}
                    {adaptation.difficulty_action === 'challenge' && <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full">Challenge View</span>}
                  </h1>
                  
                  {/* Modality Adaptation */}
                  {adaptation.modality_action === 'show_diagram' ? (
                     <div className="mt-2 p-3 bg-muted rounded-lg font-mono text-xs whitespace-pre">
{`   [Concept]
      │
   ┌──┴──┐
[A]     [B]`}
                     </div>
                  ) : adaptation.modality_action === 'text_bullets' ? (
                     <ul className="mt-2 text-sm text-muted-foreground list-disc list-inside">
                        <li>Key concept 1</li>
                        <li>Key concept 2</li>
                        <li>Summary point</li>
                     </ul>
                  ) : (
                     <p className="text-sm text-muted-foreground mt-1">{lesson.description}</p>
                  )}
                </div>
                <Button 
                  className="gradient-primary text-primary-foreground border-0" 
                  onClick={async () => {
                    if (!user) return;
                    try {
                      await fetch('http://localhost:5000/api/student/complete-lesson', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ 
                           userId: user.id, 
                           lessonId: lesson.id, 
                           courseId: lesson.courseId,
                           watchPercentage: Math.round(watchProgress)
                        })
                      });
                      navigate(`/course/${lesson.courseId}`);
                    } catch (err) {
                      console.error(err);
                    }
                  }}
                >
                  Save Progress & Exit
                </Button>
              </div>
            </motion.div>

            {/* AI Hint Adaptation */}
            <AnimatePresence>
                {adaptation.hint_action === 'show_hint' && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} 
                     className="bg-primary/10 border border-primary/30 p-3 rounded-lg flex items-start gap-3">
                     <Key className="w-5 h-5 text-primary shrink-0" />
                     <p className="text-sm text-primary font-medium">Hint: Focus on the structure shown in the video right now. It usually comes up in the quiz.</p>
                  </motion.div>
                )}
            </AnimatePresence>

            {/* Interaction Tracking Buttons */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl shadow-card p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Gauge className="w-4 h-4" /> Manual Interaction Control
              </h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  className="p-3 bg-muted rounded-lg text-center hover:bg-muted/70 transition-colors"
                  onClick={() => setInteractions((p) => ({ ...p, pauses: p.pauses + 1 }))}
                >
                  <Pause className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-lg font-bold">{interactions.pauses}</p>
                  <p className="text-xs text-muted-foreground">Pauses</p>
                </button>
                <button
                  className="p-3 bg-muted rounded-lg text-center hover:bg-muted/70 transition-colors"
                  onClick={() => setInteractions((p) => ({ ...p, rewinds: p.rewinds + 1 }))}
                >
                  <SkipBack className="w-4 h-4 mx-auto mb-1" />
                  <p className="text-lg font-bold">{interactions.rewinds}</p>
                  <p className="text-xs text-muted-foreground">Rewinds</p>
                </button>
                <div className="p-3 bg-muted rounded-lg text-center">
                  <span className="text-xs text-muted-foreground block mb-1 tracking-tighter uppercase font-bold text-[9px]">Speed Adjustment</span>
                  <p className="text-lg font-bold leading-none mb-2">{interactions.speed}x</p>
                  <div className="flex justify-center gap-1">
                    {[1, 1.5, 2].map((s) => (
                      <button key={s} className={`text-[10px] px-1.5 py-0.5 rounded ${interactions.speed === s ? 'bg-primary text-primary-foreground text-[10px]' : 'bg-card text-[10px]'}`} onClick={() => setInteractions((p) => ({ ...p, speed: s }))}>
                        {s}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Comments Section */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card rounded-xl shadow-card p-4">
               <h3 className="text-sm font-semibold mb-4">Class Discussion</h3>
               <div className="space-y-4 mb-4 max-h-64 overflow-y-auto pr-2">
                  {comments.length === 0 ? (
                     <p className="text-sm text-muted-foreground italic">No comments yet. Be the first to start the discussion!</p>
                  ) : (
                     comments.map(c => (
                        <div key={c.id} className="p-3 bg-muted/50 rounded-lg">
                           <div className="flex justify-between items-center mb-1">
                              <span className="text-xs font-bold font-display">{c.username}</span>
                              <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString()}</span>
                           </div>
                           <p className="text-sm">{c.content}</p>
                        </div>
                     ))
                  )}
               </div>
               <form onSubmit={handlePostComment} className="flex gap-2">
                  <input 
                     type="text" 
                     className="flex-1 text-sm bg-muted rounded-md px-3 py-2 outline-none focus:ring-1 focus:ring-primary"
                     placeholder="Add a comment..."
                     value={newComment}
                     onChange={(e) => setNewComment(e.target.value)}
                  />
                  <Button type="submit" size="sm">Post</Button>
               </form>
            </motion.div>
          </div>

          {/* Right: Carousel + Warning + AI */}
          <div className="space-y-4">
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <WebcamPreview onEmotions={handleEmotions} onFrame={handleFrame} />
            </motion.div>
            
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <CognitiveLoadIndicator 
                facialScore={facialLoad}
                interactionScore={interactionLoad}
                combinedScore={combinedLoad}
                sustainedHighLoad={sustainedHighLoad}
              />
            </motion.div>

            {/* Dynamic AI Tutor Suggestion */}
            <AnimatePresence mode="popLayout">
               {ollamaSuggestion && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="bg-card border-l-4 border-l-primary rounded-r-xl shadow-card p-3 flex items-start gap-3"
                  >
                     <BrainCircuit className="w-5 h-5 text-primary mt-0.5 shrink-0" />
                     <p className="text-sm font-medium">{ollamaSuggestion}</p>
                  </motion.div>
               )}
            </AnimatePresence>

            {/* Dynamic AI Quiz (shown if sustained load is high) */}
            <AnimatePresence mode="popLayout">
               {ollamaQuiz && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="bg-muted/50 border border-primary/20 rounded-xl shadow-inner p-4"
                  >
                     <h4 className="text-sm font-bold text-primary mb-2 flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> Quick Check-in
                     </h4>
                     <div className="text-sm whitespace-pre-wrap">{ollamaQuiz}</div>
                  </motion.div>
               )}
            </AnimatePresence>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
               <AIChatbot courseContext={courseContext} />
            </motion.div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
