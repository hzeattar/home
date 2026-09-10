export const PARAMS = Object.freeze({ pGuess: 0.2, pSlip: 0.1, pLearn: 0.11, targetSuccess: 0.68 });

export const clamp = (value, min = 0, max = 1) => Math.min(max, Math.max(min, value));

export function posteriorMastery(prior, correct, params = PARAMS) {
  const p = clamp(prior, 0.001, 0.999);
  if (correct) {
    const numerator = p * (1 - params.pSlip);
    return clamp(numerator / (numerator + (1 - p) * params.pGuess));
  }
  const numerator = p * params.pSlip;
  return clamp(numerator / (numerator + (1 - p) * (1 - params.pGuess)));
}

export function updateMastery(prior, correct, params = PARAMS) {
  const posterior = posteriorMastery(prior, correct, params);
  return clamp(posterior + (1 - posterior) * params.pLearn);
}

export function predictedSuccess(mastery, difficulty = 0.5, params = PARAMS) {
  const p = clamp(mastery);
  const base = p * (1 - params.pSlip) + (1 - p) * params.pGuess;
  return clamp(base + (0.5 - clamp(difficulty)) * 0.3, 0.05, 0.98);
}

export function uncertainty(mastery) {
  return 1 - Math.abs(clamp(mastery) - 0.5) * 2;
}

export function spacingUrgency(lastPracticedAt, now = Date.now()) {
  if (!lastPracticedAt) return 1;
  return clamp(Math.max(0, now - lastPracticedAt) / 1_200_000);
}

export function scoreQuestion(question, state, now = Date.now(), params = PARAMS) {
  const concept = state[question.concept];
  const need = 1 - concept.mastery;
  const info = uncertainty(concept.mastery);
  const spacing = spacingUrgency(concept.lastPracticedAt, now);
  const success = predictedSuccess(concept.mastery, question.difficulty, params);
  const fit = 1 - Math.min(1, Math.abs(success - params.targetSuccess) / 0.68);
  const novelty = 1 / (1 + concept.attempts * 0.18);
  return need * 0.38 + info * 0.2 + spacing * 0.17 + fit * 0.2 + novelty * 0.05;
}

export function chooseQuestion(questions, state, used = new Set(), now = Date.now()) {
  const candidates = questions.filter((q) => !used.has(q.id));
  const source = candidates.length ? candidates : questions;
  return [...source].sort((a, b) => scoreQuestion(b, state, now) - scoreQuestion(a, state, now))[0];
}

export function averageMastery(state) {
  const values = Object.values(state).map((item) => item.mastery);
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
