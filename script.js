// ==========================
// Carta + Test + Confirmación de Envío + WhatsApp
// ==========================

// ========= CONFIG =========
// Si NO usarás servidor, puedes dejar esto así (no se usará si confirmas sin backend).
const SERVER_ENDPOINT = "http://localhost:3000/api/complete-test";
const SERVER_TOKEN = "CAMBIA-ESTE-TOKEN";

// WHATSAPP: tu número en formato internacional (SIN +, SIN espacios)
// Bolivia ejemplo: 5917XXXXXXX
const WHATSAPP_NUMBER = "59172415298"; // <-- CAMBIA ESTO
// ==========================

const $ = (sel) => document.querySelector(sel);

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  $(screenId).classList.add("active");
}

function pad2(n){ return String(n).padStart(2,"0"); }
function formatDateTime(d){
  return `${d.getFullYear()}-${pad2(d.getMonth()+1)}-${pad2(d.getDate())} ${pad2(d.getHours())}:${pad2(d.getMinutes())}`;
}

function downloadTextFile(filename, text) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function openWhatsAppWithResults(phoneE164, text) {
  const msg = encodeURIComponent(text);
  const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

  // Celular: intenta abrir la app. PC: abre WhatsApp Web.
  const url = isMobile
    ? `whatsapp://send?phone=${phoneE164}&text=${msg}`
    : `https://wa.me/${phoneE164}?text=${msg}`;

  window.location.href = url;
}

// ==========================
// EDITA AQUÍ: "Carta" (texto + imágenes para el NO)
// ==========================
const letterSteps = [
  {
    title: "Antes de empezar…",
    text: "Presiona “Sí” si no estás enojada conmigo 😅",
    hint: "",
    img: "img/img4.jpg"
  },
  {
    title: "¿Segura?",
    text: "Piénsalo bien… yo solo quería darte un detalle 😌",
    hint: "No avanza hasta que presiones “Sí”.",
    img: "img/img5.avif"
  },
  {
    title: "Ey 😅",
    text: "Ok, no pasa nada… pero mírame tantito y di “Sí”.",
    hint: "Se acepta un “Sí” con cariño.",
    img: "img/img6.jpg"
  },
  {
    title: "Última oportunidad",
    text: "Si sigues diciendo que no, me pongo triste te quiero Laura🥲",
    hint: "Presiona “Sí” para continuar.",
    img: "img/img8.jpg"
  },
  {
    title: "Ok…",
    text: "bueno tu lo quisiste asi xD ni modos estas obligada a apretar si.... 💖",
    hint: "Prometo portarme bien.",
    img: "img/img10.png"
  }
];

// ==========================
// EDITA AQUÍ: Preguntas del test (con imágenes)
// ==========================
const quiz = [
  {
    id: "mood",
    title: "1) ¿Cómo estás conmigo ahora mismo?",
    desc: "Respóndeme con sincerida).",
    options: [
      {
        label: "Tranquila 😌",
        desc: "Así me gusta.",
        img: "img/tranqui.jpg",
        value: "Tranquila"
      },
      {
        label: "Feliz 😊",
        desc: "por que te conoci y te quiero.",
        img: "img/feliz.jpg",
        value: "Feliz"
      },
      {
        label: "En modo celitos 😑",
        desc: "Ok, abrazo urgente. o llamadita",
        img: "img/celos.jpg",
        value: "Celitos"
      }
    ]
  },
  {
    id: "like",
    title: "2) ¿Te gustó este detalle?",
    desc: "No mientas… (mentira sí, pero poquito).",
    options: [
      {
        label: "Sí, me gustó mucho 💘",
        desc: "Respuesta correcta.",
        img: "img/feliz1.png",
        value: "Le gustó mucho"
      },
      {
        label: "Me gustó… pero quiero más 😌",
        desc: "Ok, exigente. Me encanta.",
        img: "img/feliz2.jpg",
        value: "Le gustó pero quiere más"
      },
      {
        label: "No me gustó 😭",
        desc: "Acepto tu honestidad… pero igual te quiero.",
        img: "img/feliz3.jpg",
        value: "No le gustó"
      }
    ]
  },
  {
    id: "prize",
    title: "3) Elige tu premio (obligatorio)",
    desc: "El premio se cobra. Sin reclamos.",
    options: [
      {
        label: "Abrazo + besito 🫶",
        desc: "si quieres ",
        img: "img/premio1.jpg",
        value: "Abrazo + besito"
      },
      {
        label: "Cita bonita 🍓",
        desc: "Plan aprobado.",
        img: "img/premio2.jpg",
        value: "Cita bonita"
      },
      {
        label: "Peli + manta 😴",
        desc: "Modo paz activado.",
        img: "img/img11.jpg",
        value: "Peli + manta"
      }
    ]
  }
];

