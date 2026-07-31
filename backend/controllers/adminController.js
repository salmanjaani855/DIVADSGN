import User from "../models/User.js";

export const listUsers = async (req, res, next) => {
  try {
    const users = await User.find().select("-passwordHash");
    res.status(200).json(users);
  } catch (err) {
    next(err);
  }
};
