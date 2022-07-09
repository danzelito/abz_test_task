const mongoose = require("mongoose");
const { faker } = require("@faker-js/faker");
const dotenv = require("dotenv");
dotenv.config({ path: ".env" });
const User = require("../models/userModel");
const Position = require("../models/positionModel");

const URL = process.env.MONGO_DB_URI.replace(
  "<password>",
  process.env.MONGO_PASSWORD
);

mongoose
  .connect(URL)
  .then(() => {
    console.log("Connected To MongoDB");
  })
  .catch((error) => {
    console.log(error);
  });

async function deleteUserData() {
  try {
    await User.deleteMany({});
    console.log("Data Successfully Deleted");
  } catch (error) {
    console.log(error);
  }
  await mongoose.connection.close();
  console.log("Connection to MongoDB Closed");
}

async function importUserData() {
  let users = [];
  try {
    for (let i = 0; i < 45; i += 1) {
      const user = new User({
        name: faker.name.findName(),
        email: faker.internet.email(),
        phone: faker.phone.number("+38(0##)-###-##-##"),
        position_id: Math.ceil(Math.random() * 4),
        photo: faker.image.people(1234, 2345, true),
      });
      users.push(user.save());
    }
    return Promise.all(users);
  } catch (error) {
    console.log(error);
  }
  await mongoose.connection.close();
  console.log("Connection to MongoDB Closed");
}

async function importPositionData() {
  let positions = [];
  try {
    for (let i = 0; i < 4; i += 1) {
      const position = new Position({
        id: Math.ceil(Math.random() * 4),
        name: faker.name.jobType(),
      });
      positions.push(position.save());
    }
    return Promise.all(positions);
  } catch (error) {
    console.log(error);
  }
}

async function deletePositionData() {
  try {
    await Position.deleteMany({});
    console.log("Data Successfully Deleted");
  } catch (error) {
    console.log(error);
  }
  await mongoose.connection.close();
  console.log("Connection to MongoDB Closed");
}

if (process.argv[2] === "--deleteUserData") {
  deleteUserData();
}
if (process.argv[2] === "--importUserData") {
  importUserData()
    .then(() => {
      console.log("Data Successfully Loaded");
      return mongoose.connection.close();
    })
    .then(() => {
      console.log("Connection to MongoDB Closed");
    })
    .catch((error) => {
      console.log(error);
    });
}

if (process.argv[2] === "--deletePositionData") {
  deletePositionData();
}

if (process.argv[2] === "--importPositionData") {
  importPositionData()
    .then(() => {
      console.log("Data Successfully Loaded");
      return mongoose.connection.close();
    })
    .then(() => {
      console.log("Connection to MongoDB Closed");
    })
    .catch((error) => {
      console.log(error);
    });
}
