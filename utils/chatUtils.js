// utils/chatUtils.js

// Genereert een uniek chatId voor 1-op-1 chats op basis van 2 user IDs
export const buildChatId = (uid1, uid2) => {
  return [uid1, uid2].sort().join("_");
};
