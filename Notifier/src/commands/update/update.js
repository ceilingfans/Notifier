const Notifier = require('../../util/schemas/NotifySchema');

module.exports = {
  ownerOnly: true,
  callback: async ({client, message}) => {
    const results = await Notifier.find();

    const count = results.length;
    await client.user.setPresence({
      status: 'dnd',
      afk: true,
      activity: {
        name: `${count} players!`,
        type: 'WATCHING'
      }
    });

    message.channel.send(`Updated the presence of the Notifier\nThere are currently ${count} players being tracked.`)
  }
}