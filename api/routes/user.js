const express = require('express');
const router = express.Router();

const userController = require('../controllers/users');
const checkAuth = require('../middleware/check-auth');

router.post('/signup', userController.user_signup);
router.post('/login', userController.user_login);
router.delete('/:username', checkAuth, userController.user_delete);
router.post('/forgot', userController.sendEmail);
router.get('/:username', checkAuth, userController.user_get_one);

module.exports = router;