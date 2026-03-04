const TEST_FILE_PATTERNS = [
  /\.spec\./i,
  /\.test\./i,
  /\/__tests__\//i,
  /\/test\//i,
];

function isTestFile(filename) {
  return TEST_FILE_PATTERNS.some((pattern) => pattern.test(filename));
}

function getFileDiffs() {
  return document.querySelectorAll('[id^="diff-"][role="region"]');
}

function getFileNames(diffEl) {
  const names = [];

  // For renamed files, the sr-only span has "X renamed to Y"
  const srOnly = diffEl.querySelector(
    '[class*="DiffFileHeader-module__file-name"] .sr-only'
  );
  if (srOnly) {
    const text = srOnly.textContent.trim();
    const parts = text.split(/\s+renamed to\s+/);
    for (const p of parts) {
      const clean = p.replace(/\u200e/g, "").trim();
      if (clean) names.push(clean);
    }
    if (names.length > 0) return names;
  }

  // Standard single file name — grab from the <code> inside the heading
  const code = diffEl.querySelector(
    '[class*="DiffFileHeader-module__file-name"] code'
  );
  if (code) {
    const clean = code.textContent.replace(/\u200e/g, "").trim();
    if (clean) names.push(clean);
    return names;
  }

  const link = diffEl.querySelector(
    '[class*="DiffFileHeader-module__file-name"] a'
  );
  if (link) {
    const clean = link.textContent.replace(/\u200e/g, "").trim();
    if (clean) names.push(clean);
  }

  return names;
}

function getViewedButton(diffEl) {
  return diffEl.querySelector('[class*="MarkAsViewedButton"]');
}

function isAlreadyViewed(button) {
  return button.getAttribute("aria-pressed") === "true";
}

const processed = new Set();

function markTestFilesAsViewed() {
  const diffs = getFileDiffs();
  let marked = 0;

  diffs.forEach((diff) => {
    if (processed.has(diff.id)) return;

    const names = getFileNames(diff);
    if (names.length === 0) return;

    const hasTestFile = names.some(isTestFile);
    if (!hasTestFile) {
      processed.add(diff.id);
      return;
    }

    const btn = getViewedButton(diff);
    if (!btn) return;

    if (isAlreadyViewed(btn)) {
      processed.add(diff.id);
      return;
    }

    console.log(`[TLDR PR] Marking as viewed: ${names.join(" → ")}`);
    btn.click();
    processed.add(diff.id);
    marked++;
  });

  if (marked > 0) {
    showToast(marked);
  }
}

let toastTimeout;

function showToast(marked) {
  const existing = document.getElementById("tldr-pr-toast");
  if (existing) {
    clearTimeout(toastTimeout);
    existing.remove();
  }

  const total = processed.size;
  const toast = document.createElement("div");
  toast.id = "tldr-pr-toast";
  toast.textContent = `TLDR PR: Marked ${marked} test file${marked !== 1 ? "s" : ""} as viewed`;
  Object.assign(toast.style, {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    background: "#1f6feb",
    color: "#fff",
    padding: "12px 20px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "500",
    zIndex: "9999",
    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
    transition: "opacity 0.3s ease",
    opacity: "1",
  });

  document.body.appendChild(toast);
  toastTimeout = setTimeout(() => {
    toast.style.opacity = "0";
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function start() {
  console.log("[TLDR PR] Extension loaded, watching for diffs...");

  chrome.storage.sync.get({ enabled: true }, ({ enabled }) => {
    if (!enabled) {
      console.log("[TLDR PR] Extension is disabled");
      return;
    }

    // Debounce so rapid DOM mutations batch into one scan
    let scanTimer;
    function scheduleScan() {
      clearTimeout(scanTimer);
      scanTimer = setTimeout(markTestFilesAsViewed, 300);
    }

    // Keep observing — GitHub lazily renders diffs as you scroll
    const observer = new MutationObserver(scheduleScan);
    observer.observe(document.body, { childList: true, subtree: true });

    // Initial scan
    scheduleScan();
  });
}

start();
