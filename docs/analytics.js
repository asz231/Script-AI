/**
 * Script AI — Analytics & Event Tracking Module
 * Tracks user events, referrals, and session data
 * All data stored in localStorage (no external service required for MVP)
 */

// ==========================================================================
// SESSION & REFERRAL MANAGEMENT
// ==========================================================================

const Analytics = (() => {
  const STORAGE_KEY = 'scriptai_analytics';
  const SESSION_KEY = 'scriptai_session';
  const REFERRAL_KEY = 'scriptai_referral';

  // Load or create persistent analytics store
  function getStore() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
        events: [],
        visitors: 0,
        sessions: 0,
        users: new Set().size,
        analyses: 0,
        scripts_generated: 0,
        shares: 0,
        referrals: {}
      };
    } catch { return {}; }
  }

  function saveStore(store) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); } catch {}
  }

  // Get or create session ID
  function getSessionId() {
    let sid = sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = 'ses_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  }

  // Get or create user ID
  function getUserId() {
    let uid = localStorage.getItem('scriptai_uid');
    if (!uid) {
      uid = 'usr_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
      localStorage.setItem('scriptai_uid', uid);
    }
    return uid;
  }

  return { getStore, saveStore, getSessionId, getUserId };
})();

// ==========================================================================
// REFERRAL TRACKING
// ==========================================================================

function getReferralSource() {
  // Check URL param first
  const params = new URLSearchParams(window.location.search);
  const refParam = params.get('ref');

  if (refParam) {
    try {
      localStorage.setItem('scriptai_referral', refParam);
    } catch {}
    return refParam;
  }

  // Fall back to stored referral
  try {
    return localStorage.getItem('scriptai_referral') || null;
  } catch {
    return null;
  }
}

function initReferralTracking() {
  const ref = getReferralSource();
  if (ref) {
    // Store referral click
    trackEvent('referral_visit', { referral_source: ref });
  }
}

// Generate a shareable referral link for a user
function generateReferralLink(channelName) {
  const uid = Analytics.getUserId();
  const shortId = uid.slice(-8);
  const base = window.location.origin + window.location.pathname.replace('ai.html', '');
  return `${base}?ref=${shortId}`;
}

// ==========================================================================
// EVENT TRACKING
// ==========================================================================

/**
 * Track an analytics event
 * @param {string} eventName - Name of the event
 * @param {Object} metadata - Additional event metadata
 */
function trackEvent(eventName, metadata = {}) {
  const event = {
    event_name: eventName,
    timestamp: new Date().toISOString(),
    user_id: Analytics.getUserId(),
    session_id: Analytics.getSessionId(),
    referral_source: getReferralSource(),
    page: window.location.pathname,
    metadata: metadata
  };

  // Log to console in development
  console.log('[Script AI Analytics]', eventName, metadata);

  // Store locally
  try {
    const stored = JSON.parse(localStorage.getItem('scriptai_events') || '[]');
    stored.push(event);
    // Keep last 500 events only
    if (stored.length > 500) stored.splice(0, stored.length - 500);
    localStorage.setItem('scriptai_events', JSON.stringify(stored));
  } catch {}

  // TODO: In production, send to your analytics endpoint:
  // fetch('/api/analytics', { method: 'POST', body: JSON.stringify(event), headers: {'Content-Type': 'application/json'} })

  return event;
}

// ==========================================================================
// ADMIN ANALYTICS HELPERS
// ==========================================================================

function getAnalyticsSummary() {
  try {
    const events = JSON.parse(localStorage.getItem('scriptai_events') || '[]');

    const summary = {
      total_events: events.length,
      page_views: events.filter(e => e.event_name === 'page_view').length,
      analyses_started: events.filter(e => e.event_name === 'analysis_started').length,
      analyses_completed: events.filter(e => e.event_name === 'analysis_completed').length,
      scripts_generated: events.filter(e => e.event_name === 'script_generated').length,
      scripts_copied: events.filter(e => e.event_name === 'script_copied').length,
      scripts_saved: events.filter(e => e.event_name === 'script_saved').length,
      shares: events.filter(e => e.event_name === 'share_completed').length,
      cta_clicks: events.filter(e => e.event_name === 'landing_cta_clicked').length,
      referral_visits: events.filter(e => e.event_name === 'referral_visit').length,
      referral_signups: events.filter(e => e.event_name === 'referral_signup').length,
      unique_sessions: [...new Set(events.map(e => e.session_id))].length,
      unique_users: [...new Set(events.map(e => e.user_id))].length,
      conversion_rate: events.length > 0
        ? ((events.filter(e => e.event_name === 'analysis_completed').length / Math.max(events.filter(e => e.event_name === 'aipageopened').length, 1)) * 100).toFixed(1) + '%'
        : '0%'
    };

    return summary;
  } catch {
    return {};
  }
}

// Export for use in other modules
window.trackEvent = trackEvent;
window.getReferralSource = getReferralSource;
window.initReferralTracking = initReferralTracking;
window.generateReferralLink = generateReferralLink;
window.getAnalyticsSummary = getAnalyticsSummary;
