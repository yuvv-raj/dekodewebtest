export const createConsentState = () => ({
  microphone: false,
  profileReuse: false,
  leadSubmission: false,
});

export const grantConsent = (state, key) => ({ ...state, [key]: true });
export const revokeConsent = (state, key) => ({ ...state, [key]: false });
