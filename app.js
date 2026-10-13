// ==========================================================================
// MBTI Test Application Logic
// ==========================================================================

// State Management
let currentQuestionIndex = 0;
let userAnswers = []; // Array of selected types: ['E', 'S', 'T', 'J', ...]

// DOM Elements
const screenStart = document.getElementById("screen-start");
const screenQuiz = document.getElementById("screen-quiz");
const screenLoading = document.getElementById("screen-loading");
const screenResult = document.getElementById("screen-result");

const btnStart = document.getElementById("btn-start");
const btnPrev = document.getElementById("btn-prev");
const btnRestart = document.getElementById("btn-restart");
const btnShare = document.getElementById("btn-share");
const toast = document.getElementById("toast");

// Quiz Elements
const currentStepText = document.getElementById("current-step");
const progressPercentText = document.getElementById("progress-percent");
const progressBar = document.getElementById("progress-bar");
const questionEmoji = document.getElementById("question-emoji");
const questionTitle = document.getElementById("question-title");
const optionContainer = document.getElementById("option-container");

// Result Elements
const resultBadge = document.getElementById("result-badge");
const resultMbtiCode = document.getElementById("result-mbti-code");
const resultNickname = document.getElementById("result-nickname");
const resultEmoji = document.getElementById("result-emoji");
const resultEmojiCard = document.getElementById("result-emoji-card");
const resultTagsContainer = document.getElementById("result-tags");
const resultDesc = document.getElementById("result-desc");
const resultTraitsContainer = document.getElementById("result-traits");
const resultCelebsContainer = document.getElementById("result-celebs");
const dimensionBarsContainer = document.getElementById("dimension-bars");
const bestType = document.getElementById("best-type");
const bestDesc = document.getElementById("best-desc");
const chemType = document.getElementById("chem-type");
const chemDesc = document.getElementById("chem-desc");

