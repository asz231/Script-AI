/**
 * ScriptAI - Arab YouTubers & Streamers AI Platform
 * Created by Aya Zahran
 * Main Controller: 2 Pages (Features & Direct n8n Webhook Chat)
 */

// ==========================================================================
// 1. Direct Webhook AI Function (Connected to n8n chat workflow)
// Webhook ID: b19cc416-e561-4254-aed8-2feca2e9d378 (Workflow: My workflow 2)
// ==========================================================================
const N8N_DIRECT_WEBHOOK_URL = 'http://localhost:5678/webhook/b19cc416-e561-4254-aed8-2feca2e9d378/chat';

async function sendMessageToAI(userMessage) {
  const sessionId = AppState.currentSessionId || ('ses_' + Date.now());

  // First try the secure backend proxy (/api/chat)
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chatInput: userMessage,
        sessionId: sessionId
      })
    });

    if (response.ok) {
      const data = await response.json();
      const output = data.output || data.text || data.message || (Array.isArray(data) && data[0]?.output);
      if (output) return output;
      if (typeof data === 'string') return data;
    }
  } catch (error) {
    console.warn("[Script AI] فشل الاتصال عبر /api/chat، جاري المحاولة مباشرة عبر الـ Webhook:", error);
  }

  // Fallback: direct n8n webhook (works if frontend is opened via Live Server or static host)
  try {
    const directRes = await fetch(N8N_DIRECT_WEBHOOK_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        chatInput: userMessage,
        sessionId: sessionId
      })
    });

    if (directRes.ok) {
      const directData = await directRes.json();
      const directOutput = directData.output || directData.text || directData.message || (Array.isArray(directData) && directData[0]?.output);
      if (directOutput) return directOutput;
      if (typeof directData === 'string') return directData;
    }
  } catch (fallbackError) {
    console.error("[Script AI] خطأ في الاتصال بالـ Webhook المباشر:", fallbackError);
  }

  return "تعذر الاتصال بوكيل الذكاء الاصطناعي. تأكد من تشغيل n8n وتفعيل الـ Workflow (My workflow 2) على http://localhost:5678";
}

// ==========================================================================
// 2. State & Session Management
// ==========================================================================
const AppState = {
  activeView: 'features',
  currentSessionId: null,
  sessions: []
};

function useQuickPrompt(promptText) {
  const textarea = document.getElementById('chat-textarea');
  if (textarea) {
    textarea.value = promptText;
    textarea.focus();
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }
}
window.useQuickPrompt = useQuickPrompt;

document.addEventListener('DOMContentLoaded', () => {
  loadStoredData();
  setupNavigation();
  setupChatHandlers();
  renderSessionsList();

  if (AppState.sessions.length === 0) {
    createNewSession("محادثة جديدة");
  } else {
    selectSession(AppState.sessions[0].id);
  }
});

function loadStoredData() {
  try {
    const saved = localStorage.getItem('scriptai_sessions');
    if (saved) {
      AppState.sessions = JSON.parse(saved);
      // تحديث أسماء المحادثات المحفوظة القديمة تلقائياً حسب المحتوى
      if (Array.isArray(AppState.sessions)) {
        AppState.sessions.forEach(s => updateSessionTopic(s));
      }
    }
  } catch (e) {
    console.warn("LocalStorage load error:", e);
  }
}

function saveSessions() {
  try {
    localStorage.setItem('scriptai_sessions', JSON.stringify(AppState.sessions));
  } catch (e) {
    console.warn("LocalStorage save error:", e);
  }
}

// ==========================================================================
// 3. Simple Navigation (Features vs Chat)
// ==========================================================================
function setupNavigation() {
  const navBtns = document.querySelectorAll('[data-target-view]');
  navBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const target = btn.getAttribute('data-target-view');
      switchView(target);
    });
  });

  const goToChatBtn = document.getElementById('go-to-chat-btn');
  if (goToChatBtn) {
    goToChatBtn.addEventListener('click', () => switchView('chat'));
  }

  const brandHomeBtn = document.getElementById('brand-home-btn');
  if (brandHomeBtn) {
    brandHomeBtn.addEventListener('click', () => switchView('features'));
  }

  const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');
  const chatSidebar = document.getElementById('chat-sidebar');
  if (toggleSidebarBtn && chatSidebar) {
    toggleSidebarBtn.addEventListener('click', () => {
      chatSidebar.classList.toggle('open');
    });
  }
}

