import z from "zod";

const envSchema = z.object({
	PORT: z.coerce.number(),
	DATABASE_URL: z.string(),
	LOGGER_LEVEL: z
		.enum(["trace", "debug", "info", "warn", "error", "fatal"])
		.default("info"),
	JWT_SECRET: z.string(),
	JWT_EXPIRES_IN_SECONDS: z.coerce.number(),
	MICROSOFT_CLIENT_ID: z.string(),
	MICROSOFT_CLIENT_SECRET: z.string(),
	MICROSOFT_CALLBACK_URL: z.string(),
	AUTH_TOKEN_RETRIEVAL_TIMEOUT_SECONDS: z.coerce.number(),
	WEB_LOGIN_URL: z.string(),
	WEB_TOKEN_CALLBACK_URL: z.string(),
});

export const env = envSchema.parse(process.env);
