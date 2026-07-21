import express from 'express';
import { body } from 'express-validator';
import { registerUser, loginUser } from "../controllers/authController.js";
import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

router.post(
  "/register",
  [
    body("name", "Name is required").notEmpty(),
    body("email", "Please include a valid email").isEmail(),
    body("password", "Password must be at least 8 characters").isLength({ min: 8 }),
  ],
  validateRequest,
  registerUser
);
router.post(
    '/login',
    [
        body('email', 'Please include a valid email').isEmail(),
        body('password', 'Password is required').exists(),
    ],
    validateRequest,
    loginUser
);


export default router;