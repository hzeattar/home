# Devpost Submission Pack — MasteryMap AI

## Project name
MasteryMap AI

## Tagline
An explainable adaptive learning coach that chooses what you should study next.

## Inspiration
Students often get a score but not a useful next step. A learner can answer ten questions and still have no idea which concept deserves attention next. We wanted a study tool that treats every answer as evidence, updates a model of the learner, and turns that model into an immediately useful recommendation.

## What it does
MasteryMap AI runs an adaptive computer-science practice session entirely in the browser. It maintains a mastery probability for Algorithms, Networking, Databases, and Probability. After each response, a Bayesian Knowledge Tracing model updates the relevant concept while accounting for guessing, slipping, and learning. The recommender then ranks possible next questions using five signals: learning need, uncertainty, spacing urgency, difficulty fit, and novelty.

The student sees more than a score. MasteryMap shows the current mastery map, predicted success probability, learning gain, accuracy, and a plain-language explanation of why the model selected the next question.

## How we built it
The app is a dependency-free static web application built with semantic HTML, responsive CSS, and JavaScript ES modules. The ML core is implemented directly rather than delegated to a black-box API. The Bayesian update converts a prior mastery probability into a posterior after observing a correct or incorrect answer, then applies a learning transition. A transparent weighted recommender scores each candidate question and selects the highest-value practice opportunity.

No account, API key, server, or external tracking service is required. Progress is persisted locally in the browser.

## AI / ML technique
Bayesian Knowledge Tracing + adaptive recommendation scoring.

For mastery probability `p`, the model applies Bayes' rule using slip and guess probabilities. It then models learning between attempts. The recommendation function combines:

- 38% learning need
- 20% model uncertainty / information value
- 17% spaced-practice urgency
- 20% difficulty fit to a productive-challenge target
- 5% novelty

This makes the AI behavior inspectable, testable, and explainable.

## Challenges
The main design challenge was balancing two objectives that can conflict: practice weak skills, but avoid repeatedly serving questions that are either too easy or too hard. The difficulty-fit component targets a predicted-success zone while spacing and novelty prevent the same concept from dominating every recommendation.

## Accomplishments
- Built an adaptive learner model without paid APIs.
- Made the recommendation logic visible to the student instead of hiding it behind a score.
- Added deterministic tests for Bayesian updates, bounds, uncertainty, spacing, ranking, and aggregate mastery.
- Built the entire experience as a responsive static application that can run almost anywhere.

## What we learned
A small probabilistic model can create a noticeably more personalized experience when its state is updated frequently and its recommendations are grounded in interpretable signals. Explainability also improves the product itself: it forces every recommendation to have a defensible reason.

## What's next
We would expand the question bank, calibrate guess/slip parameters from anonymized classroom data, add prerequisite graphs between concepts, support teacher-authored curricula, and evaluate learning gains against fixed-order practice in a controlled study.

## Built with
JavaScript, ES modules, HTML5, CSS3, Bayesian Knowledge Tracing, localStorage, Node.js assertions for tests.

## Source code
Repository: `hzeattar/home`
Branch: `hackathon/prom-fall-classic-mastery-map`
Project directory: `hackathons/prom-fall-classic-mastery-map`

## Test command
`node tests/model.test.mjs`

## Demo requirements checklist
- Keep the final video under 2 minutes.
- Show the landing screen and local/privacy claim.
- Start an adaptive session.
- Answer one question correctly and one incorrectly.
- Show the mastery probability changing after each answer.
- Show the AI Decision panel and predicted-success ring.
- Use Quick Demo to demonstrate adaptation across concepts.
- End with the source repository/branch and project name.

## Integrity / disclosure
MasteryMap AI is built as a new entry during the Prom Fall Classic 2026 build period. The model, interface, question bank, tests, and submission materials live in the hackathon project directory. No private learner data is sent to an external model or analytics service.
