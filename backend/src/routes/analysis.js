const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const axios = require("axios");
const Analysis = require("../models/Analysis");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const logger = require("../utils/logger");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = [".js",".ts",".py",".cpp",".cc",".java",".c",".go"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("File type not supported"));
  },
});

const LANG_MAP = {
  javascript:"javascript", js:"javascript", typescript:"javascript",
  python:"python", py:"python",
  "c++":"cpp", cpp:"cpp",
  java:"java",
  c:"c",
  go:"go", golang:"go",
};

const normalize = (lang) => LANG_MAP[(lang || "").toLowerCase()] || "javascript";

const callAI = async (code, language, id) => {
  const url = (process.env.AI_ENGINE_URL || "http://localhost:8000") + "/analyze";
  const res = await axios.post(url, { code, language, analysis_id: String(id) }, { timeout: 60000 });
  return res.data;
};

const updateUserStats = async (userId) => {
  try {
    const all = await Analysis.find({ userId, status: "completed" }).select("overallScore");
    const total = all.length;
    const avg = total > 0 ? all.reduce((s, a) => s + (a.overallScore || 0), 0) / total : 0;
    const optimized = all.filter((a) => (a.overallScore || 0) >= 80).length;
    await User.findByIdAndUpdate(userId, {
      "stats.totalAnalyses": total,
      "stats.averageScore": Math.round(avg * 10) / 10,
      "stats.optimizationRate": total > 0 ? Math.round((optimized / total) * 100) : 0,
    });
  } catch (e) { logger.error("Stats update failed: " + e.message); }
};

// POST /api/v1/analysis/submit
router.post("/submit", protect, async (req, res, next) => {
  try {
    const { code, language, filename } = req.body;
    if (!code || !code.trim()) return res.status(400).json({ success: false, message: "Code is required" });
    if (!language) return res.status(400).json({ success: false, message: "Language is required" });

    const lang = normalize(language);
    const analysis = await Analysis.create({
      userId: req.user._id, code, language: lang,
      filename: filename || "untitled." + lang, status: "analyzing",
    });

    res.status(202).json({ success: true, message: "Analysis started", data: { analysisId: analysis._id, status: "analyzing" } });

    setImmediate(async () => {
      try {
        const start = Date.now();
        const result = await callAI(code, lang, analysis._id);
        await Analysis.findByIdAndUpdate(analysis._id, {
          status: "completed",
          complexity: result.complexity,
          stats: result.stats,
          patterns: result.patterns,
          explanations: result.explanations,
          dryRun: result.dry_run,
          complexityBreakdown: result.complexity_breakdown,
          suggestions: result.suggestions,
          alternatives: result.alternatives,
          visualizationData: result.visualization_data,
          overallScore: result.overall_score,
          aiEngineVersion: result.engine_version,
          analysisTime: Date.now() - start,
        });
        await updateUserStats(req.user._id);
        logger.info("Analysis " + analysis._id + " completed in " + (Date.now() - start) + "ms");
      } catch (err) {
        logger.error("AI engine error: " + err.message);
        await Analysis.findByIdAndUpdate(analysis._id, { status: "failed", errorMessage: err.message });
      }
    });
  } catch (e) { next(e); }
});

// POST /api/v1/analysis/upload
router.post("/upload", protect, upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: "No file uploaded" });
    const extLangMap = { ".js":"javascript",".ts":"javascript",".py":"python",".cpp":"cpp",".cc":"cpp",".java":"java",".c":"c",".go":"go" };
    const ext = path.extname(req.file.originalname).toLowerCase();
    const lang = extLangMap[ext] || "javascript";
    const code = req.file.buffer.toString("utf-8");
    const analysis = await Analysis.create({
      userId: req.user._id, code, language: lang,
      filename: req.file.originalname, status: "analyzing",
    });
    res.status(202).json({ success: true, message: "File uploaded and analysis started", data: { analysisId: analysis._id, status: "analyzing", filename: req.file.originalname } });
    setImmediate(async () => {
      try {
        const result = await callAI(code, lang, analysis._id);
        await Analysis.findByIdAndUpdate(analysis._id, {
          status: "completed", complexity: result.complexity, stats: result.stats,
          patterns: result.patterns, explanations: result.explanations, dryRun: result.dry_run,
          complexityBreakdown: result.complexity_breakdown, suggestions: result.suggestions,
          alternatives: result.alternatives, visualizationData: result.visualization_data,
          overallScore: result.overall_score, aiEngineVersion: result.engine_version,
        });
        await updateUserStats(req.user._id);
      } catch (err) {
        await Analysis.findByIdAndUpdate(analysis._id, { status: "failed", errorMessage: err.message });
      }
    });
  } catch (e) { next(e); }
});

// GET /api/v1/analysis/:id/status
router.get("/:id/status", protect, async (req, res, next) => {
  try {
    const a = await Analysis.findOne({ _id: req.params.id, userId: req.user._id }).select("status errorMessage analysisTime");
    if (!a) return res.status(404).json({ success: false, message: "Analysis not found" });
    res.json({ success: true, data: { status: a.status, errorMessage: a.errorMessage, analysisTime: a.analysisTime } });
  } catch (e) { next(e); }
});

// GET /api/v1/analysis/:id
router.get("/:id", protect, async (req, res, next) => {
  try {
    const a = await Analysis.findOne({ _id: req.params.id, userId: req.user._id });
    if (!a) return res.status(404).json({ success: false, message: "Analysis not found" });
    res.json({ success: true, data: { analysis: a } });
  } catch (e) { next(e); }
});

// DELETE /api/v1/analysis/:id
router.delete("/:id", protect, async (req, res, next) => {
  try {
    const a = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!a) return res.status(404).json({ success: false, message: "Analysis not found" });
    res.json({ success: true, message: "Analysis deleted" });
  } catch (e) { next(e); }
});

module.exports = router;
