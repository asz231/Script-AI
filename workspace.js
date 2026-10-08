/**
 * Script AI — Workspace Controller
 * Handles: Analysis, Ideas, Script Generation, UI States
 * Architecture: Frontend → Backend API → n8n → AI → JSON → Frontend
 */

'use strict';

// ==========================================================================
// 1. CONFIGURATION — API Contract
// ==========================================================================

const API_CONFIG = {
  // In production: replace with your backend URL
  // Backend receives requests and forwards to n8n securely
  BASE_URL: window.location.origin,

  ENDPOINTS: {
    ANALYZE:  '/api/analyze',    // POST: { channel_url, user_id, platform }
    IDEAS:    '/api/ideas',      // POST: { channel_data, user_id }
    SCRIPT:   '/api/script',     // POST: { idea, tone, length, channel_data, user_id }
  },

  // Timeout in ms
  TIMEOUT: 60000,
};

// n8n Webhook URLs (set via environment / backend — never expose here in production)
// These are used as FALLBACK only when no backend is configured (direct n8n for dev)
const N8N_DEV = {
  WEBHOOK: null, // Set your n8n webhook URL here during local development only
};

// ==========================================================================
// 2. APPLICATION STATE
// ==========================================================================

const WS = {
  // Current view
  activeView: 'analyze',

  // Analysis data
  channelUrl: null,
  channelData: null,
  analysisResult: null,
  ideas: [],

  // Script state
  selectedIdea: null,
  selectedTone: 'عفوي',
  selectedLength: 'متوسط',
  generatedScript: null,

  // UI state
  analyzeState: 'initial', // initial | loading | success | error
  lastError: null,
};

// ==========================================================================
// 3. INITIALIZATION
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
  initWorkspace();
});

function initWorkspace() {
  trackEvent('aipageopened', { referral: getReferralSource() });

  setupTabNavigation();
  setupChannelForm();
  setupToneChips();
  setupLengthChips();
  setupKeyboardShortcuts();

  // Restore state if coming back from landing
  const savedUrl = sessionStorage.getItem('scriptai_last_url');
  if (savedUrl) {
    const input = document.getElementById('channel-url-input');
    if (input) input.value = savedUrl;
  }

  // Check for analysis result in session
  const savedAnalysis = sessionStorage.getItem('scriptai_analysis');
  if (savedAnalysis) {
    try {
      const data = JSON.parse(savedAnalysis);
      WS.analysisResult = data;
      WS.channelData = data.channel;
      WS.ideas = data.ideas || [];
      showAnalysisSuccess(data);
    } catch {}
  }
}

// ==========================================================================
// 4. TAB NAVIGATION
// ==========================================================================

function setupTabNavigation() {
  const tabs = document.querySelectorAll('.ws-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const view = tab.getAttribute('data-view');
      switchView(view);
    });
  });
}

function switchView(viewName) {
  WS.activeView = viewName;

  // Update tabs
  document.querySelectorAll('.ws-tab').forEach(t => {
    const isActive = t.getAttribute('data-view') === viewName;
    t.classList.toggle('active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  // Show/hide views
  document.querySelectorAll('.ws-view').forEach(v => {
    const isActive = v.id === `view-${viewName}`;
    v.classList.toggle('active-view', isActive);
    v.classList.toggle('hidden', !isActive);
  });

  trackEvent('workspace_tab_switched', { tab: viewName });
}

// ==========================================================================
// 5. CHANNEL ANALYSIS FORM
// ==========================================================================

function setupChannelForm() {
  const form   = document.getElementById('channel-input-form');
  const input  = document.getElementById('channel-url-input');
  const clearBtn = document.getElementById('input-clear-btn');

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      startAnalysis();
    });
  }

  if (input) {
    input.addEventListener('input', () => {
      const hasValue = input.value.trim().length > 0;
      if (clearBtn) clearBtn.style.display = hasValue ? 'flex' : 'none';
      // Clear error on type
      hideInputError();
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        startAnalysis();
      }
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (input) { input.value = ''; input.focus(); }
      clearBtn.style.display = 'none';
      hideInputError();
    });
  }

  // Retry button
  const retryBtn = document.getElementById('retry-btn');
  if (retryBtn) retryBtn.addEventListener('click', retryAnalysis);
}

