import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Secret for JWT
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const signup = async (req, res) => {
  try {
    const { name, phone, email, password } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ phone });
    if (existingUser)
      return res.status(400).json({ error: "User already exists" });

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      phone,
      email,
      password: hashedPassword,
    });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });

    res.status(201).json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "Invalid credentials" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    // Generate JWT
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "30d" });

    // Convert Mongoose document → plain object
    const userObj = user.toObject();
    delete userObj.password;

    res.json({ user: userObj, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
