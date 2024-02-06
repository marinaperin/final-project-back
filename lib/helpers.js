import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import dotenv from "dotenv";
dotenv.config();

const { PEPPER_KEY, SECRET_KEY } = process.env;

//Function to hash password to protect it
export const hashPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = bcrypt.hash(password + PEPPER_KEY, salt);
  return hashedPassword;
};

//Function to compare password given and saved password
export const comparePassword = async (password, hashedPassword) => {
  const isValid = await bcrypt.compare(password + PEPPER_KEY, hashedPassword);
  return isValid;
};

//Function to create token
export const createToken = (_id) => {
  const token = jwt.sign({ _id }, SECRET_KEY, { expiresIn: "7d" });
  return token;
};

//Function to check if token is valid
export const checkToken = (token) => {
  const { _id } = jwt.verify(token, SECRET_KEY);
  return _id;
};

