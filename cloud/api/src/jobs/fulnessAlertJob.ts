import {
	listAlertSourcesByIds,
	listBinsToAlert,
	saveSentAlert,
} from "../core/alerts";
import { env } from "../env";
import { logger } from "../libs/pino";
import { sendMessage } from "../libs/telegram";

export const registerFulnessAlertJob = async () => {
	while (true) {
		await run();
		await new Promise((resolve) =>
			setTimeout(resolve, env.FULNESS_ALERT_JOB_DELAY_SECONDS * 1_000),
		);
	}
};

const run = async () => {
	logger.info("Running fulness alert job");

	const binsToAlert = await listBinsToAlert();
	const alertSourceIds = binsToAlert.map((bin) => bin.alertSourceId);
	const alertSources = await listAlertSourcesByIds(alertSourceIds);
	const alertSourcesById = alertSources.reduce<
		Record<number, (typeof alertSources)[0]>
	>((acc, alertSource) => {
		acc[alertSource.id] = alertSource;
		return acc;
	}, {});

	const promises = binsToAlert.map(async (bin) => {
		const alertSource = alertSourcesById[bin.alertSourceId];
		if (!alertSource) throw new Error("Alert source should be always defined");

		if (!alertSource.telegramAlertSource)
			throw new Error("Alert source doesn't have telegram linked");

		const chatId = alertSource.telegramAlertSource.chatId;
		if (chatId === null) {
			logger.info(
				{ chatId, alertSourceId: alertSource.id },
				"Not sending alert, telegram is not activated",
			);
			return;
		}

		logger.info(
			{
				chatId,
				activatedBinId: bin.id,
				thresholdPercent: bin.thresholdPercent,
			},
			"Sending alert",
		);
		await sendMessage({
			baseUrl: env.TELEGRAM_BASE_URL,
			token: env.TELEGRAM_BOT_TOKEN,
			chatId,
			text: `Fulness of bin "${bin.name}" reached ${bin.thresholdPercent}% threshold. Current fulness is ${bin.currentPercent}%`,
		});
		await saveSentAlert({
			activatedBinId: bin.id,
			alertSourceId: bin.alertSourceId,
		});
	});
	await Promise.all(promises);
};
