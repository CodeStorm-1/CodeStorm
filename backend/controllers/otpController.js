import dotenv from "dotenv";
dotenv.config();
import Otp from "../models/Otp.js";
import twilio from "twilio";

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Generate OTP
export const generateOtp = async (req, res) => {
  console.log("Generating OTP");
  const { phone } = req.body;
  const code = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit OTP
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  console.log({ phone, code, expiresAt });
  const otp = await Otp.create({ phone, code, expiresAt });
  console.log(otp);

  await client.messages.create({
    body: `Your OTP code is ${code}`,
    from: process.env.TWILIO_PHONE_NUMBER,
    to: phone,
  });

  console.log("OTP sent");

  // send OTP via SMS/email here
  res.json({ message: "OTP sent", otpId: otp._id });
};

// Verify OTP
export const verifyOtp = async (req, res) => {
  const { phone, code } = req.body;
  const otp = await Otp.findOne({ phone, code, used: false });

  if (!otp) return res.status(400).json({ error: "Invalid OTP" });
  if (otp.expiresAt < new Date())
    return res.status(400).json({ error: "OTP expired" });

  otp.used = true;
  await otp.save();

  res.json({ message: "OTP verified successfully" });
};
