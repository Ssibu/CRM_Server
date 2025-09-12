import express from "express"
import { getHomeBoardData } from "../../controllers/User/HomeBoardController.js";

const router = express.Router();

router.get('/', getHomeBoardData );

export default router;