// Fill demo URL
function fillDemoUrl(btn) {
  const url = btn.getAttribute('data-url');
  const input = document.getElementById('channel-url-input');
  if (input && url) {
    input.value = url;
    input.focus();
    const clearBtn = document.getElementById('input-clear-btn');
    if (clearBtn) clearBtn.style.display = 'flex';
    hideInputError();
  }
}

// ==========================================================================
// 6. ANALYSIS FLOW
// ==========================================================================

async function startAnalysis() {
  const input = document.getElementById('channel-url-input');
  if (!input) return;

  const url = input.value.trim();

  // Validate
  if (!url) {
    showInputError('الرجاء إدخال رابط القناة');
    input.focus();
    return;
  }

  if (!isValidYouTubeUrl(url)) {
    showInputError('الرجاء إدخال رابط YouTube صحيح مثل: https://youtube.com/@channel');
    input.focus();
    return;
  }

  // Store URL
  WS.channelUrl = url;
  sessionStorage.setItem('scriptai_last_url', url);

  // Track event
  trackEvent('analysis_started', { channel_url: url, user_id: Analytics.getUserId() });
  trackEvent('channel_submitted', { channel_url: url });

  // Show loading state
  showLoadingState();
  setStatusIndicator('loading', 'جاري التحليل...');

  // Animate loading steps
  animateLoadingSteps();

  try {
    const result = await analyzeChannel(url);
    handleAnalysisSuccess(result);
  } catch (err) {
    handleAnalysisError(err);
  }
}

function retryAnalysis() {
  const url = WS.channelUrl;
  if (!url) {
    resetToInitial();
    return;
  }
  const input = document.getElementById('channel-url-input');
  if (input) input.value = url;
  showLoadingState();
  setStatusIndicator('loading', 'إعادة المحاولة...');
  animateLoadingSteps();
  analyzeChannel(url)
    .then(handleAnalysisSuccess)
    .catch(handleAnalysisError);
}

function resetToInitial() {
  WS.analyzeState = 'initial';
  WS.channelUrl = null;
  WS.analysisResult = null;
  WS.ideas = [];
  sessionStorage.removeItem('scriptai_analysis');

  showState('state-initial');
  setStatusIndicator('idle', 'جاهز');

  const input = document.getElementById('channel-url-input');
  if (input) { input.value = ''; input.focus(); }
  const clearBtn = document.getElementById('input-clear-btn');
  if (clearBtn) clearBtn.style.display = 'none';
}

// ==========================================================================
// 7. API CALL — ANALYZE CHANNEL
// ==========================================================================

async function analyzeChannel(channelUrl) {
  const requestBody = {
    channel_url: channelUrl,
    user_id: Analytics.getUserId(),
    platform: 'youtube',
    session_id: Analytics.getSessionId(),
  };

  // Try backend API first
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

    const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.ANALYZE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Session-ID': Analytics.getSessionId(),
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.message || `خطأ من الخادم (${response.status})`);
    }

    const data = await response.json();
    return normalizeAnalysisResponse(data);

  } catch (err) {
    // If backend not configured, use n8n directly (dev fallback)
    if (N8N_DEV.WEBHOOK && (err.name === 'TypeError' || err.message.includes('fetch'))) {
      return analyzeViaN8nDirect(requestBody);
    }
    throw err;
  }
}

// Direct n8n fallback (development only — remove in production)
async function analyzeViaN8nDirect(body) {
  if (!N8N_DEV.WEBHOOK) {
    throw new Error('لا يوجد backend أو n8n webhook مُعيَّن. يرجى إعداد الخادم.');
  }

  const response = await fetch(N8N_DEV.WEBHOOK, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) throw new Error(`خطأ من n8n (${response.status})`);

  const data = await response.json();
  return normalizeAnalysisResponse(data);
}

