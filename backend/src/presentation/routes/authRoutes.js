const express = require('express');
const authController = require('../controllers/authController');
const authenticate = require('../middlewares/authenticate');
const asyncHandler = require('../../shared/utils/asyncHandler');

const router = express.Router();

router.post('/login', asyncHandler(authController.login));
router.get('/me', authenticate, asyncHandler(authController.me));

module.exports = router;
