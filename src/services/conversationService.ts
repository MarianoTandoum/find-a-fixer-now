
// Service désactivé - remplacé par la nouvelle architecture
export const conversationService = {
  createConversation: () => Promise.resolve(null),
  getOrCreateConversation: () => Promise.resolve(null),
  getUserConversations: () => Promise.resolve([]),
  sendMessage: () => Promise.resolve(null),
  getConversationMessages: () => Promise.resolve([]),
  markMessagesAsRead: () => Promise.resolve(),
  createAppointment: () => Promise.resolve(null),
  updateAppointmentStatus: () => Promise.resolve(false)
};
