import { NextFunction, Request, Response } from "express";
import { insertNewPost } from "../services/photographer.service";

export const newPostConstroller = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { phId, location, desc, downloadable } = req.body;
  // post logic here
  try {
    await insertNewPost(phId, location, desc, downloadable);
    res.status(200).json({
      status: "success",
      data: null,
    });
  } catch (error) {
    res.status(400).json({
      status: 400,
      error: "bad request",
    });
  }
};
