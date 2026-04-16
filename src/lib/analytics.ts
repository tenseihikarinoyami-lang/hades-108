export interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, unknown>;
  timestamp: number;
  userId?: string;
  severity?: 'info' | 'warning' | 'error';
}

const STORAGE_KEY = 'hades_analytics';
const SESSION_KEY = 'hades_session_id';
const MAX_EVENTS = 1000;

const getSessionId = () => {
  const existing = sessionStorage.getItem(SESSION_KEY);
  if (existing) return existing;
  const created = `session_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  sessionStorage.setItem(SESSION_KEY, created);
  return created;
};

const readEvents = (): AnalyticsEvent[] => {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
};

const writeEvents = (events: AnalyticsEvent[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
};

export function trackEvent(event: AnalyticsEvent): void {
  try {
    const enrichedEvent: AnalyticsEvent = {
      ...event,
      properties: {
        sessionId: getSessionId(),
        path: typeof window !== 'undefined' ? window.location.pathname : '',
        ...event.properties,
      },
      timestamp: event.timestamp || Date.now(),
    };

    const events = readEvents();
    events.push(enrichedEvent);
    writeEvents(events);
    console.log('Analytics Event:', enrichedEvent);
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

export const EVENTS = {
  PAGE_VIEW: 'page_view',
  TRIVIA_START: 'trivia_start',
  TRIVIA_COMPLETE: 'trivia_complete',
  MODE_RUN_COMPLETE: 'mode_run_complete',
  ITEM_EQUIPPED: 'item_equipped',
  FRIEND_ADDED: 'friend_added',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  PURCHASE_INITIATED: 'purchase_initiated',
  ECONOMY_REWARD: 'economy_reward',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  ERROR_OCCURRED: 'error_occurred',
  RETENTION_DAY_1: 'retention_day_1',
  RETENTION_DAY_7: 'retention_day_7',
  RETENTION_DAY_30: 'retention_day_30',
} as const;

export function trackRouteView(path: string, userId?: string) {
  trackEvent({
    eventName: EVENTS.PAGE_VIEW,
    properties: { path },
    timestamp: Date.now(),
    userId,
  });
}

export function trackModeRun(mode: string, result: 'win' | 'lose', details: Record<string, unknown> = {}, userId?: string) {
  trackEvent({
    eventName: EVENTS.MODE_RUN_COMPLETE,
    properties: { mode, result, ...details },
    timestamp: Date.now(),
    userId,
  });
}

export function trackEconomyReward(source: string, rewards: Record<string, unknown>, userId?: string) {
  trackEvent({
    eventName: EVENTS.ECONOMY_REWARD,
    properties: { source, rewards },
    timestamp: Date.now(),
    userId,
  });
}

export function captureError(error: unknown, context: string, extra: Record<string, unknown> = {}, userId?: string) {
  const message = error instanceof Error ? error.message : String(error);
  trackEvent({
    eventName: EVENTS.ERROR_OCCURRED,
    properties: { context, message, stack: error instanceof Error ? error.stack : undefined, ...extra },
    timestamp: Date.now(),
    userId,
    severity: 'error',
  });
}

export function trackRetention(userId: string, daysSinceRegistration: number): void {
  let event = '';
  if (daysSinceRegistration === 1) event = EVENTS.RETENTION_DAY_1;
  else if (daysSinceRegistration === 7) event = EVENTS.RETENTION_DAY_7;
  else if (daysSinceRegistration === 30) event = EVENTS.RETENTION_DAY_30;

  if (event) {
    trackEvent({
      eventName: event,
      properties: { userId, daysSinceRegistration },
      timestamp: Date.now(),
      userId,
    });
  }
}

export function calculateEngagementMetrics() {
  const events = readEvents();
  const pageViews = events.filter((event) => event.eventName === EVENTS.PAGE_VIEW).length;
  const runCompletions = events.filter((event) => event.eventName === EVENTS.MODE_RUN_COMPLETE).length;
  const errors = events.filter((event) => event.eventName === EVENTS.ERROR_OCCURRED).length;
  const economyEvents = events.filter((event) => event.eventName === EVENTS.ECONOMY_REWARD).length;

  return {
    pageViews,
    runCompletions,
    errors,
    economyEvents,
    totalEvents: events.length,
    lastEvent: events[events.length - 1] || null,
  };
}

export function getRecentAnalyticsEvents(limitCount: number = 25) {
  return readEvents().slice(-limitCount).reverse();
}

export function bootstrapTelemetry() {
  trackEvent({
    eventName: EVENTS.SESSION_START,
    properties: { userAgent: navigator.userAgent },
    timestamp: Date.now(),
  });

  window.addEventListener('error', (event) => {
    captureError(event.error || event.message, 'window.error');
  });

  window.addEventListener('unhandledrejection', (event) => {
    captureError(event.reason, 'window.unhandledrejection');
  });
}
