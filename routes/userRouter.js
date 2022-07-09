const router = require("express").Router();
const { body } = require("express-validator");
const {
  isRegistered,
  userRegister,
  uploadUserPhoto,
  getUserById,
  getAllUsers,
} = require("../controllers/userController");

router.route("/").post(
  isRegistered,
  uploadUserPhoto,
  [
    body("email", "The email must be a valid email address")
      .isEmail()
      .isLength({ min: 2, max: 100 }),
    body("name")
      .isLength({ min: 2, max: 60 })
      .withMessage("The name must be between  2 and 60 characters inclusive"),
    body("phone")
      .isMobilePhone("uk-UA", { strictMode: true })
      .withMessage("The phone field is required. Format: +380xxxxxxxxx"),
    body("position_id").custom((value) => {
      if (!value) {
        return Promise.reject("The position id could not be empty");
      }
      return true;
    }),
  ],
  userRegister
);

router.get("/all-users", isRegistered, getAllUsers);

router.get("/:id", isRegistered, getUserById);
module.exports = router;
