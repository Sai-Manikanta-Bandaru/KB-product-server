const Screen = require('../models/Screen');
const Client = require('../models/Client');

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

exports.createScreen = async (req, res) => {
  try {
    const { clientId, name, description, status } = req.body;
    if (!clientId) return validationError(res, 'Validation error', { clientId: 'clientId is required' });
    if (!name || !String(name).trim()) return validationError(res, 'Validation error', { name: 'Name is required' });
    if (status && !['active', 'inactive'].includes(status)) return validationError(res, 'Validation error', { status: 'Invalid status' });

    // Validate client exists and not deleted
    const client = await Client.findOne({ _id: clientId, isDeleted: false }).lean().exec();
    if (!client) return validationError(res, 'Validation error', { clientId: 'Client not found' });

    // Check name uniqueness within client
    const existing = await Screen.findOne({ clientId, name: name.trim(), isDeleted: false }).lean().exec();
    if (existing) return validationError(res, 'Validation error', { name: 'Name must be unique within the client' });

    const screen = new Screen({ clientId, name: name.trim(), description, status });
    await screen.save();
    return success(res, 'Screen created', screen);
  } catch (err) {
    if (err.name === 'ValidationError') return validationError(res, 'Validation error', { error: err.message });
    console.error(err);
    return serverError(res, 'Server error');
  }
};

exports.getScreens = async (req, res) => {
  try {
    const screens = await Screen.find({ isDeleted: false }).sort({ createdAt: -1 }).lean().exec();
    return success(res, 'Screens retrieved', screens);
  } catch (err) {
    console.error(err);
    return serverError(res, 'Server error');
  }
};

exports.getScreenById = async (req, res) => {
  try {
    const { id } = req.params;
    const screen = await Screen.findOne({ _id: id, isDeleted: false }).lean().exec();
    if (!screen) return notFound(res, 'Screen not found');
    return success(res, 'Screen retrieved', screen);
  } catch (err) {
    console.error(err);
    return serverError(res, 'Server error');
  }
};

exports.updateScreen = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, status, clientId } = req.body;

    const screen = await Screen.findOne({ _id: id, isDeleted: false }).exec();
    if (!screen) return notFound(res, 'Screen not found');

    if (clientId !== undefined && String(clientId) !== String(screen.clientId)) {
      // validate new client
      const client = await Client.findOne({ _id: clientId, isDeleted: false }).lean().exec();
      if (!client) return validationError(res, 'Validation error', { clientId: 'Client not found' });
      screen.clientId = clientId;
    }

    if (name !== undefined) {
      if (!String(name).trim()) return validationError(res, 'Validation error', { name: 'Name cannot be empty' });
      // check uniqueness within client
      const existing = await Screen.findOne({ clientId: screen.clientId, name: name.trim(), isDeleted: false, _id: { $ne: id } }).lean().exec();
      if (existing) return validationError(res, 'Validation error', { name: 'Name must be unique within the client' });
      screen.name = name.trim();
      // slug will regenerate in pre-validate
    }

    if (description !== undefined) screen.description = description;
    if (status !== undefined) {
      if (!['active', 'inactive'].includes(status)) return validationError(res, 'Validation error', { status: 'Invalid status' });
      screen.status = status;
    }

    await screen.save();
    return success(res, 'Screen updated', screen);
  } catch (err) {
    if (err.name === 'ValidationError') return validationError(res, 'Validation error', { error: err.message });
    console.error(err);
    return serverError(res, 'Server error');
  }
};

exports.deleteScreen = async (req, res) => {
  try {
    const { id } = req.params;
    const screen = await Screen.findOne({ _id: id, isDeleted: false }).exec();
    if (!screen) return notFound(res, 'Screen not found');
    screen.isDeleted = true;
    await screen.save();
    return success(res, 'Screen deleted', null);
  } catch (err) {
    console.error(err);
    return serverError(res, 'Server error');
  }
};
