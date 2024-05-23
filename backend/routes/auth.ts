import { userSignin  , workerSignin} from "../controllers/auth";
import express from 'express';

const router = express.Router();

router.post('/userSignin', userSignin);
router.post('/workerSignin', workerSignin);

export default router;