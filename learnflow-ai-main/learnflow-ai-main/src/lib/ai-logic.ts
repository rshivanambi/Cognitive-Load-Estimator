/**
 * Logic to map facial expressions to cognitive load levels.
 * 
 * Mapping Strategy:
 * - High Load (0.7 - 1.0): Confusion, Stress, Frustration (Angry, Sad, Fearful)
 * - Medium Load (0.4 - 0.7): Focus, Narrowed attention (Intensity of Neutral)
 * - OK/Optimal (0.2 - 0.4): Engaged learning (Happy, Calm Neutral)
 * - Low Load (0.0 - 0.2): Boredom, Disengagement (Neutral + low movement)
 */

export interface EmotionScores {
  neutral: number;
  happy: number;
  sad: number;
  angry: number;
  fearful: number;
  disgusted: number;
  surprised: number;
}

export const mapEmotionsToLoad = (emotions: EmotionScores): number => {
  const { neutral, happy, sad, angry, fearful, surprised } = emotions;

  // Weighted sum for cognitive load
  // Angry/Sad/Fearful are strong indicators of high cognitive load (frustration/confusion)
  let loadScore = (angry * 1.0) + (fearful * 0.9) + (sad * 0.8) + (surprised * 0.6);
  
  // Neutral is more complex. High neutral intensity can mean focus.
  // We'll treat high neutral as "Medium" if other emotions are low.
  if (neutral > 0.8) {
    loadScore += 0.45;
  } else if (neutral > 0.4) {
    loadScore += 0.3;
  }

  // Happy usually indicates low stress / positive engagement
  if (happy > 0.5) {
    loadScore -= 0.2;
  }

  // Clamp the score
  return Math.max(0, Math.min(1, loadScore));
};

export const getLoadLabel = (score: number) : 'Low' | 'OK' | 'Medium' | 'High' => {
  if (score >= 0.75) return 'High';
  if (score >= 0.45) return 'Medium';
  if (score >= 0.2) return 'OK';
  return 'Low';
};
