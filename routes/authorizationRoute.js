import express from "express";
import User from "../models/userModel.js";
import { createToken } from "../lib/helpers.js";

const router = express.Router();

//POST signUp
router.post("/sign-up", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Invalid email or password");
  }
  try {
    const user = await User.signUp(email, password);
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(201).send("User created successfully");
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode).send(error.message);
  }
});

//POST logIn
router.post("/log-in", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).send("Invalid email or password");
  }
  try {
    const user = await User.logIn(email, password);
    const token = createToken(user._id);
    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.status(202).send("User logged in successfully");
  } catch (error) {
    console.error(error);
    return res.status(error.statusCode).send(error.message);
  }
});

export default router;
