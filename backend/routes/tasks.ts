import express from 'express';
import {createTask , renewTask , pendingTask , finishedTask  , reviewTask , getTasks, decrementPendingAmount, failedTransaction, lockamount} from '../controllers/tasks';
import {auth} from '../middleware/auth';

const router = express.Router();

router.post('/createTask', auth , createTask);
router.post('/renewTask', auth , renewTask);
router.get('/pendingTask', auth , pendingTask);
router.post('/finishedTask', auth , finishedTask);
router.post('/reviewTask', auth , reviewTask);
router.get('/getTasks', auth , getTasks);
router.post('/decrementAmount' , auth ,  decrementPendingAmount);
router.post('/lockAmount' , auth ,  lockamount);
router.post('/failedTask', auth ,  failedTransaction);

export default router;