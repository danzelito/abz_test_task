const Position = require("../models/positionModel");

const getPositions = (req, res, next) => {
  Position.find({})
    .select({ id: 1, name: 1, _id:0 })
    .then((positions) => {
      res.status(200).json({
        succes: true,
        positions,
      });
    })
    .catch((error) => {
      console.log(error);
    });
};

module.exports = { getPositions };
