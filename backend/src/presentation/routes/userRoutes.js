const express = require('express');
const userController = require('../controllers/userController');
const asyncHandler = require('../../shared/utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(userController.list));
router.post('/', asyncHandler(userController.create));
router.get('/:id', asyncHandler(userController.getById));
router.put('/:id', asyncHandler(userController.update));
router.delete('/:id', asyncHandler(userController.remove));

module.exports = router;
