const { sign } = require("jsonwebtoken");

const getToken = (req, res, next) => {
  console.log(req.cookies)
  const token = sign(
    {
      user: "Public User",
      data: "Token For Registration",
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: "60m" }
  );

  res.status(200).json({
    success: true,
    token,
  });
};


module.exports = { getToken }