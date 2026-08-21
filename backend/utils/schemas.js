const { z } = require('zod');

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

const email = z.string().email('Invalid email address');
const username = z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username must be at most 30 characters').regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores');
const password = z.string().min(8, 'Password must be at least 8 characters');
const fullname = z.string().min(1, 'Fullname is required').max(100, 'Fullname must be at most 100 characters');

const pagination = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

const authParams = z.object({
  id: objectId,
  token: z.string().min(1, 'Token is required'),
});

const messageParams = z.object({
  userId: objectId,
  friendId: objectId,
});

const chatIdParam = z.object({
  chatId: z.string().min(1, 'Chat ID is required'),
});

const diaryParams = z.object({
  memoryId: objectId,
});

const groupParams = z.object({
  groupId: objectId,
});

const capsuleParams = z.object({
  id: objectId,
});

const photoParams = z.object({
  memoryId: objectId,
});

const commentParams = z.object({
  capsuleId: objectId,
});

const moodQuery = z.object({
  mood: z.string().min(1, 'Mood is required').max(50, 'Mood must be at most 50 characters'),
});

const userQuery = z.object({
  q: z.string().max(50, 'Search query must be 50 characters or less').optional(),
  ...pagination.shape,
});

const capsuleQuery = z.object({
  ...pagination.shape,
  search: z.string().max(100, 'Search must be at most 100 characters').optional(),
  sendMethod: z.string().optional(),
  sendToOthers: z.enum(['true', 'false']).optional(),
});

const messageQuery = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(20),
  before: z.string().datetime().optional(),
});

const registerBody = z.object({
  fullname: fullname,
  username: username,
  email: email,
  password: password,
});

const loginBody = z.object({
  username: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
});

const forgotPasswordBody = z.object({
  email: email,
});

const requestPasswordResetBody = z.object({
  email: email,
});

const resetPasswordBody = z.object({
  password: password,
});

const updateProfileBody = z.object({
  fullname: fullname.optional(),
  username: username.optional(),
  email: email.optional(),
  bio: z.string().max(500, 'Bio must be at most 500 characters').optional(),
  password: password.optional(),
  notifications: z.boolean().optional(),
  darkMode: z.boolean().optional(),
  avatar: z.string().startsWith('data:', 'Avatar must be a base64 data URL').optional(),
});

const updatePasswordBody = z.object({
  newPassword: password,
});

const sendMessageBody = z.object({
  receiverId: objectId,
  text: z.string().max(5000, 'Message text must be at most 5000 characters').optional().default(''),
  capsuleId: objectId.optional(),
  memoryId: objectId.optional(),
  memoryType: z.enum(['DiaryMemory', 'PhotoAlbum']).optional(),
  messageType: z.enum(['text', 'image', 'file']).default('text'),
});

const friendRequestBody = z.object({
  receiverId: objectId,
});

const acceptFriendBody = z.object({
  fromId: objectId,
});

const declineFriendBody = z.object({
  fromId: objectId,
});

const createCapsuleBody = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  message: z.string().max(10000, 'Message must be at most 10000 characters').optional(),
  category: z.string().max(50, 'Category must be at most 50 characters').default('Personal'),
  permissionLevel: z.enum(['viewer', 'editor']).default('viewer'),
  messageForRecipient: z.string().max(5000, 'Message for recipient must be at most 5000 characters').optional(),
  sendDate: z.string().datetime('Invalid send date format'),
  reminder: z.boolean().optional(),
  lockUntilSend: z.boolean().optional(),
  sendMethod: z.enum(['email', 'sms', 'push']).optional(),
  tags: z.array(z.string().max(50)).max(20, 'Maximum 20 tags allowed').optional(),
  media: z.array(z.string().url('Invalid media URL')).max(50, 'Maximum 50 media items allowed').optional(),
  coverImage: z.string().url('Invalid cover image URL').optional(),
  capsuleType: z.enum(['private', 'shared']).default('private'),
  sharedWith: z.array(objectId).max(100, 'Maximum 100 shared users allowed').optional(),
});

const updateCapsuleBody = z.object({
  title: z.string().min(1).max(200).optional(),
  message: z.string().max(10000).optional(),
  category: z.string().max(50).optional(),
  permissionLevel: z.enum(['viewer', 'editor']).optional(),
  messageForRecipient: z.string().max(5000).optional(),
  sendDate: z.string().datetime().optional(),
  reminder: z.boolean().optional(),
  lockUntilSend: z.boolean().optional(),
  sendMethod: z.enum(['email', 'sms', 'push']).optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  media: z.array(z.string().url()).max(50).optional(),
  coverImage: z.string().url().optional(),
  capsuleType: z.enum(['private', 'shared']).optional(),
  sharedWith: z.array(objectId).max(100).optional(),
  emotionTags: z.array(z.string()).max(20).optional(),
  contributors: z.array(objectId).max(50).optional(),
  memories: z.array(objectId).max(100).optional(),
}).partial();

