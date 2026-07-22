// The Widening Gyre — renders the site from data/issues.json
// Uses root-relative paths so it works from any page (/, /about/, /reader/, ...).

async function loadData() {
  const res = await fetch('/data/issues.json', { cache: 'no-cache' });
  if (!res.ok) throw new Error('Could not load issues.json');
  const data = await res.json();
  data.issues.sort((a, b) => (a.sortDate < b.sortDate ? 1 : -1)); // newest first
  return data;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

// Make an asset path absolute from the site root (covers/x.jpg -> /covers/x.jpg)
function assetUrl(p) {
  return /^(https?:)?\//.test(p) ? p : '/' + p.replace(/^\/+/, '');
}

function readerUrl(id) {
  return '/reader/?issue=' + encodeURIComponent(id);
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
        <a class="cover-frame" href="${readerUrl(issue.id)}">
          <img src="${assetUrl(issue.cover)}" alt="Cover of ${esc(issue.theme)}, Vol. ${esc(issue.volume)} No. ${esc(issue.number)}">
        </a>
      </div>
      <div class="hero-body">
        <span class="tag">THIS MONTH</span>
        <h1 class="hero-theme">${esc(issue.theme)}</h1>
        <div class="hero-meta">Vol. ${esc(issue.volume)}, No. ${esc(issue.number)} &nbsp;•&nbsp; ${esc(issue.date)}</div>
        <p class="hero-blurb">${esc(issue.blurb)}</p>
        <div class="toc">${tocRows(issue)}</div>
        <div class="btn-row">
          <a class="btn btn-solid" href="${readerUrl(issue.id)}">Read this issue →</a>
          <a class="btn btn-ghost" href="${assetUrl(issue.pdf)}" download>Download PDF</a>
        </div>
      </div>
    </div>`;
}

// ---- Archive: every issue ----
async function renderArchive(el) {
  const data = await loadData();
  if (!data.issues.length) { el.innerHTML = '<p>No issues yet.</p>'; return; }
  const cards = data.issues.map(issue => `
    <a class="issue-card" href="${readerUrl(issue.id)}">
      <span class="cover-frame"><img src="${assetUrl(issue.cover)}" alt="Cover of ${esc(issue.theme)}"></span>
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
  const pdf = assetUrl(issue.pdf);
  el.innerHTML = `
    <div class="reader-bar">
      <div class="reader-title">${esc(issue.theme)} <span class="toc-author">— Vol. ${esc(issue.volume)} No. ${esc(issue.number)}, ${esc(issue.date)}</span></div>
      <div class="btn-row">
        <a class="btn btn-ghost" href="/archive/">← Archive</a>
        <a class="btn btn-solid" href="${pdf}" download>Download PDF</a>
      </div>
    </div>
    <iframe class="reader-frame" src="${pdf}#view=FitH" title="${esc(issue.theme)}"></iframe>
    <p style="font-size:13px;color:var(--muted);margin-top:10px;">
      Trouble viewing? <a href="${pdf}" target="_blank" rel="noopener">Open the PDF in a new tab</a>.
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
