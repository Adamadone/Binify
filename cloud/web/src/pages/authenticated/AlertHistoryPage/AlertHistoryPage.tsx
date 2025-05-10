import {
	DynamicContent,
	type RenderContent,
} from "@/components/DynamicContent";
import { Layout } from "@/components/Layout/Layout";
import { Pagination } from "@/components/Pagination";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/table";
import { useStorage } from "@/context/StorageContext";
import { formatDateTime } from "@/helpers/utils";
import { trpc } from "@/libs/trpc";
import type { TrpcOutputs } from "@bin/api";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Role } from "../OrganizationPage/types";
import { AlertDetailDialog } from "./AlertDetailDialog";

const PAGE_SIZE = 50;

type Alert =
	TrpcOutputs["alerts"]["listOrganizationSentAlerts"]["sentAlerts"][number];

export const AlertHistoryPage = () => {
	const pageState = useState(0);
	const [page] = pageState;
	const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

	const storage = useStorage();
	const organizationId = storage.data.activeOrgId;

	const organizationsQuery = useQuery(
		trpc.organizations.listForCurrentUser.queryOptions(),
	);

	const currentOrganization =
		organizationId !== undefined
			? organizationsQuery.data?.find((org) => org.id === organizationId)
			: undefined;

	const isAdmin = currentOrganization?.member?.role === Role.ADMIN;

	if (!organizationId || !isAdmin) {
		return <Navigate to="/" />;
	}

	const alertsQuery = useQuery(
		trpc.alerts.listOrganizationSentAlerts.queryOptions({
			organizationId,
			page,
			pageSize: PAGE_SIZE,
		}),
	);

	const renderContent: RenderContent<
		TrpcOutputs["alerts"]["listOrganizationSentAlerts"]
	> = (alerts) => (
		<Table>
			<TableHeader>
				<TableRow>
					<TableHead>ID</TableHead>
					<TableHead>Sent at</TableHead>
					<TableHead>Alert source</TableHead>
					<TableHead>Activated bin ID</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody>
				{alerts.sentAlerts.map((alert) => (
					<TableRow
						key={alert.id}
						className="cursor-pointer hover:bg-muted/50"
						onClick={() => setSelectedAlert(alert)}
					>
						<TableCell>{alert.id}</TableCell>
						<TableCell>{formatDateTime(alert.at)}</TableCell>
						<TableCell>{alert.alertSource.name}</TableCell>
						<TableCell>{alert.activatedBinId}</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	);

	return (
		<>
			<Layout title="Alert history">
				<Card className="mb-8">
					<CardHeader>
						<CardTitle>Alert history</CardTitle>
					</CardHeader>
					<CardContent>
						<DynamicContent {...alertsQuery} renderContent={renderContent} />
						<div className="flex justify-end mt-4">
							<Pagination
								pageState={pageState}
								pageSize={PAGE_SIZE}
								total={alertsQuery.data?.totalCount ?? 0}
							/>
						</div>
					</CardContent>
				</Card>
			</Layout>

			<AlertDetailDialog
				open={!!selectedAlert}
				alert={selectedAlert}
				onClose={() => setSelectedAlert(null)}
			/>
		</>
	);
};
