import { motion, AnimatePresence } from 'framer-motion';
import type { AISuggestion } from '@/lib/mock-data';

interface Props {
  suggestions: AISuggestion[];
}

const typeStyles: Record<string, string> = {
  hint: 'border-l-warning',
  break: 'border-l-info',
  advance: 'border-l-success',
  replay: 'border-l-primary',
};

export default function AISuggestions({ suggestions }: Props) {
  return (
    <div className="bg-card rounded-xl shadow-card p-4">
      <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
        🦙 Llama AI Tutor Suggestions
      </h3>
      <div className="space-y-2">
        <AnimatePresence mode="popLayout">
          {suggestions.map((s) => (
            <motion.div
              key={s.id}
              layout
              initial={{ opacity: 0, x: 20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -20, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className={`p-3 bg-muted/50 rounded-lg border-l-4 ${typeStyles[s.type] || 'border-l-primary'}`}
            >
              <p className="text-sm">
                <span className="mr-2">{s.icon}</span>
                {s.message}
              </p>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
