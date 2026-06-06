const mongoose = require('mongoose');

const Schema = mongoose.Schema;
const Client = require('./Client');

const ScreenSchema = new Schema(
  {
    clientId: { type: Schema.Types.ObjectId, ref: 'Client', required: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    isDeleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
ScreenSchema.index({ clientId: 1 });
ScreenSchema.index({ clientId: 1, slug: 1 }, { unique: true });
ScreenSchema.index({ status: 1 });
ScreenSchema.index({ isDeleted: 1 });

function slugify(text) {
  return String(text || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\\s-]/g, '')
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-');
}

// Generate unique slug within the same client
ScreenSchema.statics.generateUniqueSlug = async function (base, clientId, excludeId) {
  const Model = this;
  // Try to include client name in the slug base when possible
  let clientName = '';
  try {
    const client = await Client.findOne({ _id: clientId }).lean().exec();
    if (client && client.name) clientName = client.name;
  } catch (e) {
    // ignore — fallback to using base only
  }

  const combined = clientName ? `${clientName} ${base}` : String(base);
  let slug = slugify(combined);
  let candidate = slug;
  let counter = 1;

  while (true) {
    const query = { clientId, slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.findOne(query).lean().exec();
    if (!exists) break;
    candidate = `${slug}-${counter}`;
    counter += 1;
  }
  return candidate;
};

// Ensure slug generated from name when needed, also when clientId changes
ScreenSchema.pre('validate', async function () {
  if (this.isModified('name') || this.isModified('clientId') || !this.slug) {
    this.slug = await this.constructor.generateUniqueSlug(this.name, this.clientId, this._id);
  }
});

// Ensure name uniqueness within the same client (non-deleted)
ScreenSchema.pre('save', async function () {
  if (this.isModified('name') || this.isModified('clientId')) {
    const existing = await this.constructor.findOne({
      clientId: this.clientId,
      name: this.name,
      isDeleted: false,
      _id: { $ne: this._id },
    }).lean().exec();
    if (existing) {
      const err = new Error('Name must be unique within the client');
      err.name = 'ValidationError';
      throw err;
    }
  }
});

module.exports = mongoose.models.Screen || mongoose.model('Screen', ScreenSchema);
