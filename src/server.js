import express from "express"
import {sequelize} from "./models/index.js"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from "cookie-parser"
import { fileURLToPath } from 'url';
import path from 'path';



import authRoutes from "./routes/AuthRoutes.js"
import pageRoutes from "./routes/PageRoutes.js"
import footerlinkRoutes from "./routes/footerlink.routes.js";
import actAndRuleRoutes from "./routes/actAndRule.routes.js"
import newsAndEventRoutes from "./routes/newsAndEvent.routes.js"
import policyRoutes from './routes/policy.routes.js';
import schemeRoutes from './src/routes/scheme.routes.js';





dotenv.config();
const app = express()
const PORT = process.env.PORT

app.use(cors({
        origin: process.env.CORS_ORIGIN, 

    credentials: true   
}));
app.use(cookieParser());

app.use(express.json())
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);




app.use(express.static(path.join(__dirname, '../public')));
app.use("/auth", authRoutes)
app.use("/pages", pageRoutes)
app.use("/api/footerlinks", footerlinkRoutes);
app.use("/api/act-and-rules", actAndRuleRoutes);
app.use("/api/news-and-events", newsAndEventRoutes);
app.use('/api/policies', policyRoutes);
app.use('/api/schemes', schemeRoutes);

const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log('db success');
    

      await sequelize.sync({ alter: true });
      console.log('sync success');

    app.listen(PORT, () => {
      console.log(`express connected on ${PORT}`);
    });
  } catch (error) {
    console.error( error);
  }
};

startServer();