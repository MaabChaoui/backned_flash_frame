import { NextFunction, Request, Response } from "express";

import AppError from "../utils/appError";
import { IGetPosts } from "../interfaces/requests.interfeces";

export const getFeedController = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {};

export const getPostsContoller = async (
  req: Request<{}, {}, IGetPosts>,
  res: Response,
  next: NextFunction
) => {
  const { userID } = req.body;
  

};
