const { EmailLog } = require('../models');
const emailSystem = require('../services/mailer/emailSystem');
const { Op } = require('sequelize');

exports.getAllEmails = async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    if (status) {
      if (status === 'history') {
        whereClause.status = { [Op.in]: ['sent', 'failed'] };
      } else {
        whereClause.status = status;
      }
    }

    const { count, rows } = await EmailLog.findAndCountAll({
      where: whereClause,
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: parseInt(offset)
    });

    res.json({
      success: true,
      total: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / limit),
      data: rows
    });
  } catch (error) {
    console.error('Error fetching emails:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch emails' });
  }
};

exports.scheduleEmail = async (req, res) => {
  try {
    const { to, subject, html, scheduled_at } = req.body;

    if (!to || !subject || !html) {
      return res.status(400).json({ success: false, message: 'Please provide to, subject, and html fields.' });
    }

    const isScheduled = !!scheduled_at;
    const sendStatus = isScheduled ? 'scheduled' : 'sent';

    const result = await emailSystem.dispatchEmail({
      to,
      subject,
      html,
      status: sendStatus,
      scheduled_at: isScheduled ? new Date(scheduled_at) : null
    });

    res.status(201).json(result);
  } catch (error) {
    console.error('Error scheduling email:', error);
    res.status(500).json({ success: false, message: 'Failed to schedule email' });
  }
};

exports.cancelScheduledEmail = async (req, res) => {
  try {
    const { id } = req.params;

    const email = await EmailLog.findOne({ where: { id, status: 'scheduled' } });
    
    if (!email) {
      return res.status(404).json({ success: false, message: 'Scheduled email not found or already processed' });
    }

    email.status = 'failed';
    email.error_message = 'Cancelled by administrator.';
    await email.save();

    res.json({ success: true, message: 'Email schedule cancelled' });
  } catch (error) {
    console.error('Error cancelling email:', error);
    res.status(500).json({ success: false, message: 'Failed to cancel email' });
  }
};
