import {
	DynamicContent,
	type RenderContent,
} from "@/components/DynamicContent";
import { Alert, AlertDescription, AlertTitle } from "@/components/alert";
import { Button } from "@/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/table";
import { env } from "@/env";
import { trpc } from "@/libs/trpc";
import type { TrpcOutputs } from "@bin/api";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { enqueueSnackbar } from "notistack";
import { useState } from "react";
import {
	AlertSourceDialog,
	type AlertSourceDialogSubmitHandler,
} from "./AlertSourceDialog";
import { ConfirmAlertSourceDeleteDialog } from "./ConfirmAlertSourceDeleteDialog";

export type AlertSourcesProps = {
	organizationId: number;
};

export const AlertSources = ({ organizationId }: AlertSourcesProps) => {
	const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
	const [updatingAlertSourceId, setUpdatingAlertSourceId] = useState<
		number | undefined
	>(undefined);
	const [deletingAlertSourceId, setDeletingAlertSourceId] = useState<
		number | undefined
	>(undefined);

	const query = useQuery(
		trpc.alerts.listOrganizationAlertSources.queryOptions({ organizationId }),
	);
	const { mutate: createAlertSource, isPending: isAlertSourceCreating } =
		useMutation(trpc.alerts.createTelegramAlertSource.mutationOptions());
	const { mutate: updateAlertSource, isPending: isAlertSourceUpdating } =
		useMutation(trpc.alerts.updateAlertSource.mutationOptions());
	const { mutate: deleteAlertSource, isPending: isAlertSourceDeleting } =
		useMutation(trpc.alerts.deleteAlertSource.mutationOptions());

	const handleCreate: AlertSourceDialogSubmitHandler = (data) => {
		createAlertSource(
			{
				organizationId,
				...data,
				repeatMinutes: data.repeatMinutes ?? undefined,
			},
			{
				onSuccess: () => {
					enqueueSnackbar({
						variant: "success",
						message: "Alert source created",
					});
					query.refetch();
					setIsCreateDialogOpen(false);
				},
				onError: () => {
					enqueueSnackbar({
						variant: "error",
						message: "Failed to craete alert source",
					});
				},
			},
		);
	};

	const handleUpdate: AlertSourceDialogSubmitHandler = (data) => {
		if (updatingAlertSourceId === undefined) return;

		updateAlertSource(
			{ id: updatingAlertSourceId, ...data, repeatMinutes: data.repeatMinutes },
			{
				onSuccess: () => {
					enqueueSnackbar({
						variant: "success",
						message: "Alert source updated",
					});
					query.refetch();
					setUpdatingAlertSourceId(undefined);
				},
				onError: () => {
					enqueueSnackbar({
						variant: "error",
						message: "Failed to update alert source",
					});
				},
			},
		);
	};

	const handleDelete = () => {
		if (deletingAlertSourceId === undefined) return;

		deleteAlertSource(
			{ id: deletingAlertSourceId },
			{
				onSuccess: () => {
					enqueueSnackbar({
						variant: "success",
						message: "Alert source deleted",
					});
					query.refetch();
					setDeletingAlertSourceId(undefined);
				},
				onError: () => {
					enqueueSnackbar({
						variant: "error",
						message: "Failed to delete alert source",
					});
				},
			},
		);
	};

	const renderContent: RenderContent<
		TrpcOutputs["alerts"]["listOrganizationAlertSources"]
	> = (alertSources) => {
		const updatingAlertSource = alertSources.find(
			(alertSource) => alertSource.id === updatingAlertSourceId,
		);

		const mappedRows = alertSources.map((alertSource) => (
			<TableRow key={alertSource.id}>
				<TableCell>{alertSource.name}</TableCell>
				<TableCell>{alertSource.thresholdPercent}%</TableCell>
				<TableCell>
					{alertSource.repeatMinutes
						? `${alertSource.repeatMinutes} minutes`
						: "-"}
				</TableCell>
				<TableCell>{alertSource.telegramAlertSource?.activationCode}</TableCell>
				<TableCell>
					{alertSource.telegramAlertSource?.username ?? "-"}
				</TableCell>
				<TableCell className="flex gap-2 justify-end">
					<Button
						variant="outline"
						onClick={() => setUpdatingAlertSourceId(alertSource.id)}
					>
						Edit
					</Button>
					<Button
						variant={"destructive"}
						onClick={() => setDeletingAlertSourceId(alertSource.id)}
					>
						Delete
					</Button>
				</TableCell>
			</TableRow>
		));
		return (
			<>
				<AlertSourceDialog
					isOpen={updatingAlertSource !== undefined}
					title="Update alert source"
					submitText="Update"
					isLoading={isAlertSourceUpdating}
					defaultValues={updatingAlertSource}
					onClose={() => setUpdatingAlertSourceId(undefined)}
					onSubmit={handleUpdate}
				/>

				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Name</TableHead>
							<TableHead>Threshold</TableHead>
							<TableHead>Repeat until under threshold every</TableHead>
							<TableHead>Activation code</TableHead>
							<TableHead>Channel name</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{mappedRows}</TableBody>
				</Table>
			</>
		);
	};

	return (
		<>
			<AlertSourceDialog
				isOpen={isCreateDialogOpen}
				title="Create alert source"
				submitText="Create"
				isLoading={isAlertSourceCreating}
				onClose={() => setIsCreateDialogOpen(false)}
				onSubmit={handleCreate}
			/>
			<ConfirmAlertSourceDeleteDialog
				isOpen={deletingAlertSourceId !== undefined}
				isLoading={isAlertSourceDeleting}
				onSubmit={handleDelete}
				onClose={() => setDeletingAlertSourceId(undefined)}
			/>

			<Card>
				<CardHeader className="flex justify-between">
					<CardTitle>Alert sources</CardTitle>
					<Button onClick={() => setIsCreateDialogOpen(true)}>
						<Plus className="h-4 w-4 mr-2" />
						Create alert source
					</Button>
				</CardHeader>
				<CardContent>
					<Alert className="mb-2">
						<AlertTitle>Alert activation</AlertTitle>
						<AlertDescription>
							<p>
								To activate an alert source, send the activation code to{" "}
								<a
									className="underline"
									target="_blank"
									href={env.VITE_TELEGRAM_BOT_URL}
									rel="noreferrer"
								>
									{env.VITE_TELEGRAM_BOT_NAME}
								</a>
								.
							</p>
						</AlertDescription>
					</Alert>
					<DynamicContent {...query} renderContent={renderContent} />
				</CardContent>
			</Card>
		</>
	);
};
