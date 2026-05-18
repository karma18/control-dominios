const express = require('express');
const domainController = require('../controllers/domainController');
const asyncHandler = require('../../shared/utils/asyncHandler');

const router = express.Router();

router.get('/', asyncHandler(domainController.list));
router.post('/', asyncHandler(domainController.create));
router.get('/:id', asyncHandler(domainController.getById));
router.put('/:id', asyncHandler(domainController.update));
router.delete('/:id', asyncHandler(domainController.remove));

module.exports = router;
