import assert from 'node:assert/strict';
import {
  PARAMS,
  posteriorMastery,
  updateMastery,
  predictedSuccess,
  uncertainty,
  spacingUrgency,
  scoreQuestion,
  chooseQuestion,
  averageMastery,
} from '../src/mastery-model.mjs';

const concepts = {
  Algorithms: { mastery: 0.25, attempts: 0, lastPracticedAt: null },
  Networking: { mastery: 0.9, attempts: 4, lastPracticedAt: 5_000_000 },
};

assert.ok(posteriorMastery(0.35, true) > 0.35);
assert.ok(posteriorMastery(0.6, false) < 0.6);
assert.ok(updateMastery(0.35, true) > 0.35);
assert.ok(updateMastery(0.6, false) < 0.6);
assert.ok(predictedSuccess(0.5, 0.5) >= 0.05 && predictedSuccess(0.5, 0.5) <= 0.98);
assert.equal(uncertainty(0.5), 1);
assert.equal(spacingUrgency(null), 1);

const weak = { id: 'weak', concept: 'Algorithms', difficulty: 0.5 };
const strong = { id: 'strong', concept: 'Networking', difficulty: 0.5 };
assert.ok(scoreQuestion(weak, concepts, 5_000_000, PARAMS) > scoreQuestion(strong, concepts, 5_000_000, PARAMS));
assert.equal(chooseQuestion([strong, weak], concepts, new Set(), 5_000_000).id, 'weak');
assert.equal(averageMastery({ A:{mastery:0.2}, B:{mastery:0.6}, C:{mastery:1} }), 0.6);

console.log('MasteryMap Next Gen mobile model tests: PASS (10 checks)');
