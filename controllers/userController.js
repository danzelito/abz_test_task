const path = require("path");
const multer = require("multer");
const tinify = require("tinify");
const User = require("../models/userModel");
const Position = require("../models/positionModel");
const { verify } = require("jsonwebtoken");
const { validationResult } = require("express-validator");

tinify.key = process.env.TINIFY_KEY;

const multerStorage = multer.memoryStorage();
const multerFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/png"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Valid extensions are only jpeg, jpg, png "), false);
  }
};

const uploadUserPhoto = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
}).single("photo");

const isRegistered = (req, res, next) => {
  const authHeader = req.get("Authorization");
  if (!authHeader) {
    const error = new Error("Token is missing");
    error.statusCode = 401;
    throw error;
  }
  const token = authHeader.split(" ")[1];
  let decodedToken;
  decodedToken = verify(token, process.env.JWT_SECRET_KEY); // TokenExpiredError, JsonWebTokenError, NotBeforeError
  if (!decodedToken) {
    const error = new Error("Not Authenticated");
    error.statusCode = 401;
    throw error;
  }
  next();
};

const userRegister = (req, res, next) => {
  console.log(req.file);
  let errorsArray
  const { email, phone } = req.body;
  const validationErrors = validationResult(req);
  const fails = {};
  validationErrors.array().forEach((error) => {
    fails[error.param] = [error.msg];
  });
  if (!req.file) {
    fails.photo = ["The photo field could  not be empty"];
  } else if (req.file) {
    const fileSize = Buffer.from(req.file.buffer);
    if (fileSize.length > 5242880) {
      fails.sizeExceeded = ["File size should not be more than 5MB"];
      errorsArray = validationErrors.array();
      errorsArray.push({msg: "File size should not be more than 5MB", param: "photo"})
    }
  }
  if (errorsArray && errorsArray.length > 0 || !validationErrors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: "Validation failed",
      fails,
    });
  }
  User.findOne({ $or: [{ email }, { phone }] })
    .then((user) => {
      if (user) {
        const error = new Error("User with this phone or email already exists");
        error.statusCode = 409;
        throw error;
      }
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}-${
        req.file.originalname
      }`;
      const sourceFile = tinify.fromBuffer(req.file.buffer);
      const resizedFile = sourceFile.resize({
        method: "cover",
        width: 70,
        height: 70,
      });
      resizedFile
        .toFile(path.join(__dirname, "..", "images/users/", uniqueSuffix))
        .then()
        .catch((error) => {
          console.log(error)
        });

      const { name, email, phone, position_id } = req.body;
      const newUser = new User({
        name,
        email,
        phone,
        position_id,
        photo: uniqueSuffix,
      });
      newUser.save().then((result) => {
        res.status(200).json({
          success: true,
          user_id: result._id,
          message: "New User Successfully Registered",
        });
      });
    })
    .catch((error) => {
      if (error.message === "jwt expired") {
        error.message = "The token expired.";
        error.statusCode = 401;
      }
      next(error);
    });
};

const getUserById = (req, res, next) => {
  let user;
  const { id } = req.params;
  User.findById({ _id: id })
    .select({ __v: 0 })
    .then((user) => {
      if (!user) {
        const error = new Error(
          "The user with the requested identifier does not exist"
        );
        error.statusCode = 404;
        throw error;
      }
      Position.findOne({ id: user.position_id })
        .then((position) => {
          res.status(200).json({
            success: true,
            user: {
              id: user._id,
              email: user.email,
              phone: user.phone,
              position: position.name,
              position_id: user.position_id,
              photo: user.photo,
            },
          });
        })
        .catch((error) => {
          next(error);
        });
    })
    .catch((error) => {
      next(error);
    });
};

const getAllUsers = (req, res, next) => {
  const page = +req.query.page || 1;
  let limit = +req.query.limit || 20;
  const skip = (page - 1) * limit;
  let total_users;
  // page=2&count=6  ==> 1-6 => page 1; 7-12 => page 2; 13-18 => page 3
  User.find({})
    .countDocuments()
    .then((count) => {
      return count;
    })
    .then((count) => {
      console.log(count)
      User.aggregate([
        {
          $sort: { position_id: 1 },
        },
      ])
        .skip(skip)
        .limit(limit)
        .then((users) => {
          res.status(200).json({
            success: true,
            page,
            total_pages: Math.ceil(count / limit),
            total_users: count,
            count: limit,
            users,
          });
        })
        .catch((error) => {
          console.log(error);
        });
    });
};

module.exports = {
  userRegister,
  uploadUserPhoto,
  getUserById,
  getAllUsers,
  isRegistered,
};