// ==========================================================================
// 8. RESPONSE NORMALIZATION
// Map any backend/n8n response shape to our internal format
// ==========================================================================

/**
 * Expected API response format (from n8n or backend):
 * {
 *   status: "completed",
 *   channel: { name, handle, subscribers, views, video_count, thumbnail },
 *   analysis: { top_topics, top_videos, patterns, insights },
 *   ideas: [{ title, topic, reason, hook, score }],
 *   scripts: []
 * }
 */
function normalizeAnalysisResponse(raw) {
  // Flatten if nested under 'output' or 'data'
  const data = raw.output || raw.data || raw;

  return {
    status: data.status || 'completed',
    channel: {
      name:         data.channel?.name         || data.channel_name        || 'القناة',
      handle:       data.channel?.handle       || data.channel_handle       || '',
      subscribers:  data.channel?.subscribers  || data.subscribers          || 0,
      views:        data.channel?.views        || data.total_views          || 0,
      video_count:  data.channel?.video_count  || data.video_count          || 0,
      thumbnail:    data.channel?.thumbnail    || null,
    },
    analysis: {
      top_topics:   data.analysis?.top_topics  || data.top_topics           || [],
      top_videos:   data.analysis?.top_videos  || data.top_videos           || [],
      patterns:     data.analysis?.patterns    || data.content_patterns     || [],
      insights:     data.analysis?.insights    || data.insights             || [],
    },
    ideas:   Array.isArray(data.ideas)   ? data.ideas   : [],
    scripts: Array.isArray(data.scripts) ? data.scripts : [],
  };
}

// ==========================================================================
// 9. ANALYSIS SUCCESS / ERROR HANDLERS
// ==========================================================================

function handleAnalysisSuccess(result) {
  WS.analysisResult = result;
  WS.channelData    = result.channel;
  WS.ideas          = result.ideas || [];

  // Save to session
  sessionStorage.setItem('scriptai_analysis', JSON.stringify(result));

  // Track
  trackEvent('analysis_completed', {
    channel: result.channel?.name,
    ideas_count: WS.ideas.length,
  });

  // Populate ideas view
  renderIdeasGrid(WS.ideas);

  showAnalysisSuccess(result);
  setStatusIndicator('success', 'تم التحليل');
}

function handleAnalysisError(err) {
  WS.lastError = err.message;
  console.error('[Script AI] Analysis error:', err);

  trackEvent('analysis_error', { error: err.message });

  showState('state-error');
  const errMsg = document.getElementById('error-message');
  if (errMsg) {
    errMsg.textContent = err.message || 'حدث خطأ أثناء تحليل القناة. تأكد من صحة الرابط والاتصال بالإنترنت.';
  }
  setStatusIndicator('error', 'خطأ');
}

// ==========================================================================
// 10. RENDER ANALYSIS RESULTS
// ==========================================================================

