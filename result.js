const raw = localStorage.getItem("arabicTestAnswers");
const answers = raw ? JSON.parse(raw) : Object.fromEntries(QUESTIONS.map(q => [q.id, null]));
const result = calculateResult(answers);
const studentName = localStorage.getItem("arabicTestStudent") || "الطالب";
const completedAt = localStorage.getItem("arabicTestCompletedAt");

document.getElementById("studentNameResult").textContent = studentName;
document.getElementById("levelChip").textContent = result.overall.name;
document.getElementById("resultTitle").textContent = `المستوى العام: ${result.overall.name}`;
document.getElementById("score").textContent = result.accuracy;
document.getElementById("resultSummary").textContent =
  `أجاب الطالب عن ${result.answered} من ${result.total} سؤالًا، منها ${result.correct} إجابة صحيحة. تم تحليل الأداء حسب المهارات ومستويات الصعوبة.`;
document.getElementById("scoreCircle").style.setProperty("--score", `${result.accuracy * 3.6}deg`);
document.getElementById("correctStat").textContent = `${result.correct} / ${result.total}`;
document.getElementById("answeredStat").textContent = `${result.answered} / ${result.total}`;
document.getElementById("basicStat").textContent = `${result.basics.pct}%`;
document.getElementById("demonstratedStat").textContent = result.demonstratedDifficulty <= 1 ? "التأسيس" : `المستوى ${result.demonstratedDifficulty}`;

document.getElementById("foundation").innerHTML = result.overallId === 0
  ? `<span class="pill warning-pill">⚠ يوصى بالبدء من برنامج التأسيس</span>`
  : `<span class="pill">✓ الأساس مناسب للمستوى المقترح</span>`;

const skillBox = document.getElementById("skills");
skillBox.innerHTML = result.skills.map(s => `
  <div class="skill-row">
    <div class="skill-top"><span><b>${s.skill}</b><small>${s.correct}/${s.total} صحيحة</small></span><strong>${s.pct}% · ${s.name}</strong></div>
    <div class="bar"><span style="width:${s.pct}%"></span></div>
  </div>`).join("");

const levelBox = document.getElementById("levels");
levelBox.innerHTML = result.levelStats.map(s => `
  <div class="level-row">
    <div><span>${s.name}</span><strong>${s.pct}%</strong></div>
    <small>${s.correct}/${s.total} صحيحة · ${s.status}</small>
    <div class="bar"><span style="width:${s.pct}%"></span></div>
  </div>`).join("");

document.getElementById("strengths").innerHTML = result.strengths
  .filter(s => s.pct >= 50)
  .map(s => `<span class="pill">✓ ${s.skill} · ${s.pct}%</span>`).join("") || `<span class="muted">لا توجد مهارة متجاوزة لعتبة القوة الحالية.</span>`;

document.getElementById("weaknesses").innerHTML = result.weaknesses
  .filter(s => s.pct < 70)
  .map(s => `<span class="pill warning-pill">↗ ${s.skill} · ${s.pct}%</span>`).join("") || `<span class="pill">✓ لا توجد فجوة واضحة في المهارات الأساسية.</span>`;

document.getElementById("courseBadge").textContent = result.overall.course;

let recommendation = `المسار المقترح: ${result.overall.course}.`;
if(result.overallId === 0){
  recommendation += ` أظهر الاختبار أن الأداء في الأساسيات بلغ ${result.basics.pct}%، لذلك يُستحسن تثبيت القواعد الأولية قبل الانتقال إلى محتوى أعلى.`;
}else{
  recommendation += ` المستوى العام مبني على الدقة الكلية مع مراعاة ثبات الأداء في المستويات الأساسية والمتدرجة.`;
}
document.getElementById("recommendation").textContent = recommendation;

const weak = result.weaknesses.filter(s => s.pct < 70).slice(0,3);
document.getElementById("recommendationList").innerHTML = weak.length
  ? weak.map(s => `<div><b>${s.skill}</b><span>يُنصح بتخصيص مراجعة علاجية قصيرة لهذا المجال (${s.pct}%).</span></div>`).join("")
  : `<div><b>خطة متابعة</b><span>يمكن الانتقال إلى محتوى المستوى المقترح مع الاستمرار في المراجعة والتطبيق.</span></div>`;

if(completedAt){
  const d = new Date(completedAt);
  const dateEl = document.createElement("div");
  dateEl.className = "report-date";
  dateEl.textContent = `تاريخ التقرير: ${d.toLocaleString("ar-AE")}`;
  document.querySelector(".result-hero > div").appendChild(dateEl);
}