// Switch Screens
function showScreen(screen) {
  [screenStart, screenQuiz, screenLoading, screenResult].forEach((s) => {
    s.classList.remove("active");
  });
  screen.classList.add("active");
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// Start Quiz
btnStart.addEventListener("click", () => {
  currentQuestionIndex = 0;
  userAnswers = [];
  showScreen(screenQuiz);
  renderQuestion(currentQuestionIndex);
});

// Render Question
function renderQuestion(index) {
  const q = questions[index];
  if (!q) return;

  // Header & Progress
  const total = questions.length;
  const currentNum = index + 1;
  const progressPercent = Math.round((currentNum / total) * 100);

  currentStepText.textContent = `Q. ${String(currentNum).padStart(2, "0")} / ${total}`;
  progressPercentText.textContent = `${progressPercent}%`;
  progressBar.style.width = `${progressPercent}%`;

  // Question Info
  questionEmoji.textContent = q.emoji;
  questionTitle.textContent = q.title;

  // Animation trigger for emoji
  questionEmoji.style.animation = "none";
  void questionEmoji.offsetWidth; // trigger reflow
  questionEmoji.style.animation = "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)";

  // Options
  optionContainer.innerHTML = "";
  q.options.forEach((opt, optIdx) => {
    const keyLetter = optIdx === 0 ? "A" : "B";
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.id = `option-${keyLetter.toLowerCase()}`;

    // Highlight previously selected
    if (userAnswers[index] === opt.type) {
      btn.classList.add("selected");
    }

    btn.innerHTML = `
      <div class="option-key">${keyLetter}</div>
      <div class="option-content">
        <span class="option-tag">${opt.tag}</span>
        <div class="option-text">${opt.text}</div>
      </div>
    `;

    btn.addEventListener("click", () => handleSelectOption(opt.type, btn));
    optionContainer.appendChild(btn);
  });

  // Previous button state
  btnPrev.disabled = index === 0;
}

// Handle Option Selection
function handleSelectOption(selectedType, btnElement) {
  // Visual feedback
  const allBtns = optionContainer.querySelectorAll(".option-btn");
  allBtns.forEach((b) => b.classList.remove("selected"));
  btnElement.classList.add("selected");

  // Save answer
  userAnswers[currentQuestionIndex] = selectedType;

  // Transition to next question with brief natural delay
  setTimeout(() => {
    if (currentQuestionIndex < questions.length - 1) {
      currentQuestionIndex++;
      renderQuestion(currentQuestionIndex);
    } else {
      finishQuiz();
    }
  }, 260);
}

// Previous Question Button
btnPrev.addEventListener("click", () => {
  if (currentQuestionIndex > 0) {
    currentQuestionIndex--;
    renderQuestion(currentQuestionIndex);
  }
});

// Finish and Calculate
function finishQuiz() {
  showScreen(screenLoading);

  // Calculate Scores
  const scores = {
    E: 0, I: 0,
    S: 0, N: 0,
    T: 0, F: 0,
    J: 0, P: 0
  };

  userAnswers.forEach((ans) => {
    if (scores[ans] !== undefined) {
      scores[ans]++;
    }
  });

  const mbti = [
    scores.E >= scores.I ? "E" : "I",
    scores.S >= scores.N ? "S" : "N",
    scores.T >= scores.F ? "T" : "F",
    scores.J >= scores.P ? "J" : "P"
  ].join("");

  // Delightful delay for analysis feeling
  setTimeout(() => {
    const resultData = mbtiResults[mbti] || mbtiResults["ENFP"];
    renderResult(resultData, scores);
    showScreen(screenResult);
    fireConfetti();
  }, 900);
}

// Render Result Screen
function renderResult(data, scores) {
  resultBadge.textContent = `당신의 성격 유형은?`;
  resultMbtiCode.textContent = data.type;
  resultMbtiCode.style.color = data.color;
  resultNickname.textContent = data.nickname;
  resultEmoji.textContent = data.emoji;
  resultEmojiCard.style.backgroundColor = data.bgColor;
  resultDesc.textContent = data.description;

  // Tags
  resultTagsContainer.innerHTML = "";
  data.tags.forEach((tag) => {
    const span = document.createElement("span");
    span.className = "result-tag-item";
    span.textContent = tag;
    span.style.color = data.color;
    resultTagsContainer.appendChild(span);
  });

  // Traits
  resultTraitsContainer.innerHTML = "";
  data.traits.forEach((trait) => {
    const div = document.createElement("div");
    div.className = "trait-item";
    div.style.borderLeftColor = data.color;
    div.innerHTML = `
      <span class="trait-bullet">✨</span>
      <span>${trait}</span>
    `;
    resultTraitsContainer.appendChild(div);
  });

  // Celebrities
  if (resultCelebsContainer && data.celebrities) {
    resultCelebsContainer.innerHTML = "";
    data.celebrities.forEach((celeb) => {
      const card = document.createElement("div");
      card.className = "celeb-card";
      card.innerHTML = `
        <span class="celeb-icon">🌟</span>
        <div class="celeb-info">
          <span class="celeb-name">${celeb.name}</span>
          <span class="celeb-job">${celeb.job}</span>
        </div>
      `;
      resultCelebsContainer.appendChild(card);
    });
  }

  // Dimension Bars
  const dimensions = [
    { labelLeft: "외향형 (E)", labelRight: "내향형 (I)", leftScore: scores.E, rightScore: scores.I, total: 3 },
    { labelLeft: "감각형 (S)", labelRight: "직관형 (N)", leftScore: scores.S, rightScore: scores.N, total: 3 },
    { labelLeft: "사고형 (T)", labelRight: "감정형 (F)", leftScore: scores.T, rightScore: scores.F, total: 3 },
    { labelLeft: "판단형 (J)", labelRight: "인식형 (P)", leftScore: scores.J, rightScore: scores.P, total: 3 }
  ];

  dimensionBarsContainer.innerHTML = "";
  dimensions.forEach((dim) => {
    const leftPercent = Math.round((dim.leftScore / dim.total) * 100);
    const rightPercent = 100 - leftPercent;

    const row = document.createElement("div");
    row.className = "dimension-row";
    row.innerHTML = `
      <div class="dimension-labels">
        <span class="dim-left">${dim.labelLeft} ${leftPercent}%</span>
        <span class="dim-right">${dim.labelRight} ${rightPercent}%</span>
      </div>
      <div class="dimension-bar-track">
        <div class="dimension-bar-fill" style="width: ${leftPercent}%;"></div>
      </div>
    `;
    dimensionBarsContainer.appendChild(row);
  });

  // Chemistry
  bestType.textContent = `${data.bestMatch.type}`;
  bestDesc.textContent = data.bestMatch.reason;

  chemType.textContent = `${data.chemistry.type}`;
  chemDesc.textContent = data.chemistry.label;
}

// Restart Quiz
btnRestart.addEventListener("click", () => {
  currentQuestionIndex = 0;
  userAnswers = [];
  showScreen(screenStart);
});

// Share / Copy Link
btnShare.addEventListener("click", () => {
  const currentUrl = window.location.href;
  if (navigator.clipboard && window.isSecureContext) {
    navigator.clipboard.writeText(currentUrl).then(() => {
      showToast("✨ 테스트 링크가 클립보드에 복사되었어요!");
    }).catch(() => {
      fallbackCopy(currentUrl);
    });
  } else {
    fallbackCopy(currentUrl);
  }
});

function fallbackCopy(text) {
  const tempInput = document.createElement("input");
  tempInput.value = text;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
  showToast("✨ 테스트 링크가 클립보드에 복사되었어요!");
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => {
    toast.classList.remove("show");
  }, 2500);
}

// ==========================================================================
// Celebration Confetti Cannon (Vanilla Canvas Implementation)
// ==========================================================================
function fireConfetti() {
  const canvas = document.getElementById("confetti-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  window.addEventListener("resize", () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const pieces = [];
  const colors = ["#FF6B8B", "#FFD166", "#06D6A0", "#118AB2", "#845EC2", "#FFA07A"];

  for (let i = 0; i < 90; i++) {
    pieces.push({
      x: width * 0.5 + (Math.random() - 0.5) * 80,
      y: height * 0.45,
      size: Math.random() * 9 + 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      vx: (Math.random() - 0.5) * 16,
      vy: (Math.random() - 1.2) * 14 - 3,
      gravity: 0.35,
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 8,
      opacity: 1
    });
  }

  let animationId;
  function update() {
    ctx.clearRect(0, 0, width, height);

    let activePieces = 0;
    pieces.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.rotation += p.rotationSpeed;
      p.opacity -= 0.007;

      if (p.opacity > 0 && p.y < height + 50) {
        activePieces++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.7);
        ctx.restore();
      }
    });

    if (activePieces > 0) {
      animationId = requestAnimationFrame(update);
    } else {
      ctx.clearRect(0, 0, width, height);
      cancelAnimationFrame(animationId);
    }
  }

  update();
}
