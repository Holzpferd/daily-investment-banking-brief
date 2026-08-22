const CATEGORY = {
  "M&A": { className: "cat-ma", label: "M&A" },
  "Equity": { className: "cat-equity", label: "Equity / IPO" },
  "Debt": { className: "cat-debt", label: "Debt" },
  "Restructuring": { className: "cat-restructuring", label: "Restructuring" },
  "Market": { className: "cat-market", label: "Market / people" }
};

const toneLabel = { avoid: "High complexity", watch: "Watch", simple: "Simpler route" };
let briefs = [];

function sourceLinks(sources) {
  return sources.map(source => `<a href="${source.url}" target="_blank" rel="noopener">${source.label}</a>`).join("");
}

function renderBrief(brief) {
  document.title = `${brief.displayDate} · Daily Investment Banking Brief`;
  document.getElementById("edition-title").textContent = brief.displayDate;
  document.getElementById("snapshot-note").textContent = brief.snapshotNote;
  document.getElementById("snapshot-grid").innerHTML = brief.snapshot.map(item => `
    <article class="snapshot-card">
      <div class="label">${item.label}</div>
      <div class="value">${item.value}</div>
      <p class="note">${item.note}</p>
    </article>`).join("");

  const counts = Object.fromEntries(Object.keys(CATEGORY).map(key => [key, 0]));
  brief.stories.forEach(story => counts[story.category] += 1);
  const total = brief.stories.length;
  document.getElementById("mix-bar").innerHTML = Object.entries(counts)
    .filter(([, count]) => count)
    .map(([category, count]) => `<div class="mix-segment ${CATEGORY[category].className}" style="width:${count / total * 100}%" title="${CATEGORY[category].label}: ${count}">${count}</div>`).join("");
  document.getElementById("mix-legend").innerHTML = Object.entries(counts)
    .filter(([, count]) => count)
    .map(([category, count]) => `<span class="legend-item"><span class="legend-dot ${CATEGORY[category].className}"></span>${CATEGORY[category].label}: ${count}</span>`).join("");

  document.getElementById("stories-body").innerHTML = brief.stories.map(story => `
    <tr>
      <td><span class="badge ${CATEGORY[story.category].className}">${CATEGORY[story.category].label}</span><p class="story-title">${story.headline}</p><p class="story-summary">${story.what}</p></td>
      <td><span class="number">${story.number}</span></td>
      <td>${story.stage}</td>
      <td><span class="tone tone-${story.tone}">${toneLabel[story.tone]}</span>${story.beginner}</td>
      <td class="sources">${sourceLinks(story.sources)}</td>
    </tr>`).join("");
}

async function init() {
  const response = await fetch("data/briefs.json");
  if (!response.ok) throw new Error("The archive could not be loaded.");
  briefs = await response.json();
  briefs.sort((a, b) => b.date.localeCompare(a.date));
  const select = document.getElementById("edition-select");
  select.innerHTML = briefs.map(brief => `<option value="${brief.date}">${brief.displayDate}</option>`).join("");
  select.addEventListener("change", event => renderBrief(briefs.find(brief => brief.date === event.target.value)));
  renderBrief(briefs[0]);
}

init().catch(error => {
  document.getElementById("edition-title").textContent = "Archive unavailable";
  document.getElementById("snapshot-grid").innerHTML = `<p>${error.message}</p>`;
});
