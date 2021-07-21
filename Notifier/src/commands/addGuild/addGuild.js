const {Hypixel, Mojang} = require('../../util/wrapper');
const Notifier = require('../../util/schemas/NotifySchema');
const {hypixelKey} = require('../../auth');

const M = new Mojang();
const H = new Hypixel(hypixelKey);

const nameRegex = new RegExp(/^\w{3,16}$/i);

module.exports = {
  ownerOnly: true,
  globalCooldown: "2m",
  callback: async ({client, message, args}) => {
    message.channel.send('This might take a while...');
    const addList = [];

    const [player] = args;
    if (!player.match(nameRegex)) return message.channel.send(`\`${player}\` is not a valid IGN!`);

    const {data: mData, success: mSuccess} = await M.getUuid(player);
    if (!mSuccess) return message.channel.send(`\`${player}\` is not a valid player.`);

    const {id, name} = mData;
    const {success, guild} = await H.getGuild(id);
    if (!guild) return message.channel.send(`\`${name}\` is not in a guild.`);
    console.log(guild);

    const {members} = guild;
    for (const member of members) {
      const {uuid} = member;

      const results = await Notifier.find({uuid: uuid});
      const actualResults = results.length === 0 ? null : results;

      if (actualResults) continue;
      const {data, success} = await H.getBedwars(uuid);

      if (!success) continue;
      const {username} = data;

      await new Notifier(data).save();
      addList.push(`Added \`${username}\` to the Notifier.`);
    }

    const subListedAddList = addList.chunk(50);
    for (const subList of subListedAddList) {
      message.channel.send(subList.join('\n'));
    }

    const toBeLen = await Notifier.find();
    const count = toBeLen.length;

    await client.user.setPresence({
      status: 'dnd',
      afk: true,
      activity: {
        name: `${count} players!`,
        type: 'WATCHING'
      }
    });

  }
}
