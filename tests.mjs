import test from "node:test";
import assert from "node:assert/strict";
import { QUESTIONS, SECTIONS } from "./questions.js";
import { createAttempt, grade, remaining, validAttempt, DURATION } from "./core.js";
test("75 valid questions across 25 groups, three variants each",()=>{
 assert.equal(QUESTIONS.length,75); assert.equal(new Set(QUESTIONS.map(q=>q.id)).size,75);
 const groups=Map.groupBy(QUESTIONS,q=>q.group); assert.equal(groups.size,25);
 for(const qs of groups.values()) {
  assert.equal(qs.length,3);
  assert.equal(new Set(qs.map(q=>q.points)).size,1);
  assert.equal(new Set(qs.map(q=>q.section)).size,1);
  for(const q of qs) {assert.ok(q.explanation.length>15);assert.ok(q.prompt.length>15);
   assert.ok(q.options.length>=3);assert.equal(new Set(q.options).size,q.options.length);
   assert.ok(q.answer>=0&&q.answer<q.options.length);
  }
 }
});
test("500 randomized attempts remain balanced and unique",()=>{
 const signatures=new Set();const allIds=new Set();const answerPositions=new Set();
 for(let n=0;n<500;n++){
  const a=createAttempt(1000);assert.ok(validAttempt(a)); assert.equal(a.questions.length,25);
  const g=grade(a);assert.equal(g.possible,40);assert.equal(g.earned,0);
  for(const s of SECTIONS) {const rows=g.rows.filter(r=>r.q.section===s.name);assert.equal(rows.length,s.count);assert.equal(rows.reduce((v,r)=>v+r.q.points,0),s.points);}
  a.questions.forEach(x=>{allIds.add(x.id);answerPositions.add(x.options.indexOf(0));});
  signatures.add(a.questions.map(q=>q.id).join(","));
 }
 assert.equal(allIds.size,75);assert.equal(answerPositions.size,4);assert.ok(signatures.size>490);
});
test("new run changes every variant from previous attempt",()=>{
 const a=createAttempt(1000);const ids=a.questions.map(q=>q.id);
 const b=createAttempt(2000,ids);assert.ok(b.questions.every(q=>!ids.includes(q.id)));
});
test("perfect, mixed, incorrect, and skipped scores",()=>{
 const a=createAttempt(1000);
 a.questions.forEach(i=>{a.answers[i.id]=QUESTIONS.find(q=>q.id===i.id).answer;});
 assert.equal(grade(a).earned,40);assert.equal(grade(a).percent,100);assert.equal(grade(a).correct,25);
 const first=QUESTIONS.find(q=>q.id===a.questions[0].id);a.answers[first.id]=1;
 assert.equal(grade(a).earned,40-first.points);assert.equal(grade(a).correct,24);
 delete a.answers[first.id];assert.equal(grade(a).unanswered,1);
 a.questions.forEach(i=>{a.answers[i.id]=1;});assert.equal(grade(a).earned,0);
});
test("deadline survives serialization and expires at the exact boundary",()=>{
 const a=createAttempt(1000);assert.equal(remaining(a,1000),2700);
 const restored=JSON.parse(JSON.stringify(a));assert.ok(validAttempt(restored));
 assert.equal(remaining(restored,1000+DURATION-1),1);assert.equal(remaining(restored,1000+DURATION),0);
 assert.equal(remaining(restored,1000+DURATION+999),0);
});
test("reject corrupted or incompatible saved attempts",()=>{
 const a=createAttempt(1000);assert.equal(validAttempt({...a,version:99}),false);
 assert.equal(validAttempt({...a,index:-1}),false);
 assert.equal(validAttempt({...a,deadline:a.deadline+1}),false);
 const b=structuredClone(a);b.questions[0].options=[0,0,0,0];assert.equal(validAttempt(b),false);
 const c=structuredClone(a);c.answers[c.questions[0].id]=99;assert.equal(validAttempt(c),false);
 const d=structuredClone(a);d.questions[1]=d.questions[0];assert.equal(validAttempt(d),false);
});
