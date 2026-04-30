// Lampstand landing page — fetches sources.json and renders story cards.
// Static, no build step. Auto-populated from queue.json by
// christian-reels/scripts/sync-landing-sources.mjs.

(function () {
  "use strict";

  const list = document.getElementById("stories-list");
  if (!list) return;

  const cacheBust = `?t=${Date.now()}`;

  fetch(`sources.json${cacheBust}`, { cache: "no-store" })
    .then(res => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then(render)
    .catch(err => {
      console.error("Failed to load sources.json:", err);
      list.innerHTML = "";
      const p = document.createElement("p");
      p.className = "stories__empty";
      p.textContent = "Stories will appear here as videos publish.";
      list.appendChild(p);
    });

  function render(data) {
    list.innerHTML = "";

    const entries = Array.isArray(data?.entries) ? data.entries : [];

    if (entries.length === 0) {
      const p = document.createElement("p");
      p.className = "stories__empty";
      p.textContent = "Stories will appear here as videos publish.";
      list.appendChild(p);
      return;
    }

    // Newest published first.
    entries
      .slice()
      .sort((a, b) => (b.published_date || "").localeCompare(a.published_date || ""))
      .forEach(entry => list.appendChild(renderCard(entry)));
  }

  function renderCard(entry) {
    const card = document.createElement("article");
    card.className = "story";

    if (entry.subject) {
      const h3 = document.createElement("h3");
      h3.className = "story__subject";
      h3.textContent = entry.subject;
      card.appendChild(h3);
    }

    if (entry.tagline) {
      const tl = document.createElement("p");
      tl.className = "story__tagline";
      tl.textContent = entry.tagline;
      card.appendChild(tl);
    }

    if (entry.summary) {
      const p = document.createElement("p");
      p.className = "story__summary";
      p.textContent = entry.summary;
      card.appendChild(p);
    }

    const sources = Array.isArray(entry.source_urls) ? entry.source_urls : [];
    if (sources.length > 0) {
      const wrap = document.createElement("div");
      wrap.className = "story__sources";

      const label = document.createElement("p");
      label.className = "story__sources-label";
      label.textContent = "Verified sources";
      wrap.appendChild(label);

      const ul = document.createElement("ul");
      ul.className = "story__sources-list";
      sources.forEach(url => {
        const li = document.createElement("li");
        const a = document.createElement("a");
        a.href = url;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = displayHost(url);
        li.appendChild(a);
        ul.appendChild(li);
      });
      wrap.appendChild(ul);
      card.appendChild(wrap);
    }

    if (entry.published_date) {
      const meta = document.createElement("p");
      meta.className = "story__meta";
      meta.textContent = `Published ${formatDate(entry.published_date)}`;
      card.appendChild(meta);
    }

    return card;
  }

  function displayHost(url) {
    try {
      const u = new URL(url);
      return u.hostname.replace(/^www\./, "");
    } catch {
      return url;
    }
  }

  function formatDate(iso) {
    // Accepts YYYY-MM-DD; renders e.g. "April 29, 2026"
    if (!/^\d{4}-\d{2}-\d{2}/.test(iso)) return iso;
    const d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  }
})();
