const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/user');
const Capsule = require('../models/capsule');
const DiaryMemory = require('../models/diaryEntry');
const PhotoAlbum = require('../models/photoAlbum');
const Comment = require('../models/comment');
const GroupDiary = require('../models/groupDiary');

const migrate = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const migrations = [
      {
        model: User,
        index: { pendingFriendRequests: 1 },
        name: 'pendingFriendRequests'
      },
      {
        model: User,
        index: { username: 'text', fullname: 'text' },
        name: 'username_fullname_text'
      },
      {
        model: Capsule,
        index: { createdBy: 1, createdAt: -1 },
        name: 'createdBy_createdAt'
      },
      {
        model: Capsule,
        index: { createdBy: 1, sendDate: 1 },
        name: 'createdBy_sendDate'
      },
      {
        model: DiaryMemory,
        index: { createdBy: 1, createdAt: -1 },
        name: 'createdBy_createdAt'
      },
      {
        model: DiaryMemory,
        index: { sharedWith: 1 },
        name: 'sharedWith'
      },
      {
        model: DiaryMemory,
        index: { groupId: 1 },
        name: 'groupId'
      },
      {
        model: PhotoAlbum,
        index: { createdBy: 1, createdAt: -1 },
        name: 'createdBy_createdAt'
      },
      {
        model: PhotoAlbum,
        index: { sharedWith: 1 },
        name: 'sharedWith'
      },
      {
        model: Comment,
        index: { capsuleId: 1, createdAt: 1 },
        name: 'capsuleId_createdAt'
      },
      {
        model: GroupDiary,
        index: { members: 1 },
        name: 'members'
      }
    ];

    for (const m of migrations) {
      const collectionName = m.model.collection.name;
      try {
        const result = await mongoose.connection.collection(collectionName).createIndex(
          m.index,
          { background: true }
        );
        console.log(`✅ ${collectionName}: index "${m.name}" created (id: ${result})`);
      } catch (err) {
        if (err.code === 85 || err.codeName === 'IndexKeySpecsConflict') {
          console.log(`⚠️  ${collectionName}: index "${m.name}" already exists`);
        } else {
          console.error(`❌ ${collectionName}: failed to create index "${m.name}" —`, err.message);
        }
      }
    }

    console.log('\nMigration complete.');
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

migrate();
