// The Widening Gyre — renders the site from data/issues.json
// Paths are resolved relative to the page, so this works from the site root.

async function loadData() {
  const res = await fetch('data/issues.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load issues.json');
  const data = await res.json();
  // Newest issue first
  data.issues.sort((a, b) => (a.sortDate < b.sortDate ? 1 : -1));
  return data;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function tocRows(issue) {
  return issue.contents.map(item => `
    <div class="toc-row">
      <span class="toc-title">${esc(item.title)} <span class="toc-author">— ${esc(item.author)}</span></span>
      <span class="toc-page">${esc(item.page)}</span>
    </div>`).join('');
}

// ---- Homepage: current (newest) issue ----
async function renderCurrentIssue(el) {
  const data = await loadData();
  const issue = data.issues[0];
  if (!issue) { el.innerHTML = '<p>No issues published yet — check back soon.</p>'; return; }
  el.innerHTML = `
    <div class="hero">
      <div class="hero-cover">
        <a class="cover-frame" href="reader.html?issue=${encodeURIComponent(issue.id)}">
          <img src="${esc(issue.cover)}" alt="Cover of ${esc(issue.theme)}, Vol. ${esc(issue.volume)} No. ${esc(issue.number)}">
        </a>
      </div>
      <div class="hero-body">
        <span class="tag">THIS MONTH</span>
        <h1 class="hero-theme">${esc(issue.theme)}</h1>
        <div class="hero-meta">Vol. ${esc(issue.volume)}, No. ${esc(issue.number)} &nbsp;•&nbsp; ${esc(issue.date)}</div>
        <p class="hero-blurb">${esc(issue.blurb)}</p>
        <div class="toc">${tocRows(issue)}</div>
        <div class="btn-row">
          <a class="btn btn-solid" href="reader.html?issue=${encodeURIComponent(issue.id)}">Read this issue →</a>
          <a class="btn btn-ghost" href="${esc(issue.pdf)}" download>Download PDF</a>
        </div>
      </div>
    </div>`;
}

// ---- Archive: every issue ----
async function renderArchive(el) {
  const data = await loadData();
  if (!data.issues.length) { el.innerHTML = '<p>No issues yet.</p>'; return; }
  const cards = data.issues.map(issue => `
    <a class="issue-card" href="reader.html?issue=${encodeURIComponent(issue.id)}">
      <span class="cover-frame"><img src="${esc(issue.cover)}" alt="Cover of ${esc(issue.theme)}"></span>
      <div class="issue-card-meta">
        <div class="issue-card-no">No. ${esc(issue.number)} — ${esc(issue.date)}</div>
        <div class="issue-card-theme">${esc(issue.theme)}</div>
      </div>
    </a>`).join('');
  el.innerHTML = `<div class="archive-grid">${cards}</div>`;
}

// ---- Reader: one issue's PDF ----
async function renderReader(el) {
  const data = await loadData();
  const id = new URLSearchParams(location.search).get('issue');
  const issue = data.issues.find(i => i.id === id) || data.issues[0];
  if (!issue) { el.innerHTML = '<p>Issue not found.</p>'; return; }
  document.title = `${issue.theme} — The Widening Gyre`;
  el.innerHTML = `
    <div class="reader-bar">
      <div class="reader-title">${esc(issue.theme)} <span class="toc-author">— Vol. ${esc(issue.volume)} No. ${esc(issue.number)}, ${esc(issue.date)}</span></div>
      <div class="btn-row">
        <a class="btn btn-ghost" href="archive.html">← Archive</a>
        <a class="btn btn-solid" href="${esc(issue.pdf)}" download>Download PDF</a>
      </div>
    </div>
    <iframe class="reader-frame" src="${esc(issue.pdf)}#view=FitH" title="${esc(issue.theme)}"></iframe>
    <p style="font-size:13px;color:var(--muted);margin-top:10px;">
      Trouble viewing? <a href="${esc(issue.pdf)}" target="_blank" rel="noopener">Open the PDF in a new tab</a>.
    </p>`;
}

document.addEventListener('DOMContentLoaded', () => {
  const routes = {
    'current-issue': renderCurrentIssue,
    'archive-root': renderArchive,
    'reader-root': renderReader,
  };
  for (const [id, fn] of Object.entries(routes)) {
    const el = document.getElementById(id);
    if (el) fn(el).catch(err => { el.innerHTML = `<p>Sorry — something went wrong loading this page.</p>`; console.error(err); });
  }
});
