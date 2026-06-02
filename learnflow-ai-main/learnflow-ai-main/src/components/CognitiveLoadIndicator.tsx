import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Brain, MousePointer2, Zap, AlertTriangle } from 'lucide-react';

interface Props {
  facialScore: number;
  interactionScore: number;
  combinedScore: number;
  sustainedHighLoad: boolean;
}

export default function CognitiveLoadIndicator({ facialScore, interactionScore, combinedScore, sustainedHighLoad }: Props) {
  const [slide, setSlide] = useState(0);
  const slides = [
    { label: 'Facial Focus', score: facialScore, icon: Brain, detail: 'AI analysis of expressions' },
    { label: 'Interaction Load', score: interactionScore, icon: MousePointer2, detail: 'Mouse movement & video events' },
    { label: 'Overall Load', score: combinedScore, icon: Zap, detail: 'Combined cognitive demand' },
  ];

  const current = slides[slide];
  const level = current.score >= 0.75 ? 'high' : current.score >= 0.45 ? 'medium' : current.score >= 0.2 ? 'ok' : 'low';
  const textColor = level === 'high' ? 'text-destructive' : level === 'medium' ? 'text-warning' : level === 'ok' ? 'text-primary' : 'text-success';
  const color = level === 'high' ? 'bg-destructive' : level === 'medium' ? 'bg-warning' : level === 'ok' ? 'bg-primary' : 'bg-success';

  // Auto-slide removed per user request. Use manual arrows to navigate.

  return (
    <div className="space-y-4">
      <div className={`bg-card rounded-xl shadow-card p-4 relative overflow-hidden group border-2 ${sustainedHighLoad && slide === 2 ? 'border-destructive animate-pulse-slow' : 'border-transparent'}`}>
        {/* Navigation Dots */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 flex gap-1 z-10">
          {slides.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === slide ? 'bg-primary' : 'bg-muted'}`} />
          ))}
        </div>

        {/* Carousel Content */}
        <div className="relative h-48">
          <AnimatePresence mode="wait">
            <motion.div
              key={slide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="absolute inset-0 flex flex-col items-center justify-center pt-2"
            >
              <div className="flex items-center gap-2 mb-2">
                <current.icon className={`w-4 h-4 ${textColor}`} />
                <h3 className="text-sm font-semibold">{current.label}</h3>
              </div>
              
              <div className="relative w-28 h-28 mb-3">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
                  <motion.circle
                    cx="50" cy="50" r="42" fill="none" stroke="currentColor" strokeWidth="8" strokeLinecap="round"
                    strokeDasharray={`${current.score * 264} 264`}
                    className={textColor}
                    initial={{ strokeDasharray: '0 264' }}
                    animate={{ strokeDasharray: `${current.score * 264} 264` }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold">{Math.round(current.score * 100)}%</span>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground">{current.detail}</p>
            </motion.div>
          </AnimatePresence>

          <button onClick={() => setSlide((prev) => (prev - 1 + slides.length) % slides.length)} className="absolute left-0 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button onClick={() => setSlide((prev) => (prev + 1) % slides.length)} className="absolute right-0 top-1/2 -translate-y-1/2 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Status Bar */}
        <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
          <motion.div className={`h-full rounded-full ${color}`} animate={{ width: `${current.score * 100}%` }} />
        </div>
      </div>

      {/* Sustained High Load Warning Panel */}
      {sustainedHighLoad && (
        <motion.div
           initial={{ opacity: 0, y: 10 }}
           animate={{ opacity: 1, y: 0 }}
           className="bg-destructive/10 border border-destructive/20 rounded-xl p-4 flex items-start gap-3"
        >
           <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
           <div>
              <h4 className="text-sm font-bold text-destructive">Suggestion: Focus Break Needed</h4>
              <p className="text-xs text-destructive/80 mt-1 leading-relaxed">
                 Your sustained cognitive load has exceeded 75% for several minutes. We recommend taking a 5-minute break or reviewing the previous section at a slower speed.
              </p>
           </div>
        </motion.div>
      )}
    </div>
  );
}
