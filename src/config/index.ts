import { z } from 'zod';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from .env file
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Define the schema for validating environment variables
const envVarsSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'test', 'production'])
    .default('development'),
  PORT: z
    .string({
      invalid_type_error: 'PORT must be a string',
      required_error: 'PORT is required',
    })
    .default('5673'),
  SOCKET: z
    .string({
      invalid_type_error: 'SOCKET must be a string',
      required_error: 'SOCKET is required',
    })
    .default('8082'),
  MONGODB_URL: z.string({
    required_error: 'MongoDB URL is required',
    invalid_type_error: 'MongoDB URL must be a string',
  }),
  JWT_SECRET: z.string({
    required_error: 'JWT secret is required',
    invalid_type_error: 'JWT secret must be a string',
  }),
  JWT_EXPIRATION_TIME: z
    .string({
      invalid_type_error: 'JWT_EXPIRATION_TIME must be a valid string',
      required_error: 'JWT_EXPIRATION_TIME is required',
    })
    .default('1d'),
  JWT_REFRESH_EXPIRATION_TIME: z
    .string({
      invalid_type_error: 'JWT_REFRESH_EXPIRATION_TIME must be a valid string',
      required_error: 'JWT_REFRESH_EXPIRATION_TIME is required',
    })
    .default('180d'),
  BCRYPT_SALT_ROUNDS: z
    .string({
      invalid_type_error: 'BCRYPT_SALT_ROUNDS must be a string',
      required_error: 'BCRYPT_SALT_ROUNDS is required',
    })
    .default('12'),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().optional(),
  SMTP_USERNAME: z.string().optional(),
  SMTP_PASSWORD: z.string().optional(),
  EMAIL_FROM: z.string().optional(),
  BACKEND_IP: z.string().optional(),
  LOCAL_SERVER:z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  STRIPE_WEBHOOK_SECRET: z.string().optional(),
});

// Validate the environment variables
const envVars = envVarsSchema.safeParse(process.env);
if (!envVars.success) {
  console.log(envVars.error);
  throw new Error(`Config validation error: ${envVars.error.format()}`);
}

export default {
  env: envVars.data.NODE_ENV,
  port: envVars.data.PORT,
  socket_port: envVars.data.SOCKET,
  mongoose: {
    url: envVars.data.MONGODB_URL,
    options: {
      // Optional Mongoose configurations can go here
    },
  },
  jwt: {
    accessSecret: envVars.data.JWT_SECRET,
    accessExpirationTime: envVars.data.JWT_EXPIRATION_TIME,
    refreshExpirationTime: envVars.data.JWT_REFRESH_EXPIRATION_TIME,
  },
  bcrypt: {
    saltRounds: envVars.data.BCRYPT_SALT_ROUNDS,
  },
  email: {
    smtp: {
      host: envVars.data.SMTP_HOST,
      port: envVars.data.SMTP_PORT,
      auth: {
        user: envVars.data.SMTP_USERNAME,
        pass: envVars.data.SMTP_PASSWORD,
      },
    },
    from: envVars.data.EMAIL_FROM,
  },
  backendIp: envVars.data.BACKEND_IP || 'localhost',
  localServer : envVars.data.LOCAL_SERVER,
  stripe: {
    secretKey: envVars.data.STRIPE_SECRET_KEY,
    webhookSecret: envVars.data.STRIPE_WEBHOOK_SECRET,
  },
};
