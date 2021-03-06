/* global describe it before */
const commons = require('../../../dest/commons');


require('../../general.js');

const db = require('../../general.js').db;
const message = require('../../general.js').message;

const top = (require('../../../dest/systems/top')).default;

const { getRepository } = require('typeorm');
const { User, UserBit } = require('../../../dest/database/entity/user');

const tmi = (require('../../../dest/tmi')).default;

// users
const owner = { username: 'soge__' };

describe('Top - !top bits', () => {
  before(async () => {
    await db.cleanup();
    await message.prepare();
  });

  it ('Add 10 users into db and last user will don\'t have any bits', async () => {
    for (let i = 0; i < 10; i++) {
      const user = {
        bits: [],
        ...await getRepository(User).save({ userId: Math.floor(Math.random() * 100000), username: 'user' + i }),
      };

      if (i === 0) {
        continue;
      }

      for (let j = 0; j <= i; j++) {
        user.bits.push({
          amount: j,
          cheeredAt: Date.now(),
          message: '',
        });
      }

      await getRepository(User).save(user);
    }
  });

  it('run !top bits and expect correct output', async () => {
    top.bits({ sender: { username: commons.getOwner() } });
    await message.isSentRaw('Top 10 (bits): 1. @user9 - 45, 2. @user8 - 36, 3. @user7 - 28, 4. @user6 - 21, 5. @user5 - 15, 6. @user4 - 10, 7. @user3 - 6, 8. @user2 - 3, 9. @user1 - 1', owner);
  });

  it('add user1 to ignore list', async () => {
    tmi.ignoreAdd({ sender: owner, parameters: 'user1' });
    await message.isSent('ignore.user.is.added', owner, { username: 'user1' });
  });

  it('run !top bits and expect correct output', async () => {
    top.bits({ sender: { username: commons.getOwner() } });
    await message.isSentRaw('Top 10 (bits): 1. @user9 - 45, 2. @user8 - 36, 3. @user7 - 28, 4. @user6 - 21, 5. @user5 - 15, 6. @user4 - 10, 7. @user3 - 6, 8. @user2 - 3', owner);
  });
});
