import express from "express";
import {
  addAdvertisement,
  listAdvertisements,
  getAdvertisementById,
  updateAdvertisement,
  toggleAdvertisementStatus,
} from "../../controllers/Admin/AdvertisementController.js";
import upload from "../../middlewares/UploadMiddleware.js";
import { auth, hp } from "../../middlewares/AuthMiddleware.js";

const router = express.Router();
router.use(auth).use(hp("NA"));

const img = upload({
  mode: "fields",

  field: [
    { name: "en_adphoto", maxCount: 1 },
    { name: "od_adphoto", maxCount: 1 },
  ],

  uploadDir: "public/uploads/advertisements",
  allowedTypes: ["image/"],
  maxSize: 2 * 1024 * 1024,
  prefix: "ad",

  resize: true,
  width: 800,
  height: 600,
});

router.route("/").post(img, addAdvertisement).get(listAdvertisements);

router.route("/:id").get(getAdvertisementById).patch(img, updateAdvertisement);

router.patch("/:id/status", toggleAdvertisementStatus);

export default router;