const createDiaryBody = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  entryText: z.string().max(50000, 'Entry text must be at most 50000 characters').optional(),
  date: z.string().datetime().optional(),
  emotionTag: z.string().max(50, 'Emotion tag must be at most 50 characters').optional(),
  isSecret: z.boolean().optional(),
  pin: z.string().length(4, 'PIN must be exactly 4 digits').regex(/^\d{4}$/, 'PIN must contain only digits').optional(),
  burnAfterReading: z.boolean().optional(),
  voiceNoteUrl: z.string().url('Invalid voice note URL').optional(),
  voiceNoteDuration: z.number().positive('Duration must be positive').optional(),
  voiceNotePublicId: z.string().optional(),
  groupId: objectId.optional(),
});

const updateDiaryBody = z.object({
  title: z.string().min(1).max(200).optional(),
  content: z.string().max(50000).optional(),
  emotionTag: z.string().max(50).optional(),
  voiceNoteUrl: z.string().url().optional(),
  voiceNoteDuration: z.number().positive().optional(),
  voiceNotePublicId: z.string().optional(),
}).partial();

const unlockDiaryBody = z.object({
  pin: z.string().length(4, 'PIN must be exactly 4 digits').regex(/^\d{4}$/, 'PIN must contain only digits'),
});

const shareDiaryBody = z.object({
  userIds: z.array(objectId).min(1, 'At least one userId is required').max(100, 'Maximum 100 users allowed'),
});

const createPhotoBody = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  description: z.string().max(5000, 'Description must be at most 5000 characters').optional(),
  photos: z.array(z.string().url('Invalid photo URL')).min(1, 'At least one photo is required').max(100, 'Maximum 100 photos allowed'),
});

const updatePhotoBody = z.object({
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(5000).optional(),
}).partial();

const addPhotosBody = z.object({
  photos: z.array(z.string().url()).min(1, 'At least one photo is required').max(100, 'Maximum 100 photos allowed'),
});

const removePhotoBody = z.object({
  photoUrl: z.string().url('Invalid photo URL'),
});

const sharePhotoBody = z.object({
  userIds: z.array(objectId).min(1, 'At least one userId is required').max(100, 'Maximum 100 users allowed'),
});

const postCommentBody = z.object({
  content: z.string().min(1, 'Comment content is required').max(5000, 'Comment must be at most 5000 characters').trim(),
});

const createGroupBody = z.object({
  name: z.string().min(1, 'Group name is required').max(100, 'Group name must be at most 100 characters'),
  description: z.string().max(1000, 'Description must be at most 1000 characters').optional(),
  type: z.enum(['personal', 'family', 'friends', 'work', 'other']).default('personal'),
  coverEmoji: z.string().max(10, 'Emoji must be at most 10 characters').default('📖'),
  memberIds: z.array(objectId).max(100, 'Maximum 100 members allowed').optional(),
});

const joinGroupBody = z.object({
  inviteCode: z.string().min(1, 'Invite code is required').max(20, 'Invite code must be at most 20 characters'),
});

const addGroupEntryBody = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be at most 200 characters'),
  entryText: z.string().max(50000, 'Entry text must be at most 50000 characters').optional(),
  emotionTag: z.string().max(50, 'Emotion tag must be at most 50 characters').optional(),
});

const signatureQuery = z.object({
  folder: z.string().max(100, 'Folder name must be at most 100 characters').default('album_images'),
});

module.exports = {
  objectId,
  email,
  username,
  password,
  fullname,
  pagination,
  authParams,
  messageParams,
  chatIdParam,
  diaryParams,
  groupParams,
  capsuleParams,
  photoParams,
  commentParams,
  moodQuery,
  userQuery,
  capsuleQuery,
  messageQuery,
  registerBody,
  loginBody,
  forgotPasswordBody,
  requestPasswordResetBody,
  resetPasswordBody,
  updateProfileBody,
  updatePasswordBody,
  sendMessageBody,
  friendRequestBody,
  acceptFriendBody,
  declineFriendBody,
  createCapsuleBody,
  updateCapsuleBody,
  createDiaryBody,
  updateDiaryBody,
  unlockDiaryBody,
  shareDiaryBody,
  createPhotoBody,
  updatePhotoBody,
  addPhotosBody,
  removePhotoBody,
  sharePhotoBody,
  postCommentBody,
  createGroupBody,
  joinGroupBody,
  addGroupEntryBody,
  signatureQuery,
};