function showAnalysisSuccess(result) {
  showState('state-success');
  WS.analyzeState = 'success';

  const container = document.getElementById('analysis-results-content');
  if (!container) return;

  const ch  = result.channel || {};
  const an  = result.analysis || {};

  const topVideos  = an.top_videos  || [];
  const topTopics  = an.top_topics  || [];
  const patterns   = an.patterns    || [];
  const insights   = an.insights    || [];

  container.innerHTML = `
    <!-- Channel Overview -->
    <div class="results-channel-overview">
      <div class="channel-info">
        <div class="channel-avatar" aria-hidden="true">
          ${ch.thumbnail 
            ? `<img src="${escapeAttr(ch.thumbnail)}" alt="${escapeHtml(ch.name)}" style="width:100%;height:100%;object-fit:cover;border-radius:inherit;">` 
            : '📺'}
        </div>
        <div class="channel-meta">
          <h3>${escapeHtml(ch.name || 'القناة')}</h3>
          <p>${escapeHtml(ch.handle || ch.channel_url || WS.channelUrl || '')}</p>
        </div>
      </div>

      <div class="channel-stats-row">
        <div class="cs-stat">
          <span class="cs-num">${formatNumber(ch.subscribers)}</span>
          <span class="cs-label">مشترك</span>
        </div>
        <div class="cs-stat">
          <span class="cs-num">${formatNumber(ch.views)}</span>
          <span class="cs-label">مشاهدة</span>
        </div>
        <div class="cs-stat">
          <span class="cs-num">${formatNumber(ch.video_count)}</span>
          <span class="cs-label">فيديو</span>
        </div>
      </div>

      <button class="results-share-btn" onclick="openShareModal()" aria-label="شارك تحليلك">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/>
          <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
        </svg>
        شارك التحليل
      </button>
    </div>

    <!-- Results Grid -->
    <div class="results-grid">

      <!-- Insights -->
      <div class="result-card">
        <div class="result-card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          اكتشافات رئيسية
        </div>
        <div class="insights-list">
          ${insights.length > 0
            ? insights.map(ins => `
              <div class="insight-item">
                <span class="insight-icon">⚡</span>
                <span>${escapeHtml(ins)}</span>
              </div>`).join('')
            : '<p style="color:var(--text-muted);font-size:0.85rem;">لا توجد اكتشافات متاحة</p>'
          }
        </div>
      </div>

      <!-- Top Videos -->
      <div class="result-card">
        <div class="result-card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="5 3 19 12 5 21 5 3"/>
          </svg>
          أفضل الفيديوهات
        </div>
        <div class="top-videos-list">
          ${topVideos.length > 0
            ? topVideos.slice(0, 5).map((v, i) => `
              <div class="top-video-item">
                <div class="tv-rank">${i + 1}</div>
                <div class="tv-info">
                  <div class="tv-title">${escapeHtml(v.title || v.name || 'فيديو')}</div>
                  <div class="tv-meta">${formatNumber(v.views || v.view_count || 0)} مشاهدة${v.date ? ' • ' + escapeHtml(v.date) : ''}</div>
                </div>
              </div>`).join('')
            : '<p style="color:var(--text-muted);font-size:0.85rem;">لا توجد بيانات متاحة</p>'
          }
        </div>
      </div>

      <!-- Top Topics -->
      <div class="result-card">
        <div class="result-card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          أفضل المواضيع
        </div>
        <div class="topics-bars">
          ${topTopics.length > 0
            ? topTopics.slice(0, 5).map(t => `
              <div class="topic-bar-item">
                <div class="topic-bar-label">
                  <span class="topic-name">${escapeHtml(t.name || t.topic || t)}</span>
                  <span class="topic-pct">${t.percentage || t.pct || '—'}%</span>
                </div>
                <div class="topic-bar-track">
                  <div class="topic-bar-fill" style="width: ${Math.min(t.percentage || t.pct || 50, 100)}%" aria-hidden="true"></div>
                </div>
              </div>`).join('')
            : '<p style="color:var(--text-muted);font-size:0.85rem;">لا توجد بيانات متاحة</p>'
          }
        </div>
      </div>

      <!-- Content Patterns -->
      <div class="result-card">
        <div class="result-card-title">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
          </svg>
          أنماط المحتوى
        </div>
        <div class="patterns-tags">
          ${patterns.length > 0
            ? patterns.map(p => `<span class="pattern-tag">${escapeHtml(p.label || p.name || p)}</span>`).join('')
            : '<p style="color:var(--text-muted);font-size:0.85rem;">لا توجد أنماط متاحة</p>'
          }
        </div>
      </div>

    </div>

    <!-- Actions -->
    <div class="results-actions">
      <button class="cta-primary" onclick="switchView('ideas'); trackEvent('idea_generated', {from: 'results'});" aria-label="عرض الأفكار المقترحة">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
        عرض أفكار المحتوى (${WS.ideas.length})
      </button>
      <button class="ghost-btn" onclick="resetToInitial()">
        تحليل قناة أخرى
      </button>
    </div>
  `;

  // Animate topic bars after render
  requestAnimationFrame(() => {
    document.querySelectorAll('.topic-bar-fill').forEach(bar => {
      const targetWidth = bar.style.width;
      bar.style.width = '0';
      requestAnimationFrame(() => { bar.style.width = targetWidth; });
    });
  });
}

