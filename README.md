# C# Practice Lab

A 45-minute, browser-based practice assessment for C#/.NET and integration engineering.

## Take the assessment

https://jcoder-ma.github.io/csharp-screening-practice/

- 75 questions in 25 topic groups, with three variants per group.
- Each attempt draws 25 questions: 10 C#/.NET, 5 integration/logic, 5 numerical, and 5 verbal.
- Question order is randomized within each section; answer choices are shuffled.
- The next attempt avoids the immediately previous variant for every topic.
- 40 weighted points, automatic scoring, and section breakdowns.
- Incorrect and unanswered questions show the correct answer and explanation after submission.
- A 45-minute deadline survives reloads. If the browser was closed at expiry, submission occurs when it is reopened.
- Progress and the latest result are stored only in localStorage in the current browser.
- Responsive layout, keyboard-accessible controls, review flags, and a submission confirmation.

## Scoring

| Section | Questions | Points |
| --- | ---: | ---: |
| C# and .NET | 10 | 18 |
| Integration logic | 5 | 10 |
| Numerical reasoning | 5 | 6 |
| Verbal reasoning | 5 | 6 |

Each question awards all its points or zero. No partial credit or negative marking.
Open-ended coding and writing prompts from the original practice assessment are adapted into multiple-choice/code-selection items for deterministic grading.

This is independent study material, not an official DriveCentric assessment or a validated hiring instrument. As a static practice site, the question bank and answers can be inspected in source; it is not a secure or proctored examination. Local progress can be modified or cleared, and does not sync between devices. Use one tab per attempt.

## Run locally

Serve the directory over HTTP rather than opening index.html directly, because the app uses ES modules.

Example with Python:

    python -m http.server 8000

Then open http://localhost:8000.

No build step or application dependencies are required.

## Tests

With Node.js 22 or newer:

    npm test

Tests cover the 75-question bank, balanced sampling, all variants appearing across repeated runs, fresh variants, weighted scoring, deadline persistence, and invalid saved-state rejection.

The deployed app was also checked in a desktop and mobile browser for navigation, answer persistence, flagging, submission, result explanations, timeout, and unavailable-storage behavior.

## Files

- index.html and styles.css: layout and visual design.
- questions.js: question bank, answers, explanations, and section definitions.
- core.js: sampling, grading, time calculations, and state validation.
- app.js: assessment interface and browser persistence.
- tests.mjs: automated checks.

## Hosting

GitHub Pages publishes the repository's default branch from its root. The .nojekyll file enables straightforward static asset serving.

## Technical references

- [ConcurrentDictionary.GetOrAdd and repeated value factory invocation](https://learn.microsoft.com/dotnet/api/system.collections.concurrent.concurrentdictionary-2.getoradd)
- [EF Core DbContext lifetime and thread safety](https://learn.microsoft.com/en-us/ef/core/dbcontext-configuration/)
