/* eslint-disable @typescript-eslint/no-var-requires */
/* global describe it before */


require('../../general.js');

const db = require('../../general.js').db;
const assert = require('assert');
const message = require('../../general.js').message;

const { getManager } = require('typeorm');
const { Quotes } = require('../../../dest/database/entity/quotes');

const quotes = (require('../../../dest/systems/quotes')).default;

// users
const owner = { username: 'soge__', userId: 1 };

const tests = [
  { sender: owner, parameters: '', shouldFail: true },
  { sender: owner, parameters: '-quote -tags', shouldFail: true },
  { sender: owner, parameters: '-quote         -tags             ', shouldFail: true },
  { sender: owner, parameters: '-quote -tags lorem ipsum', shouldFail: true },
  { sender: owner, parameters: '-tags -quote', shouldFail: true },
  { sender: owner, parameters: '-tags lorem ipsum -quote', shouldFail: true },
  { sender: owner, parameters: '-tags Lorem Ipsum Dolor', shouldFail: true },
  { sender: owner, parameters: '-quote Lorem Ipsum Dolor', quote: 'Lorem Ipsum Dolor', tags: 'general', shouldFail: false },
  { sender: owner, parameters: '-quote Lorem Ipsum Dolor -tags lorem', quote: 'Lorem Ipsum Dolor', tags: 'lorem', shouldFail: false },
  { sender: owner, parameters: '-quote Lorem Ipsum Dolor -tags lorem ipsum', quote: 'Lorem Ipsum Dolor', tags: 'lorem ipsum', shouldFail: false },
  { sender: owner, parameters: ' -tags lorem ipsum, dolor sit -quote Lorem Ipsum Dolor', quote: 'Lorem Ipsum Dolor', tags: 'lorem ipsum, dolor sit', shouldFail: false },
];

describe('Quotes - add()', () => {
  for (const test of tests) {
    describe(test.parameters, async () => {
      let id = null;
      before(async () => {
        await db.cleanup();
        await message.prepare();
      });

      it('Run !quote add', async () => {
        const quote = await quotes.add({ sender: test.sender, parameters: test.parameters, command: '!quote add' });
        id = quote.id;
      });
      if (test.shouldFail) {
        it('Should throw error', async () => {
          await message.isSent('systems.quotes.add.error', owner, { command: '!quote add' });
        });
        it('Database should be empty', async () => {
          const items = await getManager()
            .createQueryBuilder()
            .select('quotes')
            .from(Quotes, 'quotes')
            .getMany();
          assert(items.length === 0);
        });
      } else {
        it('Should sent success message', async () => {
          await message.isSent('systems.quotes.add.ok', owner, { tags: test.tags, quote: test.quote, id });
        });
        it('Database should contain new quote', async () => {
          const items = await getManager()
            .createQueryBuilder()
            .select('quotes')
            .from(Quotes, 'quotes')
            .getMany();
          assert(items.length > 0);
        });
      }
    });
  }
});
