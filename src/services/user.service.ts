import config from "config";
import { User } from "../entities/user.entity";
//import { CreateUserInput } from '../schemas/user.schema';
import redisClient from "../utils/connectRedis";
import { AppDataSource } from "../utils/data-source";
import { signJwt } from "../utils/jwt";
import { Doctor } from "../entities/doctor.entity";
import AppError from "../utils/appError";
import { DailyReport } from "../entities/PatientProfile/dailyReport.entity";
import { dailyReportInput } from "../schemas/user.schema";
import exp from "constants";
import { messages } from "../entities/messages.entity";
import { Supplements } from "../entities/PatientProfile/supplement.entity";
import { DataSource } from "typeorm";
import { IMeal } from "../interfaces/requests.interfaces";
import { Meals_ } from "../entities/PatientProfile/meals.entity";

const userRepository = AppDataSource.getRepository(User);
const dailyReportRepository = AppDataSource.getRepository(DailyReport);
const messagesRepository = AppDataSource.getRepository(messages);
const supplementsRepository = AppDataSource.getRepository(Supplements);
const mealsRepository = AppDataSource.getRepository(Meals_);

export const createUser = async (input: any) => {
  console.log("create user input::\n", input);
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

// ? Sign access and Refresh Tokens
// scary times
export const signTokens = async (user: User | Doctor) => {
  // 1. Create Session
  redisClient.set(user.id, JSON.stringify(user), {
    EX: config.get<number>("redisCacheExpiresIn") * 60,
  });

  // 2. Create Access and Refresh tokens
  const access_token = signJwt({ sub: user.id }, "accessTokenPrivateKey", {
    expiresIn: `${config.get<number>("accessTokenExpiresIn")}m`,
  });

  const refresh_token = signJwt({ sub: user.id }, "refreshTokenPrivateKey", {
    expiresIn: `${config.get<number>("refreshTokenExpiresIn")}m`,
  });

  return { access_token, refresh_token };
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

export const createDailyReport = async (input: any, user: User) => {
  const dailyReport = dailyReportRepository.manager.create(DailyReport, {
    ...input,
    user: user,
  });
  return await dailyReportRepository.manager.save(dailyReport);
};

export const loadUserMessages = async (userID: string) => {
  const sentMessages = await messagesRepository.findBy({ senderID: userID });
  console.log("sent messages: ", sentMessages);

  const recievedMessages = await messagesRepository.findBy({
    recieverID: userID,
  });
  console.log("received messages: ", recievedMessages);

  const messages = sentMessages.concat(recievedMessages);
  console.log("loaded messages: ", messages);
  messages.sort((a: any, b: any) => a.created_at - b.created_at);

  return messages;
};

export const insertMessage = async (
  senderID: string,
  recieverID: string,
  messageContent: string
) => {
  const message = await messagesRepository.manager.create(messages, {
    senderID: senderID,
    recieverID: recieverID,
    messageContent: messageContent,
  });
  return await messagesRepository.save(message);
};

// supplementss
export const getSupplements = async (user: User) => {
  const supplements = supplementsRepository.find({
    where: {
      user: { id: user.id },
    },
  });

  return supplements;
};

export const addSupplements = async (supplements: string[], user: User) => {
  if (supplements.length > 0) {
    supplements.forEach(async (name) => {
      const supp = new Supplements();
      supp.name = name;
      supp.user = user;
      await supplementsRepository.manager.save(supp);
    });
  }
};

export const createMeals = (meals: IMeal[], dr: DailyReport) => {
  const mealsArray: Array<Meals_> = [];
  meals.forEach(async (meal) => {
    const ml = new Meals_();
    ml.time = meal.time;
    ml.type = meal.type;
    ml.components = meal.components;
    ml.dailyReport = dr;
    mealsArray.push(await mealsRepository.manager.save(ml));
  });
  return mealsArray;
};
