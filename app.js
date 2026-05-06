const state = {
  data: null,
  started: false,
  loopTimer: null,
  toastTimer: null,
  currentPolicy: null,
};

const elements = {
  heroTitle: document.querySelector("#heroTitle"),
  heroCopy: document.querySelector("#heroCopy"),
  generateButton: document.querySelector("#generateButton"),
  loopButton: document.querySelector("#loopButton"),
  settingsButton: document.querySelector("#settingsButton"),
  settingsPanel: document.querySelector("#settingsPanel"),
  aboutButton: document.querySelector("#aboutButton"),
  feedbackButton: document.querySelector("#feedbackButton"),
  modal: document.querySelector("#modal"),
  modalTitle: document.querySelector("#modalTitle"),
  modalBody: document.querySelector("#modalBody"),
  closeModal: document.querySelector("#closeModal"),
  toast: document.querySelector("#toast"),
  generatorView: document.querySelector("#generatorView"),
  policyPage: document.querySelector("#policyPage"),
  policyContent: document.querySelector("#policyContent"),
  footerNav: document.querySelector("#footerNav"),
  disclaimerLink: document.querySelector("#disclaimerLink"),
  privacyLink: document.querySelector("#privacyLink"),
  supportLink: document.querySelector("#supportLink"),
  backFromPolicy: document.querySelector("#backFromPolicy"),
  brandButton: document.querySelector("#brandButton"),
  worldTitle: document.querySelector("#worldTitle"),
  worldDetail: document.querySelector("#worldDetail"),
  appearanceTitle: document.querySelector("#appearanceTitle"),
  appearanceDetail: document.querySelector("#appearanceDetail"),
  personalityTitle: document.querySelector("#personalityTitle"),
  personalityDetail: document.querySelector("#personalityDetail"),
  cards: [...document.querySelectorAll(".card")],
};

function sample(list) {
  return list[Math.floor(Math.random() * list.length)];
}

function showToast(message) {
  clearTimeout(state.toastTimer);
  elements.toast.textContent = message;
  elements.toast.classList.remove("hidden", "is-hiding");
  void elements.toast.offsetWidth;
  elements.toast.classList.add("is-visible");
  state.toastTimer = window.setTimeout(() => {
    elements.toast.classList.remove("is-visible");
    elements.toast.classList.add("is-hiding");
    window.setTimeout(() => {
      elements.toast.classList.add("hidden");
      elements.toast.classList.remove("is-hiding");
    }, 220);
  }, 2000);
}

function openModal(title, body) {
  elements.modalTitle.textContent = title;
  elements.modalBody.innerHTML = body;
  elements.modal.classList.remove("hidden");
}

function closeModal() {
  elements.modal.classList.add("hidden");
}

function showPublicLoadError() {
  openModal(
    "暂时无法加载",
    "<p>词库暂时加载失败，请稍后重试。</p><p>如果问题持续存在，请通过反馈入口联系维护者。</p>"
  );
}

function requireData() {
  if (state.data) {
    return true;
  }
  showPublicLoadError();
  return false;
}

function applyEntry(entry) {
  elements.worldTitle.textContent = entry.world.identity;
  elements.worldDetail.textContent = entry.world.element;

  elements.appearanceTitle.textContent = entry.appearance.value;
  elements.appearanceDetail.textContent = entry.appearance.label;

  elements.personalityTitle.textContent = entry.personality.value;
  elements.personalityDetail.textContent = entry.personality.label;
}

function sampleByMap(map, labels) {
  const keys = Object.keys(map);
  const key = sample(keys);
  return {
    key,
    label: labels[key] ?? key,
    value: sample(map[key]),
  };
}

function buildEntry() {
  const world = sample(state.data.worldviews);
  const appearance = sampleByMap(state.data.appearance, {
    hair: "头发",
    face: "五官",
    trait: "特征",
    scar: "伤痕",
  });
  const personality = sampleByMap(state.data.personality, {
    core: "核心人格",
    social: "社交模式",
    mood: "情绪基底",
    quirk: "怪癖",
  });

  return {
    world: {
      style: world.style,
      identity: sample(world.identities),
      element: sample(world.elements),
    },
    appearance,
    personality,
  };
}

