function pick(obj, fields) {
  if (!obj) return null;
  const out = {};
  for (const f of fields) {
    if (obj[f] !== undefined) out[f] = obj[f];
  }
  return out;
}

const UserDTO = (u) => pick(u, [
  '_id', 'fullname', 'username', 'email', 'bio',
  'settings', 'avatar', 'isVerified', 'tokenVersion',
  'createdAt', 'updatedAt'
]);

const CapsuleDTO = (c) => pick(c, [
  '_id', 'title', 'message', 'category', 'coverImage',
  'status', 'sendDate', 'lockUntilSend', 'capsuleType',
  'sharedWith', 'createdBy', 'permissionLevel',
  'tags', 'media', 'createdAt', 'updatedAt'
]);

const DiaryDTO = (d) => pick(d, [
  '_id', 'title', 'content', 'date', 'emotionTag',
  'isSecret', 'burnAfterReading', 'groupId',
  'sharedWith', 'createdBy', 'voiceNote',
  'createdAt', 'updatedAt'
]);

const PhotoDTO = (p) => pick(p, [
  '_id', 'title', 'description', 'photos',
  'sharedWith', 'createdBy', 'createdAt', 'updatedAt'
]);

const CommentDTO = (c) => pick(c, [
  '_id', 'content', 'capsuleId', 'userId',
  'createdAt', 'updatedAt'
]);

const MessageDTO = (m) => pick(m, [
  '_id', 'chatId', 'text', 'messageType', 'read',
  'timestamp', 'sender', 'receiver', 'capsuleId',
  'memoryId', 'memoryType', 'createdAt', 'updatedAt'
]);

const GroupDTO = (g) => pick(g, [
  '_id', 'name', 'description', 'type', 'coverEmoji',
  'members', 'admins', 'inviteCode', 'createdBy',
  'createdAt', 'updatedAt'
]);

const MoodDTO = (m) => pick(m, [
  '_id', 'mood', 'date', 'createdAt', 'updatedAt'
]);

const StreakDTO = (s) => pick(s, [
  '_id', 'currentStreak', 'longestStreak', 'lastEntryDate', 'totalEntries'
]);

const FriendDTO = (f) => pick(f, [
  '_id', 'username', 'fullname', 'avatar', 'bio'
]);

module.exports = {
  pick,
  UserDTO,
  CapsuleDTO,
  DiaryDTO,
  PhotoDTO,
  CommentDTO,
  MessageDTO,
  GroupDTO,
  MoodDTO,
  StreakDTO,
  FriendDTO,
};
