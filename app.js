const express = require("express");
require("dotenv").config();
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");

const tokenRouter = require("./routes/tokenRouter");
const userRouter = require("./routes/userRouter");
const positionRouter = require("./routes/positionRouter");

const app = express();

const uri = process.env.MONGO_DB_URI.replace(
  "<password>",
  process.env.MONGO_PASSWORD
);

app.use(cookieParser());
app.use(morgan("dev"));
app.use(express.static("images/users"));
app.use(express.urlencoded({ extended: true }));
app.use(express.json({ limit: "50kb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Alow-Methods", [
    "GET",
    "POST",
    "OPTIONS",
    "HEAD",
  ]);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use("/api/v1/token", tokenRouter);
app.use("/api/v1/users", userRouter);
app.use("/api/v1/positions", positionRouter);

app.use((error, req, res, next) => {
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({
    success: false,
    message,
  });
});
mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
    const port = process.env.PORT || 3000;
    app.listen(port);
  })
  .catch((error) => {
    console.log(error);
  });
