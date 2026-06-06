const Content = require('../models/Content');
const Screen = require('../models/Screen');
const fs = require('fs');

function success(res, message, data) {
  return res.json({ success: true, message, data });
}

function validationError(res, message, errors) {
  return res.status(400).json({ success: false, message, errors });
}

function notFound(res, message) {
  return res.status(404).json({ success: false, message });
}

function serverError(res, message) {
  return res.status(500).json({ success: false, message });
}

exports.uploadContent = async (req, res) => {
  try {
    const { screenId } = req.body || {};
    if (!screenId) return validationError(res, 'Validation error', { screenId: 'screenId is required' });

    // Validate screen exists and not deleted
    const screen = await Screen.findOne({ _id: screenId, isDeleted: false }).lean().exec();
    if (!screen) {
      // remove uploaded file if present
      if (req.file && req.file.path) {
        try { fs.unlinkSync(req.file.path); } catch (e) {}
      }
      return validationError(res, 'Validation error', { screenId: 'Screen not found' });
    }

    if (!req.file) return validationError(res, 'Validation error', { file: 'Media file is required' });

    const mimetype = req.file.mimetype || '';
    const mediaType = mimetype.startsWith('image') ? 'image' : mimetype.startsWith('video') ? 'video' : null;
    if (!mediaType) return validationError(res, 'Validation error', { file: 'Unsupported media type' });

    const filePath = (req.file.path || '').replace(/\\/g, '/');

    const content = new Content({
      screenId,
      mediaType,
      fileName: req.file.filename,
      originalFileName: req.file.originalname,
      filePath,
      fileSize: req.file.size,
    });

    await content.save();
    return success(res, 'Content uploaded', content);
  } catch (err) {
    console.error(err);
    if (err.message && err.message.includes('Unsupported file type')) return validationError(res, 'Validation error', { file: 'Unsupported file type' });
    return serverError(res, 'Server error');
  }
};

exports.getContents = async (req, res) => {
  try {
    const contents = await Content.find({ isDeleted: false }).sort({ createdAt: -1 }).lean().exec();
    return success(res, 'Contents retrieved', contents);
  } catch (err) {
    console.error(err);
    return serverError(res, 'Server error');
  }
};

exports.getContentById = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findOne({ _id: id, isDeleted: false }).lean().exec();
    if (!content) return notFound(res, 'Content not found');
    return success(res, 'Content retrieved', content);
  } catch (err) {
    console.error(err);
    return serverError(res, 'Server error');
  }
};

exports.getContentsByScreen = async (req, res) => {
  try {
    const { id: screenId } = req.params;

    // validate screen exists
    const screen = await Screen.findOne({ _id: screenId, isDeleted: false }).lean().exec();
    if (!screen) return notFound(res, 'Screen not found');

    const contents = await Content.find({ screenId, isDeleted: false }).sort({ createdAt: -1 }).lean().exec();
    return success(res, 'Contents retrieved', contents);
  } catch (err) {
    console.error(err);
    return serverError(res, 'Server error');
  }
};

exports.activateContent = async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const content = await Content.findOne({ _id: id, isDeleted: false }).exec();
    if (!content) return notFound(res, 'Content not found');

    const activate = isActive === undefined ? true : !!isActive;

    if (activate) {
      // deactivate others
      await Content.updateMany({ screenId: content.screenId, isActive: true, _id: { $ne: id } }, { isActive: false }).exec();
      content.isActive = true;
    } else {
      content.isActive = false;
    }

    await content.save();
    return success(res, 'Content status updated', content);
  } catch (err) {
    console.error(err);
    if (err.name === 'ValidationError') return validationError(res, 'Validation error', { error: err.message });
    return serverError(res, 'Server error');
  }
};

exports.deleteContent = async (req, res) => {
  try {
    const { id } = req.params;
    const content = await Content.findOne({ _id: id, isDeleted: false }).exec();
    if (!content) return notFound(res, 'Content not found');

    content.isDeleted = true;
    if (content.isActive) content.isActive = false;
    await content.save();
    return success(res, 'Content deleted', null);
  } catch (err) {
    console.error(err);
    return serverError(res, 'Server error');
  }
};
