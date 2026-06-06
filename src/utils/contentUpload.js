const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    try {
      const screenId = req.body.screenId ? String(req.body.screenId) : 'general';
      const mediaType = file.mimetype && file.mimetype.startsWith('image') ? 'images' : file.mimetype && file.mimetype.startsWith('video') ? 'videos' : 'others';
      const dest = path.join('uploads', 'content', screenId, mediaType);
      fs.mkdirSync(dest, { recursive: true });
      cb(null, dest);
    } catch (err) {
      cb(err);
    }
  },
  filename: function (req, file, cb) {
    const safeName = file.originalname.replace(/[^a-z0-9.()-_ ]/gi, '_');
    cb(null, `${Date.now()}-${safeName}`);
  },
});

const fileFilter = function (req, file, cb) {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'video/mp4'];
  if (allowed.includes(file.mimetype)) return cb(null, true);
  return cb(new Error('Unsupported file type'), false);
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
