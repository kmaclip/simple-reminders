import express from 'express';
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  getTaskHistory
} from '../controllers/taskController';

const router = express.Router();

router.get('/:date', getTasks);
router.post('/', createTask);
router.put('/:id', updateTask);
router.delete('/:id', deleteTask);
router.get('/:id/history', getTaskHistory);

export default router;