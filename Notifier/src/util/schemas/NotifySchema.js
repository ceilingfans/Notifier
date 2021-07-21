const mongoose = require('mongoose');

const reqNumber = {
  type: Number,
  required: true,
};

const reqString = {
  type: String,
  required: true,
};

const reqBoolean = {
  type: Boolean,
  required: true
};

const Schema = new mongoose.Schema(
  {
    /* Information */
    username: reqString,
    uuid: reqString,
    online: reqBoolean,
    /* Winstreaks */
    soloWinstreak: reqNumber,
    doublesWinstreak: reqNumber,
    threesWinstreak: reqNumber,
    foursWinstreak: reqNumber,
    _4v4Winstreak: reqNumber,
    totalWinstreak: reqNumber,
  }
);

const name = 'notifier';
module.exports = mongoose.model[name] || mongoose.model(name, Schema, name);