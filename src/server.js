import dotenv from 'dotenv';
dotenv.config();
import express from 'express'
import useragent from "express-useragent"
import multer from 'multer';  

import { fileURLToPath } from 'url';
import path from 'path';

import sequelize from '../config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';


import directorDeskRoutes from './routes/Admin/DirectorDeskRoutes.js';
import adminAuthRoutes from './routes/Admin/AdminAuthRoutes.js';
import pageRoutes from "./routes/Admin/PageRoutes.js"
import pagePermissionRoutes from "./routes/Admin/PagePermissionRoutes.js"
import tenderRoutes from "./routes/Admin/TenderRoutes.js"
import noticeRoutes from "./routes/Admin/NoticeRoutes.js"
import advertisementRoutes from "./routes/Admin/AdvertisementRoutes.js"
import corrigendumRoutes from "./routes/Admin/CorrigendumRoutes.js"
import holidayRoutes from './routes/Admin/HolidayRoutes.js';
import footerlinkRoutes from "./routes/Admin/FooterLinkRoutes.js";
import actAndRuleRoutes from "./routes/Admin/ActAndRuleRoutes.js"
import newsAndEventRoutes from "./routes/Admin/NewsAndEventRoutes.js"
import policyRoutes from './routes/Admin/PolicyRoutes.js';
import schemeRoutes from './routes/Admin/SchemeRoutes.js';
import imageSetupRoutes from './routes/Admin/ImageSetupRoutes.js';
import chatbotCategoryRoutes from './routes/Admin/ChatbotCategoryRoutes.js';
import chatbotQuestionRoutes from './routes/Admin/ChatbotQuestionRoutes.js';
import chatbotAnswerRoutes from './routes/Admin/ChatbotAnswerRoutes.js';
import menuRoutes from './routes/Admin/MenuRoutes.js';
import subMenuRoutes from './routes/Admin/SubMenuRoutes.js';
import subSubMenuRoutes from './routes/Admin/SubSubMenuRoutes.js'; 
import homeConfigurationRoutes from "./routes/Admin/HomeSettingRoutes.js"
import importantLinkRoutes from "./routes/Admin/ImportantLinkRoutes.js"
import bedStrengthRoutes from "./routes/Admin/BedStrengthRoutes.js"
import formRoutes from "./routes/Admin/FormRoutes.js"
import dashboardRoutes from "./routes/Admin/DashboardRoutes.js"
import homeAdminRoutes from "./routes/Admin/HomeAdminRoutes.js"
import galleryRoutes from "./routes/Admin/GalleryRoutes.js"
import generatedLinkRoutes from "./routes/Admin/GeneratedLinkRoutes.js"
import logRecordRoutes from "./routes/Admin/LogRecordRoutes.js"



//user routes
import publicMenuRoutes from "./routes/User/MenuRoutes.js"
import pageContentRoutes from "./routes/User/PageContentRoutes.js"
import publicNoticeRoutes from "./routes/User/NoticeRoutes.js"
import homeBoardRoutes from "./routes/User/HomeBoardRoutes.js"
import homeDirectorAndAboutRoutes from "./routes/User/HomeDirectorDeskRoutes.js"
import homeGalleryRoutes from "./routes/User/HomeGalleryRoutes.js"
import homeFooterRoutes from "./routes/User/HomeFooterRoutes.js"
import newsAndEventUserRoutes from "./routes/User/NewsAndEventRoutes.js"
import tenderUserRoutes from "./routes/User/TenderRoutes.js"
import userHomeConfigurationRoutes from "./routes/User/userHomeConfigurationRoutes.js"
import userChatbotRoutes from "./routes/User/userChatbotRoutes.js"
import userNewsAndEventRoutes from "./routes/User/userNewsAndEventRoutes.js"
import userDirectorDeskRoutes from "./routes/User/DirectorDeskRoutes.js"
import userPolicyRoutes from "./routes/User/PolicyRoutes.js"
import userBedStrengthRoutes from "./routes/User/BedStrengthRoutes.js"
import formRouter from './routes/User/FormRoutes.js';
import schemeRouter from './routes/User/SchemeRoutes.js';
import ActAndRulesRouter from './routes/User/DisplayActAndRulesRoutes.js';
import displayHomeAdminRouter from './routes/User/DisplayHomeAdminRoutes.js';
import photoRouter from './routes/User/PhotoRoutes.js';
import videoRouter from './routes/User/VideoRoutes.js';
import BannerRouter from './routes/User/BannerRoutes.js';
import siteSearchRoutes from "./routes/User/SiteSearchRoutes.js"
import homeAdvertiseRoutres from "./routes/User/HomeAdvertisementRoutes.js"
import linkRoutes from "./routes/User/FooterLinkRoutes.js"


