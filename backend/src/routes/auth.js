const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const rateLimit = require("express-rate-limit");
const User = require("../models/User");
const { protect } = require("../middleware/auth");

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10, message: { success: false, message: "Too many auth attempts" } });

const signToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
const signRefresh = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d" });

// POST /api/v1/auth/register
router.post("/register", limiter, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) return res.status(400).json({ success: false, message: "All fields are required" });
    if (password.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ success: false, message: "Email already registered" });
    const user = await User.create({ name, email, password });
    const accessToken = signToken(user._id);
    const refreshToken = signRefresh(user._id);
    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });
    res.status(201).json({ success: true, message: "Account created", data: { user, accessToken, refreshToken } });
  } catch (e) { next(e); }
});

// POST /api/v1/auth/login
router.post("/login", limiter, async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ success: false, message: "Email and password required" });
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid email or password" });
    }
    const accessToken = signToken(user._id);
    const refreshToken = signRefresh(user._id);
    user.refreshToken = refreshToken;
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, message: "Login successful", data: { user, accessToken, refreshToken } });
  } catch (e) { next(e); }
});

// POST /api/v1/auth/refresh
router.post("/refresh", async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) return res.status(401).json({ success: false, message: "Refresh token required" });
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(decoded.id).select("+refreshToken");
    if (!user || user.refreshToken !== refreshToken) {
      return res.status(401).json({ success: false, message: "Invalid refresh token" });
    }
    const accessToken = signToken(user._id);
    const newRefresh = signRefresh(user._id);
    user.refreshToken = newRefresh;
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, data: { accessToken, refreshToken: newRefresh } });
  } catch (e) { next(e); }
});

// POST /api/v1/auth/logout
router.post("/logout", protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { refreshToken: null });
    res.json({ success: true, message: "Logged out" });
  } catch (e) { next(e); }
});

// GET /api/v1/auth/me
router.get("/me", protect, (req, res) => res.json({ success: true, data: { user: req.user } }));

module.exports = router;
