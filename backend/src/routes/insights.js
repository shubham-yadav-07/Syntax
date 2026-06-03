const express = require("express");
const router = express.Router();
const Analysis = require("../models/Analysis");
const { protect } = require("../middleware/auth");

router.get("/", protect, async (req, res, next) => {
  try {
    const userId = req.user._id;
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - 6);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const all = await Analysis.find({ userId, status: "completed" })
      .select("overallScore language complexity createdAt").lean();

    const total = all.length;
    const avgScore = total > 0 ? Math.round((all.reduce((s, a) => s + (a.overallScore || 0), 0) / total) * 10) / 10 : 0;
    const thisMonth = all.filter((a) => new Date(a.createdAt) >= startOfMonth).length;
    const lastMonthArr = all.filter((a) => { const d = new Date(a.createdAt); return d >= startOfLastMonth && d <= endOfLastMonth; });
    const lastMonthAvg = lastMonthArr.length > 0 ? lastMonthArr.reduce((s, a) => s + (a.overallScore || 0), 0) / lastMonthArr.length : avgScore;
    const scoreDelta = Math.round((avgScore - lastMonthAvg) * 10) / 10;
    const optimized = all.filter((a) => (a.overallScore || 0) >= 80).length;
    const optimizationRate = total > 0 ? Math.round((optimized / total) * 100) : 0;

    const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
    const performanceData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(startOfWeek); d.setDate(d.getDate() + i);
      const end = new Date(d); end.setHours(23, 59, 59, 999);
      const dayArr = all.filter((a) => { const ad = new Date(a.createdAt); return ad >= d && ad <= end; });
      const score = dayArr.length > 0 ? Math.round(dayArr.reduce((s, a) => s + (a.overallScore || 0), 0) / dayArr.length) : 0;
      return { name: days[d.getDay()], score };
    });

    const cxCount = {};
    all.forEach((a) => { const t = a.complexity?.time || "Unknown"; cxCount[t] = (cxCount[t] || 0) + 1; });
    const complexityData = Object.entries(cxCount).map(([name, count]) => ({ name, count }));

    const langCount = {};
    all.forEach((a) => { langCount[a.language] = (langCount[a.language] || 0) + 1; });
    const languageData = Object.entries(langCount).map(([name, count]) => ({ name, count }));

    res.json({
      success: true,
      data: { summary: { averageScore: avgScore, scoreDelta, totalAnalyses: total, thisMonth, optimizationRate }, performanceData, complexityData, languageData },
    });
  } catch (e) { next(e); }
});

module.exports = router;
