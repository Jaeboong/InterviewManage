const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/signup', userController.signup.bind(userController));
router.post('/login', userController.login.bind(userController));
router.post('/logout', userController.logout.bind(userController));

module.exports = router; 