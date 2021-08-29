const User = require('../models/user');

// Handle index actions
exports.index = (req, res) => {
  User.get((err, users) => {
    if (err) {
      res.json({
        status: 'error',
        message: err,
      });
    } else {
      console.log('OK', users);
    }
    res.json({
      status: 'success',
      message: 'users retrieved successfully',
      data: users
    });
  });
};

// Handle view user info
exports.view = (req, res) => {
  User.findById(req.params.user_id, (err, user) => {
    if (err) {
      res.send(err);
    }
    else {
      res.json({
        message: 'User details loading..',
        data: user
      });
    }
  });
};

// Handle update user info
exports.update = (req, res) => {
  User.findById(req.params.user_id, (err, user) => {
    if (err) {
      res.send(err);
    }
    for (let key in req.body) {
      user[key] = req.body[key];
    }
    // save the user and check for errors
    user.save((err) => {
      if (err) {
        res.json(err);
      } else {
        res.json({
            message: 'user Info updated',
            data: user
        });
      }
    });
  });
};

exports.findUser = (id) => {
  return new Promise((resolve, reject) => {
    User.findById(id, (error, data) => {
      if(error) {
        resolve({notFound: 'empty'});
      }
      resolve(data);
    });
  })
}

// Handle delete user
exports.delete = (req, res) => {
  User.remove({
    _id: req.params.user_id
  }, (err, user) => {
    if (err) {
        res.send(err);
    } else {
      res.json({
        status: 'success',
        message: 'user deleted'
      });
    }
  });
};

exports.isAdmin = async (userParam) => {
  if (userParam === undefined) return false; 
  else {
    const user = await User.findOne({_id: userParam._id});
    return (user && user.role === 'admin');
  }
}