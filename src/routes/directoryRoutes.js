const express = require('express');
const router = express.Router();
const directoryController = require('../controllers/directoryController');
const authMiddleware = require('../middlewares/auth');

router.get('/', authMiddleware, directoryController.getDirectoryTree);

module.exports = router; 