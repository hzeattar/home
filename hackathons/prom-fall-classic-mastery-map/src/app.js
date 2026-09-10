import {
  DEFAULT_PARAMS,
  updateMastery,
  chooseNextQuestion,
  explainRecommendation,
  averageMastery,
} from './mastery-model.mjs';

const QUESTIONS = [
  {
    id: 'algo-1', concept: 'Algorithms', difficulty: 0.25,
    text: 'Which data structure gives average O(1) lookup by key?',
    answers: ['Linked list', 'Hash table', 'Binary tree', 'Queue'], correct: 1,
    explanation: 'A hash table uses a hash function to map keys to buckets, giving average constant-time lookup when collisions are well managed.'
  },
  {
    id: 'algo-2', concept: 'Algorithms', difficulty: 0.5,
    text: 'What is the time complexity of binary search on a sorted array?',
    answers: ['O(1)', 'O(log n)', 'O(n)', 'O(n log n)'], correct: 1,
    explanation: 'Binary search halves the remaining search space each step, so the number of steps grows logarithmically.'
  },
  {
    id: 'algo-3', concept: 'Algorithms', difficulty: 0.75,
    text: 'A stable sorting algorithm guarantees that…',
    answers: ['It always runs in O(n log n)', 'Equal elements keep their relative order', 'It uses no extra memory', 'The input is already sorted'], correct: 1,
    explanation: 'Stability means records with equal sort keys preserve their original relative order.'
  },
  {
    id: 'net-1', concept: 'Networking', difficulty: 0.25,
    text: 'Which protocol translates a domain name like example.com into an IP address?',
    answers: ['HTTP', 'DNS', 'SSH', 'SMTP'], correct: 1,
    explanation: 'DNS resolves human-readable domain names to network addresses.'
  },
  {
    id: 'net-2', concept: 'Networking', difficulty: 0.5,
    text: 'What does HTTPS add on top of HTTP?',
    answers: ['Database caching', 'TLS encryption and authentication', 'Faster DNS', 'A different IP version'], correct: 1,
    explanation: 'HTTPS is HTTP carried over TLS, which encrypts traffic and authenticates the server certificate.'
  },
  {
    id: 'net-3', concept: 'Networking', difficulty: 0.75,
    text: 'In TCP, why is a three-way handshake used before data transfer?',
    answers: ['To compress packets', 'To synchronize connection state and sequence numbers', 'To resolve DNS twice', 'To assign a MAC address'], correct: 1,
    explanation: 'The SYN, SYN-ACK, ACK exchange establishes both directions of the connection and synchronizes sequence state.'
  },
  {
    id: 'db-1', concept: 'Databases', difficulty: 0.25,
    text: 'Which SQL clause filters rows before they are returned?',
    answers: ['WHERE', 'ORDER BY', 'GROUP BY', 'JOIN'], correct: 0,
    explanation: 'WHERE applies a Boolean condition to rows before the result set is returned.'
  },
  {
    id: 'db-2', concept: 'Databases', difficulty: 0.5,
    text: 'What is the main purpose of a database index?',
    answers: ['Encrypt every row', 'Speed up data retrieval', 'Replace backups', 'Normalize all tables'], correct: 1,
    explanation: 'An index maintains a search-friendly structure that can dramatically reduce the rows scanned by a query.'
  },
  {
    id: 'db-3', concept: 'Databases', difficulty: 0.75,
    text: 'Third Normal Form primarily aims to remove…',
    answers: ['All primary keys', 'Transitive dependencies on non-key attributes', 'Every foreign key', 'All duplicate values'], correct: 1,
    explanation: '3NF removes transitive dependencies so non-key attributes depend on the key, the whole key, and nothing but the key.'
  },
  {
    id: 'prob-1', concept: 'Probability', difficulty: 0.25,
    text: 'A fair coin is flipped twice. What is the probability of getting two heads?',
    answers: ['1/2', '1/3', '1/4', '3/4'], correct: 2,
    explanation: 'The independent probabilities multiply: 1/2 × 1/2 = 1/4.'
  },
  {
    id: 'prob-2', concept: 'Probability', difficulty: 0.5,
    text: 'If events A and B are independent, which equation is true?',
    answers: ['P(A∩B)=P(A)+P(B)', 'P(A∩B)=P(A)P(B)', 'P(A|B)=0', 'P(A)=P(B)'], correct: 1,
    explanation: 'For independent events, observing one does not change the probability of the other, so their joint probability is the product.'
  },
  {
    id: 'prob-3', concept: 'Probability', difficulty: 0.75,
    text: 'Bayes’ theorem is most useful for updating a probability after receiving…',
    answers: ['New evidence', 'A larger sample only', 'A sorted array', 'A deterministic result'], correct: 0,
    explanation: 'Bayesian updating combines a prior belief with the likelihood of newly observed evidence to produce a posterior belief.'
  }
];

