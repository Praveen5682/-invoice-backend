// controllers/location.controller.js

const service = require("../service/index");

module.exports.getStates = async (req, res) => {
  try {
    const states = await service.getStates();
    return res.json({ success: true, data: states });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};

module.exports.getCities = async (req, res) => {
  try {
    const { stateId } = req.params;
    const cities = await service.getCitiesByState(stateId);

    return res.json({ success: true, data: cities });
  } catch (err) {
    return res.status(500).json({ success: false });
  }
};
