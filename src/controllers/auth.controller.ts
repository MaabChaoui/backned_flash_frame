import { CookieOptions, NextFunction, Request, Response } from "express";
import config from "config";
import { CreateUserInput, LoginUserInput } from "../schemas/user.schema";
import {
  createUser,
  findUserByEmail,
  findUserById,
  signTokens,
} from "../services/user.service";
import AppError from "../utils/appError";
import redisClient from "../utils/connectRedis";
import { signJwt, verifyJwt } from "../utils/jwt";
import { User } from "../entities/user.entity";
import { LoginDoctorInput } from "../schemas/doctor.schemas";
import { createDoctor, findDoctorByEmail } from "../services/doctor.service";
import { Doctor } from "../entities/doctor.entity";

// ? Cookie Options Here
const cookiesOptions: CookieOptions = {
  //temp false
  httpOnly: false,
  sameSite: "lax",
};

if (process.env.NODE_ENV === "production") cookiesOptions.secure = true;

const accessTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>("accessTokenExpiresIn") * 60 * 1000
  ),
  maxAge: config.get<number>("accessTokenExpiresIn") * 60 * 1000,
};

const refreshTokenCookieOptions: CookieOptions = {
  ...cookiesOptions,
  expires: new Date(
    Date.now() + config.get<number>("refreshTokenExpiresIn") * 60 * 1000
  ),
  maxAge: config.get<number>("refreshTokenExpiresIn") * 60 * 1000,
};

// ? register user controller

export const registerUserHandler = async (
  req: Request<{}, {}, CreateUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      fName,
      lName,
      email,
      phone,
      photoURL,
      password,
      gender,
      dateOfBirth,
      maritalStatus,
      height,
      weight,
      waistMeasurements,
      hipMeasurements,
      illnesses,
      parentsIllnessDescription,
      sleepingProblems,
      plan,
    } = req.body;

    const user = await createUser({
      fName,
      lName,
      email: email.toLowerCase(),
      phone,
      photoURL,
      password,
      gender,
      dateOfBirth,
      maritalStatus,
      height,
      weight,
      waistMeasurements,
      hipMeasurements,
      sleepingProblems,
      illnesses,
      parentsIllnessDescription,
      plan,
    });

    res.status(201).json({
      status:200,
      data: {
        user,
      },
    });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({
        status: 409,
        message: "User with that email already exist",
      });
    }
    next(err);
  }
};

// ? login user controller

export const loginUserHandler = async (
  req: Request<{}, {}, LoginUserInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const user = await findUserByEmail({ email });

    //1. Check if user exists and password is valid
    if (!user || !(await User.comparePasswords(password, user.password))) {
      return next(new AppError(400, "Invalid email or password"));
    }

    // 2. Sign Access and Refresh Tokens
    const { access_token, refresh_token } = await signTokens(user);

    // 3. Add Cookies
    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("refresh_token", refresh_token, refreshTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // 4. Send response
    res.status(200).json({
      status:200,
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

// ? login doctor controller

export const loginDoctorHandler = async (
  req: Request<{}, {}, LoginDoctorInput>,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, password } = req.body;
    const doctor = await findDoctorByEmail({ email });

    //1. Check if doctor exists and password is valid
    if (
      !doctor ||
      !(await Doctor.comparePasswords(password, doctor.password))
    ) {
      console.log("found the error at compare pass: ", doctor);

      return next(new AppError(400, "Invalid email or password"));
    }

    // 2. Sign Access and Refresh Tokens
    const { access_token, refresh_token } = await signTokens(doctor);

    // 3. Add Cookies
    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("refresh_token", refresh_token, refreshTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // 4. Send response
    res.status(200).json({
      status:200,
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

// ? refresh access token controller

export const refreshAccessTokenHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const refresh_token = req.cookies.refresh_token;

    const message = "Could not refresh access token";

    if (!refresh_token) {
      return next(new AppError(403, message));
    }

    // Validate refresh token
    const decoded = verifyJwt<{ sub: string }>(
      refresh_token,
      "refreshTokenPublicKey"
    );

    if (!decoded) {
      return next(new AppError(403, message));
    }

    // Check if user has a valid session
    const session = await redisClient.get(decoded.sub);

    if (!session) {
      return next(new AppError(403, message));
    }

    // Check if user still exist
    const user = await findUserById(JSON.parse(session).id);

    if (!user) {
      return next(new AppError(403, message));
    }

    // Sign new access token
    const access_token = signJwt({ sub: user.id }, "accessTokenPrivateKey", {
      expiresIn: `${config.get<number>("accessTokenExpiresIn")}m`,
    });

    // 4. Add Cookies
    res.cookie("access_token", access_token, accessTokenCookieOptions);
    res.cookie("logged_in", true, {
      ...accessTokenCookieOptions,
      httpOnly: false,
    });

    // 5. Send response
    res.status(200).json({
      status:200,
      access_token,
    });
  } catch (err: any) {
    next(err);
  }
};

// ? logout user controller

const logout = (res: Response) => {
  res.cookie("access_token", "", { maxAge: -1 });
  res.cookie("refresh_token", "", { maxAge: -1 });
  res.cookie("logged_in", "", { maxAge: -1 });
};

export const logoutUserHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const user = res.locals.user;

    await redisClient.del(user.id);
    logout(res);

    res.status(200).json({
      status:200,
    });
  } catch (err: any) {
    next(err);
  }
};

// ? logout doctor controller

export const logoutDoctorHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const doctor = res.locals.doctor;

    await redisClient.del(doctor.id);
    logout(res);

    res.status(200).json({
      status:200,
    });
  } catch (err: any) {
    next(err);
  }
};

// ? register doctor controller
// ,,
export const registerDoctorHandler = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const {
      fName,
      lName,
      email,
      phone,
      photoURL,
      password,
      dateOfBirth,
      gender,
      bio,
      address,
      city,
      wilaya,
      postcode,
      clinicName,
      clinicAddress,
    } = req.body;

    const doctor = await createDoctor({
      fName,
      lName,
      email: email.toLowerCase(),
      phone,
      photoURL,
      password,
      gender,
      dateOfBirth,
      bio,
      address,
      city,
      wilaya,
      postcode,
      clinicName,
      clinicAddress,
    });

    res.status(201).json({
      status:200,
      data: {
        doctor,
      },
    });
  } catch (err: any) {
    if (err.code === "23505") {
      return res.status(409).json({
        status: "fail",
        message: "Doctor with that email already exist",
      });
    }
    next(err);
  }
};
