const userController = require('../controllers/user');

exports.requireAuth = function(req, res, next) {
  if(req.isAuthenticated()) {
    next();
  } else {
    res.status(401).json({
      message: 'Unauthorized.',
    });
  }
};

exports.requireAdmin = async (req, res, next) => {
  const isAdmin = await userController.isAdmin(req.user);
  console.log(isAdmin);
  if(req.isAuthenticated() && isAdmin) {
    next();
  } else {
    res.status(401).json({
      message: 'Unauthorized.',
    });
  }
};