const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ClientSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
ClientSchema.index({ name: 1 });
ClientSchema.index({ slug: 1 }, { unique: true });
ClientSchema.index({ status: 1 });
ClientSchema.index({ isDeleted: 1 });

// Simple slugify helper
function slugify(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

// Generate a unique slug by appending a counter if needed
ClientSchema.statics.generateUniqueSlug = async function (base, excludeId) {
  const Model = this;
  let slug = slugify(base);
  let candidate = slug;
  let counter = 1;

  // Loop until we find a slug that isn't used (including deleted records)
  while (true) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.findOne(query).lean().exec();
    if (!exists) break;
    candidate = `${slug}-${counter}`;
    counter += 1;
  }
  return candidate;
};

// Pre-validate hook to ensure slug is present and generated from name
ClientSchema.pre('validate', async function () {
  if (this.isModified('name') || !this.slug) {
    this.slug = await this.constructor.generateUniqueSlug(this.name, this._id);
  }
});

// Ensure name uniqueness among non-deleted records at application level
ClientSchema.pre('save', async function () {
  if (this.isModified('name')) {
    const existing = await this.constructor.findOne({
      name: this.name,
      isDeleted: false,
      _id: { $ne: this._id },
    }).lean().exec();
    if (existing) {
      const err = new Error('Name must be unique');
      err.name = 'ValidationError';
      throw err;
    }
  }
});

module.exports = mongoose.model('Client', ClientSchema);
