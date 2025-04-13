import { activateTelegramAlertSource } from "../core/alerts";
import { env } from "../env";
import { logger } from "../libs/pino";
import { getUpdates, sendMessage } from "../libs/telegram";

const ERROR_THROTTLE_SEC = 10;

export const registerTelegramUpdatesJob = async () => {
	let lastUpdateId = -1;
	while (true) {
		try {
			const newLastUpdateId = await pollUpdates(lastUpdateId);
			if (newLastUpdateId) lastUpdateId = newLastUpdateId;
		} catch (err) {
			logger.error(
				err,
				`Error occured during processing telegram updates, will wait ${ERROR_THROTTLE_SEC}s`,
			);
			await new Promise((resolve) =>
				setTimeout(resolve, ERROR_THROTTLE_SEC * 1_000),
			);
		}
	}
};

const pollUpdates = async (
	lastUpdateId: number,
): Promise<number | undefined> => {
	logger.debug("Starting to poll telegram updates");
	const updates = await getUpdates({
		baseUrl: env.TELEGRAM_BASE_URL,
		token: env.TELEGRAM_BOT_TOKEN,
		allowedUpdates: ["message"],
		timeout: env.TELEGRAM_TIMEOUT_SECONDS,
		offset: lastUpdateId + 1,
		limit: 1,
	});
	logger.debug(
		{ numberOfUpdates: updates.length },
		"Finished telegram updates poll",
	);

	const update = updates[0];
	const message = update?.message;
	if (message && message.text !== undefined) {
		await (
			await activateTelegramAlertSource({
				activationCode: message.text.trim(),
				chatId: message.chat.id.toString(),
				title: message.chat.title,
				firstName: message.chat.firstName,
				lastName: message.chat.lastName,
				username: message.chat.username,
			})
		).match(
			async () => {
				logger.info(
					{ chatId: message.chat.id, text: message.text },
					"Message text does match activation code, sending succes response",
				);
				await sendMessage({
					baseUrl: env.TELEGRAM_BASE_URL,
					token: env.TELEGRAM_BOT_TOKEN,
					chatId: message.chat.id.toString(),
					text: "Alert activated",
				});
			},
			async (err) => {
				switch (err) {
					case "invalidActivationCode":
					case "alertSourceNotFound":
						logger.info(
							{ chatId: message.chat.id, text: message.text },
							"Message text doesn't match any activation code, sending error response",
						);
						await sendMessage({
							baseUrl: env.TELEGRAM_BASE_URL,
							token: env.TELEGRAM_BOT_TOKEN,
							chatId: message.chat.id.toString(),
							text: "Sent text doesn't match any activation code",
						});
						break;
					default:
						return err satisfies never;
				}
			},
		);
	}

	return update?.updateId;
};
