const express = require('express');
const catalogController = require('../controllers/catalogController');
const asyncHandler = require('../../shared/utils/asyncHandler');

const router = express.Router();

router.get('/:resource', asyncHandler(catalogController.list));
router.post('/:resource', asyncHandler(catalogController.create));
router.get('/:resource/:id', asyncHandler(catalogController.getById));
router.put('/:resource/:id', asyncHandler(catalogController.update));
router.delete('/:resource/:id', asyncHandler(catalogController.remove));

module.exports = router;
