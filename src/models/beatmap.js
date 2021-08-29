const mongoose = require('mongoose');

const beatmapSchema = mongoose.Schema({
  title: String,
  orgID: String,
  artist: String,
  source: String,
  tags: String,
  difficulties: [{
    type: Object
  }],
  audioFilename: String,
  backgroundFilename: String,
  upload_date: {
    type: Date,
    default: Date.now
  }
});

beatmapSchema.statics.findOrCreate = function findOrCreate(condition, data, callback) {
  const self = this;
  self.findOne(condition, (err, result) => {
    return result ? callback(err, result) : self.create(data, (err, result) => { return callback(err, result) })
  });
}

const Beatmap = module.exports = mongoose.model('beatmap', beatmapSchema);
module.exports.get = function (callback, limit) {
  Beatmap.find(callback).limit(limit);
}