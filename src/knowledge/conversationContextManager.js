export function createCompanyConversationContext() {
  return { isCompanyConversation: false, lastTopic: null, turnCount: 0 };
}

export function rememberCompanyTurn(context, topic) {
  return {
    isCompanyConversation: true,
    lastTopic: topic || context.lastTopic || 'company',
    turnCount: context.turnCount + 1,
  };
}

export function leaveCompanyConversation(context) {
  return { ...context, isCompanyConversation: false };
}
