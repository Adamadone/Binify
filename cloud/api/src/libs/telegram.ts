import { type ZodSchema, z } from "zod";
import { logger } from "./pino";

export type Chat = {
	id: number;
	title?: string;
	firstName?: string;
	lastName?: string;
	username?: string;
};

const chatSchema = z.object({
	id: z.number(),
	title: z.string().optional(),
	first_name: z.string().optional(),
	last_name: z.string().optional(),
	username: z.string().optional(),
});

export type Message = {
	messageId: number;
	text?: string;
	chat: Chat;
};

const messageSchema = z.object({
	message_id: z.number(),
	text: z.string().optional(),
	chat: chatSchema,
});

export type Update = {
	updateId: number;
	message?: Message;
};

const updateSchema = z.object({
	update_id: z.number(),
	message: messageSchema.optional(),
});

const getResultSchema = <TNested extends ZodSchema>(nested: TNested) =>
	z.object({ ok: z.boolean(), result: nested });

export type AllowedUpdate = "message";

export type GetUpdatesParams = {
	baseUrl: string;
	token: string;
	offset?: number;
	limit?: number;
	timeout?: number;
	allowedUpdates?: AllowedUpdate[];
};

export const getUpdates = async ({
	baseUrl,
	token,
	offset,
	limit,
	timeout,
	allowedUpdates,
}: GetUpdatesParams): Promise<Update[]> => {
	const query = new URLSearchParams();
	if (offset) query.set("offset", offset.toString());
	if (limit) query.set("limit", limit.toString());
	if (timeout) query.set("timeout", timeout.toString());
	if (allowedUpdates)
		query.set("allowed_updates", JSON.stringify(allowedUpdates));

	const res = await fetch(
		`${baseUrl}/bot${token}/getUpdates?${query.toString()}`,
	).then((res) => res.json());

	const validatedRes = getResultSchema(z.array(updateSchema)).parse(res);
	if (!validatedRes.ok) throw Error("Not ok");

	const mappedRes = validatedRes.result.map((update) => ({
		updateId: update.update_id,
		message: update.message && {
			messageId: update.message.message_id,
			chat: {
				id: update.message.chat.id,
				firstName: update.message.chat.first_name,
				lastName: update.message.chat.last_name,
				title: update.message.chat.last_name,
				username: update.message.chat.username,
			},
			text: update.message.text,
		},
	}));
	return mappedRes;
};

export type SendMessageParams = {
	baseUrl: string;
	token: string;
	chatId: string;
	text: string;
};
export const sendMessage = async ({
	baseUrl,
	token,
	chatId,
	text,
}: SendMessageParams) => {
	const res = await fetch(`${baseUrl}/bot${token}/sendMessage`, {
		method: "POST",
		body: JSON.stringify({
			chat_id: chatId,
			text,
		}),
		headers: {
			"Content-Type": "application/json",
		},
	});

	if (res.status !== 200) {
		logger.error(await res.text(), "sendMessage error");
		throw new Error("Non 200 status");
	}
};
