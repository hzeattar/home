export const DEFAULT_PARAMS = Object.freeze({
  pGuess: 0.2,
  pSlip: 0.1,
  pLearn: 0.11,
  targetSuccess: 0.68,
});

export function clamp(value, min = 0, max = 1) {
  return Math.min(max, Math.max(min, value));
}

export function posteriorMastery(prior, correct, params = DEFAULT_PARAMS) {
  const p = clamp(prior, 0.001, 0.999);
  const guess = clamp(params.pGuess, 0.001, 0.999);
  const slip = clamp(params.pSlip, 0.001, 0.999);

  if (correct) {
    const numerator = p * (1 - slip);
    const denominator = numerator + (1 - p) * guess;
    return clamp(numerator / denominator);
  }

  const numerator = p * slip;
  const denominator = numerator + (1 - p) * (1 - guess);
  return clamp(numerator / denominator);
}

export function applyLearningTransition(posterior, pLearn = DEFAULT_PARAMS.pLearn) {
  const learned = clamp(pLearn);
  return clamp(posterior + (1 - posterior) * learned);
}

export function updateMastery(prior, correct, params = DEFAULT_PARAMS) {
  const posterior = posteriorMastery(prior, correct, params);
  return applyLearningTransition(posterior, params.pLearn);
}

export function predictedSuccess(mastery, difficulty = 0.5, params = DEFAULT_PARAMS) {
  const p = clamp(mastery);
  const guess = clamp(params.pGuess);
  const slip = clamp(params.pSlip);
  const base = p * (1 - slip) + (1 - p) * guess;
  const difficultyShift = (0.5 - clamp(difficulty)) * 0.3;
  return clamp(base + difficultyShift, 0.05, 0.98);
}

export function uncertainty(mastery) {
  const p = clamp(mastery);
  return 1 - Math.abs(p - 0.5) * 2;
}

export function spacingUrgency(lastPracticedAt, now = Date.now()) {
  if (!lastPracticedAt) return 1;
  const elapsedMinutes = Math.max(0, now - lastPracticedAt) / 60000;
  return clamp(elapsedMinutes / 20);
}

export function recommendationScore({ mastery, difficulty, lastPracticedAt, attempts = 0 }, params = DEFAULT_PARAMS, now = Date.now()) {
  const need = 1 - clamp(mastery);
  const uncertaintyValue = uncertainty(mastery);
  const spacing = spacingUrgency(lastPracticedAt, now);
  const success = predictedSuccess(mastery, difficulty, params);
  const difficultyFit = 1 - Math.min(1, Math.abs(success - params.targetSuccess) / 0.68);
  const novelty = 1 / (1 + attempts * 0.18);

  return (
    need * 0.38 +
    uncertaintyValue * 0.2 +
    spacing * 0.17 +
    difficultyFit * 0.2 +
    novelty * 0.05
  );
}

export function chooseNextQuestion(questions, conceptState, params = DEFAULT_PARAMS, now = Date.now(), excludedIds = new Set()) {
  const ranked = questions
    .filter((question) => !excludedIds.has(question.id))
    .map((question) => {
      const state = conceptState[question.concept] ?? { mastery: 0.35, attempts: 0, lastPracticedAt: null };
      const score = recommendationScore({ ...state, difficulty: question.difficulty }, params, now);
      const success = predictedSuccess(state.mastery, question.difficulty, params);
      return { question, score, success, state };
    })
    .sort((a, b) => b.score - a.score);

  return ranked[0] ?? null;
}

export function explainRecommendation(candidate, params = DEFAULT_PARAMS, now = Date.now()) {
  if (!candidate) return [];
  const { state, question, success } = candidate;
  const reasons = [];
  const masteryPct = Math.round(state.mastery * 100);
  const uncertaintyPct = Math.round(uncertainty(state.mastery) * 100);
  const spacingPct = Math.round(spacingUrgency(state.lastPracticedAt, now) * 100);
  const targetPct = Math.round(params.targetSuccess * 100);
  const successPct = Math.round(success * 100);

  reasons.push(`${question.concept} mastery is estimated at ${masteryPct}%, leaving meaningful room to learn.`);
  if (uncertaintyPct >= 55) reasons.push(`The model is ${uncertaintyPct}% uncertain here, so another answer is highly informative.`);
  if (spacingPct >= 60) reasons.push(`Spacing urgency is ${spacingPct}%, making this concept due for another retrieval attempt.`);
  reasons.push(`Predicted success is ${successPct}%, close to the ${targetPct}% productive-challenge target.`);

  return reasons;
}

export function averageMastery(conceptState) {
  const values = Object.values(conceptState).map((item) => item.mastery);
  if (!values.length) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
