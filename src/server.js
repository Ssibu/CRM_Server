import dotenv from 'dotenv';
dotenv.config();
console.log(`<<<<< CURRENT NODE_ENV IS: [${process.env.NODE_ENV}] >>>>>`);
import express from 'express'

import { fileURLToPath } from 'url';
import path from 'path';

import sequelize from '../config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';



import directorDeskRoutes from './routes/DirectorDeskRoutes.js';

import adminAuthRoutes from './routes/AdminAuthRoutes.js';
import pageRoutes from "./routes/PageRoutes.js"
import pagePermissionRoutes from "./routes/PagePermissionRoutes.js"
import tenderRoutes from "./routes/TenderRoutes.js"
import noticeRoutes from "./routes/NoticeRoutes.js"
import advertisementRoutes from "./routes/AdvertisementRoutes.js"
import corrigendumRoutes from "./routes/CorrigendumRoutes.js"
import holidayRoutes from './routes/HolidayRoutes.js';

import footerlinkRoutes from "./routes/FooterLinkRoutes.js";
import actAndRuleRoutes from "./routes/ActAndRuleRoutes.js"
import newsAndEventRoutes from "./routes/NewsAndEventRoutes.js"
import policyRoutes from './routes/PolicyRoutes.js';
import schemeRoutes from './routes/SchemeRoutes.js';
import imageSetupRoutes from './routes/ImageSetupRoutes.js';

import chatbotCategoryRoutes from './routes/ChatbotCategoryRoutes.js';
import chatbotQuestionRoutes from './routes/ChatbotQuestionRoutes.js';
import chatbotAnswerRoutes from './routes/ChatbotAnswerRoutes.js';

import menuRoutes from './routes/MenuRoutes.js';
import subMenuRoutes from './routes/SubMenuRoutes.js';
import subSubMenuRoutes from './routes/SubSubMenuRoutes.js'; 

import homeConfigurationRoutes from "./routes/HomeSettingRoutes.js"
import importantLinkRoutes from "./routes/ImportantLinkRoutes.js"

import bedStrengthRoutes from "./routes/BedStrengthRoutes.js"
import formRoutes from "./routes/FormRoutes.js"

import dashboardRoutes from "./routes/DashboardRoutes.js"
import homeAdminRoutes from "./routes/HomeAdminRoutes.js"
import galleryRoutes from "./routes/GalleryRoutes.js"
import generatedLinkRoutes from "./routes/GeneratedLinkRoutes.js"

const app = express()
const PORT = process.env.PORT;
app.use(express.urlencoded({ extended: true }));
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
  saveUninitialized: true, // Set to false if you want to be more strict
  cookie: {
    // Set secure to true only in production
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax' // 'lax' is a good, secure default.
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

// app.use("/")

app.use('/api/important-links', importantLinkRoutes);

async function startServer() {
   app.listen(PORT, () => {
      console.log(`Server is running on http://localhost:${PORT}`);
    });


    await sequelize.authenticate()
    console.log("Database connected")

    // await sequelize.sync({alter: true})
    // console.log("Database SYnced")
}
startServer()