const app = express()
const PORT = process.env.PORT;
app.use(express.urlencoded({ extended: true }));
app.set('trust proxy', true);
app.use(useragent.express());
app.use(cookieParser())


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())
const corsOptions = {
  origin: "http://localhost:5173",
  credentials: true,                
};
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, '../public')));

app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax'
  }
}));

app.use('/admin',  adminAuthRoutes)
app.use("/dashboard", dashboardRoutes)
app.use("/pages", pageRoutes)
app.use("/permissions", pagePermissionRoutes )
app.use("/tenders", tenderRoutes)
app.use("/notices", noticeRoutes)
app.use("/corrigendums", corrigendumRoutes)
app.use("/advertisements", advertisementRoutes)
app.use("/holidays", holidayRoutes)
app.use("/director-desk", directorDeskRoutes)
app.use("/home-admins", homeAdminRoutes)
app.use("/api/footerlinks", footerlinkRoutes);
app.use("/api/act-and-rules", actAndRuleRoutes);
app.use("/api/news-and-events", newsAndEventRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/schemes', schemeRoutes);
app.use("/api/bed-strengths", bedStrengthRoutes)
app.use("/api/forms", formRoutes)
app.use('/image-setup',  imageSetupRoutes)
app.use("/image-setup", galleryRoutes)
app.use('/api/chatbot-categories', chatbotCategoryRoutes);
app.use('/api/chatbot-questions', chatbotQuestionRoutes);
app.use('/api/chatbot-answers', chatbotAnswerRoutes);
app.use('/api/menus', menuRoutes);
app.use('/api/submenus', subMenuRoutes);
app.use('/api/subsubmenus', subSubMenuRoutes);
app.use("/api/home-settings", homeConfigurationRoutes)
app.use("/api/generated-links", generatedLinkRoutes);
app.use('/image-setup', importantLinkRoutes);
app.use("/logs", logRecordRoutes)




// user routes
app.use("/menus", publicMenuRoutes)
app.use("/content", pageContentRoutes)
app.use("/public/notices", publicNoticeRoutes)
app.use("/home-board", homeBoardRoutes)
app.use("/home-d-desk", homeDirectorAndAboutRoutes)
app.use("/gallery-and-events", homeGalleryRoutes)
app.use("/footer-data", homeFooterRoutes)
app.use('/user/news-and-events',newsAndEventUserRoutes)
app.use('/user/tenders', tenderUserRoutes)
app.use("/user-home-settings", userHomeConfigurationRoutes)
app.use('/user-chatbot', userChatbotRoutes);
app.use('/user-news-and-events', userNewsAndEventRoutes);
app.use("/public/director-desk", userDirectorDeskRoutes)
app.use("/api/user/policies", userPolicyRoutes)
app.use("/api/user/bed-strengths", userBedStrengthRoutes)
app.use("/",formRouter)
app.use("/",schemeRouter)
app.use("/",ActAndRulesRouter)
app.use("/",displayHomeAdminRouter)
app.use('/user/image',photoRouter)
app.use('/user/video',videoRouter)
app.use('/home',BannerRouter)
app.use("/search", siteSearchRoutes)
app.use("/ads", homeAdvertiseRoutres)
app.use("/api/footer-links", linkRoutes);





app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific error
    return res.status(400).json({
      success: false,
      message: err.message,
      code: err.code,
    });
  }

  // General error
  return res.status(500).json({
    success: false,
    message: "Internal Server Error",
    error: err.message || "Unknown error",
  });
});





async function startServer() {
   app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });


    await sequelize.authenticate()
    console.log("Database connected")

    await sequelize.sync({alter: true})
    console.log("Database SYnced")
}
startServer()