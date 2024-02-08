import config from "config";
import User from "../entities/account/user.entity";
//import { CreateUserInput } from '../schemas/user.schema';
import { AppDataSource } from "../utils/data-source";
import AppError from "../utils/appError";
import Post from "../entities/post.entity";

const userRepository = AppDataSource.getRepository(User);
const postRepository = AppDataSource.getRepository(Post);

export const createUser = async (input: any) => {
  //console.log("create user input::\n", input);
  const user = AppDataSource.manager.create(User, input);

  return (await AppDataSource.manager.save(user)) as User;
};

export const findUserByEmail = async ({ email }: { email: string }) => {
  return await userRepository.findOneBy({ email });
};

export const findUserById = async (userId: string) => {
  return await userRepository.findOneBy({ id: userId });
};

export const findUser = async (query: Object) => {
  return await userRepository.findOneBy(query);
};

export const findAllUsers = async () => {
  return await userRepository.find();
};

export const updateUserPassword = async (id: string, newPassword: string) => {
  try {
    const user = await findUserById(id);
    return await userRepository.save(
      // @ts-ignore
      Object.assign(user, { password: newPassword })
    );
  } catch (err: any) {
    return new AppError(404, err.message);
  }
};

export const findPostsByID = async (id: string) => {
  try {
    const ph = await findUserById(id);
    console.log("findPostsByID returned: ", ph);
    await postRepository.find({
      where: {
        photographer: { id: ph ? ph.id : "" },
      },
    });
  } catch (err: any) {
    return new AppError(404, err.message);
  }
};
