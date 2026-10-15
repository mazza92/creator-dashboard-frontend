/**
 * Retired. Lifecycle and Polly emails are sent by the backend Polly cron
 * (/api/polly/cron/alerts), which honours unsubscribes, the waitlist gate
 * and the gap between emails. This endpoint sends nothing.
 */

module.exports = async function handler(req, res) {
  return res.status(200).json({ success: true, retired: true, sent: 0 });
};
