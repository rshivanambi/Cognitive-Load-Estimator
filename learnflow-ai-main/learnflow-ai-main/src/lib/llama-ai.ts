import { AISuggestion } from './mock-data';

/**
 * Simulates a call to a LLaMA AI model to generate adaptation learning techniques
 * based on cognitive load and user interactions.
 */
export async function generateLlamaAdaptation(
  loadScore: number, 
  interactions: { pauses: number; rewinds: number; speed: number }
): Promise<AISuggestion[]> {
  // Simulate network delay for AI API call
  await new Promise(resolve => setTimeout(resolve, 600));

  // High Cognitive Load
  if (loadScore >= 0.7 || interactions.rewinds > 3) {
    return [
      { id: 'llama-1', type: 'hint', message: 'Llama AI Detected High Load: Recommending a simpler video explanation to revisit the topic.', icon: '🧠' },
      { id: 'llama-2', type: 'replay', message: 'Reason: high rewind frequency + confusion. Let me provide step-by-step examples.', icon: '📊' },
      { id: 'llama-3', type: 'break', message: 'Would you like some extra practice questions before moving forward?', icon: '📝' },
    ];
  }
  
  // Low Cognitive Load
  if (loadScore < 0.4 && interactions.pauses <= 1) {
    return [
      { id: 'llama-4', type: 'advance', message: 'Llama AI Detected Low Load: You seem bored. Let\'s increase the difficulty.', icon: '🚀' },
      { id: 'llama-5', type: 'advance', message: 'Skipping basic explanation. Providing advanced problems for your level.', icon: '⚡' },
    ];
  }
  
  // Optimal Cognitive Load
  return [
    { id: 'llama-6', type: 'advance', message: 'Llama AI: Your cognitive load is optimal. Student is learning well!', icon: '✅' },
    { id: 'llama-7', type: 'hint', message: 'Continuing current lesson pace and providing normal quizzes.', icon: '📚' },
  ];
}
