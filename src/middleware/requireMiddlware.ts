import { NextFunction, Request, Response } from "express";
import AppError from "../utils/appError";

export const requireUser = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    next();
  } catch (err: any) {
    next(err);
  }
};

export const requirePhotographer = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    next();
  } catch (err: any) {
    next(err);
  }
};