// ==========================================================================
// 11. IDEAS RENDERING
// ==========================================================================

function renderIdeasGrid(ideas) {
  const grid = document.getElementById('ideas-grid');
  const noAnalysis = document.getElementById('ideas-no-analysis');

  if (!grid) return;

  if (!ideas || ideas.length === 0) {
    if (noAnalysis) noAnalysis.classList.remove('hidden');
    grid.innerHTML = '';
    return;
  }

  if (noAnalysis) noAnalysis.classList.add('hidden');

  grid.innerHTML = ideas.map((idea, index) => `
    <div class="idea-card" id="idea-card-${index}" onclick="selectIdeaForScript(${index})" role="button" tabindex="0" aria-label="اختر فكرة: ${escapeAttr(idea.title || '')}">
      <div class="idea-card-top">
        <div class="idea-card-tags">
          ${idea.topic ? `<span class="ic-tag topic">${escapeHtml(idea.topic)}</span>` : ''}
          ${idea.score ? `<span class="ic-tag score">${escapeHtml(String(idea.score))}% نجاح</span>` : ''}
        </div>
      </div>
      <div class="idea-card-title">${escapeHtml(idea.title || 'فكرة محتوى')}</div>
      ${idea.reason ? `<p class="idea-card-reason">${escapeHtml(idea.reason)}</p>` : ''}
      ${idea.hook ? `
        <div class="idea-card-hook">
          <div class="idea-card-hook-label">الهوك المقترح</div>
          "${escapeHtml(idea.hook)}"
        </div>` : ''}
      <button class="idea-card-script-btn" onclick="event.stopPropagation(); selectIdeaForScript(${index})" aria-label="اكتب السكريبت لهذه الفكرة">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
        </svg>
        اكتب السكريبت
      </button>
    </div>
  `).join('');

  // Keyboard navigation for idea cards
  grid.querySelectorAll('.idea-card').forEach(card => {
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.click();
      }
    });
  });
}

function refreshIdeas() {
  if (!WS.analysisResult) return;
  trackEvent('idea_generated', { action: 'refresh' });
  // Re-render existing ideas (in real app, call API again)
  renderIdeasGrid(WS.ideas);
  showToast('تم تحديث الأفكار', 'info');
}

// ==========================================================================
// 12. SCRIPT GENERATION
// ==========================================================================

function selectIdeaForScript(index) {
  const idea = WS.ideas[index];
  if (!idea) return;

  WS.selectedIdea = idea;
  trackEvent('idea_selected', { idea_title: idea.title, idea_topic: idea.topic });

  // Update selected idea display
  const emptyEl = document.getElementById('selected-idea-empty');
  const cardEl  = document.getElementById('selected-idea-card');
  const titleEl = document.getElementById('selected-idea-title');

  if (emptyEl) emptyEl.classList.add('hidden');
  if (cardEl)  cardEl.classList.remove('hidden');
  if (titleEl) titleEl.textContent = idea.title || 'الفكرة المختارة';

  // Switch to script view
  switchView('script');
}

function setupToneChips() {
  const container = document.getElementById('tone-chips');
  if (!container) return;

  container.querySelectorAll('.option-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.option-chip').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      WS.selectedTone = chip.getAttribute('data-value');
    });
  });
}

