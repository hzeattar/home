import { Capacitor } from '@capacitor/core';
import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { PARAMS, updateMastery, predictedSuccess, uncertainty, spacingUrgency, chooseQuestion, averageMastery } from './mastery-model.mjs';

const RC_API_KEY = import.meta.env.VITE_REVENUECAT_API_KEY || '';
const ENTITLEMENT_ID = import.meta.env.VITE_RC_ENTITLEMENT_ID || 'pro_insights';
const STORAGE_KEY = 'masterymap-nextgen-v1';

const QUESTIONS = [
  { id:'a1', concept:'Algorithms', difficulty:.25, text:'Which data structure gives average O(1) lookup by key?', answers:['Linked list','Hash table','Queue','Stack'], correct:1, explanation:'Hash tables map keys to buckets and normally provide average constant-time lookup.' },
  { id:'a2', concept:'Algorithms', difficulty:.55, text:'Binary search on a sorted array runs in…', answers:['O(1)','O(log n)','O(n)','O(n²)'], correct:1, explanation:'Each comparison halves the remaining search interval, producing logarithmic growth.' },
  { id:'n1', concept:'Networking', difficulty:.25, text:'Which protocol resolves domain names to IP addresses?', answers:['HTTP','DNS','SMTP','SSH'], correct:1, explanation:'DNS translates human-readable hostnames into network addresses.' },
  { id:'n2', concept:'Networking', difficulty:.6, text:'HTTPS protects HTTP traffic primarily by using…', answers:['TLS','FTP','ARP','DHCP'], correct:0, explanation:'HTTPS carries HTTP over TLS to provide encryption and server authentication.' },
  { id:'d1', concept:'Databases', difficulty:.3, text:'Which SQL clause filters rows using a condition?', answers:['WHERE','ORDER BY','GROUP BY','JOIN'], correct:0, explanation:'WHERE filters rows before they are returned by the query.' },
  { id:'d2', concept:'Databases', difficulty:.65, text:'Third Normal Form mainly removes…', answers:['Primary keys','Transitive dependencies','Foreign keys','Indexes'], correct:1, explanation:'3NF removes transitive dependencies between non-key attributes.' },
  { id:'p1', concept:'Probability', difficulty:.3, text:'A fair coin is flipped twice. Probability of two heads?', answers:['1/2','1/3','1/4','3/4'], correct:2, explanation:'The independent probabilities multiply: 1/2 × 1/2 = 1/4.' },
  { id:'p2', concept:'Probability', difficulty:.65, text:'Bayes’ theorem updates a prior probability after receiving…', answers:['New evidence','A sorted list','A constant','A deterministic guarantee'], correct:0, explanation:'Bayesian inference combines a prior with the likelihood of new evidence to obtain a posterior.' }
];

const CONCEPTS = [...new Set(QUESTIONS.map(q => q.concept))];
const $ = id => document.getElementById(id);
const els = Object.fromEntries(['overallMastery','masteryList','conceptBadge','prediction','questionIndex','questionText','answers','feedback','nextBtn','reasons','answeredMetric','accuracyMetric','gainMetric','unlockBtn','restoreBtn','proState','premiumInsights','purchaseStatus'].map(id => [id,$(id)]));

function freshState() {
  const concepts = Object.fromEntries(CONCEPTS.map(name => [name,{ mastery:.35, attempts:0, lastPracticedAt:null }]));
  return { concepts, baseline:.35, answered:0, correct:0, used:[] };
}

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!raw?.concepts || !CONCEPTS.every(name => raw.concepts[name])) return freshState();
    return raw;
  } catch { return freshState(); }
}

let state = loadState();
let current = null;
let questionAnswered = false;
let revenueCatReady = false;
let proActive = false;

function persist() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function pct(value) { return `${Math.round(value * 100)}%`; }

