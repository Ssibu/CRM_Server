// // services/logService.js
// import Log from "../models/LogRecord.js";

// export const log = async ({
//   user_id,
//   action,
//   page_name,
//   target_id,
//   description,
//   ip,
//   browser,
//   os,
//   platform,
//   user_agent,
// }) => {
//   try {
//     await Log.create({
//       user_id,
//       action,
//       page_name,
//       target_id,
//       description,
//       ip,
//       browser,
//       os,
//       platform,
//       user_agent,
//     });
//   } catch (err) {
//     console.error("Log error:", err.message);
//   }
// };




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
      user_id,
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
