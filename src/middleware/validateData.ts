import { NextFunction, Request, Response } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "./errors";

export const validateId = async (req: Request, res: Response, next: NextFunction) => {
    await param('id')
        .notEmpty().withMessage('ID no valido')
        .run(req)

    handleInputErrors(req, res, next);
};

export const validateDataBody= async (req: Request, res: Response, next: NextFunction) => {
    await body('title')
        .notEmpty().withMessage('The title cannot be empty')
        .isString().withMessage('The title must be a string')
        .isLength({ max: 100 }).withMessage('The title cannot exceed 100 characters.')
        .run(req)
    await body('description')
        .isString().withMessage('The description must be a string')
        .isLength({ max: 500 }).withMessage('The description cannot exceed 500 characters.')
        .run(req)
    handleInputErrors(req, res, next);
};

export const validateStatus = async (req: Request, res: Response, next: NextFunction) => {
    await body('status')
        .notEmpty().withMessage('Status is mandatory')
        .isString().withMessage('The status must be a string')
        .run(req)
    handleInputErrors(req, res, next);
};