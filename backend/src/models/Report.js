const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  analysisId: { type: mongoose.Schema.Types.ObjectId, ref: "Analysis", required: true },
  title: { type: String, default: "Analysis Report" },
  shareToken: { type: String, sparse: true },
  isPublic: { type: Boolean, default: false },
  downloadCount: { type: Number, default: 0 },
  snapshot: { type: mongoose.Schema.Types.Mixed },
}, { timestamps: true });

// Single index definition — no inline index:true + schema.index() duplicates
reportSchema.index({ shareToken: 1 }, { unique: true, sparse: true });
reportSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("Report", reportSchema);
