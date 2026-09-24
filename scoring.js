const LEVELS = [
  {id:0,name:"تأسيس",course:"برنامج تأسيس اللغة العربية"},
  {id:1,name:"مبتدئ",course:"العربية للمبتدئين"},
  {id:2,name:"متوسط",course:"العربية المستوى المتوسط"},
  {id:3,name:"فوق المتوسط",course:"العربية فوق المتوسط"},
  {id:4,name:"متقدم",course:"العربية المتقدمة"},
  {id:5,name:"متقدم جدًا",course:"العربية المتقدمة جدًا"}
];

const SKILL_ORDER = ["النحو","الصرف","التحويل","اللغة والتراكيب","الأساليب والبلاغة","فهم واستيعاب"];

function scoreToLevel(pct){
  if(pct < 40) return 0;
  if(pct < 55) return 1;
  if(pct < 70) return 2;
  if(pct < 80) return 3;
  if(pct < 90) return 4;
  return 5;
}

function calculateResult(answers){
  const total = QUESTIONS.length;
  const answeredQs = QUESTIONS.filter(q => answers[q.id] !== null && answers[q.id] !== undefined);
  const correct = answeredQs.filter(q => answers[q.id] === q.answer).length;
  const accuracy = Math.round((correct / total) * 100);

  const levelStats = [1,2,3,4,5,6].map(difficulty => {
    const qs = QUESTIONS.filter(q => q.difficulty === difficulty);
    const answered = qs.filter(q => answers[q.id] !== null && answers[q.id] !== undefined);
    const hits = answered.filter(q => answers[q.id] === q.answer).length;
    const pct = qs.length ? Math.round((hits / qs.length) * 100) : 0;
    return {
      difficulty, name: `المستوى ${difficulty}`,
      total: qs.length, answered: answered.length, correct: hits, pct,
      status: pct >= 70 ? "متقن" : pct >= 50 ? "قيد التثبيت" : "يحتاج دعمًا"
    };
  });

  const skills = SKILL_ORDER.map(skill => {
    const qs = QUESTIONS.filter(q => q.skill === skill);
    const answered = qs.filter(q => answers[q.id] !== null && answers[q.id] !== undefined);
    const hits = answered.filter(q => answers[q.id] === q.answer).length;
    const pct = qs.length ? Math.round((hits / qs.length) * 100) : 0;
    return {
      skill, pct, correct:hits, total:qs.length, answered:answered.length,
      level:scoreToLevel(pct), name:LEVELS[scoreToLevel(pct)].name
    };
  });

  const basics = QUESTIONS.filter(q => q.difficulty <= 2);
  const basicCorrect = basics.filter(q => answers[q.id] === q.answer).length;
  const basicPct = Math.round((basicCorrect / basics.length) * 100);

  // A level is considered demonstrated only when at least half of its questions
  // were attempted and the student achieved 60% of the full band.
  const demonstratedBands = levelStats.filter(s => s.answered >= Math.ceil(s.total/2) && s.pct >= 60);
  const demonstratedDifficulty = demonstratedBands.length ? Math.max(...demonstratedBands.map(s=>s.difficulty)) : 1;
  const demonstratedLevel = Math.max(0, demonstratedDifficulty - 1);

  let overallId = scoreToLevel(accuracy);
  if(basicPct < 40) overallId = 0;
  overallId = Math.min(overallId, demonstratedLevel);

  const strengths = [...skills].sort((a,b)=>b.pct-a.pct).slice(0,3);
  const weaknesses = [...skills].sort((a,b)=>a.pct-b.pct).slice(0,3);

  return {
    total, answered:answeredQs.length, correct, accuracy,
    overall:LEVELS[overallId], overallId,
    levelStats, skills, strengths, weaknesses,
    basics:{correct:basicCorrect,total:basics.length,pct:basicPct},
    demonstratedDifficulty, demonstratedLevel,
    needsFoundation: basicPct < 60
  };
}
