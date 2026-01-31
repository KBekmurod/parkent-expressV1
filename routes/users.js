const express = require('express');
const {
  getProfile,
  updateProfile,
  deleteProfile
} = require('../controllers/userController');
const { protect } = require('../middlewares/auth');

const router = express.Router();

router.use(protect);

router.route('/profile')
  .get(getProfile)
  .put(updateProfile)
  .delete(deleteProfile);

module.exports = router;
