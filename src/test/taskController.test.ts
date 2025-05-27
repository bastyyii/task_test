import { createRequest, createResponse } from 'node-mocks-http';
import { createTask, deleteTask, getTasks, updateTaskStatus } from '../controllers/task.controller';
import { Task } from '../models/task.model';
import db from '../services/db';
import { Statement } from 'better-sqlite3';

describe('getTasks', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return a list of tasks with status 200', () => {
    const fakeTasks: Task[] = [
      {
        id: 1,
        title: 'Tarea 1',
        description: 'Descripción',
      },
    ];

    const mockAll = jest.fn().mockReturnValue(fakeTasks);
    jest.spyOn(db, 'prepare').mockImplementation(() => ({
      all: mockAll,
    }) as unknown as Statement);

    const req = createRequest();
    const res = createResponse();

    getTasks(req, res);

    expect(res.statusCode).toBe(200);
    expect(res._getJSONData()).toEqual(fakeTasks);
    expect(db.prepare).toHaveBeenCalledWith(expect.stringContaining('SELECT *'));
  });

  it('should return 500 if database throws an error', () => {
    const mockAll = jest.fn(() => {
      throw new Error('DB error');
    });

    jest.spyOn(db, 'prepare').mockImplementation(() => ({
      all: mockAll,
    }) as unknown as Statement);

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
  });

  it('should create a new task and respond with 201 and the new task', () => {
    const fakeTask: Task = {
      id: 1,
      title: 'Test Task',
      description: 'Description',
    };

    const mockRun = jest.fn().mockReturnValue({ lastInsertRowid: 1 });
    const mockGet = jest.fn().mockReturnValue(fakeTask);

    const prepareSpy = jest.spyOn(db, 'prepare')
      .mockImplementationOnce(() => ({
        run: mockRun,
      }) as unknown as Statement)
      .mockImplementationOnce(() => ({
        get: mockGet,
      }) as unknown as Statement);

    const req = createRequest({
      body: {
        title: 'Test Task',
        description: 'Description',
      },
    });
    const res = createResponse();

    createTask(req, res);

    expect(prepareSpy).toHaveBeenCalled();
    expect(mockRun).toHaveBeenCalledWith('Test Task', 'Description');
    expect(mockGet).toHaveBeenCalledWith(1);
    expect(res.statusCode).toBe(201);
    expect(res._getJSONData()).toEqual(fakeTask);
  });

  it('should return 500 if there is a database error', () => {
    const mockRun = jest.fn(() => {
      throw new Error('DB Insert error');
    });

    jest.spyOn(db, 'prepare').mockImplementation(() => ({
      run: mockRun,
    }) as unknown as Statement);

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

    const mockRun = jest.fn().mockReturnValue({ changes: 1 });
    const mockGet = jest.fn().mockReturnValue(fakeTask);

    const prepareSpy = jest.spyOn(db, 'prepare')
      .mockImplementationOnce(() => ({
        run: mockRun,
      }) as unknown as Statement)
      .mockImplementationOnce(() => ({
        get: mockGet,
      }) as unknown as Statement);

    const req = createRequest({
      params: { id: '1' },
      body: { status: 'completed' },
    });
    const res = createResponse();

    updateTaskStatus(req, res);

    expect(prepareSpy).toHaveBeenCalledTimes(2);
    expect(mockRun).toHaveBeenCalledWith('completed', '1');
    expect(mockGet).toHaveBeenCalledWith('1');
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
    expect(res._getJSONData()).toEqual({ error: 'Invalid status. Must be "pending" or "compled".' });
  });

  it('should return 404 if no task was updated', () => {
    const mockRun = jest.fn().mockReturnValue({ changes: 0 });

    jest.spyOn(db, 'prepare')
      .mockImplementationOnce(() => ({
        run: mockRun,
      }) as unknown as Statement);

    const req = createRequest({
      params: { id: '99' },
      body: { status: 'pending' },
    });
    const res = createResponse();

    updateTaskStatus(req, res);

    expect(mockRun).toHaveBeenCalledWith('pending', '99');
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'Task not found' });
  });

  it('should return 500 if there is a database error', () => {
    const mockRun = jest.fn(() => {
      throw new Error('DB error');
    });

    jest.spyOn(db, 'prepare')
      .mockImplementationOnce(() => ({
        run: mockRun,
      }) as unknown as Statement);

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
  });

  it('should delete task and return 204 status', () => {
    const mockRun = jest.fn().mockReturnValue({ changes: 1 });

    jest.spyOn(db, 'prepare').mockImplementation(() => ({
      run: mockRun,
    }) as unknown as Statement);

    const req = createRequest({
      params: { id: '1' },
    });
    const res = createResponse();

    deleteTask(req, res);

    expect(mockRun).toHaveBeenCalledWith('1');
    expect(res.statusCode).toBe(204);
    expect(res._isEndCalled()).toBe(true); 
  });

  it('should return 404 if task not found', () => {
    const mockRun = jest.fn().mockReturnValue({ changes: 0 });

    jest.spyOn(db, 'prepare').mockImplementation(() => ({
      run: mockRun,
    }) as unknown as Statement);

    const req = createRequest({
      params: { id: '99' },
    });
    const res = createResponse();

    deleteTask(req, res);

    expect(mockRun).toHaveBeenCalledWith('99');
    expect(res.statusCode).toBe(404);
    expect(res._getJSONData()).toEqual({ error: 'Task not found' });
  });

  it('should return 500 if database throws error', () => {
    const mockRun = jest.fn(() => {
      throw new Error('DB error');
    });

    jest.spyOn(db, 'prepare').mockImplementation(() => ({
      run: mockRun,
    }) as unknown as Statement);

    const req = createRequest({
      params: { id: '1' },
    });
    const res = createResponse();

    deleteTask(req, res);

    expect(res.statusCode).toBe(500);
    expect(res._getJSONData()).toEqual({ error: 'Server error deleting task' });
  });
});