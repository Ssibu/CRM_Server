
// import Log from "../models/LogRecord.js";

// export const log = async ({
//   req,       
//   user_id,
//   action,
//   page_name,
//   target,
// }) => {
//   try {
//     const ua = req.useragent || {};

//     await Log.create({
//       user_id : user_id || (req.user ? req.user.id : null),
//       action,
//       page_name,
//       target,
//       ip: req.ip,
//       browser: ua.browser || null,
//       os: ua.os || null,
//       platform: ua.platform || null,
//       user_agent: ua,
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
  target,
}) => {
  try {
    const ua = req.useragent || {};
    const query = req?.query || {};

    if (action === "READ") {
      const { page, limit, search, sort, order } = query;

      const isFirstPage = !page || Number(page) === 1;
      const isDefaultLimit = !limit || Number(limit) === 10;

      const isNoisy =
        search || sort || order || !isFirstPage || !isDefaultLimit;

      if (isNoisy) {
        return;
      }
    }

    await Log.create({
      user_id: user_id || (req.user ? req.user.id : null),
      action,
      page_name,
      target,
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
