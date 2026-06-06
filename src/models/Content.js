const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ContentSchema = new Schema(
  {
    screenId: { type: Schema.Types.ObjectId, ref: 'Screen', required: true },
    mediaType: { type: String, enum: ['image', 'video'], required: true },
    fileName: { type: String, required: true },
    originalFileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number },
    isActive: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
ContentSchema.index({ screenId: 1 });
ContentSchema.index({ isActive: 1 });
ContentSchema.index({ isDeleted: 1 });
ContentSchema.index({ mediaType: 1 });

module.exports = mongoose.models.Content || mongoose.model('Content', ContentSchema);
