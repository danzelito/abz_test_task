const router = require('express').Router();
const { getPositions } = require('../controllers/positionController')



router.get('/', getPositions);



module.exports = router