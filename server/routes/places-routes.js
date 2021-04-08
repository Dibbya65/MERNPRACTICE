const express = require('express');
const { check } = require('express-validator');

const placesController = require('../controllers/places-controller');
const fileUpload = require('../middleware/file-upload');
const checkAuth = require('../middleware/auth');

const router = express.Router();

router.get('/', placesController.getPlaces);
router.get('/:place_id', placesController.getPlaceById);
router.get('/user/:user_id', placesController.getPlaceByUserId);

router.use(checkAuth);

router.post(
  '/',
  fileUpload.single('image'),
  [
    check('title')
      .not()
      .isEmpty()
      .trim()
      .withMessage('Title should not be empty')
      .isLength({ min: 5 })
      .trim()
      .withMessage('Title must be at least 5 chars long'),
    check('description')
      .not()
      .isEmpty()
      .withMessage('Description should not be empty')
      .isLength({ min: 5 })
      .withMessage('Description must be at maximum 50 chars long'),
    check('address')
      .not()
      .isEmpty()
      .trim()
      .withMessage('Address should not be empty'),
  ],
  placesController.createPlace
);
router.patch(
  '/:place_id',
  [
    check('title')
      .not()
      .isEmpty()
      .trim()
      .withMessage('Title should not be empty')
      .isLength({ min: 5 })
      .trim()
      .withMessage('Title must be at least 5 chars long'),
    check('description')
      .not()
      .isEmpty()
      .withMessage('Description should not be empty')
      .isLength({ min: 5 })
      .withMessage('Description must be at maximum 50 chars long'),
  ],
  placesController.updatePlace
);
router.delete('/:place_id', placesController.deletePlace);

module.exports = router;