function switchView(viewName) {
  AppState.activeView = viewName;

  document.querySelectorAll('.view-section').forEach(section => {
    section.classList.remove('active-view');
  });

  const activeSection = document.getElementById(`view-${viewName}`);
  if (activeSection) {
    activeSection.classList.add('active-view');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  document.querySelectorAll('.nav-link-btn').forEach(link => {
    if (link.getAttribute('data-target-view') === viewName) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });

  const chatSidebar = document.getElementById('chat-sidebar');
  if (chatSidebar) {
    chatSidebar.classList.remove('open');
  }
}

// ==========================================================================
// 4. Session Controls
// ==========================================================================
function createNewSession(title = "محادثة جديدة") {
  const newId = 'session_' + Date.now();
  const newSession = {
    id: newId,
    title: title,
    date: new Date().toLocaleDateString('ar-EG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
    messages: []
  };

  AppState.sessions.unshift(newSession);
  saveSessions();
  renderSessionsList();
  selectSession(newId);
  return newSession;
}

function selectSession(sessionId) {
  AppState.currentSessionId = sessionId;
  renderSessionsList();
  renderCurrentChatMessages();

  const chatSidebar = document.getElementById('chat-sidebar');
  if (chatSidebar) {
    chatSidebar.classList.remove('open');
  }
}

function deleteSession(sessionId, event) {
  if (event) event.stopPropagation();

  AppState.sessions = AppState.sessions.filter(s => s.id !== sessionId);
  saveSessions();

  if (AppState.currentSessionId === sessionId) {
    if (AppState.sessions.length > 0) {
      selectSession(AppState.sessions[0].id);
    } else {
      createNewSession("محادثة جديدة");
    }
  } else {
    renderSessionsList();
  }
  showToast("تم حذف المحادثة", "info");
}

function renderSessionsList() {
  const container = document.getElementById('sidebar-sessions-list');
  if (!container) return;

  container.innerHTML = '';

  if (AppState.sessions.length === 0) {
    container.innerHTML = `
      <div class="sidebar-empty-state">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
        <span>لا توجد محادثات سابقة</span>
      </div>
    `;
    return;
  }

  AppState.sessions.forEach(session => {
    const item = document.createElement('div');
    const isActive = session.id === AppState.currentSessionId;
    item.className = `session-item ${isActive ? 'active' : ''}`;
    item.onclick = () => selectSession(session.id);

    const msgCount = session.messages ? session.messages.length : 0;

    item.innerHTML = `
      <div class="session-item-icon">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <div class="session-info">
        <span class="session-title">${escapeHtml(session.title)}</span>
        <div class="session-meta-row">
          <span class="session-date">${session.date || ''}</span>
          ${msgCount > 0 ? `<span class="session-count-badge">${msgCount}</span>` : ''}
        </div>
      </div>
      <button class="session-delete-btn" title="حذف المحادثة" onclick="deleteSession('${session.id}', event)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    `;
    container.appendChild(item);
  });
}

// ==========================================================================
// 5. Chat Messaging & Webhook Integration
// ==========================================================================
function getCurrentSession() {
  return AppState.sessions.find(s => s.id === AppState.currentSessionId);
}

function renderCurrentChatMessages() {
  const messagesContainer = document.getElementById('chat-messages-container');
  const session = getCurrentSession();
  if (!messagesContainer || !session) return;

  const titleElem = document.getElementById('chat-current-title');
  if (titleElem) {
    titleElem.textContent = session.title;
  }

  // Welcome screen if no messages
  if (session.messages.length === 0) {
    messagesContainer.innerHTML = `
      <div class="chat-welcome-state">
        <div class="welcome-badge">
          <span class="badge-sparkle">✨</span>
          <span>Script AI — المساعد الاستراتيجي للمحتوى</span>
        </div>
        <h2 class="welcome-title">كيف نطور محتواك وقناتك اليوم؟</h2>
        <p class="welcome-desc">
          مرحبًا بك! أنا متصل مباشرة بوكيل الذكاء الاصطناعي الخاص بك لتحليل القنوات، اكتشاف الأفكار الفيروسية، وصياغة سكريبتات احترافية متكاملة.
        </p>

        <div class="welcome-quick-actions">
          <button class="quick-prompt-card" onclick="useQuickPrompt('أنا يوتيوبر، رابط قناتي هو: ')">
            <div class="qp-icon-wrap">📊</div>
            <div class="qp-info">
              <span class="qp-title">تحليل القناة</span>
              <span class="qp-sub">أدخل الرابط لتحليل الأداء والأشخاص</span>
            </div>
          </button>
          <button class="quick-prompt-card" onclick="useQuickPrompt('اقترح لي فكرة تحدي ألعاب حماسية وجماعية مع الشباب')">
            <div class="qp-icon-wrap">🎮</div>
            <div class="qp-info">
              <span class="qp-title">تحدي جماعي</span>
              <span class="qp-sub">فكرة ألعاب وتحدي مع الـ Squad</span>
            </div>
          </button>
          <button class="quick-prompt-card" onclick="useQuickPrompt('اكتب لي سكريبت كامل لفيديو يوتيوب مع هوك قوي ومقدمة مشوقة')">
            <div class="qp-icon-wrap">🎬</div>
            <div class="qp-info">
              <span class="qp-title">صناعة سكريبت كامل</span>
              <span class="qp-sub">هوك + مقدمة + أحداث + خاتمة وCTA</span>
            </div>
          </button>
          <button class="quick-prompt-card" onclick="useQuickPrompt('أعطني 3 أفكار فيديوهات قريبة من أسلوبي ولها احتمالية انتشار عالية')">
            <div class="qp-icon-wrap">⚡</div>
            <div class="qp-info">
              <span class="qp-title">أفكار قابلة للانتشار</span>
              <span class="qp-sub">Viral Content Strategy</span>
            </div>
          </button>
        </div>
      </div>
    `;
    return;
  }

  messagesContainer.innerHTML = '';

  session.messages.forEach((msg, index) => {
    const isUser = msg.sender === 'user';
    const row = document.createElement('div');
    row.className = `message-row ${isUser ? 'user-row' : 'ai-row'}`;

    const parsedContent = formatMessageContent(msg.text);

    row.innerHTML = `
      <div class="message-avatar-wrap">
        ${isUser 
          ? `<div class="avatar-badge user-avatar" title="أنت">
               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
             </div>`
          : `<div class="avatar-badge ai-avatar" title="Script AI">
               <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
             </div>`
        }
      </div>
      <div class="message-bubble">
        <div class="message-header">
          <div class="message-sender-meta">
            ${isUser 
              ? `<span class="sender-name-user">أنت</span>` 
              : `<span class="sender-name-ai">Script AI</span><span class="sender-tag">وكيل المحتوى</span>`
            }
            <span class="message-time">${msg.time || ''}</span>
          </div>
          <div class="message-actions">
            <button class="message-copy-btn" onclick="copyMessageText(${index})" title="نسخ الرسالة">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
              <span>نسخ</span>
            </button>
          </div>
        </div>
        <div class="message-content">${parsedContent}</div>
      </div>
    `;

    messagesContainer.appendChild(row);
  });

  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function formatMessageContent(rawText) {
  if (!rawText) return '';

  let text = escapeHtml(rawText);

  // Markdown Headings
  text = text.replace(/^#### (.*$)/gim, '<h4 class="chat-h4">$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3 class="chat-h3">$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2 class="chat-h2">$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1 class="chat-h1">$1</h1>');

  // Bold & Italic & Code
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  text = text.replace(/`([^`]+)`/g, '<code class="chat-code">$1</code>');

  // Script Tags
  text = text.replace(/\[(المشهد.*?)\]/gi, '<span class="script-tag visual">🎬 $1</span>');
  text = text.replace(/\[(Hook|الخطاف.*?)\]/gi, '<span class="script-tag hook">⚡ $1</span>');
  text = text.replace(/\[(SFX|المؤثر الصوتي.*?)\]/gi, '<span class="script-tag audio">🔊 $1</span>');
  text = text.replace(/\[(CTA|الخاتمة.*?)\]/gi, '<span class="script-tag cta">🔔 $1</span>');

  // Horizontal rules
  text = text.replace(/^---$/gim, '<hr class="chat-divider">');

  // Split into paragraphs & lists
  const lines = text.split('\n');
  let inList = false;
  let html = '';

  for (let line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      if (!inList) { html += '<ul class="chat-list">'; inList = true; }
      html += `<li>${trimmed.slice(2)}</li>`;
    } else {
      if (inList) { html += '</ul>'; inList = false; }
      if (trimmed.startsWith('<h1') || trimmed.startsWith('<h2') || trimmed.startsWith('<h3') || trimmed.startsWith('<h4') || trimmed.startsWith('<hr')) {
        html += trimmed;
      } else if (trimmed.length > 0) {
        html += `<p>${trimmed}</p>`;
      }
    }
  }
  if (inList) html += '</ul>';

  return html;
}

function useQuickPrompt(promptText) {
  const textarea = document.getElementById('chat-textarea');
  if (textarea) {
    textarea.value = promptText;
    textarea.focus();
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
  }
}
window.useQuickPrompt = useQuickPrompt;

function copyMessageText(msgIndex) {
  const session = getCurrentSession();
  if (!session || !session.messages[msgIndex]) return;

  const text = session.messages[msgIndex].text;
  navigator.clipboard.writeText(text).then(() => {
    showToast("تم النسخ بنجاح", "success");
  });
}

function setupChatHandlers() {
  const sendBtn = document.getElementById('chat-send-btn');
  const textarea = document.getElementById('chat-textarea');
  const newChatBtn = document.getElementById('new-chat-btn');
  const copyAllBtn = document.getElementById('copy-all-btn');
  const clearChatBtn = document.getElementById('clear-chat-btn');

  if (newChatBtn) {
    newChatBtn.addEventListener('click', () => createNewSession("محادثة جديدة"));
  }

  if (textarea) {
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 130)}px`;
    });

    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSendMessage();
      }
    });
  }

  if (sendBtn) {
    sendBtn.addEventListener('click', handleSendMessage);
  }

  if (copyAllBtn) {
    copyAllBtn.addEventListener('click', () => {
      const session = getCurrentSession();
      if (!session || session.messages.length === 0) return;
      let fullText = session.messages.map(m => `[${m.sender === 'user' ? 'المستخدم' : 'ScriptAI'}]:\n${m.text}`).join('\n\n');
      navigator.clipboard.writeText(fullText).then(() => showToast("تم نسخ كامل المحادثة", "success"));
    });
  }

  if (clearChatBtn) {
    clearChatBtn.addEventListener('click', () => {
      const session = getCurrentSession();
      if (session && confirm("مسح هذه المحادثة؟")) {
        session.messages = [];
        saveSessions();
        renderCurrentChatMessages();
      }
    });
  }

  // Edit Chat Title Handler
  const editTitleBtn = document.getElementById('edit-title-btn');
  const chatTitleHeader = document.getElementById('chat-current-title');
  const handleRenameTitle = () => {
    const session = getCurrentSession();
    if (!session) return;
    const current = session.title === "محادثة جديدة" ? "" : session.title;
    const newTitle = prompt("أدخل اسم موضوع المحادثة:", current);
    if (newTitle !== null && newTitle.trim()) {
      session.title = newTitle.trim().slice(0, 40);
      session.isManualTitle = true;
      saveSessions();
      renderSessionsList();
      if (chatTitleHeader) chatTitleHeader.textContent = session.title;
      showToast("تم تحديث اسم المحادثة", "success");
    }
  };
  if (editTitleBtn) editTitleBtn.addEventListener('click', handleRenameTitle);
  if (chatTitleHeader) chatTitleHeader.addEventListener('click', handleRenameTitle);
}

