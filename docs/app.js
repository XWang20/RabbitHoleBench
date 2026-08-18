const agents = [
  { framework: "Claude Code", model: "Claude Opus 4.6", pass: 29.1, score: 50.4, steps: 389, cost: 1524.78, tokens: 2_400_000_000 },
  { framework: "Claude Code", model: "Claude Sonnet 4.6", pass: 23.2, score: 43.3, steps: 407, cost: 1042.78, tokens: 2_600_000_000 },
  { framework: "Claude Code", model: "Claude Haiku 4.5", pass: 5.9, score: 23.2, steps: 149, cost: 91.49, tokens: 600_000_000 },
  { framework: "Codex", model: "GPT 5.4", pass: 17.7, score: 37.3, steps: 226, cost: 527.14, tokens: 1_700_000_000 },
  { framework: "Codex", model: "GPT 5.4 mini", pass: 10.6, score: 30.4, steps: 183, cost: 124.56, tokens: 1_200_000_000 },
  { framework: "Pi", model: "Claude Opus 4.6", pass: 26.2, score: 45.7, steps: 264, cost: 1068.03, tokens: 1_800_000_000 },
  { framework: "Pi", model: "Claude Sonnet 4.6", pass: 17.3, score: 36.8, steps: 244, cost: 710.31, tokens: 2_000_000_000 },
  { framework: "Pi", model: "Claude Haiku 4.5", pass: 5.1, score: 18.2, steps: 79, cost: 36.98, tokens: 300_000_000 },
  { framework: "Pi", model: "GPT 5.4", pass: 17.3, score: 34.9, steps: 183, cost: 815.54, tokens: 1_000_000_000 },
  { framework: "Pi", model: "GPT 5.4 mini", pass: 10.1, score: 28.6, steps: 149, cost: 145.29, tokens: 700_000_000 },
  { framework: "Pi", model: "Gemini 3.1 Pro", pass: 11.8, score: 27.6, steps: 271, cost: 837.26, tokens: 2_800_000_000 },
  { framework: "Pi", model: "Kimi 2.6", pass: 15.6, score: 35.0, steps: 226, cost: 724.20, tokens: 1_600_000_000 },
  { framework: "Pi", model: "Grok 4.3", pass: 3.4, score: 16.7, steps: 36, cost: 12.38, tokens: 44_400_000 },
];

const leaderboardBody = document.querySelector("#leaderboard-body");
const filterButtons = [...document.querySelectorAll(".filter-button")];
const sortButtons = [...document.querySelectorAll(".sort-button")];

const state = {
  framework: "All",
  sortKey: "pass",
  direction: "desc",
};

const descendingByDefault = new Set(["pass", "score"]);

function formatTokens(value) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  return `${(value / 1_000_000).toFixed(1)}M`;
}

function compareAgents(a, b) {
  const modifier = state.direction === "asc" ? 1 : -1;
  const primary = (a[state.sortKey] - b[state.sortKey]) * modifier;
  if (primary !== 0) return primary;

  if (state.sortKey !== "pass") {
    const passTieBreak = (b.pass - a.pass);
    if (passTieBreak !== 0) return passTieBreak;
  }
  return b.score - a.score;
}

function metricMarkup(value, max, suffix = "") {
  const width = Math.min(100, Math.max(4, (value / max) * 100));
  return `
    <strong>${value.toFixed(1)}${suffix}</strong>
    <span class="metric-track" aria-hidden="true"><i style="--width:${width}%"></i></span>
  `;
}

function renderLeaderboard() {
  const visibleAgents = agents
    .filter((agent) => state.framework === "All" || agent.framework === state.framework)
    .sort(compareAgents);

  leaderboardBody.innerHTML = visibleAgents.map((agent, index) => {
    const isBest = agent.pass === Math.max(...agents.map((item) => item.pass));
    return `
      <tr>
        <td class="rank-cell"><span class="rank-badge">${String(index + 1).padStart(2, "0")}</span></td>
        <td class="agent-cell">
          <span class="agent-name">${agent.model}${isBest ? '<span class="best-chip">Best overall</span>' : ""}</span>
          <span class="framework-name">${agent.framework}</span>
        </td>
        <td class="metric-cell">${metricMarkup(agent.pass, 35, "%")}</td>
        <td class="metric-cell">${metricMarkup(agent.score, 55)}</td>
        <td><span class="secondary-value">${agent.steps}</span></td>
        <td><span class="secondary-value">$${agent.cost.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></td>
        <td><span class="secondary-value">${formatTokens(agent.tokens)}</span></td>
      </tr>
    `;
  }).join("");
}

filterButtons.forEach((button) => {
  button.addEventListener("click", () => {
    state.framework = button.dataset.framework;
    filterButtons.forEach((item) => item.classList.toggle("active", item === button));
    renderLeaderboard();
  });
});

sortButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const nextKey = button.dataset.sort;
    if (state.sortKey === nextKey) {
      state.direction = state.direction === "desc" ? "asc" : "desc";
    } else {
      state.sortKey = nextKey;
      state.direction = descendingByDefault.has(nextKey) ? "desc" : "asc";
    }

    sortButtons.forEach((item) => {
      const active = item === button;
      item.classList.toggle("active", active);
      item.querySelector("span").textContent = active
        ? (state.direction === "desc" ? "↓" : "↑")
        : "↕";
    });
    renderLeaderboard();
  });
});

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add("is-visible");
    revealObserver.unobserve(entry.target);
  });
}, {
  threshold: 0.1,
  rootMargin: "0px 0px -40px",
});

document.querySelectorAll(".reveal").forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(element);
});

renderLeaderboard();
