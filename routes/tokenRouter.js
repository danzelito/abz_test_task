const router = require("express").Router();

const { getToken } = require("../controllers/tokenController");


router.use("/", getToken);

module.exports = router;
