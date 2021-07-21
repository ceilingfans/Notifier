const fetch = require('node-fetch');

class Mojang {
  constructor() {
  }

  /**
   *
   * @param {String} username Minecraft String
   * @returns {Promise<Object>}
   */

  async getUuid (username) {
    const res = await fetch(`https://api.mojang.com/users/profiles/minecraft/${username}`);

    const body = await res.text();
    let json = {};

    if (res.status === 200) {
      json.success = true;
      json.data = JSON.parse(body);
    } else {
      json.success = false;
      json.message = 'Invalid Player';
    }

    return json;

  }
}

module.exports = Mojang;