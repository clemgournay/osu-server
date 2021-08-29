const User = require('../models/user');

exports.login = (req, res) => {
  return res.status(200).json({msg: 'user sucessfully logged in'});
};

exports.signup = async (req, res) => {
  const { email, name, password } = req.body;
  try {
    let user = await User.findOne({email});
    if (!user) {
      let newUser = new User({name, email, password});
      await newUser.save();
      return res.status(200).json({msg: 'user successfully created'});
    }
    return res
      .status(422)
      .json({errors: ['the user with this email already exists']});
  } catch (error) {
    console.error(error);

    return res.status(500).json({errors: ['some error occured']});
  }
};

exports.logout = (req, res) => {
  req.logout();
  res.status(200).json({msg: 'logged out'});
};

exports.me = (req, res) => {
  if (!req.user)
    return res.status(403).json({errors: ['login to get the info']});

  return res.status(200).json({user: req.user});
};
