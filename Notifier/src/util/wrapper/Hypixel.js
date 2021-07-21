const fetch = require('node-fetch');

class Hypixel {
  constructor(keys) {
    this.keys = keys;
    this.keysIndex = 0;
  }

  /* Util Methods */
  /**
   * Gets a key
   * @returns {Promise<String>}
   */
  async getKey() {
    ++this.keysIndex; // Increments index

    if (this.keysIndex > this.keys.length - 1) {
      this.keysIndex = 0;
    }

    return this.keys[this.keysIndex];
  }

  /**
   * Convert number to `0` number
   * @param {Number} n Number
   * @returns {Promise<*|number>}
   */
  async convertNumber (n) {
    return n ? n : 0;
  }

  /**
   * Covert string to `Default` string
   * @param {String} str String
   * @returns {Promise<*|string>}
   */
  async convertDefaultString (str) {
    return str ? str : "Default";
  }

  /* Bedwars Methods */

  /**
   * Gets bedwars information + other useful things
   * @param {String} uuid Minecraft UUID
   * @returns {Promise<void>}
   */
  async getBedwars(uuid) {
    let json = {};
    const res = await fetch(`https://api.hypixel.net/player?key=${await this.getKey()}&uuid=${uuid}`);
    const body = await res.text();

    if (res.status === 200) {
      const data = JSON.parse(body);
      const {player} = data;

      const {
        lastLogin,  //  \
        lastLogout, //   ) Get Information
        stats,      //  /
        displayname: username,
      } = player;

      if (!stats) {
        json.success = false;
        json.message = 'Player has no stats';
        return json;
      }

      const {Bedwars} = stats;

      if (!Bedwars) {
        json.success = false;
        json.message = 'Player has no Bedwars stats';
        return json;
      }

      const {
        eight_one_winstreak: soloWinstreak,
        eight_two_winstreak: doublesWinstreak,
        four_three_winstreak: threesWinstreak,
        four_four_winstreak: foursWinstreak,
        two_four_winstreak: _4v4Winstreak,
      } = Bedwars;

      json.data = {
        uuid,
        username,
        online: lastLogin > lastLogout,
        soloWinstreak: await this.convertNumber(soloWinstreak),
        doublesWinstreak: await this.convertNumber(doublesWinstreak),
        threesWinstreak: await this.convertNumber(threesWinstreak),
        foursWinstreak: await this.convertNumber(foursWinstreak),
        _4v4Winstreak: await this.convertNumber(_4v4Winstreak),
      }

      const {
        soloWinstreak: _soloWinstreak,
        doublesWinstreak: _doublesWinstreak,
        threesWinstreak: _threesWinstreak,
        foursWinstreak: _foursWinstreak,
      } = json.data;

      json.data.totalWinstreak = _soloWinstreak + _doublesWinstreak + _threesWinstreak + _foursWinstreak;
      json.success = true;

      return json;

    }
  }

  /**
   * Returns the Guild
   * @param {String} uuid Minecraft UUID
   * @returns {Promise<Object>}
   */
  async getGuild(uuid) {
    const res = await fetch(`https://api.hypixel.net/guild?key=${await this.getKey()}&player=${uuid}`)

    const body = await res.text()
    let json = {}

    if (res.status == 200) {
      json = JSON.parse(body)
    }

    return json;

  }

}

module.exports = Hypixel;