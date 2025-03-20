import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../env";
import { logger } from "../libs/pino";

const jwtSchema = z.object({
	userId: z.number(),
});

export const encodeJwt = (userId: number) =>
	new Promise((resolve, reject) =>
		jwt.sign(
			{ userId: userId },
			env.JWT_SECRET,
			{ expiresIn: env.JWT_EXPIRES_IN_SECONDS },
			(err, token) => {
				if (err) return reject(err);
				resolve(token);
			},
		),
	);

export const decodeJwt = (value: string) =>
	new Promise<z.infer<typeof jwtSchema> | null>((resolve) => {
		jwt.verify(value, env.JWT_SECRET, (err, decoded) => {
			if (err) {
				logger.error({ err }, "Errors during jwt decoding");
				return resolve(null);
			}

			const validation = jwtSchema.safeParse(decoded);
			if (validation.error) {
				logger.error({ err: validation.error }, "Errors during jwt parsing");
				return resolve(null);
			}

			resolve(validation.data);
		});
	});