// ==========================================================================
// 6. Dynamic Topic Extraction Engine (تحديث اسم المحادثة تلقائياً وبدقة عالية)
// ==========================================================================

function normalizeArabicText(text) {
  return (text || '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .toLowerCase()
    .trim();
}

function isGreetingText(text) {
  const norm = normalizeArabicText(text);
  const greetings = [
    'السلام عليكم', 'سلام عليكم', 'وعليكم السلام', 'مرحبا', 'مرحبتين',
    'هاي', 'هلا', 'اهلين', 'اهلا', 'صباح الخير', 'مساء الخير',
    'كيفك', 'كيف الحال', 'شخبارك', 'الو', 'هلا والله', 'هلا وغلا'
  ];
  return greetings.some(g => norm === g || norm.startsWith(g + ' '));
}

/**
 * فحص كامل جلسة المحادثة واستخراج أدق وأفضل عنوان لها تلقائياً
 */
function computeBestTitleForSession(session) {
  if (!session || !session.messages || session.messages.length === 0) {
    return "محادثة جديدة";
  }

  // 1. الأولوية الأولى: استخراج عنوان الفكرة من ردود الذكاء الاصطناعي (من الأحدث للأقدم)
  for (let i = session.messages.length - 1; i >= 0; i--) {
    const msg = session.messages[i];
    if (msg.sender === 'ai' && msg.text) {
      // عنوان الفكرة: [...] أو العنوان: [...] أو فكرة البث: [...]
      const titleMatch = msg.text.match(/(?:عنوان الفكرة|العنوان|عنوان الفيديو|فكرة البث|اسم الفكرة|عنوان السكريبت|فكرة التحدي)[\s:*：]+["«“]?([^\n"»”\*\#]{3,42})/i);
      if (titleMatch && titleMatch[1]) {
        const clean = titleMatch[1].replace(/^[^\w\u0600-\u06FF]+|[^\w\u0600-\u06FF]+$/g, '').trim();
        if (clean.length >= 3 && clean.length <= 36) return clean;
      }

      // **عنوان الفكرة:** أو **فكرة:** أو **تحدي:**
      const boldMatch = msg.text.match(/\*\*(?:فكرة|تحدي|سيناريو|بث مباشر|بث|العنوان|عنوان الفكرة):\s*([^\*]{3,38})\*\*/i);
      if (boldMatch && boldMatch[1]) {
        const clean = boldMatch[1].replace(/^[^\w\u0600-\u06FF]+|[^\w\u0600-\u06FF]+$/g, '').trim();
        if (clean.length >= 3 && clean.length <= 36) return clean;
      }

      // عناوين Markdown الرئيسية: ## فكرة... أو ### تحدي...
      const headingMatch = msg.text.match(/^#{1,3}\s+(?:فكرة\s+|تحدي\s+|بث\s+)?([^\n]{4,35})$/m);
      if (headingMatch && headingMatch[1] && !headingMatch[1].includes('Master') && !headingMatch[1].includes('Prompt')) {
        return headingMatch[1].trim();
      }
    }
  }

  // 2. الأولوية الثانية: استخراج رابط القناة أو اليوزر من رسائل المستخدم
  for (let i = session.messages.length - 1; i >= 0; i--) {
    const msg = session.messages[i];
    if (msg.sender === 'user' && msg.text) {
      const text = msg.text.trim();
      const ytMatch = text.match(/(?:youtube\.com\/(?:@|c\/|channel\/)?|youtu\.be\/|@)([\w\-\.\u0600-\u06FF]+)/i);
      if (ytMatch && ytMatch[1] && ytMatch[1].toLowerCase() !== 'watch') {
        const handle = ytMatch[1].startsWith('@') ? ytMatch[1] : `@${ytMatch[1]}`;
        return `تحليل قناة ${handle}`;
      }
    }
  }

  // 3. الأولوية الثالثة: استخراج الهدف المحدد من طلبات المستخدم (سكريبت، تحدي، ستريمر، يوتيوبر)
  for (let i = session.messages.length - 1; i >= 0; i--) {
    const msg = session.messages[i];
    if (msg.sender === 'user' && msg.text) {
      const norm = normalizeArabicText(msg.text);

      if (norm.includes('سكريبت') || norm.includes('سيناريو')) {
        const m = msg.text.match(/(?:سكريبت|سيناريو)\s+(?:عن|لـ|حول)?\s*([^\n\.\,\!\?]{3,28})/i);
        if (m && m[1]) return `سكريبت: ${m[1].trim()}`;
        return "كتابة سكريبت";
      }

      if (norm.includes('تحدي') || norm.includes('تجربه')) {
        const m = msg.text.match(/(?:تحدي|تجربة)\s+([^\n\.\,\!\?]{3,28})/i);
        if (m && m[1]) return `تحدي: ${m[1].trim()}`;
        return "فكرة تحدي";
      }

      if (norm.includes('ستريمر') || norm.includes('ستريم') || norm.includes('تويتش')) {
        return "محتوى ستريمر";
      }

      if (norm.includes('يوتيوبر') || norm.includes('يوتيوب')) {
        return "محتوى يوتيوبر";
      }
    }
  }

  // 4. الأولوية الرابعة: أول رسالة مفيدة من المستخدم غير التحيات
  for (const msg of session.messages) {
    if (msg.sender === 'user' && msg.text) {
      const text = msg.text.trim();
      if (!isGreetingText(text) && text.length >= 3 && !text.startsWith('http')) {
        const firstLine = text.split('\n')[0].trim();
        return firstLine.slice(0, 24) + (firstLine.length > 24 ? '...' : '');
      }
    }
  }

  return "محادثة جديدة";
}

/**
 * تحديث عنوان المحادثة ومزامنة الواجهة وشريط العنوان
 */
function updateSessionTopic(session) {
  if (!session || session.isManualTitle) return false;

  const bestTitle = computeBestTitleForSession(session);
  if (bestTitle && bestTitle !== session.title) {
    session.title = bestTitle;
    const titleElem = document.getElementById('chat-current-title');
    if (titleElem && AppState.currentSessionId === session.id) {
      titleElem.textContent = session.title;
    }
    return true;
  }
  return false;
}

async function handleSendMessage() {
  const textarea = document.getElementById('chat-textarea');
  const sendBtn = document.getElementById('chat-send-btn');
  if (!textarea) return;

  const rawMessage = textarea.value.trim();
  if (!rawMessage) return;

  let session = getCurrentSession();
  if (!session) {
    session = createNewSession();
  }

  const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  session.messages.push({
    sender: 'user',
    text: rawMessage,
    time: nowTime
  });

  textarea.value = '';
  textarea.style.height = 'auto';

  // تحديث فوري لعنوان المحادثة بحسب رسالة المستخدم
  updateSessionTopic(session);
  saveSessions();
  renderSessionsList();
  renderCurrentChatMessages();

  // Typing indicator
  const messagesContainer = document.getElementById('chat-messages-container');
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message-row ai-row';
  typingIndicator.id = 'ai-typing-indicator';
  typingIndicator.innerHTML = `
    <div class="message-avatar-wrap">
      <div class="avatar-badge ai-avatar">
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
      </div>
    </div>
    <div class="typing-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <span class="typing-text">Script AI يحلل ويكتب الرد...</span>
    </div>
  `;
  messagesContainer.appendChild(typingIndicator);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;

  if (sendBtn) sendBtn.disabled = true;

  try {
    // 🎯 الاتصال المباشر بالـ Webhook
    const reply = await sendMessageToAI(rawMessage);

    const existingTyping = document.getElementById('ai-typing-indicator');
    if (existingTyping) existingTyping.remove();

    session.messages.push({
      sender: 'ai',
      text: reply,
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    });

    // 🎯 تحديث عنوان المحادثة بحسب رد الذكاء الاصطناعي (أعلى دقة)
    updateSessionTopic(session);

    saveSessions();
    renderSessionsList();
    renderCurrentChatMessages();

  } catch (err) {
    const existingTyping = document.getElementById('ai-typing-indicator');
    if (existingTyping) existingTyping.remove();

    session.messages.push({
      sender: 'ai',
      text: "حدث خطأ في الاتصال بالـ Webhook.",
      time: new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })
    });

    saveSessions();
    renderCurrentChatMessages();
  } finally {
    if (sendBtn) sendBtn.disabled = false;
  }
}

// Toast & Utilities
function showToast(message, type = 'info') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = '0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 2800);
}

function escapeHtml(string) {
  if (!string) return '';
  return String(string)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

window.copyMessageText = copyMessageText;
window.deleteSession = deleteSession;
