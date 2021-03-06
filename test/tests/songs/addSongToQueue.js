/* eslint-disable @typescript-eslint/no-var-requires */
/* global describe it  */

require('../../general.js');

const db = require('../../general.js').db;
const assert = require('assert');
const message = require('../../general.js').message;
const user = require('../../general.js').user;

const songs = (require('../../../dest/systems/songs')).default;

const { getRepository } = require('typeorm');
const { SongRequest } = require('../../../dest/database/entity/song');


describe('Songs - addSongToQueue()', () => {
  describe('Add music song by videoId', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();
      await user.prepare();
      songs.onlyMusicCategory = false;
    });
    const videoId = 'hLQl3WQQoQ0';

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });

    it(`Add music song ${videoId}`, async () => {
      songs.addSongToQueue({ parameters: videoId, sender: user.owner });
    });

    it(`Song is correctly added to queue`, async () => {
      await message.isSent('songs.song-was-added-to-queue', user.owner, { name: 'Adele - Someone Like You (Official Music Video)' });
    });

    it(`Queue contains song`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 1);
    });
  });

  describe('Add music song by url', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();
      await user.prepare();
      songs.onlyMusicCategory = false;
    });
    const videoUrl = 'https://www.youtube.com/watch?v=hLQl3WQQoQ0';

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });

    it(`Add music song ${videoUrl}`, async () => {
      songs.addSongToQueue({ parameters: videoUrl, sender: user.owner });
    });

    it(`Song is correctly added to queue`, async () => {
      await message.isSent('songs.song-was-added-to-queue', user.owner, { name: 'Adele - Someone Like You (Official Music Video)' });
    });

    it(`Queue contains song`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 1);
    });
  });

  describe('Add music song by search string', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();
      await user.prepare();
      songs.onlyMusicCategory = false;
    });
    const videoSearch = 'Adele - Someone Like You (Official Music Video)';

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });

    it(`Add music song ${videoSearch}`, async () => {
      songs.addSongToQueue({ parameters: videoSearch, sender: user.owner });
    });

    it(`Song is correctly added to queue`, async () => {
      await message.isSent('songs.song-was-added-to-queue', user.owner, { name: 'Adele - Someone Like You (Official Music Video)' });
    });

    it(`Queue contains song`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 1);
    });
  });

  describe('Add music song by videoId - music only', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();
      await user.prepare();
      songs.onlyMusicCategory = true;
    });
    const videoId = 'hLQl3WQQoQ0';

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });

    it(`Add music song ${videoId}`, async () => {
      songs.addSongToQueue({ parameters: videoId, sender: user.owner });
    });

    it(`Song is correctly added to queue`, async () => {
      await message.isSent('songs.song-was-added-to-queue', user.owner, { name: 'Adele - Someone Like You (Official Music Video)' });
    });

    it(`Queue contains song`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 1);
    });
  });

  describe('Add music song by url - music only', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();
      await user.prepare();
      songs.onlyMusicCategory = true;
    });
    const videoUrl = 'https://www.youtube.com/watch?v=hLQl3WQQoQ0';

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });

    it(`Add music song ${videoUrl}`, async () => {
      songs.addSongToQueue({ parameters: videoUrl, sender: user.owner });
    });

    it(`Song is correctly added to queue`, async () => {
      await message.isSent('songs.song-was-added-to-queue', user.owner, { name: 'Adele - Someone Like You (Official Music Video)' });
    });

    it(`Queue contains song`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 1);
    });
  });

  describe('Add music song by search string - music only', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();
      await user.prepare();
      songs.onlyMusicCategory = true;
    });
    const videoSearch = 'Adele - Someone Like You (Official Music Video)';

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });

    it(`Add music song ${videoSearch}`, async () => {
      songs.addSongToQueue({ parameters: videoSearch, sender: user.owner });
    });

    it(`Song is correctly added to queue`, async () => {
      await message.isSent('songs.song-was-added-to-queue', user.owner, { name: 'Adele - Someone Like You (Official Music Video)' });
    });

    it(`Queue contains song`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 1);
    });
  });

  describe('Add non-music video by videoId - music only', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();
      await user.prepare();
      songs.onlyMusicCategory = true;
    });
    const videoId = 'RwtZrI6HuwY';

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });

    it(`Add non-music video ${videoId}`, async () => {
      songs.addSongToQueue({ parameters: videoId, sender: user.owner });
    });

    it(`Song is not added to queue (incorrect category)`, async () => {
      await message.isSent('songs.incorrect-category', user.owner, {}, 10000);
    });

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });
  });

  describe('Add non-music video by url - music only', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();
      await user.prepare();
      songs.onlyMusicCategory = true;
    });
    const videoUrl = 'https://www.youtube.com/watch?v=RwtZrI6HuwY';

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });

    it(`Add non-music video ${videoUrl}`, async () => {
      songs.addSongToQueue({ parameters: videoUrl, sender: user.owner });
    });

    it(`Song is not added to queue (incorrect category)`, async () => {
      await message.isSent('songs.incorrect-category', user.owner, {}, 10000);
    });

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });
  });

  describe('Add non-music video by search string - music only', () => {
    before(async () => {
      await db.cleanup();
      await message.prepare();
      await user.prepare();
      songs.onlyMusicCategory = true;
    });
    const videoSearch = 'Annoying customers after closing time - In and Out';

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });

    it(`Add non-music video ${videoSearch}`, async () => {
      songs.addSongToQueue({ parameters: videoSearch, sender: user.owner });
    });

    it(`Song is not added to queue (incorrect category)`, async () => {
      await message.isSent('songs.incorrect-category', user.owner, {}, 10000);
    });

    it(`Queue is empty`, async () => {
      const count = await getRepository(SongRequest).count();
      assert(count === 0);
    });
  });
});
