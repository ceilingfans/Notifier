function roundToTwo(num) {
  return +(Math.round(num + "e+2")  + "e-2");
}

const Notifier = require('../../util/schemas/NotifySchema');
const {Mojang} = require('../../util/wrapper');

module.exports = {
  minArgs: 1,
  maxArgs: 20,
  ownerOnly: true,
  expectedArgs: '<username> | <username> <username>...',
  callback: async ({message, args}) => {
    const msg = await message.channel.send(`This should take around ${roundToTwo(args.length * 0.194)}s`);
    const nameRegex = new RegExp(/^\w{3,16}$/i);
    const M = new Mojang();
    let returnedMessage = '';

    for (const player of args) {
      if (!player.match(nameRegex)) {
       returnedMessage += `\`${player}\` is not a valid username.\n`;
       continue;
      }

      const {success, data} = await M.getUuid(player);
      if (!success) {
        returnedMessage += `\`${player}\` is not a valid player.\n`;
        continue;
      }

      const {name, id} = data;
      const deleteData = await Notifier.deleteOne({uuid: id});
      if (deleteData.deletedCount === 0) {
        returnedMessage += `\`${name}\` is not being tracked.\n`;
        continue;
      }

      returnedMessage += `\`${name}\` has been removed from the Notifier.\n`;
    }

    message.channel.send(returnedMessage)
  }
}