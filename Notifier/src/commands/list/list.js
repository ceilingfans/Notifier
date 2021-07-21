function roundToTwo(num) {
  return +(Math.round(num + "e+2")  + "e-2");
}

async function delay(ms) {
  return await new Promise(resolve => setTimeout(resolve, ms));
}

const Notifier = require('../../util/schemas/NotifySchema');

module.exports = {
  callback: async ({message}) => {
    const results = await Notifier.find();
    const msg = await message.channel.send(`This should take around ${roundToTwo((results.length / 50) * 0.2)}s.`)
    message.channel.send('```There are ' + results.length + ' players being tracked```');
    const resultsList = [];

    for (const r of results) {
      resultsList.push(`${resultsList.length + 1}. ${r.username}`);
    }

    const subLists = resultsList.chunk(50);
    for (const subList of subLists) {
      let returnedMessage = '```prolog\n';

      returnedMessage += subList.join('\n') + '```';
      message.channel.send(returnedMessage);

      await delay(1000)
    }

    msg.delete();
  }
}