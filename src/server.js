import dotenv from 'dotenv';
dotenv.config();

import express from 'express'

import { fileURLToPath } from 'url';
import path from 'path';

import sequelize from '../config/db.js';
import cors from 'cors';
import cookieParser from 'cookie-parser';



import adminAuthRoutes from './routes/AdminAuthRoutes.js';
import pageRoutes from "./routes/PageRoutes.js"
import pagePermissionRoutes from "./routes/PagePermissionRoutes.js"
import tenderRoutes from "./routes/TenderRoutes.js"
import corrigendumRoutes from "./routes/CorrigendumRoutes.js"
import footerlinkRoutes from "./routes/FooterLinkRoutes.js";
import actAndRuleRoutes from "./routes/ActAndRuleRoutes.js"
import newsAndEventRoutes from "./routes/NewsAndEventRoutes.js"
import policyRoutes from './routes/PolicyRoutes.js';
import schemeRoutes from './routes/SchemeRoutes.js';
import imageSetupRoutes from './routes/ImageSetupRoutes.js';

import chatbotCategoryRoutes from './routes/chatbotCategoryRoutes.js';
import chatbotQuestionRoutes from './routes/chatbotQuestionRoutes.js';
import chatbotAnswerRoutes from './routes/chatbotAnswerRoutes.js';

import menuRoutes from './routes/MenuRoutes.js';
import subMenuRoutes from './routes/SubMenuRoutes.js';
import subSubMenuRoutes from './routes/SubSubMenuRoutes.js'; 
import FormRoutes from './routes/FormRoutes.js';
import BedStrengthRoutes from './routes/BedStrengthRroutes.js';

const app = express()
const PORT = process.env.PORT;
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json())
const corsOptions = {
  origin: 'http://localhost:3000',
  credentials: true,                
};
app.use(cors(corsOptions));

app.use(express.static(path.join(__dirname, '../public')));


app.use('/admin',  adminAuthRoutes)
app.use("/pages", pageRoutes)
app.use("/permissions", pagePermissionRoutes )
app.use("/tenders", tenderRoutes)
app.use("/corrigendums", corrigendumRoutes)
app.use("/api/footerlinks", footerlinkRoutes);
app.use("/api/act-and-rules", actAndRuleRoutes);
app.use("/api/news-and-events", newsAndEventRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/schemes', schemeRoutes);
app.use('/image-setup',  imageSetupRoutes)

app.use('/api/chatbot-categories', chatbotCategoryRoutes);
app.use('/api/chatbot-questions', chatbotQuestionRoutes);
app.use('/api/chatbot-answers', chatbotAnswerRoutes);

app.use('/api/menus', menuRoutes);
app.use('/api/submenus', subMenuRoutes);
app.use('/api/subsubmenus', subSubMenuRoutes);
app.use('/api/forms',FormRoutes);
app.use('/api/bed-strengths', BedStrengthRoutes);


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