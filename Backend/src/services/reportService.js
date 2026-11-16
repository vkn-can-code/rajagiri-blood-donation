const { User, Donation, Batch, Sequelize } = require('../models');
const { Op } = Sequelize;

/**
 * Generates a statistical report for a specific Faculty's batch for the last month.
 */
exports.getBatchMonthlyStats = async (batchId) => {
  const startOfMonth = new Date();
  startOfMonth.setMonth(startOfMonth.getMonth() - 1);
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const endOfMonth = new Date();
  endOfMonth.setDate(0); // Last day of previous month
  endOfMonth.setHours(23, 59, 59, 999);

  // 1. Count Total Donations in this batch
  const totalDonations = await Donation.count({
    where: {
      donation_date: { [Op.between]: [startOfMonth, endOfMonth] }
    },
    include: [{
      model: User,
      where: { batch_id: batchId },
      required: true
    }]
  });

  // 2. Count Approved
  const approved = await Donation.count({
    where: {
      donation_date: { [Op.between]: [startOfMonth, endOfMonth] },
      status: 'approved'
    },
    include: [{ model: User, where: { batch_id: batchId }, required: true }]
  });

  // 3. Get List of Donors
  const donors = await Donation.findAll({
    where: {
      donation_date: { [Op.between]: [startOfMonth, endOfMonth] },
      status: 'approved'
    },
    include: [{ 
      model: User, 
      where: { batch_id: batchId },
      attributes: ['name', 'email'] 
    }]
  });

  return { total: totalDonations, approved, donors, month: startOfMonth.toLocaleString('default', { month: 'long' }) };
};

/**
 * Generates a global report for the Admin.
 */
exports.getAdminMonthlyStats = async () => {
  const startOfMonth = new Date();
  startOfMonth.setMonth(startOfMonth.getMonth() - 1);
  startOfMonth.setDate(1);

  const endOfMonth = new Date();
  endOfMonth.setDate(0);

  const totalDonations = await Donation.count({
    where: { donation_date: { [Op.between]: [startOfMonth, endOfMonth] } }
  });

  const approvedDonations = await Donation.count({
    where: { 
      donation_date: { [Op.between]: [startOfMonth, endOfMonth] },
      status: 'approved'
    }
  });

  // Get top performing batch
  const topBatch = await Donation.findAll({
    attributes: [
      [Sequelize.fn('COUNT', Sequelize.col('Donation.id')), 'count']
    ],
    include: [{
      model: User,
      include: [{ model: Batch, as: 'StudentBatch', attributes: ['batch_name'] }]
    }],
    where: { 
      donation_date: { [Op.between]: [startOfMonth, endOfMonth] },
      status: 'approved' 
    },
    group: ['User.StudentBatch.id', 'User.StudentBatch.batch_name'],
    order: [[Sequelize.literal('count'), 'DESC']],
    limit: 1
  });

  return {
    total: totalDonations,
    approved: approvedDonations,
    topBatch: topBatch[0] ? topBatch[0].User.StudentBatch.batch_name : 'None',
    month: startOfMonth.toLocaleString('default', { month: 'long' })
  };
};