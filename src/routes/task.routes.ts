import { Router } from 'express';
import {
  getTasks,
  createTask,
  updateTaskStatus,
  deleteTask,
} from '../controllers/task.controller';
import { validateId, validateDataBody } from '../middleware/validateData';

const router = Router();

router.param('id', validateId);

router.get('/', getTasks);

router.post('/', 
  validateDataBody,
  createTask);

router.put('/:id', updateTaskStatus);

router.delete('/:id', deleteTask);

export default router;
