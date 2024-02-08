import config from "config";
import { AppDataSource } from "../utils/data-source";
import AppError from "../utils/appError";
import Post from "../entities/post.entity";
import Photographer from "../entities/account/photographer.entity";

/* const doctorRepository = AppDataSource.getRepository(Doctor);
const messagesRepository = AppDataSource.getRepository(messages);
 */

const phRepository = AppDataSource.getRepository(Photographer);
const postRepository = AppDataSource.getRepository(Post);

export const insertNewPost = async (
  phId: string,
  location: string,
  desc: string,
  downloadable: boolean
) => {
  const post = new Post();
  post.photographer =
    (await phRepository.findOne({
      where: {
        id: phId,
      },
      // this is ungodly
    })) ?? new Photographer();

  return;
};
