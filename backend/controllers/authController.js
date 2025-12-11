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

// --- NEW FUNCTION: changePassword ---
export const changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;
    const userId = req.userId; // Extracted from JWT by the 'protect' middleware

    if (!newPassword || newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "New password must be at least 6 characters." });
    }

    // 1. Find the user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // 2. Verify Old Password
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Incorrect old password." });
    }

    // 3. Hash the New Password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update the password and save
    user.password = hashedNewPassword;
    await user.save();

    res.status(200).json({ message: "Password updated successfully." });
  } catch (err) {
    console.error("Change Password Error:", err);
    res.status(500).json({ error: "Failed to update password." });
  }
};