const CONCEPTS = [...new Set(QUESTIONS.map((q) => q.concept))];
const STORAGE_KEY = 'masterymap-ai-v1';

const els = Object.fromEntries([
  'startBtn','demoBtn','resetBtn','workspace','heroMastery','modelStatus','conceptList','overallMastery',
  'answeredMetric','accuracyMetric','gainMetric','conceptBadge','difficultyBadge','questionNumber','questionText',
  'answers','feedback','nextBtn','predictionRing','predictedSuccess','reasoningList'
].map((id) => [id, document.getElementById(id)]));

function freshState() {
  const concepts = Object.fromEntries(CONCEPTS.map((name) => [name, {
    mastery: 0.35,
    attempts: 0,
    lastPracticedAt: null,
  }]));
  return {
    concepts,
    baselineMastery: averageMastery(concepts),
    answered: 0,
    correct: 0,
    currentId: null,
    usedIds: [],
  };
}

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!saved?.concepts) return freshState();
    for (const concept of CONCEPTS) {
      if (!saved.concepts[concept]) return freshState();
    }
    return saved;
  } catch {
    return freshState();
  }
}

let state = loadState();
let currentCandidate = null;
let answeredCurrent = false;

function persist() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function masteryLabel(value) {
  if (value >= 0.8) return 'Strong';
  if (value >= 0.6) return 'Growing';
  if (value >= 0.4) return 'Developing';
  return 'Needs practice';
}

function renderMasteryBars(target, compact = false) {
  const ordered = Object.entries(state.concepts).sort((a, b) => a[1].mastery - b[1].mastery);
  target.innerHTML = ordered.map(([name, item]) => {
    const pct = Math.round(item.mastery * 100);
    if (compact) {
      return `<div class="mastery-row"><header><strong>${name}</strong><span>${pct}%</span></header><div class="bar"><span style="width:${pct}%"></span></div></div>`;
    }
    return `<div class="concept-card"><div class="row"><strong>${name}</strong><span>${masteryLabel(item.mastery)} · ${pct}%</span></div><div class="bar"><span style="width:${pct}%"></span></div></div>`;
  }).join('');
}

function renderMetrics() {
  const avg = averageMastery(state.concepts);
  const gain = Math.round((avg - state.baselineMastery) * 100);
  els.overallMastery.textContent = `${Math.round(avg * 100)}%`;
  els.answeredMetric.textContent = state.answered;
  els.accuracyMetric.textContent = state.answered ? `${Math.round(state.correct / state.answered * 100)}%` : '—';
  els.gainMetric.textContent = `${gain >= 0 ? '+' : ''}${gain}%`;
  renderMasteryBars(els.heroMastery, true);
  renderMasteryBars(els.conceptList, false);
}

function resetQuestionUI() {
  answeredCurrent = false;
  els.feedback.classList.add('hidden');
  els.nextBtn.classList.add('hidden');
  els.answers.innerHTML = '';
}

function nextCandidate() {
  let excluded = new Set(state.usedIds);
  let candidate = chooseNextQuestion(QUESTIONS, state.concepts, DEFAULT_PARAMS, Date.now(), excluded);

  if (!candidate) {
    state.usedIds = [];
    excluded = new Set();
    candidate = chooseNextQuestion(QUESTIONS, state.concepts, DEFAULT_PARAMS, Date.now(), excluded);
  }
  return candidate;
}

function renderReasoning(candidate) {
  const reasons = explainRecommendation(candidate, DEFAULT_PARAMS, Date.now());
  const pct = Math.round(candidate.success * 100);
  els.predictedSuccess.textContent = `${pct}%`;
  els.predictionRing.style.background = `conic-gradient(var(--accent) 0deg, var(--accent-2) ${pct * 3.6}deg, rgba(255,255,255,.06) ${pct * 3.6}deg)`;
  els.reasoningList.innerHTML = reasons.map((reason, index) => `<div class="reason"><b>${index + 1}</b><span>${reason}</span></div>`).join('');
}

