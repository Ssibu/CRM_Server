import express from 'express';
import {
    addHoliday,
    listHolidays,
    getHolidayById,
    updateHoliday,
    toggleHolidayStatus,
    deleteHoliday,
} from '../controllers/HolidayController.js';
import {auth, hp} from "../middlewares/AuthMiddleware.js"

const router = express.Router();
router.use(auth).use(hp("NH"))

router.route('/')
    .post(addHoliday)
    .get(listHolidays);

router.route('/:id')
    .get(getHolidayById)
    .patch(updateHoliday)
    .delete(deleteHoliday);

router.patch('/:id/status', toggleHolidayStatus);

export default router;