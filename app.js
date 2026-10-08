/**
 * ScriptAI - Arab YouTubers & Streamers AI Platform
 * Created by Aya Zahran
 * Main Controller: 2 Pages (Features & Direct n8n Webhook Chat)
 */

// ==========================================================================
// 1. Direct Webhook AI Function (Connected directly to user's n8n chat)
// ==========================================================================
async function sendMessageToAI(userMessage) {
  // ضعي رابط الـ Webhook الخاص بـ n8n هنا بين العلامتين
  const webhookUrl = "http://localhost:5678/webhook/620d6140-2e4e-4d99-9fc3-8d7d0a345b90/chat";

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      // اعتماداً على إعدادات n8n، غالباً يتم إرسال النص تحت مفتاح chatInput أو message
      body: JSON.stringify({ chatInput: userMessage })
    });

    const data = await response.json();
    
    // الرد القادم من n8n (تأكدي من مطابقة اسم المفتاح مثل output أو text حسب مخرجات الـ Agent)
    return data.output || data.text || (typeof data === 'string' ? data : JSON.stringify(data)) || "عذراً، لم أتمكن من الرد.";
    
  } catch (error) {
    console.error("خطأ في الاتصال:", error);
    return "حدث خطأ في الاتصال بالخادم. تأكد من تشغيل n8n على localhost:5678 وتفعيل الـ Webhook.";
  }
}

// ==========================================================================
// 2. State & Session Management
// ==========================================================================
const AppState = {
  activeView: 'features',
  currentSessionId: null,
  sessions: []
};

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

  AppState.sessions.forEach(session => {
    const item = document.createElement('div');
    item.className = `session-item ${session.id === AppState.currentSessionId ? 'active' : ''}`;
    item.onclick = () => selectSession(session.id);

    item.innerHTML = `
      <div class="session-info">
        <span class="session-title">${escapeHtml(session.title)}</span>
        <span class="session-date">${session.date}</span>
      </div>
      <button class="session-delete-btn" title="حذف" onclick="deleteSession('${session.id}', event)">
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
        <h2 class="welcome-title">ScriptAI</h2>
        <div class="welcome-subtitle">تطوير وبرمجة: آية زهران (Aya Zahran)</div>
        <p class="welcome-desc">
          أهلاً بك! الشات متصل مباشرة بذكاء ScriptAI الاصطناعي.<br>
          ضع رابط قناتك (يوتيوب أو تويتش) لتحليل الفيديوهات الأكثر مشاهدة، أو اسأل عن فكرة وسكربت لحلقتك القادمة:
        </p>
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
      <div class="message-bubble">
        <div class="message-header">
          <div>
            ${isUser 
              ? `<span class="sender-name-user">أنت</span>` 
              : `<span class="sender-name-ai">ScriptAI (آية زهران)</span>`
            }
          </div>
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="font-size: 0.72rem; color: var(--text-dim);">${msg.time || ''}</span>
            ${!isUser ? `<button class="message-copy-btn" onclick="copyMessageText(${index})">نسخ</button>` : ''}
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
  text = text.replace(/^#### (.*$)/gim, '<h4 style="color:#ffffff; margin: 10px 0 4px;">$1</h4>');
  text = text.replace(/^### (.*$)/gim, '<h3>$1</h3>');
  text = text.replace(/^## (.*$)/gim, '<h2>$1</h2>');
  text = text.replace(/^# (.*$)/gim, '<h1>$1</h1>');

  // Bold & Italic
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');

  // Script Tags
  text = text.replace(/\[(المشهد.*?)\]/gi, '<span class="script-tag visual">🎬 $1</span>');
  text = text.replace(/\[(Hook|الخطاف.*?)\]/gi, '<span class="script-tag hook">⚡ $1</span>');
  text = text.replace(/\[(SFX|المؤثر الصوتي.*?)\]/gi, '<span class="script-tag audio">🔊 $1</span>');
  text = text.replace(/\[(CTA|الخاتمة.*?)\]/gi, '<span class="script-tag cta">🔔 $1</span>');

  const paragraphs = text.split(/\n\n+/);
  return paragraphs.map(p => {
    if (p.startsWith('<h1') || p.startsWith('<h2') || p.startsWith('<h3') || p.startsWith('<h4')) {
      return p;
    }
    return `<p>${p.replace(/\n/g, '<br>')}</p>`;
  }).join('');
}

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

  if (session.messages.length === 0) {
    session.title = rawMessage.slice(0, 26) + (rawMessage.length > 26 ? '...' : '');
    renderSessionsList();
  }

  const nowTime = new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });

  session.messages.push({
    sender: 'user',
    text: rawMessage,
    time: nowTime
  });

  textarea.value = '';
  textarea.style.height = 'auto';
  renderCurrentChatMessages();

  // Typing indicator
  const messagesContainer = document.getElementById('chat-messages-container');
  const typingIndicator = document.createElement('div');
  typingIndicator.className = 'message-row ai-row';
  typingIndicator.id = 'ai-typing-indicator';
  typingIndicator.innerHTML = `
    <div class="typing-bubble">
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <div class="typing-dot"></div>
      <span style="font-size: 0.78rem; color: var(--text-muted); margin-right: 6px;">ScriptAI يتصل بالـ Webhook ويكتب الرد...</span>
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

    saveSessions();
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
