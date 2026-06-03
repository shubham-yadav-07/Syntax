const express = require("express");
const router = express.Router();
const Analysis = require("../models/Analysis");
const { protect } = require("../middleware/auth");

router.get("/:analysisId", protect, async (req, res, next) => {
  try {
    const a = await Analysis.findOne({ _id: req.params.analysisId, userId: req.user._id, status: "completed" })
      .select("suggestions complexity language filename");
    if (!a) return res.status(404).json({ success: false, message: "Analysis not found" });
    res.json({ success: true, data: { suggestions: a.suggestions || [], complexity: a.complexity, filename: a.filename, language: a.language } });
  } catch (e) { next(e); }
});

module.exports = router;
