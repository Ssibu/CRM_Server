

import Log from "../models/LogRecord.js";

export const log = async ({
  req,       
  user_id,
  action,
  page_name,
  target_id,
  description,
}) => {
  try {
    const ua = req.useragent || {};

    await Log.create({
      user_id : user_id || (req.user ? req.user.id : null),
      action,
      page_name,
      target_id,
      description,
      ip: req.ip,
      browser: ua.browser || null,
      os: ua.os || null,
      platform: ua.platform || null,
      user_agent: ua,
    });
  } catch (err) {
    console.error("Log error:", err.message);
  }
};