function renderMastery() {
  const sorted = Object.entries(state.concepts).sort((a,b) => a[1].mastery - b[1].mastery);
  els.masteryList.innerHTML = sorted.map(([name,item]) => `<div class="mastery-item"><div class="mastery-row"><strong>${name}</strong><span>${pct(item.mastery)}</span></div><div class="bar"><i style="width:${pct(item.mastery)}"></i></div></div>`).join('');
  const avg = averageMastery(state.concepts);
  els.overallMastery.textContent = pct(avg);
  els.answeredMetric.textContent = state.answered;
  els.accuracyMetric.textContent = state.answered ? pct(state.correct/state.answered) : '—';
  const gain = Math.round((avg - state.baseline) * 100);
  els.gainMetric.textContent = `${gain >= 0 ? '+' : ''}${gain}%`;
  if (proActive) renderPremiumInsights();
}

function reasonsFor(question) {
  const concept = state.concepts[question.concept];
  const success = predictedSuccess(concept.mastery, question.difficulty, PARAMS);
  const info = uncertainty(concept.mastery);
  const spacing = spacingUrgency(concept.lastPracticedAt);
  const statements = [
    `${question.concept} mastery is currently ${pct(concept.mastery)}, so there is useful learning headroom.`,
    `Model uncertainty is ${pct(info)}; another answer can sharpen the estimate.`,
    `Spacing urgency is ${pct(spacing)}, balancing retrieval practice against repetition.`,
    `Predicted success is ${pct(success)}, compared with a ${pct(PARAMS.targetSuccess)} productive-challenge target.`
  ];
  els.reasons.innerHTML = statements.map((text,i) => `<div class="reason"><b>${i+1}</b><span>${text}</span></div>`).join('');
  els.prediction.textContent = `${pct(success)} predicted`;
}

function showQuestion() {
  questionAnswered = false;
  els.feedback.classList.add('hidden');
  els.nextBtn.classList.add('hidden');
  current = chooseQuestion(QUESTIONS,state.concepts,new Set(state.used));
  if (state.used.length >= QUESTIONS.length) state.used = [];
  const q = current;
  els.conceptBadge.textContent = q.concept;
  els.questionIndex.textContent = `QUESTION ${state.answered + 1}`;
  els.questionText.textContent = q.text;
  els.answers.innerHTML = q.answers.map((answer,index) => `<button type="button" class="answer" data-i="${index}">${String.fromCharCode(65+index)}. ${answer}</button>`).join('');
  els.answers.querySelectorAll('.answer').forEach(btn => btn.addEventListener('click', () => answer(Number(btn.dataset.i))));
  reasonsFor(q);
  renderMastery();
}

function answer(index) {
  if (questionAnswered || !current) return;
  questionAnswered = true;
  const q = current;
  const concept = state.concepts[q.concept];
  const before = concept.mastery;
  const correct = index === q.correct;
  concept.mastery = updateMastery(before,correct,PARAMS);
  concept.attempts += 1;
  concept.lastPracticedAt = Date.now();
  state.answered += 1;
  if (correct) state.correct += 1;
  if (!state.used.includes(q.id)) state.used.push(q.id);
  persist();

  [...els.answers.children].forEach((button,i) => {
    button.disabled = true;
    if (i === q.correct) button.classList.add('correct');
    if (i === index && !correct) button.classList.add('wrong');
  });
  const delta = Math.round((concept.mastery-before)*100);
  els.feedback.innerHTML = `<strong>${correct?'Correct.':'Not quite.'}</strong> ${q.explanation}<br><small>Mastery ${pct(before)} → ${pct(concept.mastery)} (${delta>=0?'+':''}${delta} pts)</small>`;
  els.feedback.classList.remove('hidden');
  els.nextBtn.classList.remove('hidden');
  renderMastery();
}

function isEntitled(customerInfo) {
  return Boolean(customerInfo?.entitlements?.active?.[ENTITLEMENT_ID]);
}