// ==========================
// Elements
// ==========================
// Letter
const letterTitle = $("#letterTitle");
const letterText  = $("#letterText");
const letterHint  = $("#letterHint");
const letterImg   = $("#letterImg");
const btnNo       = $("#btnNo");
const btnYes      = $("#btnYes");

// Quiz
const progress = $("#progress");
const total = $("#total");
const questionTitle = $("#questionTitle");
const questionDesc = $("#questionDesc");
const optionsWrap = $("#options");
const btnNext = $("#btnNext");
const quizHint = $("#quizHint");

// Confirm
const btnConfirmSend = $("#btnConfirmSend");
const btnConfirmRestart = $("#btnConfirmRestart");
const confirmHint = $("#confirmHint");

// End/doc
const finalMessage = $("#finalMessage");
const docText = $("#docText");
const docMeta = $("#docMeta");
const btnCopy = $("#btnCopy");
const btnDownload = $("#btnDownload");
const btnSendWA = $("#btnSendWA"); // ✅ NUEVO BOTÓN
const btnRestart = $("#btnRestart");

// ==========================
// State
// ==========================
let letterNoCount = 0;

let currentIndex = 0;
let selectedOptionIndex = null;

// answers: incluye "carta" + quiz
const answers = []; // {questionId, questionTitle, selectedLabel, selectedValue}

// ==========================
// Letter logic
// ==========================
function renderLetterStep(stepIndex) {
  const step = letterSteps[stepIndex];
  letterTitle.textContent = step.title;
  letterText.textContent = step.text;
  letterHint.textContent = step.hint || "";
  letterImg.src = step.img;
}

btnNo.addEventListener("click", () => {
  // No avanza. Solo cambia texto/imagen.
  letterNoCount++;
  const stepIndex = Math.min(letterNoCount, letterSteps.length - 1);
  renderLetterStep(stepIndex);
});

btnYes.addEventListener("click", () => {
  // Guardar confirmación
  const existingIndex = answers.findIndex(a => a.questionId === "carta");
  const payload = {
    questionId: "carta",
    questionTitle: "Confirmación inicial",
    selectedLabel: "Sí",
    selectedValue: "Aceptó continuar"
  };
  if (existingIndex >= 0) answers[existingIndex] = payload;
  else answers.push(payload);

  startQuiz();
});

// ==========================
// Quiz logic
// ==========================
function startQuiz() {
  currentIndex = 0;
  selectedOptionIndex = null;

  total.textContent = String(quiz.length);
  showScreen("#screenQuiz");
  renderQuestion();
}

function renderQuestion() {
  const q = quiz[currentIndex];

  progress.textContent = String(currentIndex + 1);
  questionTitle.textContent = q.title;
  questionDesc.textContent = q.desc;

  optionsWrap.innerHTML = "";
  selectedOptionIndex = null;
  btnNext.disabled = true;
  quizHint.textContent = "Selecciona una opción.";

  q.options.forEach((opt, idx) => {
    const card = document.createElement("div");
    card.className = "option";
    card.dataset.idx = String(idx);

    card.innerHTML = `
      <img src="${opt.img}" alt="opción ${idx + 1}">
      <div>
        <p class="optTitle">${opt.label}</p>
        <p class="optDesc">${opt.desc}</p>
      </div>
    `;

    card.addEventListener("click", () => selectOption(idx));
    optionsWrap.appendChild(card);
  });

  btnNext.textContent = (currentIndex === quiz.length - 1) ? "Finalizar ✅" : "Siguiente ➜";
}

function selectOption(idx) {
  const q = quiz[currentIndex];
  selectedOptionIndex = idx;

  optionsWrap.querySelectorAll(".option").forEach(c => c.classList.remove("selected"));
  const selectedCard = optionsWrap.querySelector(`.option[data-idx="${idx}"]`);
  if (selectedCard) selectedCard.classList.add("selected");

  btnNext.disabled = false;
  quizHint.textContent = "Ok 😌";

  const opt = q.options[idx];

  const existingIndex = answers.findIndex(a => a.questionId === q.id);
  const payload = {
    questionId: q.id,
    questionTitle: q.title,
    selectedLabel: opt.label,
    selectedValue: opt.value
  };

  if (existingIndex >= 0) answers[existingIndex] = payload;
  else answers.push(payload);
}

btnNext.addEventListener("click", () => {
  if (selectedOptionIndex === null) return;

  if (currentIndex < quiz.length - 1) {
    currentIndex++;
    renderQuestion();
    return;
  }

  // Terminó el quiz: generamos doc.text y pedimos confirmación
  finishQuizToConfirm();
});

