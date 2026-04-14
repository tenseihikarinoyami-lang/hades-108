// ANALYTICS Y TELEMETRÍA - Tracking de métricas
export interface AnalyticsEvent {
  eventName: string;
  properties: Record<string, any>;
  timestamp: number;
  userId?: string;
}

// Evento tracker local (enviar a servicio de analytics)
export function trackEvent(event: AnalyticsEvent): void {
  // En producción, enviar a Vercel Analytics, Google Analytics, etc.
  console.log('Analytics Event:', event);
  
  // Guardar en localStorage para análisis posterior
  try {
    const events = JSON.parse(localStorage.getItem('hades_analytics') || '[]');
    events.push(event);
    // Mantener solo últimos 1000 eventos
    if (events.length > 1000) events.splice(0, events.length - 1000);
    localStorage.setItem('hades_analytics', JSON.stringify(events));
  } catch (error) {
    console.error('Error tracking event:', error);
  }
}

// Eventos predefinidos
export const EVENTS = {
  PAGE_VIEW: 'page_view',
  TRIVIA_START: 'trivia_start',
  TRIVIA_COMPLETE: 'trivia_complete',
  ITEM_EQUIPPED: 'item_equipped',
  FRIEND_ADDED: 'friend_added',
  ACHIEVEMENT_UNLOCKED: 'achievement_unlocked',
  PURCHASE_INITIATED: 'purchase_initiated',
  SESSION_START: 'session_start',
  SESSION_END: 'session_end',
  ERROR_OCCURRED: 'error_occurred',
  RETENTION_DAY_1: 'retention_day_1',
  RETENTION_DAY_7: 'retention_day_7',
  RETENTION_DAY_30: 'retention_day_30'
};

// Track retención
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
      userId
    });
  }
}

// Calcular métricas de engagement
export function calculateEngagementMetrics(): any {
  try {
    const events = JSON.parse(localStorage.getItem('hades_analytics') || '[]');
    const pageViews = events.filter((e: any) => e.eventName === 'page_view').length;
    const triviaStarts = events.filter((e: any) => e.eventName === 'trivia_start').length;
    const triviaCompletions = events.filter((e: any) => e.eventName === 'trivia_complete').length;
    const completionRate = triviaStarts > 0 ? (triviaCompletions / triviaStarts * 100).toFixed(2) : 0;
    
    return {
      pageViews,
      triviaStarts,
      triviaCompletions,
      triviaCompletionRate: `${completionRate}%`,
      totalEvents: events.length
    };
  } catch (error) {
    return {};
  }
}
