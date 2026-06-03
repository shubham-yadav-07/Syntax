const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const PDFDocument = require("pdfkit");
const Analysis = require("../models/Analysis");
const Report = require("../models/Report");
const { protect } = require("../middleware/auth");

router.get("/", protect, async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [reports, total] = await Promise.all([
      Report.find({ userId: req.user._id }).populate("analysisId", "filename language complexity overallScore createdAt")
        .sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Report.countDocuments({ userId: req.user._id }),
    ]);
    res.json({ success: true, data: { reports, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } } });
  } catch (e) { next(e); }
});

router.post("/save", protect, async (req, res, next) => {
  try {
    const { analysisId, title } = req.body;
    if (!analysisId) return res.status(400).json({ success: false, message: "analysisId required" });
    const analysis = await Analysis.findOne({ _id: analysisId, userId: req.user._id, status: "completed" });
    if (!analysis) return res.status(404).json({ success: false, message: "Analysis not found" });
    const report = await Report.findOneAndUpdate(
      { userId: req.user._id, analysisId },
      { title: title || (analysis.filename + " Report"), snapshot: { filename: analysis.filename, language: analysis.language, complexity: analysis.complexity, stats: analysis.stats, suggestions: analysis.suggestions, overallScore: analysis.overallScore, createdAt: analysis.createdAt } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.status(201).json({ success: true, message: "Report saved", data: { report } });
  } catch (e) { next(e); }
});

router.post("/:id/share", protect, async (req, res, next) => {
  try {
    const report = await Report.findOne({ _id: req.params.id, userId: req.user._id });
    if (!report) return res.status(404).json({ success: false, message: "Report not found" });
    if (!report.shareToken) { report.shareToken = uuidv4(); report.isPublic = true; await report.save(); }
    const shareUrl = (process.env.FRONTEND_URL || "http://localhost:5173") + "/reports/shared/" + report.shareToken;
    res.json({ success: true, data: { shareUrl, shareToken: report.shareToken } });
  } catch (e) { next(e); }
});

router.get("/shared/:token", async (req, res, next) => {
  try {
    const report = await Report.findOne({ shareToken: req.params.token, isPublic: true }).populate("analysisId");
    if (!report) return res.status(404).json({ success: false, message: "Report not found or not public" });
    res.json({ success: true, data: { report } });
  } catch (e) { next(e); }
});

router.get("/:analysisId/pdf", protect, async (req, res, next) => {
  try {
    const a = await Analysis.findOne({ _id: req.params.analysisId, userId: req.user._id, status: "completed" });
    if (!a) return res.status(404).json({ success: false, message: "Analysis not found" });
    await Report.findOneAndUpdate({ analysisId: a._id }, { $inc: { downloadCount: 1 } });

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", "attachment; filename=syntax-report-" + a._id + ".pdf");
    doc.pipe(res);

    doc.fillColor("#7C3AED").fontSize(24).text("<Syntax/>", 50, 50);
    doc.fillColor("#94a3b8").fontSize(10).text("AI-Powered Code Analysis Platform", 50, 80);
    doc.moveTo(50, 100).lineTo(545, 100).strokeColor("#334155").stroke();
    doc.fillColor("#ffffff").fontSize(18).text("Analysis Report", 50, 120);
    doc.fillColor("#94a3b8").fontSize(10).text("Generated: " + new Date().toLocaleString(), 50, 145);

    doc.rect(50, 165, 495, 120).fillColor("#1e293b").fill();
    doc.fillColor("#e2e8f0").fontSize(12).text("Summary", 65, 178);
    const summaryItems = [["Filename", a.filename], ["Language", (a.language || "").toUpperCase()], ["Lines", String(a.stats?.linesOfCode || "N/A")], ["Score", String(a.overallScore || 0) + "/100"], ["Status", "Completed"]];
    summaryItems.forEach(function(item, i) {
      doc.fillColor("#94a3b8").fontSize(10).text(item[0], 65, 198 + i * 16);
      doc.fillColor("#ffffff").text(item[1], 260, 198 + i * 16);
    });

    doc.fillColor("#e2e8f0").fontSize(14).text("Complexity Analysis", 50, 305);
    doc.moveTo(50, 322).lineTo(545, 322).strokeColor("#475569").stroke();
    const cx = a.complexity || {};
    const cxItems = [["Time", cx.time || "N/A"], ["Space", cx.space || "N/A"], ["Best Case", cx.bestCase || "N/A"], ["Average", cx.averageCase || "N/A"], ["Worst Case", cx.worstCase || "N/A"]];
    cxItems.forEach(function(item, i) {
      doc.fillColor("#94a3b8").fontSize(10).text(item[0], 50, 332 + i * 18);
      doc.fillColor("#7C3AED").text(item[1], 300, 332 + i * 18);
    });

    if (a.suggestions && a.suggestions.length > 0) {
      doc.addPage();
      doc.fillColor("#e2e8f0").fontSize(14).text("Optimization Suggestions", 50, 50);
      doc.moveTo(50, 68).lineTo(545, 68).strokeColor("#475569").stroke();
      let y = 80;
      a.suggestions.slice(0, 5).forEach(function(s, i) {
        doc.rect(50, y, 495, 55).fillColor("#1e293b").fill();
        doc.fillColor("#e2e8f0").fontSize(11).text((i + 1) + ". " + s.title, 65, y + 8);
        doc.fillColor("#94a3b8").fontSize(9).text(s.description, 65, y + 26, { width: 380 });
        doc.fillColor("#22c55e").fontSize(9).text(s.improvement || "", 420, y + 26);
        y += 65;
      });
    }
    doc.end();
  } catch (e) { next(e); }
});

router.delete("/:id", protect, async (req, res, next) => {
  try {
    const r = await Report.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!r) return res.status(404).json({ success: false, message: "Report not found" });
    res.json({ success: true, message: "Report deleted" });
  } catch (e) { next(e); }
});

module.exports = router;
