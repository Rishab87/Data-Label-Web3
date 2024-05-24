import express from 'express';
import {createTask , renewTask , pendingTask , finishedTask  , reviewTask , getTasks} from '../controllers/tasks';
import {auth} from '../middleware/auth';

const router = express.Router();

router.post('/createTask', auth , createTask);
router.post('/renewTask', auth , renewTask);
router.post('/pendingTask', auth , pendingTask);
router.post('/finishedTask', auth , finishedTask);
router.post('/reviewTask', auth , reviewTask);
router.get('/getTasks', auth , getTasks);

export default router;