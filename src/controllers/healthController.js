exports.getHealth = (req, res) => {
  res.json({ status: 'ok', env: process.env.NODE_ENV || 'development', timestamp: Date.now() });
};
