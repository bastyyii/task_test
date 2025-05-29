import { createRequest, createResponse } from 'node-mocks-http';
import { createTask, deleteTask, getTasks, updateTaskStatus } from '../controllers/task.controller';
import { Task } from '../models/task.model';
import db from '../services/db';
import { Statement } from 'better-sqlite3';
import { getAllTasks, createTaskInDb, updateTaskStatusInDb, deleteTaskInDb } from '../services/taskRepository';
jest.mock('../services/taskRepository'); 

describe('getTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of tasks with status 200', () => {
    const fakeTasks: Task[] = [
      {
        title: 'Tarea 1',
        description: 'Descripción'
      },
    ];
    (getAllTasks as jest.Mock).mockReturnValue(fakeTasks);

    const req = createRequest();
    const res = createResponse();

    getTasks(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(fakeTasks);
    expect(getAllTasks).toHaveBeenCalled();
  });

  it('should return 500 if repository throws an error', () => {
    (getAllTasks as jest.Mock).mockImplementation(() => {
      throw new Error('DB error');
    });

    const req = createRequest();
    const res = createResponse();

    getTasks(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Server error retrieving tasks' });
  });
});

describe('createTask', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should create a new task and respond with 201 and the new task', () => {
    const fakeTask: Task = {
      id: 1,
      title: 'Test Task',
      description: 'Description'
    };

    (createTaskInDb as jest.Mock).mockReturnValue(fakeTask);

    const req = createRequest({
      body: {
        title: 'Test Task',
        description: 'Description',
      },
    });
    const res = createResponse();

    createTask(req, res);

    expect(createTaskInDb).toHaveBeenCalledWith('Test Task', 'Description');
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual(fakeTask);
  });

  it('should return 500 if there is a database error', () => {
    (createTaskInDb as jest.Mock).mockImplementation(() => {
      throw new Error('DB Insert error');
    });

    const req = createRequest({
      body: {
        title: 'Test Task',
        description: 'Description',
      },
    });
    const res = createResponse();

    createTask(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Server error creating task' });
  });
});

describe('updateTaskStatus', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should update task status and return updated task with status 200', () => {
    const fakeTask: Task = {
      id: 1,
      title: 'Test Task',
      description: 'Description',
      status: 'completed',
      creationDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
    };

    (updateTaskStatusInDb as jest.Mock).mockReturnValue(fakeTask);

    const req = createRequest({
      params: { id: '1' },
      body: { status: 'completed' },
    });
    const res = createResponse();

    updateTaskStatus(req, res);

    expect(updateTaskStatusInDb).toHaveBeenCalledWith('1', 'completed');
    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(fakeTask);
  });

  it('should return 400 if status is invalid', () => {
    const req = createRequest({
      params: { id: '1' },
      body: { status: 'invalid-status' },
    });
    const res = createResponse();

    updateTaskStatus(req, res);

    expect(res.statusCode).toBe(400);
    expect(res._getJSONData()).toEqual({ error: 'Invalid status. Must be "pending" or "completed".' });
  });

  it('should return 404 if no task was updated', () => {
    (updateTaskStatusInDb as jest.Mock).mockReturnValue(null);

    const req = createRequest({
      params: { id: '99' },
      body: { status: 'pending' },
    });
    const res = createResponse();

    updateTaskStatus(req, res);

    expect(updateTaskStatusInDb).toHaveBeenCalledWith('99', 'pending');
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'Task not found' });
  });

  it('should return 500 if there is a database error', () => {
    (updateTaskStatusInDb as jest.Mock).mockImplementation(() => {
      throw new Error('DB error');
    });

    const req = createRequest({
      params: { id: '1' },
      body: { status: 'pending' },
    });
    const res = createResponse();

    updateTaskStatus(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Server error updating task status' });
  });
});

describe('deleteTask', () => {
  afterEach(() => {
    jest.restoreAllMocks();
    jest.clearAllMocks();
  });

  it('should delete task and return 204 status', () => {
    (deleteTaskInDb as jest.Mock).mockReturnValue(true);

    const req = createRequest({
      params: { id: '1' },
    });
    const res = createResponse();

    deleteTask(req, res);

    expect(deleteTaskInDb).toHaveBeenCalledWith('1');
    expect(res.statusCode).toBe(204);
    expect(res._isEndCalled()).toBe(true);
  });

  it('should return 404 if task not found', () => {
    (deleteTaskInDb as jest.Mock).mockReturnValue(false);

    const req = createRequest({
      params: { id: '99' },
    });
    const res = createResponse();

    deleteTask(req, res);

    expect(deleteTaskInDb).toHaveBeenCalledWith('99');
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'Task not found' });
  });

  it('should return 500 if database throws error', () => {
    (deleteTaskInDb as jest.Mock).mockImplementation(() => {
      throw new Error('DB error');
    });

    const req = createRequest({
      params: { id: '1' },
    });
    const res = createResponse();

    deleteTask(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Server error deleting task' });
  });
});