// ==========================
// doc.text generation
// ==========================
function buildDocText() {
  const now = new Date();

  let text = "";
  text += "====================================\n";
  text += "             doc.text\n";
  text += "====================================\n";
  text += `Fecha/Hora: ${formatDateTime(now)}\n\n`;

  text += "Respuestas:\n";
  text += "------------------------------------\n";

  const onlyQuiz = answers.filter(a => a.questionId !== "carta");

  onlyQuiz.forEach((a, i) => {
    text += `${i + 1}. ${a.questionTitle}\n`;
    text += `   - Elegiste: ${a.selectedLabel}\n`;
    text += `   - Interpretación: ${a.selectedValue}\n\n`;
  });

  text += "------------------------------------\n";
  text += "Mensaje final:\n";
  text += "------------------------------------\n";
  text += "Bum. Te quiero. ❤️\n";

  return text;
}

// En vez de ir a END, va a CONFIRM
function finishQuizToConfirm() {
  const now = new Date();
  docMeta.textContent = `Generado: ${formatDateTime(now)}`;
  docText.value = buildDocText();

  confirmHint.textContent = "";
  btnConfirmSend.disabled = false;
  btnConfirmRestart.disabled = false;

  showScreen("#screenConfirm");
}

// ==========================
// Envío a servidor (opcional)
// ==========================
async function sendResultsToServer(docTextValue, answersArray) {
  const payload = {
    token: SERVER_TOKEN,
    createdAt: new Date().toISOString(),
    docText: docTextValue,
    answers: answersArray,
    userAgent: navigator.userAgent
  };

  const res = await fetch(SERVER_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    const msg = await res.text().catch(() => "");
    throw new Error(`Error servidor: ${res.status} ${msg}`);
  }

  return res.json().catch(() => ({}));
}

function setFinalMessageByMood() {
  const mood = answers.find(a => a.questionId === "mood")?.selectedValue || "";
  if (mood.includes("Celitos")) {
    finalMessage.textContent = "Ok… celitos detectados. Procedo a dar abrazo y atención. 😌";
  } else if (mood.includes("Feliz")) {
    finalMessage.textContent = "Perfecto. Felicidad confirmada. Bum: te quiero ❤️";
  } else {
    finalMessage.textContent = "Bien. Tranquilidad. Ahora sí: bum, te quiero ❤️";
  }
}

// ✅ Sin backend: confirmación solo muestra END.
// Si quieres usar backend, cambia USE_BACKEND a true.
const USE_BACKEND = false;

btnConfirmSend.addEventListener("click", async () => {
  btnConfirmSend.disabled = true;
  btnConfirmRestart.disabled = true;

  if (!USE_BACKEND) {
    confirmHint.textContent = "Listo ✅";
    setFinalMessageByMood();
    showScreen("#screenEnd");
    return;
  }

  confirmHint.textContent = "Enviando respuestas…";

  try {
    await sendResultsToServer(docText.value, answers);
    confirmHint.textContent = "Enviado ✅";
    setFinalMessageByMood();
    showScreen("#screenEnd");
  } catch (err) {
    console.error(err);
    confirmHint.textContent = "No se pudo enviar 😅 Revisa tu servidor/URL/token.";
    btnConfirmSend.disabled = false;
    btnConfirmRestart.disabled = false;
  }
});

btnConfirmRestart.addEventListener("click", () => {
  resetAll(false);
});

// ==========================
// Copy / Download / WhatsApp / Restart
// ==========================
btnCopy.addEventListener("click", async () => {
  try {
    await navigator.clipboard.writeText(docText.value);
    btnCopy.textContent = "Copiado ✅";
    setTimeout(() => btnCopy.textContent = "Copiar", 1200);
  } catch {
    docText.focus();
    docText.select();
    document.execCommand("copy");
    btnCopy.textContent = "Copiado ✅";
    setTimeout(() => btnCopy.textContent = "Copiar", 1200);
  }
});

btnDownload.addEventListener("click", () => {
  downloadTextFile("doc.text.txt", docText.value);
});

// ✅ Botón WhatsApp: abre WA con el doc.text
btnSendWA?.addEventListener("click", () => {
  const header =
    "Hola amor 💘\n" +
    "Ya terminé el test 😌\n\n" +
    "Aquí van mis respuestas:\n\n";

  const footer =
    "\n\nListo, ahora reclamo mi premio 🎁";

  const message = header + docText.value + footer;

  openWhatsAppWithResults(WHATSAPP_NUMBER, message);
});

btnRestart.addEventListener("click", () => {
  resetAll(false);
});

// ==========================
// Reset
// ==========================
function resetAll(goToConfirm) {
  // Reset state
  letterNoCount = 0;
  currentIndex = 0;
  selectedOptionIndex = null;
  answers.length = 0;

  // Reset UI
  finalMessage.textContent = "Listo. Aquí está tu doc.text con lo que elegiste.";
  docText.value = "Aquí se generarán tus respuestas…";
  confirmHint.textContent = "";

  renderLetterStep(0);
  showScreen("#screenLetter");
}

// ==========================
// Init
// ==========================
renderLetterStep(0);
showScreen("#screenLetter");
