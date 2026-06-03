const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true, maxlength: 100 },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 8, select: false },
  bio: { type: String, maxlength: 500, default: "" },
  avatar: { type: String, default: "" },
  preferences: {
    defaultLanguage: { type: String, enum: ["javascript","python","cpp","java","c","go"], default: "javascript" },
    theme: { type: String, enum: ["dark","light"], default: "dark" },
    editorFontSize: { type: Number, default: 14, min: 10, max: 24 },
    notifications: {
      email: { type: Boolean, default: true },
      analysisComplete: { type: Boolean, default: true },
      weeklySummary: { type: Boolean, default: false },
    },
  },
  stats: {
    totalAnalyses: { type: Number, default: 0 },
    averageScore: { type: Number, default: 0 },
    optimizationRate: { type: Number, default: 0 },
  },
  isActive: { type: Boolean, default: true },
  lastLogin: Date,
  refreshToken: { type: String, select: false },
}, { timestamps: true });

userSchema.pre("save", async function(next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidate) {
  return bcrypt.compare(candidate, this.password);
};

userSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  delete obj.__v;
  return obj;
};

module.exports = mongoose.model("User", userSchema);
