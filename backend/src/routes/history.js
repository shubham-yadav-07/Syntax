const express = require("express");
const router = express.Router();
const Analysis = require("../models/Analysis");
const { protect } = require("../middleware/auth");

router.get("/", protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, language, search } = req.query;
    const query = { userId: req.user._id, status: "completed" };
    if (language) query.language = language;
    if (search) query.filename = { $regex: search, $options: "i" };
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [analyses, total] = await Promise.all([
      Analysis.find(query).select("filename language complexity overallScore createdAt status analysisTime")
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Analysis.countDocuments(query),
    ]);
    res.json({ success: true, data: { analyses, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (e) { next(e); }
});

router.get("/recent", protect, async (req, res, next) => {
  try {
    const analyses = await Analysis.find({ userId: req.user._id })
      .select("filename language createdAt status").sort({ createdAt: -1 }).limit(5).lean();
    res.json({ success: true, data: { analyses } });
  } catch (e) { next(e); }
});

module.exports = router;
