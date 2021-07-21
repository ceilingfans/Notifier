function roundToTwo(num) {
  return +(Math.round(num + "e+2")  + "e-2");
}

const {hypixelKey} = require('../../auth');
const {Hypixel, Mojang} = require('../../util/wrapper');
const Notifier = require('../../util/schemas/NotifySchema');
module.exports = {
  minArgs: 1,
  maxArgs: 20,
  expectedArgs: '...<username>',
  callback: async ({message, args}) => {
    const nameRegex = new RegExp(/^\w{3,16}$/i);
    let returnedMessage = '';

    const msg = await message.channel.send(`This should take around ${roundToTwo(args.length * 0.194)}s`);

    for (const player of args) {
      if (player === '') {
        continue;
      }
      if (!player.match(nameRegex)) {
        returnedMessage += `\`${player}\` is not a valid IGN.\n`;
        continue;
      }

      const M = new Mojang();
      const H = new Hypixel(hypixelKey);

      const {data, success} = await M.getUuid(player);
      if (!success) {
        returnedMessage += `\`${player}\` is not a valid player!\n`;
        continue;
      }
      const {id, name} = data;

      const results = await Notifier.find({uuid: id});
      const actualResult = results.length === 0 ? null : results;
      if (actualResult) {
        returnedMessage += `\`${name}\` has already been added.\n`;
        continue;
      }
      const {data: HData, success: HSuccess} = await H.getBedwars(id);
      if (!HSuccess) {
        returnedMessage += `\`${name}\` has no stats.\n`;
        continue;
      }

      await new Notifier(HData).save();
      returnedMessage += `Added \`${name}\` to the Notifier.\n`;

    }

    msg.edit(returnedMessage);

  }
}