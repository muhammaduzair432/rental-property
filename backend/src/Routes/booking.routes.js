import { Router } from "express";
import { createBooking, getMyBookings, cancelBooking } from "../Controllers/booking.controller.js";
import { verifyJwt } from "../Middlewares/auth.middleware.js";

const router = Router();

router.use(verifyJwt); // Secures all downstream endpoints in this file

router.route("/request").post(createBooking);
router.route("/my-list").get(getMyBookings);
router.route("/cancel/:bookingId").put(cancelBooking);

export default router;