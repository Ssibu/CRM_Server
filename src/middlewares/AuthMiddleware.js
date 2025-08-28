import jwt from 'jsonwebtoken'
import models from "../models/index.js"

const {User, Page} = models


export default function authMiddleware(req, res, next) {
  const token = req.cookies.token;//Without cookie-parser, req.cookies would be undefined, and this line would not work.
  if (!token) {
    return res.status(401).json({ message: "No token, unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);//If valid → decoded contains the payload
    req.user = decoded; // attach user info
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}
// const authMiddleware = async (req, res, next) => {
//   const token = req.cookies.token;
  

//   if (token) {
//     try {
//       const decoded = jwt.verify(token, process.env.JWT_SECRET);
//       req.user = decoded;
//       next();
//     } catch (error) {
//       return res.status(401).json({ message: 'Not authorized, token failed.' });
//     }
//   } else {
//     return res.status(401).json({ message: 'Not authorized, no token.' });
//   }
// };
// export  default authMiddleware;





export const hasPermission = (pageShortCode) => {
  return async (req, res, next) => {
    
    const userId = req.user.id; 

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    try {
      const user = await User.findByPk(userId);
      if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (user.isAdmin) {
        return next();
      }

      const page = await Page.findOne({ where: { shortCode: pageShortCode } });

      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }

      const hasPermission = await user.hasPage(page);

      if (hasPermission) {
        return next();
      }

      return res.status(403).json({ message: "Forbidden: Page not allowed to access." });
    } catch (error) {
      console.error("Error checking permission:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};