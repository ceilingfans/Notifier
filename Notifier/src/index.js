Object.defineProperty(Array.prototype, 'chunk', {
  /**
   *  Returns an array of arrays
   * @param {Number} chunkSize Size of each chunk
   * @returns {*[]}
   */
  value: function(chunkSize) {
    var array = this;
    return [].concat.apply([],
      array.map(function(elem, i) {
        return i % chunkSize ? [] : [array.slice(i, i + chunkSize)];
      })
    ); // Code From:
  }    // https://stackoverflow.com/questions/8495687/split-array-into-chunks
});

/**
 * JavaScript equivalent of time.sleep() in python
 * @param {Number} ms Time in miliseconds to sleep
 * @returns {Promise<unknown>}
 */
async function sleep(ms) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}
// Code From:
// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep

const Discord = require('discord.js');
const Wok = require('wokcommands');
const chalk = require('chalk');
const fs = require('fs');
const DataFrame = require('dataframe-js').DataFrame;

const Notifier = require('./util/schemas/NotifySchema');
const {token, mongouri, hypixelKey} = require('./auth');
const {Hypixel} = require('./util/wrapper');

/* Discord Client */
const client = new Discord.Client({
  allowedMentions: {
    parse: ['users']
  }
});
client.login(token);

/* Ready */
client.on('ready', () => {

  Notifier.find()
    .then(results => {
      const len = results.length;

      client.user.setPresence({
        status: 'dnd',
        afk: true,
        activity: {
          name: `${len} Players!`,
          type: 'WATCHING'
        }
      });

    });

  new Wok(client, {
    commandsDir: 'commands',
    showWarns: false
  })
    .setDefaultPrefix('n.')
    .setMongoPath(mongouri)
    .setBotOwner(['624904212043661312', '300491735128342538', '851966362447249408']);

  console.log(chalk.greenBright('Ready'));

});

client.on('ready', async () => {
  /* Channels */
  const notifierChannel = client.channels.cache.find(c => c.id === '859788819578617897');
  const alertChannel = client.channels.cache.find(c => c.id === '860760065925185537');

  /* Lists */

  /* Wrapper */
  const H = new Hypixel(hypixelKey);

  setInterval(async () => {
    const notifierResults = await Notifier.find();
    const newData = [];

    /* Parse Results */
    for (const result of notifierResults) {

      const {
        uuid
      } = result;
      const {data} = await H.getBedwars(uuid);
      const {
        online,
        username: Name,
        soloWinstreak: Solo,
        doublesWinstreak: Doubles,
        threesWinstreak: Threes,
        foursWinstreak: Fours,
        _4v4Winstreak: FourVFour,
      } = data;

      newData.push({
        online,
        Name,
        Solo,
        Doubles,
        Threes,
        Fours,
        FourVFour,
      });

      /* Update DB */
      await Notifier.findOneAndUpdate(
        {uuid: uuid},
        {$set: data},
        (err, res) => {}
      );

      await sleep(1000);
    }

    /* Notifier Channel (#notifier) */
    await notifierChannel.bulkDelete(100);
    const df = new DataFrame(
      newData,
      ['Name', 'Solo', 'Doubles', 'Threes', 'Fours', 'FourVFour']
    );

    const table = df.show(newData.length, true);
    fs.writeFileSync('notifyDataframe.txt', table);

    const dataframeFile = new Discord.MessageAttachment('./notifyDataframe.txt');
    await notifierChannel.send('Notifier List:', dataframeFile);

    /* Notifier Alert Channel (#notifier-alerts) */
    await alertChannel.bulkDelete(100);
    // Counts
    let index = 0;
    let _4v4Index = 0;
    // Lists
    const _4v4List = [];
    const list = [];

    for (const data of newData) {
      const {
        online,
        Name,
        Solo,
        Doubles,
        Threes,
        Fours,
        FourVFour,
      } = data;

      const parsedData = {
        username: Name,
        winstreaks: {
          Solo, Doubles, Threes, Fours,
        },
        winstreaksList: [
          Solo, Doubles, Threes, Fours,
        ],
        _4v4: FourVFour,
      };

      if (parsedData._4v4 > 399) {
        ++_4v4Index;
        _4v4List.push(`${_4v4Index}. ${parsedData.username} | (4v4: ${parsedData._4v4}) | ${online ? 'Online' : 'Offline'}`);
      }

      if (parsedData.winstreaksList.some(ws => ws > 99)) {
        ++index;
        let trackerMessage = `${index}. ${parsedData.username} | (`;
        for (const key in parsedData.winstreaks) {
          const data = parsedData.winstreaks[key];

          if (data > 99) {
            trackerMessage += `${key}: ${data} `;
          }
        }

        const formatted = `${trackerMessage.slice(0, -1)}) | ${online ? 'Online' : 'Offline'}`;
        list.push(formatted);
      }

    }

    const chunkedList = list.chunk(40);
    const chunked4v4List = _4v4List.chunk(40);

    for (const subList of chunkedList) {
      await alertChannel.send('```' + subList.join('\n') + '```');
    }
    for (const subList of chunked4v4List) {
      await alertChannel.send('```' + subList.join('\n') + '```');
    }

    await alertChannel.send(`||<@&859799350681927693>||\nWinstreak Data:\n\tPlayers with ≥ 100 Winstreak: ${list.length}\n\tPlayers with ≥ 400 4v4 Winstreak: ${_4v4List.length}`);
    await client.user.setPresence({
      status: 'dnd',
      afk: true,
      activity: {
        name: `over ${newData.length} players`,
        type: 'WATCHING'
      }
    });


  }, 60 * 60 * 1000 /* 1 Hour Timeout */);

});