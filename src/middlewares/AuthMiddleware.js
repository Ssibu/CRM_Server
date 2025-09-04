import jwt from 'jsonwebtoken'
import models from "../models/index.js"

const {User, Page} = models


export const auth = (req, res, next)=> {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ message: "No token, unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; 
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
}



// export const hp = (pageShortCode) => {
//   return async (req, res, next) => {
    
//     const userId = req.user.id; 

//     if (!userId) {
//       return res.status(401).json({ message: "Unauthorized" });
//     }

//     try {
//       const user = await User.findByPk(userId);
//       if (!user) {
//         return res.status(401).json({ message: "Unauthorized" });
//       }

//       if (user.isAdmin) {
//         return next();
//       }

//       const page = await Page.findOne({ where: { shortCode: pageShortCode } });

//       if (!page) {
//         return res.status(404).json({ message: "Page not found" });
//       }
//             if (!page.isActive) {
//         return res.status(403).json({ message: "Page inactive" });
//       }


//       const hasPermission = await user.hasPage(page);

//       if (hasPermission) {
//         return next();
//       }

//       return res.status(403).json({ message: "Forbidden: Page not allowed to access." });
//     } catch (error) {
//       console.error("Error checking permission:", error);
//       return res.status(500).json({ message: "Internal server error" });
//     }
//   };
// };


export const hp = (pageShortCode) => {
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

      const page = await Page.findOne({ where: { shortCode: pageShortCode } });

      if (!page) {
        return res.status(404).json({ message: "Page not found" });
      }

      if (!page.isActive) {
        return res.status(403).json({ message: "Page inactive or not found." });
      }

      if (user.isAdmin) {
        return next();
      }

      const hasPermission = await user.hasPage(page);

      if (hasPermission) {
        return next();
      }

      return res
        .status(403)
        .json({ message: "Forbidden: Page not allowed to access." });
    } catch (error) {
      console.error("Error checking permission:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  };
};
