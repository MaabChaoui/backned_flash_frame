import config from "config";
import { User } from "../entities/user.entity";
//import { CreateUserInput } from '../schemas/user.schema';
import redisClient from "../utils/connectRedis";
import { AppDataSource } from "../utils/data-source";
import { signJwt } from "../utils/jwt";
import { Doctor } from "../entities/doctor.entity";
import AppError from "../utils/appError";
import { messages } from "../entities/messages.entity";

const doctorRepository = AppDataSource.getRepository(Doctor);
const messagesRepository = AppDataSource.getRepository(messages);

export const findDoctorByEmail = async ({ email }: { email: string }) => {
  return await doctorRepository.findOneBy({ email });
};

export const findDoctorById = async (doctorId: string) => {
  return await doctorRepository.findOneBy({ id: doctorId });
};

export const findDoctor = async (query: Object) => {
  return await doctorRepository.findOneBy(query);
};

// danger zone
export const createDoctor = async (input: any) => {
  console.log("input:\n", input);
  const doctor = AppDataSource.manager.create(Doctor, input);

  console.log(doctor.password);

  return (await AppDataSource.manager.save(doctor)) as Doctor;
};

export const updateDoctorPassword = async (id:string, newPassword: string) => {
  try {
    const doctor = await findDoctorById(id)
    // @ts-ignore
    return await doctorRepository.save(Object.assign(doctor, {password: newPassword}))
  } catch (err: any) {
    return (new AppError(404, "doctor not found"))
  }
}

export const loadDoctorMessages = async (userID: string) => {
  const sentMessages = await messagesRepository.findBy({ senderID: userID });
  console.log("sent messages: ", sentMessages);

  const recievedMessages = await messagesRepository.findBy({
    recieverID: userID,
  });
  console.log("received messages: ", recievedMessages);

  const messages = sentMessages.concat(recievedMessages);
  console.log("loaded messages: ", messages);
  messages.sort((a:any, b: any) => a.created_at - b.created_at);

  return messages;
};