require("dotenv").config();
import "reflect-metadata";
import { DataSource } from "typeorm";
import config from "config";

export const postgresConfig = config.get<{
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}>("postgresConfig");

export const AppDataSource = new DataSource({
  ...postgresConfig,
  type: "postgres",
  // only for development, set to false for production:
  synchronize: true,
  logging: false,
  //namingStrategy: new SnakeNamingStrategy(),
  entities: ["src/entities/**/*.entity{.ts,.js}"],
  migrations: ["src/migrations/**/*{.ts,.js}"],
  subscribers: ["src/subscribers/**/*{.ts,.js}"],
});