function renderGeneration({ withToast = false } = {}) {
  if (!requireData()) {
    return;
  }
  const entry = buildEntry();
  applyEntry(entry);
  if (!state.started) {
    state.started = true;
    elements.generateButton.textContent = "再次随机";
  }
  if (withToast) {
    showToast("随机成功");
  }
}

function setLooping(isLooping) {
  elements.loopButton.setAttribute("aria-pressed", String(isLooping));
  elements.cards.forEach((card) => {
    card.classList.toggle("is-looping", isLooping);
  });
}

function stopLoop() {
  if (state.loopTimer) {
    window.clearInterval(state.loopTimer);
    state.loopTimer = null;
  }
  setLooping(false);
}

function toggleLoop() {
  if (state.loopTimer) {
    stopLoop();
    return;
  }

  if (!state.started) {
    renderGeneration();
  }

  setLooping(true);
  state.loopTimer = window.setInterval(() => {
    renderGeneration();
  }, 500);
}

function resetHome() {
  stopLoop();
  state.started = false;
  elements.heroTitle.textContent = state.data?.meta.title ?? "OC 设定生成器";
  elements.heroCopy.textContent = state.data?.meta.subtitle ?? "从世界观、外表、性格三个维度快速抽取角色雏形。";
  elements.generateButton.textContent = "开始生成";
  elements.worldTitle.textContent = "等待生成";
  elements.worldDetail.textContent = "联想元素";
  elements.appearanceTitle.textContent = "等待生成";
  elements.appearanceDetail.textContent = "外表维度";
  elements.personalityTitle.textContent = "等待生成";
  elements.personalityDetail.textContent = "性格维度";
}

function openPolicy(type) {
  if (!requireData()) {
    return;
  }
  const content = state.data.policies[type];
  if (!content) {
    return;
  }
  stopLoop();
  elements.generatorView.classList.add("hidden");
  elements.policyPage.classList.remove("hidden");
  elements.policyContent.textContent = content;
}

function closePolicy() {
  elements.policyPage.classList.add("hidden");
  elements.generatorView.classList.remove("hidden");
  resetHome();
}

function bindEvents() {
  elements.generateButton.addEventListener("click", () => {
    stopLoop();
    renderGeneration({ withToast: state.started });
  });

  elements.loopButton.addEventListener("click", toggleLoop);

  elements.settingsButton.addEventListener("click", () => {
    elements.settingsPanel.classList.toggle("hidden");
  });

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }
    if (!target.closest(".toolbar")) {
      elements.settingsPanel.classList.add("hidden");
    }
  });

  elements.aboutButton.addEventListener("click", () => {
    if (!requireData()) {
      elements.settingsPanel.classList.add("hidden");
      return;
    }
    openModal("创作者信息", state.data.meta.about);
    elements.settingsPanel.classList.add("hidden");
  });

  elements.feedbackButton.addEventListener("click", () => {
    if (!requireData()) {
      elements.settingsPanel.classList.add("hidden");
      return;
    }
    openModal("反馈", state.data.meta.feedback);
    elements.settingsPanel.classList.add("hidden");
  });

  elements.closeModal.addEventListener("click", closeModal);
  elements.modal.addEventListener("click", (event) => {
    if (event.target === elements.modal) {
      closeModal();
    }
  });

  elements.disclaimerLink.addEventListener("click", () => openPolicy("disclaimer"));
  elements.privacyLink.addEventListener("click", () => openPolicy("privacy"));
  elements.supportLink.addEventListener("click", () => openPolicy("support"));
  elements.backFromPolicy.addEventListener("click", closePolicy);
  elements.brandButton.addEventListener("click", closePolicy);
}

async function init() {
  const response = await fetch("./data/generator-data.json");
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.status}`);
  }
  state.data = await response.json();
  document.title = state.data.meta.title;
  const description = document.querySelector('meta[name="description"]');
  if (description) {
    description.setAttribute("content", state.data.meta.subtitle);
  }
  elements.heroTitle.textContent = state.data.meta.title;
  elements.heroCopy.textContent = state.data.meta.subtitle;
}

bindEvents();

init().catch(() => {
  resetHome();
  showPublicLoadError();
});