function setPro(active, note='') {
  proActive = active;
  els.proState.textContent = active ? 'Unlocked' : 'Locked';
  els.unlockBtn.classList.toggle('hidden',active);
  els.premiumInsights.classList.toggle('hidden',!active);
  if (note) els.purchaseStatus.textContent = note;
  if (active) renderPremiumInsights();
}

function renderPremiumInsights() {
  const sorted = Object.entries(state.concepts).sort((a,b) => a[1].mastery-b[1].mastery);
  const [weakName,weak] = sorted[0];
  const [strongName,strong] = sorted[sorted.length-1];
  const next = chooseQuestion(QUESTIONS,state.concepts,new Set(state.used));
  els.premiumInsights.innerHTML = `<strong>Your next-session plan</strong><span>Focus first on ${weakName} (${pct(weak.mastery)} mastery). Keep ${strongName} (${pct(strong.mastery)}) warm with spaced retrieval. Recommended next item: ${next.concept}. This plan updates after every answer.</span>`;
}

async function initRevenueCat() {
  if (!Capacitor.isNativePlatform()) {
    els.purchaseStatus.textContent = 'Browser preview: learning model active. RevenueCat purchases activate in the Android build.';
    return;
  }
  if (!RC_API_KEY) {
    els.purchaseStatus.textContent = 'Android build ready; add VITE_REVENUECAT_API_KEY from the RevenueCat Test Store to enable test purchases.';
    return;
  }
  try {
    await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
    await Purchases.configure({ apiKey: RC_API_KEY });
    revenueCatReady = true;
    const { customerInfo } = await Purchases.getCustomerInfo();
    setPro(isEntitled(customerInfo), 'RevenueCat Test Store connected. No real money is charged in test mode.');
  } catch (error) {
    els.purchaseStatus.textContent = `RevenueCat setup error: ${error?.message || 'unable to initialize'}`;
  }
}

async function unlockPro() {
  if (!revenueCatReady) {
    els.purchaseStatus.textContent = RC_API_KEY ? 'RevenueCat is still initializing.' : 'A RevenueCat Test Store public SDK key must be configured in the Android build first.';
    return;
  }
  els.unlockBtn.disabled = true;
  els.purchaseStatus.textContent = 'Loading current RevenueCat offering…';
  try {
    const offerings = await Purchases.getOfferings();
    const pack = offerings?.current?.availablePackages?.[0];
    if (!pack) throw new Error('No package is attached to the current offering.');
    const result = await Purchases.purchasePackage({ aPackage: pack });
    const customerInfo = result?.customerInfo || result;
    const active = isEntitled(customerInfo);
    setPro(active, active ? 'Test purchase confirmed by RevenueCat; Pro Insights entitlement is active.' : 'Purchase completed but the configured entitlement was not active.');
  } catch (error) {
    els.purchaseStatus.textContent = `Purchase not completed: ${error?.message || 'cancelled or failed'}`;
  } finally {
    els.unlockBtn.disabled = false;
  }
}

async function restorePro() {
  if (!revenueCatReady) {
    els.purchaseStatus.textContent = 'RevenueCat must be configured before restoring.';
    return;
  }
  els.restoreBtn.disabled = true;
  try {
    const { customerInfo } = await Purchases.restorePurchases();
    const active = isEntitled(customerInfo);
    setPro(active, active ? 'Purchase restored; Pro Insights is active.' : 'Restore completed; no active Pro Insights entitlement found.');
  } catch (error) {
    els.purchaseStatus.textContent = `Restore failed: ${error?.message || 'unknown error'}`;
  } finally {
    els.restoreBtn.disabled = false;
  }
}

els.nextBtn.addEventListener('click',showQuestion);
els.unlockBtn.addEventListener('click',unlockPro);
els.restoreBtn.addEventListener('click',restorePro);

renderMastery();
showQuestion();
initRevenueCat();