function setupLengthChips() {
  const container = document.getElementById('length-chips');
  if (!container) return;

  container.querySelectorAll('.option-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.option-chip').forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      WS.selectedLength = chip.getAttribute('data-value');
    });
  });
}

async function generateScript() {
  if (!WS.selectedIdea) {
    showToast('اختر فكرة أولاً من قسم الأفكار', 'error');
    return;
  }

  trackEvent('script_generated', {
    idea: WS.selectedIdea.title,
    tone: WS.selectedTone,
    length: WS.selectedLength,
  });

  // Show loading in output panel
  showScriptLoading(true);

  const btn = document.getElementById('generate-script-btn');
  const btnText = document.getElementById('generate-btn-text');
  if (btn) btn.disabled = true;
  if (btnText) btnText.textContent = 'جاري الكتابة...';

  try {
    const result = await callScriptAPI({
      idea: WS.selectedIdea,
      tone: WS.selectedTone,
      length: WS.selectedLength,
      channel_data: WS.channelData,
      user_id: Analytics.getUserId(),
    });

    WS.generatedScript = result;
    renderScriptResult(result);
    showToast('تم توليد السكريبت بنجاح ✨', 'success');

  } catch (err) {
    showScriptLoading(false);
    showToast('خطأ في توليد السكريبت: ' + err.message, 'error');
    console.error('[Script AI] Script error:', err);
  } finally {
    if (btn) btn.disabled = false;
    if (btnText) btnText.textContent = 'اكتب السكريبت';
  }
}

async function callScriptAPI(body) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), API_CONFIG.TIMEOUT);

  const response = await fetch(API_CONFIG.BASE_URL + API_CONFIG.ENDPOINTS.SCRIPT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Session-ID': Analytics.getSessionId(),
    },
    body: JSON.stringify(body),
    signal: controller.signal,
  });

  clearTimeout(timeout);

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `خطأ (${response.status})`);
  }

  const data = await response.json();
  return normalizeScriptResponse(data);
}

/**
 * Expected script response from n8n/backend:
 * {
 *   title: "عنوان السكريبت",
 *   hook: "...",
 *   introduction: "...",
 *   main_content: "...",
 *   cta: "...",
 *   ending: "..."
 * }
 */
function normalizeScriptResponse(raw) {
  const data = raw.output || raw.data || raw;
  return {
    title:        data.title        || WS.selectedIdea?.title || 'السكريبت',
    hook:         data.hook         || data.opening           || '',
    introduction: data.introduction || data.intro             || '',
    main_content: data.main_content || data.body              || data.content || '',
    cta:          data.cta          || data.call_to_action     || '',
    ending:       data.ending       || data.outro             || '',
  };
}

function renderScriptResult(script) {
  showScriptLoading(false);

  const resultEl  = document.getElementById('script-result');
  const emptyEl   = document.getElementById('script-empty');
  const titleEl   = document.getElementById('script-result-title');
  const contentEl = document.getElementById('script-content');

  if (emptyEl)  emptyEl.classList.add('hidden');
  if (resultEl) resultEl.classList.remove('hidden');
  if (titleEl)  titleEl.textContent = script.title || 'السكريبت';

  if (!contentEl) return;

  const sections = [
    { key: 'hook',         label: '⚡ الهوك',           cls: 'hook',  text: script.hook },
    { key: 'introduction', label: '📌 المقدمة',          cls: 'intro', text: script.introduction },
    { key: 'main_content', label: '🎬 المحتوى الرئيسي', cls: 'main',  text: script.main_content },
    { key: 'cta',          label: '📣 النداء للتفاعل',   cls: 'cta',   text: script.cta },
    { key: 'ending',       label: '👋 الخاتمة',          cls: 'outro', text: script.ending },
  ];

  contentEl.innerHTML = sections
    .filter(s => s.text)
    .map(s => `
      <div class="script-section">
        <span class="script-section-label ${s.cls}">${s.label}</span>
        <div class="script-section-text">${escapeHtml(s.text)}</div>
      </div>
    `).join('');
}

