import express from 'express';
import { getAllUsers, getAUser, loginUser, myProfile, updateName, verifyUser } from '../controllers/user.js';
import { isAuth } from '../middlewares/isAuth.js';

const router = express.Router();


router.post("/login",loginUser);
router.post("/verify",verifyUser);
router.get("/me",isAuth,myProfile);
router.get("/user/all",isAuth,getAllUsers);
router.get("/user/:id",getAUser);
router.post("/user/update-name", isAuth, updateName);
export default router;

