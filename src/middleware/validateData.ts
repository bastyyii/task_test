import { NextFunction, Request, Response } from "express";
import { body, param } from "express-validator";
import { handleInputErrors } from "./errors";

export const validateId = async (req: Request, res: Response, next: NextFunction) => {
    await param('id')
        .notEmpty().withMessage('ID no valido')
        .run(req)

    handleInputErrors(req, res, next);
};

export const validateTitle = async (req: Request, res: Response, next: NextFunction) => {
    await body('titulo')
        .notEmpty().withMessage('El titulo no puede ir vacío')
        .run(req)

    handleInputErrors(req, res, next);
};