function showScriptLoading(show) {
  const loadingEl = document.getElementById('script-loading');
  const emptyEl   = document.getElementById('script-empty');
  const resultEl  = document.getElementById('script-result');

  if (show) {
    if (loadingEl) loadingEl.classList.remove('hidden');
    if (emptyEl)   emptyEl.classList.add('hidden');
    if (resultEl)  resultEl.classList.add('hidden');
  } else {
    if (loadingEl) loadingEl.classList.add('hidden');
  }
}

// Script actions
function copyScript() {
  if (!WS.generatedScript) return;
  const text = buildScriptText(WS.generatedScript);
  navigator.clipboard.writeText(text).then(() => {
    showToast('تم نسخ السكريبت ✅', 'success');
    trackEvent('script_copied', { idea: WS.selectedIdea?.title });
  }).catch(() => {
    showToast('لم يتمكن من النسخ', 'error');
  });
}

function saveScript() {
  if (!WS.generatedScript) return;
  const saved = JSON.parse(localStorage.getItem('scriptai_saved_scripts') || '[]');
  saved.unshift({
    id: 'sc_' + Date.now(),
    title: WS.generatedScript.title,
    idea: WS.selectedIdea?.title,
    tone: WS.selectedTone,
    length: WS.selectedLength,
    script: WS.generatedScript,
    saved_at: new Date().toISOString(),
  });
  // Keep last 20 scripts
  if (saved.length > 20) saved.splice(20);
  localStorage.setItem('scriptai_saved_scripts', JSON.stringify(saved));
  showToast('تم حفظ السكريبت 💾', 'success');
  trackEvent('script_saved', { idea: WS.selectedIdea?.title });
}

function buildScriptText(script) {
  const parts = [];
  if (script.title)        parts.push(`# ${script.title}\n`);
  if (script.hook)         parts.push(`## الهوك\n${script.hook}`);
  if (script.introduction) parts.push(`## المقدمة\n${script.introduction}`);
  if (script.main_content) parts.push(`## المحتوى الرئيسي\n${script.main_content}`);
  if (script.cta)          parts.push(`## النداء للتفاعل\n${script.cta}`);
  if (script.ending)       parts.push(`## الخاتمة\n${script.ending}`);
  parts.push('\n---\nتم إنشاؤه بواسطة Script AI');
  return parts.join('\n\n');
}

// ==========================================================================
// 13. SHARE MODAL
// ==========================================================================

function openShareModal() {
  if (!WS.analysisResult) return;

  const ch = WS.channelData || {};
  const overlay = document.getElementById('share-modal-overlay');
  const channelNameEl = document.getElementById('share-channel-name');
  const statRowsEl = document.getElementById('share-stat-rows');

  if (channelNameEl) channelNameEl.textContent = ch.name || 'قناتك';

  if (statRowsEl) {
    const stats = [
      { name: 'المشتركون', val: formatNumber(ch.subscribers) },
      { name: 'إجمالي المشاهدات', val: formatNumber(ch.views) },
      { name: 'أفضل موضوع', val: WS.analysisResult.analysis?.top_topics?.[0]?.name || '—' },
    ];

    statRowsEl.innerHTML = stats.map(s => `
      <div class="share-stat-row">
        <span class="share-stat-name">${escapeHtml(s.name)}</span>
        <span class="share-stat-val">${escapeHtml(String(s.val))}</span>
      </div>
    `).join('');
  }

  if (overlay) overlay.classList.remove('hidden');

  trackEvent('share_clicked', { channel: ch.name });
}

function closeShareModal() {
  const overlay = document.getElementById('share-modal-overlay');
  if (overlay) overlay.classList.add('hidden');
}

function copyShareLink() {
  const link = generateReferralLink(WS.channelData?.name);
  navigator.clipboard.writeText(link).then(() => {
    showToast('تم نسخ الرابط ✅', 'success');
    trackEvent('share_completed', { method: 'copy_link' });
  }).catch(() => {
    showToast('فشل النسخ', 'error');
  });
}

