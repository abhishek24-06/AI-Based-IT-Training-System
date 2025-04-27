import { DataSource } from "typeorm";
import { User } from "./entity/User";
import { Course } from "./entity/Course";
import { Assessment } from "./entity/Assessment";
import { Question } from "./entity/Question";
import { Certificate } from "./entity/Certificate";
import { SystemSettings } from "./entity/SystemSettings";
import { Log } from "./entity/Log";
import { Backup } from "./entity/Backup";
import { Quiz } from "./entity/Quiz";
import { Lesson } from "./entity/Lesson";
import { Video } from "./entity/Video";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "training_system",
  synchronize: process.env.NODE_ENV !== "production",
  logging: process.env.NODE_ENV !== "production",
  entities: [
    User,
    Course,
    Assessment,
    Question,
    Certificate,
    SystemSettings,
    Log,
    Backup,
    Quiz,
    Lesson,
    Video
  ],
  migrations: ["src/migration/**/*.ts"],
  subscribers: [],
});

// Initialize the database connection
let isInitialized = false;

export const initializeDatabase = async () => {
  if (!isInitialized) {
    try {
      await AppDataSource.initialize();
      console.log("Data Source has been initialized!");
      isInitialized = true;
    } catch (error) {
      console.error("Error during Data Source initialization:", error);
      throw error;
    }
  }
  return AppDataSource;
};
