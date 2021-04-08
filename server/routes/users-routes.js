const express = require('express');
const { check } = require('express-validator');

const usersController = require('../controllers/users-controller');
const fileUpload = require('../middleware/file-upload');

const router = express.Router();

router.get('/', usersController.getUsers);
router.post(
  '/signup',
  fileUpload.single('image'),
  [
    check('name')
      .not()
      .isEmpty()
      .trim()
      .withMessage('Name should not be empty')
      .isLength({ min: 5 })
      .trim()
      .withMessage('Name must be at least 5 chars long'),
    check('email')
      .not()
      .isEmpty()
      .trim()
      .withMessage('Email should not be empty')
      .isEmail()
      .trim()
      .withMessage('Email should be valid email'),
    check('password')
      .not()
      .isEmpty()
      .withMessage('Password should not be empty')
      .isLength({ min: 6 })
      .withMessage('Password must be minimum 6 chars'),
  ],
  usersController.singup
);
router.post('/login', usersController.login);

module.exports = router;
