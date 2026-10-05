import { QUESTIONS, SECTIONS } from "./questions.js";
import { KEY, createAttempt, remaining, grade, validAttempt } from "./core.js";
const app = document.querySelector("#app");
const dialog = document.querySelector("#confirm-dialog");
const $ = id => document.getElementById(id);
const esc = value => String(value).replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
let attempt = null, showAll = false, confirmAction = null, announcedFive = false;
function storageWarning() { $("storage-note").hidden = false; }
try {
  const saved = localStorage.getItem(KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    if (validAttempt(parsed)) attempt = parsed;
    else localStorage.removeItem(KEY);
  }
} catch { storageWarning(); }
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(attempt)); } catch { storageWarning(); }
}
function speak(message) { $("announcer").textContent = message; }
function focusHeading() {
  const h = app.querySelector("h1, #question-title");
  if (h) { h.setAttribute("tabindex", "-1"); h.focus(); }
}
function codeBlock(code) { return code ? '<pre class="code"><code>' + esc(code) + '</code></pre>' : ""; }
function home() {
  app.innerHTML = `<div class="intro"><section class="intro-copy">
  <div class="eyebrow">C# · .NET · Integration engineering</div>
  <h1>Put your engineering<br>judgment to the test.</h1>
  <p class="muted">A focused practice assessment, from asynchronous C# to reliable integrations and clear decision-making.</p>
  <div class="summary-line"><div><strong>45</strong><span>minutes</span></div><div><strong>25</strong><span>questions per attempt</span></div><div><strong>75</strong><span>questions in the bank</span></div></div>
  <button class="primary" id="start">Start 45-minute assessment →</button>
  <p class="fine">No sign-in. Your progress is saved only in this browser.</p>
  <div class="rules"><strong>Before you begin</strong><ul>
  <li>Choose one answer per question. Code questions ask you to select an implementation; no code editor is needed.</li>
  <li>The timer continues if you leave or refresh. At zero, your answers are submitted automatically.</li>
  <li>Navigate freely and flag questions to revisit. Answers and explanations appear after submission.</li>
  <li>40 points total. Correct answers earn the displayed points; incorrect or skipped answers earn zero. No partial credit or negative marking.</li>
  <li>For realistic practice, avoid an IDE, AI, or reference material. A basic calculator is fine.</li>
  </ul></div></section>
  <aside class="panel"><div class="eyebrow">Your assessment</div><h2>Four ways to think.</h2>
  <p class="muted">Each attempt samples one of three variants per topic and shuffles the answer choices.</p>
  ${SECTIONS.map(s => `<div class="section-row"><div><strong>${esc(s.name)}</strong><small>${s.count} questions · suggested ${s.minutes} minutes</small></div><b>${s.points} pts</b></div>`).join("")}
  <p class="fine">Practice scores help identify topics to review. They are not validated hiring thresholds. This is independent practice material, not a DriveCentric test.</p></aside></div>`;
  $("start").onclick = () => begin();
}
function begin() {
  const previous = attempt?.questions.map(q => q.id) || [];
  attempt = createAttempt(Date.now(), previous);
  showAll = false; announcedFive = false;
  persist(); renderQuestion(); focusHeading();
}
function finish(reason = "submitted") {
  if (!attempt || attempt.completed !== null) return;
  attempt.completed = Math.min(Date.now(), attempt.deadline);
  attempt.reason = reason;
  if (dialog.open) dialog.close();
  persist(); renderResults(); window.scrollTo(0,0); focusHeading();
  speak(reason === "timeout" ? "Time is up. Your assessment has been scored." : "Assessment submitted. Your score is ready.");
}
function guardTime() {
  if (attempt && attempt.completed === null && remaining(attempt) === 0) {
    finish("timeout"); return false;
  }
  return true;
}
function move(index) {
  if (!guardTime()) return;
  attempt.index = Math.max(0, Math.min(24,index));
  persist(); renderQuestion(); window.scrollTo({top:0,behavior:"instant"}); focusHeading();
}
function openConfirm(title, text, action, button, cancel = "Keep working") {
  $("dialog-title").textContent = title; $("dialog-text").textContent = text;
  $("confirm-dialog-button").textContent = button; $("cancel-dialog").textContent = cancel;
  confirmAction = action; dialog.showModal();
}
$("cancel-dialog").onclick = () => dialog.close();
$("confirm-dialog-button").onclick = () => { dialog.close(); confirmAction?.(); };
function renderQuestion() {
  if (!guardTime()) return;
  const item = attempt.questions[attempt.index];
  const q = QUESTIONS.find(q => q.id === item.id);
  const answered = Object.keys(attempt.answers).length;
  app.innerHTML = `<div class="toolbar"><div><div class="eyebrow">Assessment in progress</div><h1>One problem at a time.</h1><span class="muted" id="answered-summary">${answered} of 25 answered</span></div><div class="timer-box"><small>TIME REMAINING</small><div id="timer" class="timer" role="timer" aria-label="Time remaining"></div></div></div>
  <div class="workspace"><section class="panel question" aria-labelledby="question-title">
  <div class="question-meta"><span>${esc(q.section)} · Question ${attempt.index+1} of 25</span><span>${q.points} ${q.points===1?"point":"points"}</span></div>
  <div class="progress" role="progressbar" aria-label="Questions answered" aria-valuenow="${answered}" aria-valuemin="0" aria-valuemax="25"><span style="width:${answered*4}%"></span></div>
  <h2 id="question-title" tabindex="-1">${esc(q.prompt)}</h2>${codeBlock(q.code)}
  <fieldset class="answers"><legend class="sr-only">Choose one answer</legend>
  ${item.options.map((option,index) => `<label class="option"><input type="radio" name="answer" value="${option}" ${attempt.answers[q.id]===option?"checked":""}><span><span class="letter">OPTION ${String.fromCharCode(65+index)}</span>${esc(q.options[option])}</span></label>`).join("")}
  </fieldset>
  <button class="quiet" id="clear-answer" ${attempt.answers[q.id]===undefined?"disabled":""}>Clear answer</button>
  <div class="question-actions"><button class="secondary" id="previous" ${attempt.index===0?"disabled":""}>← Previous</button><button class="quiet flag-button ${attempt.flags.includes(q.id)?"active":""}" id="flag" aria-pressed="${attempt.flags.includes(q.id)}">${attempt.flags.includes(q.id)?"Flagged for review":"Flag for review"}</button><button class="primary" id="next">${attempt.index===24?"Review & finish":"Next →"}</button></div>
  </section><aside class="panel navigator"><h2>Question navigator</h2><div id="nav-groups"></div><div class="legend">Green: answered · Dot: flagged<br>Outline: current question</div><button class="primary" id="submit">Finish assessment</button><p class="fine">Progress saves as you go. The timer does not pause.</p></aside></div>`;
  app.querySelectorAll('input[name="answer"]').forEach(input => input.onchange = () => {
    if (!guardTime()) return;
    attempt.answers[q.id] = Number(input.value);
    persist(); updateProgress(); $("clear-answer").disabled = false;
  });
  $("clear-answer").onclick = () => {
    if (!guardTime()) return;
    delete attempt.answers[q.id]; persist(); renderQuestion();
  };
  $("flag").onclick = () => {
    if (!guardTime()) return;
    attempt.flags = attempt.flags.includes(q.id) ? attempt.flags.filter(id => id!==q.id) : [...attempt.flags,q.id];
    persist(); renderQuestion(); $("flag").focus();
  };
  $("previous").onclick = () => move(attempt.index-1);
  $("next").onclick = () => attempt.index===24 ? requestFinish() : move(attempt.index+1);
  $("submit").onclick = requestFinish;
  updateProgress(); tick();
}
function requestFinish() {
  if (!guardTime()) return;
  const unanswered = 25-Object.keys(attempt.answers).length;
  openConfirm("Finish assessment?", `You have ${unanswered} unanswered question${unanswered===1?"":"s"} and ${attempt.flags.length} flagged for review. Unanswered questions earn zero points. Submit now to see your score and explanations.`, () => { if (guardTime()) finish(); }, "Submit and see score");
}
function updateProgress() {
  const answered = Object.keys(attempt.answers).length;
  $("answered-summary").textContent = `${answered} of 25 answered`;
  const progress = app.querySelector(".progress");
  progress.setAttribute("aria-valuenow", answered);
  progress.firstElementChild.style.width = answered*4+"%";
  $("nav-groups").innerHTML = SECTIONS.map(s => `<div class="nav-group"><p>${esc(s.name)}</p><div class="nav-grid">${attempt.questions.map((item,i) => ({item,i,q:QUESTIONS.find(q=>q.id===item.id)})).filter(x=>x.q.section===s.name).map(({item,i}) => {
    const done = attempt.answers[item.id]!==undefined, flagged=attempt.flags.includes(item.id);
    return `<button class="nav-button ${done?"answered":""} ${i===attempt.index?"current":""} ${flagged?"flagged":""}" data-index="${i}" ${i===attempt.index?'aria-current="step"':""} aria-label="Question ${i+1}, ${done?"answered":"unanswered"}${flagged?", flagged":""}">${i+1}</button>`;
  }).join("")}</div></div>`).join("");
  app.querySelectorAll("[data-index]").forEach(b=>b.onclick=()=>move(Number(b.dataset.index)));
}
function tick() {
  if (!attempt || attempt.completed !== null || !guardTime()) return;
  const secs = remaining(attempt), timer = $("timer");
  if (timer) {
    timer.textContent = `${String(Math.floor(secs/60)).padStart(2,"0")}:${String(secs%60).padStart(2,"0")}`;
    timer.classList.toggle("low", secs<=300);
  }
  if (secs<=300 && !announcedFive) { announcedFive=true; speak("Five minutes or less remain."); }
}
function renderResults() {
  const result = grade(attempt);
  const missed = result.rows.filter(r=>!r.correct);
  const rows = showAll ? result.rows : missed;
  const elapsed = Math.max(0,Math.min(2700,Math.floor((attempt.completed-attempt.started)/1000)));
  const feedback = result.earned>=34 ? "Strong performance on this practice set." : result.earned>=28 ? "A solid foundation. Review the missed topics below." : result.earned>=20 ? "Targeted practice will help strengthen these topics." : "Start with the explanations, then try a fresh attempt.";
  app.innerHTML = `<section class="result-top"><div><div class="eyebrow" style="color:#baddbc">Assessment complete</div><h1>Your results are ready.</h1><p>${feedback}</p><p class="fine">${attempt.reason==="timeout"?"Time expired · Auto-submitted":"Submitted"} · ${Math.floor(elapsed/60)}m ${elapsed%60}s · ${result.correct}/25 correct · ${result.unanswered} unanswered</p></div><div class="score-box"><div class="score">${result.earned}<small> / ${result.possible}</small></div><p>${result.percent}% weighted score</p></div></section>
  <div class="score-grid">${result.sections.map(s=>`<div class="panel score-card"><p>${esc(s.name)}</p><strong>${s.earned}<span class="muted"> / ${s.points}</span></strong></div>`).join("")}</div>
  <p class="fine">Scores are for practice, not validated hiring thresholds. Each question earns all of its points or zero. Longer code and reasoning questions carry more weight.</p>
  <div class="result-actions"><button class="primary" id="restart">Try a new randomized assessment</button></div>
  <div class="review-heading"><h2>${showAll?"All questions":"Review missed questions"} <span class="muted">(${rows.length})</span></h2><button class="secondary" id="toggle-review">${showAll?"Show missed only":"Review all questions"}</button></div>
  ${rows.length===0?'<div class="panel"><h2>Every answer was correct.</h2><p class="muted">You can review all explanations or try another set of variants.</p></div>':rows.map(r=>`<article class="panel review-card"><div class="question-meta"><span>${esc(r.q.section)} · Question ${attempt.questions.findIndex(i=>i.id===r.q.id)+1} · ${r.earned}/${r.q.points} pts</span><span class="status-badge ${r.correct?"correct":""}">${r.correct?"CORRECT":r.answer===undefined?"UNANSWERED":"INCORRECT"}</span></div>
  <h3>${esc(r.q.prompt)}</h3>${codeBlock(r.q.code)}
  ${!r.correct?`<p class="answer-line wrong-answer"><strong>Your answer:</strong> ${r.answer===undefined?"No answer selected":esc(r.q.options[r.answer])}</p>`:""}
  <p class="answer-line right-answer"><strong>Correct answer:</strong> ${esc(r.q.options[r.q.answer])}</p>
  <p class="explanation"><strong>Why:</strong> ${esc(r.q.explanation)}</p></article>`).join("")}`;
  $("toggle-review").onclick = () => {showAll=!showAll;renderResults();};
  $("restart").onclick = () => openConfirm("Start a fresh attempt?", "This replaces the saved result in this browser and starts a new 45-minute timer. Each topic will use a different variant from this attempt.", () => {begin();window.scrollTo(0,0);}, "Start new attempt", "Keep results");
}
setInterval(tick,1000);
document.addEventListener("visibilitychange", tick);
window.addEventListener("pageshow", tick);
if (!attempt) home();
else if (attempt.completed !== null) renderResults();
else renderQuestion();
