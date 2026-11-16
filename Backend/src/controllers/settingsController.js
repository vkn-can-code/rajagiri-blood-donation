const { SystemSetting } = require('../models');

exports.getAllSettings = async (req, res) => {
  try {
    const settings = await SystemSetting.findAll();
    res.status(200).json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching settings:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.updateSetting = async (req, res) => {
  const { key } = req.params;
  const { value, type } = req.body;

  try {
    let setting = await SystemSetting.findOne({ where: { key } });

    if (setting) {
      setting.value = value !== undefined ? String(value) : setting.value;
      if (type) setting.type = type;
      await setting.save();
    } else {
      setting = await SystemSetting.create({
        key,
        value: String(value),
        type: type || 'string'
      });
    }

    res.status(200).json({ success: true, setting, message: 'Setting updated successfully' });
  } catch (error) {
    console.error('Error updating setting:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
