const readBoolean = (value, fallback) => {
  if (value == null || value === '') return fallback;
  return !['0', 'false', 'off', 'no'].includes(String(value).toLowerCase());
};

const env = import.meta.env || {};

export const voiceConfig = Object.freeze({
  enabled: readBoolean(env.VITE_DEKODE_VOICE_ENABLED, true),
  provider: env.VITE_VOICE_PROVIDER || 'browser',
  fallbackEnabled: readBoolean(env.VITE_VOICE_FALLBACK_ENABLED, true),
  mockMeetingSlotsEnabled: readBoolean(env.VITE_MOCK_MEETING_SLOTS_ENABLED, true),
  companyTimezone: env.VITE_COMPANY_TIMEZONE || 'Australia/Melbourne',
  notificationMode: env.VITE_LEAD_NOTIFICATION_MODE || 'mock',
  leadEndpoint: env.VITE_LEAD_NOTIFICATION_ENDPOINT || '/api/leads',
});

export { readBoolean };
