import express from "express";
import passport from "passport";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import type OAuth2Strategy from "passport-oauth2";
import { z } from "zod";
import { upsertMicrosoftLogin } from "../core/accounts";
import { env } from "../env";
import { logger } from "../libs/pino";
import { encodeJwt } from "./jwt";

const microsoftProfileSchema = z.object({
	id: z.string(),
	displayName: z.string(),
	_json: z.object({ mail: z.string() }),
});

const microsoftStrategy = new MicrosoftStrategy(
	{
		clientID: env.MICROSOFT_CLIENT_ID,
		clientSecret: env.MICROSOFT_CLIENT_SECRET,
		scope: ["user.read"],
	},
	async (
		_accessToken: string,
		_refreshToken: string,
		rawProfile: unknown,
		done: OAuth2Strategy.VerifyCallback,
	) => {
		logger.info("Processing microsoft login callback");

		const profileValidation = microsoftProfileSchema.safeParse(rawProfile);
		if (profileValidation.error) {
			logger.error(
				{ error: profileValidation.error },
				"Failed to parse profile",
			);
			return done(profileValidation.error);
		}
		const profile = profileValidation.data;

		const microsoftLogin = await upsertMicrosoftLogin({
			id: profile.id,
			email: profile._json.mail,
			name: profile.displayName,
		});
		logger.info(
			{ id: microsoftLogin.id, userId: microsoftLogin.userId },
			"Retrieved microsoft login",
		);
		return done(null, { id: microsoftLogin.userId });
	},
);

export const setupAuth = () => {
	passport.use(microsoftStrategy);
	passport.initialize();
};

export const authRouter = express.Router();

authRouter.get("/auth/microsoft", passport.authenticate("microsoft"));
authRouter.get(
	"/auth/microsoft/callback",
	passport.authenticate("microsoft", { session: false }),
	async (req, res) => {
		if (!req.user) return res.redirect(env.WEB_LOGIN_URL);

		const jwt = await encodeJwt(req.user.id);
		res.redirect(`${env.WEB_TOKEN_CALLBACK_URL}?token=${jwt}`);
	},
);
