import express from "express";
import { getActiveAdvertisements } from "../../controllers/User/HomeAdvertiseController.js";

const router = express.Router();

router.get("/", getActiveAdvertisements);

export default router;
