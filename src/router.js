const Router = require('express').Router;
const passport = require('passport');
const multer  = require('multer');

const upload = multer({dest: 'data/beatmaps/osz'});
const { check, validationResult } = require('express-validator');

const routesMiddleware = require('./middleware/routes');

const loginController = require('./controllers/login');
const userController = require('./controllers/user');
const beatmapController = require('./controllers/beatmap');

const router = new Router();

// Signup
router.post('/signup', [
  check('username')
    .isLength({min: 4, max: 12})
    .withMessage('username must be between 4 and 12 characters')
    .matches(/^(?=.*[A-Za-z0-9]$)[A-Za-z][A-Za-z\d.-]{0,19}$/)
    .withMessage('username must only contains letters, numbers, dot and hyphen')
    .trim(),
  check('email')
    .isEmail()
    .withMessage('invalid email address')
    .normalizeEmail(),
  check('password')
    .isLength({min: 8, max: 15})
    .withMessage('your password should have min and max length between 8-15')
    .matches(/\d/).withMessage('your password should have at least one number')
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage('your password should have at least one sepcial character'),
  check('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('confirm password does not match');
      }
      return true;
    }),
], (req, res, next) => {
  const error = validationResult(req).formatWith(({msg}) => msg);
  const hasError = !error.isEmpty();

  if (hasError) {
    res.status(422).json({error: error.array()});
  } else {
    next();
  }
}, loginController.signup);
  
// Login
router.post('/login', passport.authenticate('local', {
  failureMessage: 'Invalid username or password',
}), loginController.login);
router.route('/logout').get(loginController.logout);
router.route('/me').get(loginController.me);

// User
router.route('/users')
  .get(userController.index)
router.route('/users/:user_id')
  .get(userController.view)
  .patch(userController.update)
  .put(userController.update)
  .delete(userController.delete);

// Beatmaps
router.route('/beatmaps')
  .get(beatmapController.index)
  .post(upload.array('beatmap', 100), beatmapController.add)
  .put(routesMiddleware.requireAdmin, beatmapController.update)
  .patch(routesMiddleware.requireAdmin, beatmapController.update);
router.route('/beatmaps/:id')
  .get(beatmapController.view)
  .delete(beatmapController.delete);
router.route('/beatmaps/:org_id/file/:filename')
  .get(beatmapController.getFile);
  router.route('/beatmaps/:org_id/:diff_id')
  .get(beatmapController.getDiffData);

module.exports = router;