function showQuestion() {
  resetQuestionUI();
  currentCandidate = nextCandidate();
  if (!currentCandidate) return;
  const q = currentCandidate.question;
  state.currentId = q.id;
  persist();

  els.modelStatus.textContent = 'Adapting';
  els.questionNumber.textContent = `QUESTION ${state.answered + 1}`;
  els.conceptBadge.textContent = q.concept;
  els.difficultyBadge.textContent = q.difficulty < .4 ? 'Foundation' : q.difficulty < .7 ? 'Intermediate' : 'Challenge';
  els.questionText.textContent = q.text;
  els.answers.innerHTML = q.answers.map((answer, index) => `<button class="answer-btn" type="button" data-index="${index}">${String.fromCharCode(65 + index)}. ${answer}</button>`).join('');
  els.answers.querySelectorAll('.answer-btn').forEach((button) => button.addEventListener('click', () => answerQuestion(Number(button.dataset.index))));
  renderReasoning(currentCandidate);
  renderMetrics();
}

function answerQuestion(index) {
  if (answeredCurrent || !currentCandidate) return;
  answeredCurrent = true;
  const q = currentCandidate.question;
  const isCorrect = index === q.correct;
  const concept = state.concepts[q.concept];
  const before = concept.mastery;

  concept.mastery = updateMastery(before, isCorrect, DEFAULT_PARAMS);
  concept.attempts += 1;
  concept.lastPracticedAt = Date.now();
  state.answered += 1;
  if (isCorrect) state.correct += 1;
  if (!state.usedIds.includes(q.id)) state.usedIds.push(q.id);

  const buttons = [...els.answers.querySelectorAll('.answer-btn')];
  buttons.forEach((button, buttonIndex) => {
    button.disabled = true;
    if (buttonIndex === q.correct) button.classList.add('correct');
    if (buttonIndex === index && !isCorrect) button.classList.add('wrong');
  });

  const after = concept.mastery;
  const delta = Math.round((after - before) * 100);
  els.feedback.innerHTML = `<strong>${isCorrect ? 'Correct.' : 'Not quite.'}</strong> ${q.explanation}<br><small>Model update: ${q.concept} mastery ${Math.round(before * 100)}% → ${Math.round(after * 100)}% (${delta >= 0 ? '+' : ''}${delta} pts).</small>`;
  els.feedback.classList.remove('hidden');
  els.nextBtn.classList.remove('hidden');
  els.modelStatus.textContent = 'Updated';
  persist();
  renderMetrics();
}

function startSession() {
  els.workspace.classList.remove('hidden');
  els.workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });
  showQuestion();
}

async function quickDemo() {
  state = freshState();
  persist();
  els.workspace.classList.remove('hidden');
  els.workspace.scrollIntoView({ behavior: 'smooth', block: 'start' });

  const scriptedCorrectness = [true, false, true, true, false];
  for (const shouldBeCorrect of scriptedCorrectness) {
    showQuestion();
    await new Promise((resolve) => setTimeout(resolve, 420));
    const q = currentCandidate.question;
    const choice = shouldBeCorrect ? q.correct : (q.correct + 1) % q.answers.length;
    answerQuestion(choice);
    await new Promise((resolve) => setTimeout(resolve, 520));
  }
  showQuestion();
  els.modelStatus.textContent = 'Demo complete';
}

function resetSession() {
  localStorage.removeItem(STORAGE_KEY);
  state = freshState();
  currentCandidate = null;
  answeredCurrent = false;
  els.workspace.classList.add('hidden');
  els.modelStatus.textContent = 'Ready';
  els.predictedSuccess.textContent = '—';
  els.reasoningList.innerHTML = '<p class="empty-note">Start a session to see the model explain its recommendation.</p>';
  renderMetrics();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

els.startBtn.addEventListener('click', startSession);
els.demoBtn.addEventListener('click', quickDemo);
els.resetBtn.addEventListener('click', resetSession);
els.nextBtn.addEventListener('click', showQuestion);

renderMetrics();
if (state.answered > 0) els.modelStatus.textContent = 'Progress restored';
