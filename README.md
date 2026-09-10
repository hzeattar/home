# MasteryMap AI

**Adaptive learning that shows students what to study next — and why.**

MasteryMap AI is a privacy-first educational web app built for the Prom Fall Classic 2026. It uses a lightweight Bayesian Knowledge Tracing model to estimate concept mastery after every answer, then recommends the next question using uncertainty, learning need, spacing, and difficulty fit.

## Why this matters

Most quiz apps tell students whether an answer was right or wrong. MasteryMap estimates *what the learner probably knows*, identifies uncertain concepts, and adapts the practice path in real time. The model runs entirely in the browser, so no account, API key, or personal data upload is required.

## AI / ML core

For each concept the app maintains a mastery probability `P(L)`. After an answer it performs a Bayesian update using configurable guess and slip probabilities, then applies a learning transition. Question selection scores concepts using:

- low estimated mastery,
- uncertainty / information value,
- spaced-practice urgency,
- difficulty fit to predicted success.

The UI exposes the model's reasoning so students can see why a question was selected.

## Features

- Adaptive question sequencing
- Bayesian Knowledge Tracing mastery updates
- Predicted probability of success
- Explainable recommendation panel
- Mastery dashboard by concept
- Session streak, accuracy, and learning-gain metrics
- Local-only progress persistence
- Responsive mobile/desktop interface
- No paid dependencies or external AI API

## Run locally

Open `index.html` through any static web server, for example:

```bash
python -m http.server 8080
```

Then open `http://localhost:8080/hackathons/prom-fall-classic-mastery-map/`.

## Tests

```bash
cd hackathons/prom-fall-classic-mastery-map
node tests/model.test.mjs
```

## Hackathon

Built from scratch during the Prom Fall Classic 2026 build window. Submission target: source code + a demo video under two minutes.

## License

MIT
