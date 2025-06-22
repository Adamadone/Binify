import { Layout } from "@/components/Layout/Layout";
import { useStorage } from "@/context/StorageContext";
import { trpc } from "@/libs/trpc";
import type { TrpcOutputs } from "@bin/api";
import { useQuery } from "@tanstack/react-query";
import { Navigate } from "@tanstack/react-router";
import { useState } from "react";
import { Role } from "../OrganizationPage/types";
import { AlertDetailDialog } from "./alerts/AlertDetailDialog";
import { AlertHistoryContainer } from "./alerts/AlertHistoryContainer";

type Alert =
	TrpcOutputs["alerts"]["listOrganizationSentAlerts"]["sentAlerts"][number];

export const AlertHistoryPage = () => {
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

	const binsQuery = useQuery(
		trpc.bins.listActivatedForOrganization.queryOptions({
			organizationId: organizationId,
		}),
	);

	return (
		<>
			<Layout title="Alert History">
				<AlertHistoryContainer
					organizationId={organizationId}
					bins={binsQuery.data?.bins || []}
					showBinControls={true}
					title="Alert History"
					pageSize={50}
					onAlertClick={setSelectedAlert}
				/>
			</Layout>

			<AlertDetailDialog
				open={!!selectedAlert}
				alert={selectedAlert}
				onClose={() => setSelectedAlert(null)}
			/>
		</>
	);
};
