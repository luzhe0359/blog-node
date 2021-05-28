const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', async (req, res, next) => {
  console.log('111');
  res.send('web express start success ...')
});

module.exports = router;
