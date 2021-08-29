const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Setup schema
const userSchema = mongoose.Schema({
  username: {
    type: String,
    require: true
  },
  email: {
    type: String,
    require: true
  },
  password: {
    type: String,
    require: true
  },
  role: {
    type: String,
    require: true
  },
  create_date: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', async function (next) {
  const user = this;
  try {
    if (!user.isModified('password')) next();
    let hash = await bcrypt.hash(user.password, 13);
    user.password = hash;
    next();
  } catch (error) {
    console.error(error);
    next(error);
  }
});

userSchema.methods.comparePassword = async function (password) {
  try {
    let result = await bcrypt.compare(password, this.password);
    return result;
  } catch (error) {
    console.error(error);
    return false;
  }
};


userSchema.statics.findOrCreate = function findOrCreate(condition, data, callback) {
  const self = this;
  self.findOne(condition, (err, result) => {
    return result ? callback(err, result) : self.create(data, (err, result) => { return callback(err, result) })
  });
}
// Export User model
const User = module.exports = mongoose.model('user', userSchema);
module.exports.get = function (callback, limit) {
  User.find(callback).limit(limit);
}