
(function () {
  const form = document.getElementById('prompt-form');
  const input = document.getElementById('prompt-input');
  const placeholder = document.getElementById('fake-placeholder');
  const results = document.getElementById('results');
  const emptyHint = document.getElementById('empty-hint');
  const searchBtn = document.getElementById('search-btn');

  if (!form) return; // not on the generate page


  function syncPlaceholder() {
    placeholder.style.display = input.value.length ? 'none' : 'block';
  }
  input.addEventListener('input', syncPlaceholder);
  input.addEventListener('focus', syncPlaceholder);
  syncPlaceholder();

  // 
  const FILLER = [
    'umm', 'um', 'uh', 'like', 'kinda', 'sorta', 'basically', 'literally',
    'i want', 'i need', 'i wanna', 'i wanted', 'can you', 'could you',
    'please', 'idk', 'you know', 'just', 'so', 'well', 'actually'
  ];

  function cleanCore(raw) {
    let text = raw.trim().replace(/\s+/g, ' ');
    let lower = text.toLowerCase();
    FILLER.forEach(f => {
      lower = lower.split(f).join(' ');
    });
    lower = lower.replace(/\s+/g, ' ').trim();
    if (!lower) lower = text.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  function titleCase(str) {
    return str.replace(/\w\S*/g, w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
  }

  // ---- template bank: each returns { meaning, prompt } ----
  function buildTemplates(raw) {
    const core = cleanCore(raw);
    const coreLower = core.toLowerCase().replace(/\.$/, '');
    const topic = titleCase(coreLower.split(' ').slice(0, 6).join(' '));

    return [
      {
        meaning: 'Direct & clear — the scuffed idea, cleaned up',
        prompt: `${core}. Be specific, avoid filler, and get straight to a useful, complete answer.`
      },
      {
        meaning: 'Role-based — gives the AI an expert identity',
        prompt: `Act as an expert in this area. ${core}. Draw on best practices and explain your reasoning briefly where it helps, but keep the main answer practical and usable.`
      },
      {
        meaning: 'Step-by-step — for anything procedural',
        prompt: `${core}. Break your answer into clear, numbered steps I can follow in order. Keep each step short and actionable, and flag anything I should double-check before moving on.`
      },
      {
        meaning: 'Structured output — for a scannable, formatted result',
        prompt: `${core}. Format the response with short headings and bullet points where useful, so it's easy to scan. End with a one-line summary.`
      },
      {
        meaning: 'Context-rich — spells out goal, audience, and constraints',
        prompt: `Goal: ${core}.\nAudience: assume I have working knowledge of the topic but want the fastest path to a good result.\nConstraints: be concise, avoid generic filler, and prioritize accuracy over length.\nDeliver the best possible answer given this context.`
      },
      {
        meaning: 'Few options — when you want to compare approaches',
        prompt: `${core}. Give me 2–3 different ways to approach this, with a short pros/cons for each, then tell me which one you'd pick and why.`
      },
      {
        meaning: 'Tight & minimal — for a fast, no-fluff answer',
        prompt: `${core}. One clear answer, no preamble, no disclaimers — just the result.`
      },
      {
        meaning: `Refined topic framing — built around "${topic || 'your idea'}"`,
        prompt: `I'm working on: ${topic || core}.\nHere's what I actually need: ${core}.\nRespond with a well-organized, ready-to-use result — correct any gaps in how I phrased this and ask a clarifying question only if something is truly ambiguous.`
      }
    ];
  }

  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  function renderResults(raw) {
    const templates = buildTemplates(raw);
    results.innerHTML = '';
    templates.forEach((t, i) => {
      const card = document.createElement('div');
      card.className = 'result-card';
      card.style.animationDelay = `${i * 0.06}s`;

      const meaning = document.createElement('div');
      meaning.className = 'result-meaning';
      meaning.textContent = t.meaning;

      const prompt = document.createElement('div');
      prompt.className = 'result-prompt';
      prompt.textContent = t.prompt;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'copy-btn';
      copyBtn.type = 'button';
      copyBtn.textContent = 'Copy prompt';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(t.prompt).then(() => {
          copyBtn.textContent = 'Copied!';
          setTimeout(() => (copyBtn.textContent = 'Copy prompt'), 1400);
        }).catch(() => {
          copyBtn.textContent = 'Select & copy manually';
        });
      });

      card.appendChild(meaning);
      card.appendChild(prompt);
      card.appendChild(copyBtn);
      results.appendChild(card);
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const raw = input.value.trim();
    if (!raw) {
      input.focus();
      return;
    }

    emptyHint.style.display = 'none';
    searchBtn.classList.add('loading');
    results.innerHTML = '';

    
    setTimeout(() => {
      searchBtn.classList.remove('loading');
      renderResults(raw);
    }, 420);
  });
})();
