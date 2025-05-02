import z from "zod";

const envSchema = z.object({
	PORT: z.coerce.number().min(1).max(65535),
	DATA_PERSISTANCE_FILE: z.string().nonempty(),
	DATA_SYNC_INTERVAL_MINUTES: z.coerce.number().min(1),
	BACKEND_URI: z.string().url(),
});

const env = envSchema.parse(process.env);

export { env };
