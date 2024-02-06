import { Schema, model } from "mongoose";
import { isStrongPassword } from "validator";
import isEmail from "validator/lib/isEmail";
import { comparePassword, hashPassword } from "../lib/helpers";

const schema = new Schema({
  email: {
    type: String,
    required: true,
    trim: true,
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
});

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

const User = model("User", schema);

export default User;
