import assert from 'node:assert/strict';
import {
  DEFAULT_PARAMS,
  posteriorMastery,
  updateMastery,
  predictedSuccess,
  spacingUrgency,
  uncertainty,
  recommendationScore,
  chooseNextQuestion,
  averageMastery,
} from '../src/mastery-model.mjs';

function approx(actual, expected, tolerance = 1e-9) {
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} != ${expected}`);
}

{
  const prior = 0.35;
  const posterior = posteriorMastery(prior, true);
  assert.ok(posterior > prior, 'correct evidence should raise posterior mastery');
}

{
  const prior = 0.6;
  const posterior = posteriorMastery(prior, false);
  assert.ok(posterior < prior, 'incorrect evidence should lower posterior mastery');
}

{
  const before = 0.35;
  const after = updateMastery(before, true);
  assert.ok(after > before, 'learning transition should preserve positive correct update');
}

{
  const afterWrong = updateMastery(0.6, false);
  assert.ok(afterWrong < 0.6, 'an incorrect answer should reduce a confident mastery estimate');
}

{
  for (const mastery of [0, 0.25, 0.5, 0.75, 1]) {
    const success = predictedSuccess(mastery, 0.5);
    assert.ok(success >= 0.05 && success <= 0.98, 'predicted success must stay bounded');
  }
}

{
  approx(uncertainty(0.5), 1);
  approx(uncertainty(0), 0);
  approx(uncertainty(1), 0);
}

{
  assert.equal(spacingUrgency(null), 1, 'never-practiced concepts are maximally due');
  const now = 1_000_000;
  assert.equal(spacingUrgency(now, now), 0);
  assert.equal(spacingUrgency(now - 20 * 60_000, now), 1);
}

{
  const now = 5_000_000;
  const needy = recommendationScore({ mastery: 0.25, difficulty: 0.5, lastPracticedAt: null, attempts: 0 }, DEFAULT_PARAMS, now);
  const strong = recommendationScore({ mastery: 0.9, difficulty: 0.5, lastPracticedAt: now, attempts: 5 }, DEFAULT_PARAMS, now);
  assert.ok(needy > strong, 'low-mastery, due concepts should outrank already-strong recent concepts');
}

{
  const questions = [
    { id: 'weak', concept: 'Weak', difficulty: 0.5 },
    { id: 'strong', concept: 'Strong', difficulty: 0.5 },
  ];
  const concepts = {
    Weak: { mastery: 0.22, attempts: 0, lastPracticedAt: null },
    Strong: { mastery: 0.9, attempts: 4, lastPracticedAt: 10_000 },
  };
  const picked = chooseNextQuestion(questions, concepts, DEFAULT_PARAMS, 10_000);
  assert.equal(picked.question.id, 'weak');
}

{
  const concepts = { A: { mastery: 0.2 }, B: { mastery: 0.6 }, C: { mastery: 1.0 } };
  approx(averageMastery(concepts), 0.6);
}

console.log('MasteryMap model tests: PASS (10 checks)');
