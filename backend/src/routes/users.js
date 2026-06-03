const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect } = require("../middleware/auth");

router.get("/profile", protect, (req, res) => res.json({ success: true, data: { user: req.user } }));

router.patch("/profile", protect, async (req, res, next) => {
  try {
    const { name, bio, avatar } = req.body;
    const updates = {};
    if (name !== undefined) updates.name = name;
    if (bio !== undefined) updates.bio = bio;
    if (avatar !== undefined) updates.avatar = avatar;
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: "Profile updated", data: { user } });
  } catch (e) { next(e); }
});

router.patch("/preferences", protect, async (req, res, next) => {
  try {
    const updates = {};
    const { defaultLanguage, theme, editorFontSize, notifications } = req.body;
    if (defaultLanguage) updates["preferences.defaultLanguage"] = defaultLanguage;
    if (theme) updates["preferences.theme"] = theme;
    if (editorFontSize) updates["preferences.editorFontSize"] = editorFontSize;
    if (notifications && typeof notifications === "object") {
      Object.keys(notifications).forEach((k) => {
        updates["preferences.notifications." + k] = notifications[k];
      });
    }
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true });
    res.json({ success: true, message: "Preferences updated", data: { user } });
  } catch (e) { next(e); }
});

router.patch("/password", protect, async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ success: false, message: "Both passwords required" });
    if (newPassword.length < 8) return res.status(400).json({ success: false, message: "Password must be at least 8 characters" });
    const user = await User.findById(req.user._id).select("+password");
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: "Current password is incorrect" });
    }
    user.password = newPassword;
    await user.save();
    res.json({ success: true, message: "Password updated" });
  } catch (e) { next(e); }
});

router.delete("/account", protect, async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user._id, { isActive: false });
    res.json({ success: true, message: "Account deactivated" });
  } catch (e) { next(e); }
});

module.exports = router;
