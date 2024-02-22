import { Schema, SchemaTypes, model } from "mongoose";
import validator from "validator";
import isEmail from "validator/lib/isEmail.js";
import { comparePassword, hashPassword } from "../lib/helpers.js";
const { isStrongPassword } = validator;

const schema = new Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    user_type: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    favorites: {
      type: [SchemaTypes.ObjectId],
      ref: "Creature",
      default: null,
    },
  },
  { timestamps: true }
);

//Sign Up static with multiple validation and check
schema.statics.signUp = async function (email, password) {
  if (!isEmail(email)) {
    throw new Error("Enter a valid email");
  }
  if (
    !isStrongPassword(password, {
      minLength: 10,
      minLowercase: 1,
      minNumbers: 1,
      minSymbols: 1,
      minUppercase: 1,
    })
  ) {
    throw new Error("Password not strong enough");
  }
  const emailExists = await this.exists({ email });
  if (emailExists) {
    throw new Error("Email already in use");
  }
  const hashedPassword = await hashPassword(password);
  const user = await this.create({ email, password: hashedPassword });
  return user;
};

schema.statics.logIn = async function (email, password) {
  const user = await this.findOne({ email });
  if (!user) {
    throw new Error("Incorrect email or password");
  }
  const validPassword = await comparePassword(password, user.password);
  if (!validPassword) {
    throw new Error("Incorrect email or password");
  }
  return user;
};

schema.methods.removeFavorite = async function (creatureId) {
  const favorites = this.favorites.map((f) => f.toString());
  if (favorites.includes(creatureId)) {
    favorites.splice(favorites.indexOf(creatureId), 1);
    this.favorites = favorites;
    await this.save();
  }
};

schema.methods.resUser = function () {
  const user = this.toObject();
  delete user.password;
  delete user.__v;
  return user;
};

const User = model("User", schema);

export default User;
