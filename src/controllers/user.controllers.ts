import { NextFunction, Request, Response } from "express";

import AppError from "../utils/appError";
import { IGetPosts } from "../interfaces/requests.interfeces";
import { findPostsByID } from "../services/user.service";

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
  try {
    const posts = await findPostsByID(userID);
    res.status(200).json({
      status: 200,
      data: posts,
    });
  } catch (e: any) {
    res.status(404).json({
      status: 404,
      error: {
        message: "There was an error with the request.",
      },
    });
  }
};