// Close modal on overlay click
document.addEventListener('DOMContentLoaded', () => {
  const overlay = document.getElementById('share-modal-overlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) closeShareModal();
    });
  }
});

// ==========================================================================
// 14. UI STATE HELPERS
// ==========================================================================

function showState(stateId) {
  const states = ['state-initial', 'state-loading', 'state-success', 'state-error'];
  states.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    if (id === stateId) {
      el.classList.remove('hidden');
    } else {
      el.classList.add('hidden');
    }
  });
}

function showLoadingState() {
  WS.analyzeState = 'loading';
  showState('state-loading');
}

function setStatusIndicator(type, text) {
  const dot  = document.querySelector('.status-dot');
  const label = document.getElementById('status-text');

  if (dot) {
    dot.className = `status-dot ${type}`;
  }

  if (label) label.textContent = text;
}

function showInputError(msg) {
  const el = document.getElementById('input-error');
  if (el) {
    el.textContent = msg;
    el.style.display = 'flex';
  }
}

function hideInputError() {
  const el = document.getElementById('input-error');
  if (el) el.style.display = 'none';
}

// ==========================================================================
// 15. LOADING STEP ANIMATION
// ==========================================================================

let loadingStepInterval = null;

function animateLoadingSteps() {
  const steps = document.querySelectorAll('.loading-step');
  let currentStep = 0;

  // Reset
  steps.forEach(s => {
    s.classList.remove('active', 'done');
  });

  if (loadingStepInterval) clearInterval(loadingStepInterval);

  steps[0]?.classList.add('active');

  loadingStepInterval = setInterval(() => {
    if (currentStep < steps.length - 1) {
      steps[currentStep]?.classList.remove('active');
      steps[currentStep]?.classList.add('done');
      currentStep++;
      steps[currentStep]?.classList.add('active');
    } else {
      clearInterval(loadingStepInterval);
    }
  }, 2500);
}

// ==========================================================================
// 16. KEYBOARD SHORTCUTS
// ==========================================================================

function setupKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Escape: close modal
    if (e.key === 'Escape') {
      closeShareModal();
    }
    // Ctrl/Cmd + 1/2/3: switch tabs
    if ((e.ctrlKey || e.metaKey) && ['1','2','3'].includes(e.key)) {
      e.preventDefault();
      const views = ['analyze', 'ideas', 'script'];
      switchView(views[parseInt(e.key) - 1]);
    }
  });
}

// ==========================================================================
// 17. UTILITY FUNCTIONS
// ==========================================================================

function isValidYouTubeUrl(url) {
  try {
    const u = new URL(url);
    return ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(u.hostname);
  } catch {
    // Also accept handle format like @username
    return url.startsWith('@') || url.includes('youtube.com');
  }
}

function formatNumber(num) {
  if (!num && num !== 0) return '—';
  const n = Number(num);
  if (isNaN(n)) return String(num);
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000)     return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString('ar-EG');
}

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeAttr(str) {
  return escapeHtml(str);
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = {
    success: '✅',
    error:   '❌',
    info:    'ℹ️',
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = (icons[type] || '') + ' ' + message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// ==========================================================================
// 18. EXPOSE GLOBALS
// ==========================================================================

window.switchView        = switchView;
window.startAnalysis     = startAnalysis;
window.retryAnalysis     = retryAnalysis;
window.resetToInitial    = resetToInitial;
window.fillDemoUrl       = fillDemoUrl;
window.selectIdeaForScript = selectIdeaForScript;
window.refreshIdeas      = refreshIdeas;
window.generateScript    = generateScript;
window.copyScript        = copyScript;
window.saveScript        = saveScript;
window.openShareModal    = openShareModal;
window.closeShareModal   = closeShareModal;
window.copyShareLink     = copyShareLink;
window.showToast         = showToast;
