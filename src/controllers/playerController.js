const Client = require('../models/Client');
const Screen = require('../models/Screen');
const Content = require('../models/Content');

function success(res, message, data) {
  return res.json({ success: true, message, data });
}

function notFound(res, message) {
  return res.status(404).json({ success: false, message });
}

function serverError(res, message) {
  return res.status(500).json({ success: false, message });
}

exports.getPlayerContent = async (req, res) => {
  try {
    const { clientSlug, screenSlug } = req.query;
    if (!clientSlug) return notFound(res, 'Client not found');
    if (!screenSlug) return notFound(res, 'Screen not found');

    // Find active client
    const client = await Client.findOne({ slug: clientSlug, isDeleted: false, status: 'active' }).lean().exec();
    if (!client) return notFound(res, 'Client not found');

    // Find active screen belonging to client
    const screen = await Screen.findOne({ slug: screenSlug, clientId: client._id, isDeleted: false, status: 'active' }).lean().exec();
    if (!screen) return notFound(res, 'Screen not found');

    // Find active content for the screen
    const content = await Content.findOne({ screenId: screen._id, isDeleted: false, isActive: true }).lean().exec();
    if (!content) return notFound(res, 'No active content found for this screen');

    // Build public URL for the media file
    const host = req.get('host');
    const protocol = req.protocol;
    const filePath = content.filePath && content.filePath.replace(/^\/*/, '');
    const url = `${protocol}://${host}/${filePath}`;

    const data = {
      client: { id: client._id, name: client.name, slug: client.slug },
      screen: { id: screen._id, name: screen.name, slug: screen.slug },
      content: { id: content._id, mediaType: content.mediaType, fileName: content.fileName, filePath: url },
    };

    return success(res, 'Player content retrieved', data);
  } catch (err) {
    console.error(err);
    return serverError(res, 'Server error');
  }
};
