let current = 0;
let answers = Object.fromEntries(QUESTIONS.map(q => [q.id, null]));
let marked = new Set();
let seconds = 25 * 60;
let timerId = null;
let finished = false;

const $ = id => document.getElementById(id);

function loadStudent(){
  const name = (localStorage.getItem("arabicTestStudent") || "").trim();
  if(!name){
    location.href = "index.html";
    return "";
  }
  $("studentNameTop").textContent = name;
  return name;
}

function render(){
  const q = QUESTIONS[current];
  $("questionCounter").textContent = `السؤال ${q.id} من ${QUESTIONS.length}`;
  $("questionText").innerHTML = q.question;
  $("ringText").textContent = `${q.id} / ${QUESTIONS.length}`;

  const pct = ((q.id - 1) / (QUESTIONS.length - 1)) * 100;
  $("progressBar").style.width = `${Math.max(3, pct)}%`;
  $("mainProgress").style.width = `${Math.max(3, pct)}%`;
  $("ring").style.setProperty("--progress", `${Math.max(3, pct) * 3.6}deg`);
  $("difficultyLabel").textContent = `السؤال ${q.id} · ${q.difficulty <= 2 ? "أساسي" : q.difficulty <= 4 ? "متوسط" : "متقدم"}`;

  $("prevBtn").disabled = current === 0;
  $("prevBtn").style.opacity = current === 0 ? ".45" : "1";
  $("nextBtn").textContent = current === QUESTIONS.length - 1 ? "عرض النتيجة ←" : "السؤال التالي ←";
  $("markBtn").textContent = marked.has(q.id) ? "⚑ إزالة المراجعة" : "⚑ مراجعة";

  $("options").innerHTML = "";
  q.options.forEach((opt, i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "option" + (answers[q.id] === i ? " selected" : "");
    b.innerHTML = `<span class="radio">${answers[q.id] === i ? "✓" : ""}</span><span><b>${['أ','ب','ج','د'][i]}.</b> ${opt}</span>`;
    b.onclick = () => {
      answers[q.id] = i;
      render();
    };
    $("options").appendChild(b);
  });
  renderGrid();
}

function renderGrid(){
  const grid = $("qGrid");
  grid.innerHTML = "";
  QUESTIONS.forEach((q,i) => {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "q-num" +
      (answers[q.id] !== null ? " answered" : "") +
      (i === current ? " current" : "") +
      (marked.has(q.id) ? " marked" : "");
    b.textContent = q.id;
    b.title = marked.has(q.id) ? "للمراجعة" : `السؤال ${q.id}`;
    b.onclick = () => { current = i; render(); window.scrollTo({top:0,behavior:"smooth"}); };
    grid.appendChild(b);
  });

  const answered = QUESTIONS.filter(q => answers[q.id] !== null).length;
  $("answeredCount").textContent = `${answered} / ${QUESTIONS.length}`;
  $("markedCount").textContent = marked.size;
  $("navStatus").textContent = `${Math.round(answered / QUESTIONS.length * 100)}%`;
}

function openFinish(){
  const unanswered = QUESTIONS.filter(q => answers[q.id] === null).length;
  $("finishMessage").textContent = unanswered
    ? `تبقى ${unanswered} سؤالًا دون إجابة. يمكنك العودة إليها، أو إنهاء الاختبار الآن وعرض التقرير.`
    : "لقد أجبت عن جميع الأسئلة. هل تريد إنهاء الاختبار وعرض التقرير؟";
  $("finishModal").hidden = false;
}

function finish(){
  if(finished) return;
  finished = true;
  clearInterval(timerId);
  localStorage.setItem("arabicTestAnswers", JSON.stringify(answers));
  localStorage.setItem("arabicTestCompletedAt", new Date().toISOString());
  location.href = "result.html";
}

$("prevBtn").onclick = () => { if(current > 0){ current--; render(); } };
$("nextBtn").onclick = () => { if(current < QUESTIONS.length - 1){ current++; render(); } else openFinish(); };
$("markBtn").onclick = () => {
  const id = QUESTIONS[current].id;
  marked.has(id) ? marked.delete(id) : marked.add(id);
  render();
};
$("finishTop").onclick = openFinish;
$("cancelFinish").onclick = () => $("finishModal").hidden = true;
$("confirmFinish").onclick = finish;
$("exitLink").onclick = e => {
  if(!confirm("هل تريد الخروج؟ ستفقد إجاباتك الحالية.")) e.preventDefault();
};

function startTimer(){
  const tick = () => {
    const m = Math.floor(seconds / 60), s = seconds % 60;
    $("timer").textContent = `${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;
    if(seconds <= 60) $("timer").classList.add("urgent");
    if(seconds <= 0){
      clearInterval(timerId);
      alert("انتهى وقت الاختبار. سيتم عرض النتيجة الآن.");
      finish();
      return;
    }
    seconds--;
  };
  tick();
  timerId = setInterval(tick,1000);
}

loadStudent();
render();
startTimer();
