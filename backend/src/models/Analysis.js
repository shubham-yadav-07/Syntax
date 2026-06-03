const mongoose = require("mongoose");

const analysisSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  code: { type: String, required: true, maxlength: 50000 },
  language: { type: String, required: true, enum: ["javascript","python","cpp","java","c","go"], lowercase: true },
  filename: { type: String, default: "untitled" },
  complexity: {
    time: String, space: String,
    bestCase: String, averageCase: String, worstCase: String,
  },
  stats: {
    linesOfCode: { type: Number, default: 0 },
    loops: { type: Number, default: 0 },
    recursiveCalls: { type: Number, default: 0 },
    variables: { type: Number, default: 0 },
    functions: { type: Number, default: 0 },
    nestedDepth: { type: Number, default: 0 },
    conditionals: { type: Number, default: 0 },
  },
  patterns: {
    hasLoops: Boolean, hasRecursion: Boolean, hasNestedLoops: Boolean,
    hasDivideAndConquer: Boolean, hasDynamicProgramming: Boolean,
    hasHashMap: Boolean, detectedAlgorithm: String,
  },
  explanations: [{ line: Number, text: String, highlight: Boolean }],
  dryRun: [{ step: Number, description: String, variables: mongoose.Schema.Types.Mixed, lineNumber: Number }],
  complexityBreakdown: [{ section: String, complexity: String, reason: String, lineStart: Number, lineEnd: Number }],
  suggestions: [{
    id: String, title: String, description: String,
    impact: { type: String, enum: ["high","medium","low"] },
    improvement: String, codeExample: String,
    category: { type: String, enum: ["time","space","readability","pattern"] },
  }],
  alternatives: [{
    id: String, name: String, code: String, language: String,
    timeComplexity: String, spaceComplexity: String,
    readabilityScore: Number, efficiencyScore: Number, description: String,
  }],
  visualizationData: { type: mongoose.Schema.Types.Mixed, default: {} },
  overallScore: { type: Number, min: 0, max: 100, default: 0 },
  status: { type: String, enum: ["pending","analyzing","completed","failed"], default: "pending" },
  errorMessage: String,
  analysisTime: Number,
  aiEngineVersion: { type: String, default: "1.0.0" },
}, { timestamps: true });

analysisSchema.index({ userId: 1, createdAt: -1 });
analysisSchema.index({ userId: 1, language: 1 });

module.exports = mongoose.model("Analysis", analysisSchema);
