import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/button";
import { useStorage } from "@/context/StorageContext";
import { trpc } from "@/libs/trpc";
import type { TrpcOutputs } from "@bin/api";
import { useQuery } from "@tanstack/react-query";
import {
	Navigate,
	useNavigate,
	useParams,
	useSearch,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { type FC, memo, useRef, useState } from "react";
import { AlertDetailDialog } from "../AlertHistoryPage/alerts/AlertDetailDialog";
import { AlertHistoryContainer } from "../AlertHistoryPage/alerts/AlertHistoryContainer";
import { Role } from "../OrganizationPage/types";
import { AirQualityChart } from "./charts/AirQualityChart";
import { FullnessChart } from "./charts/FullnessChart";

type Alert =
	TrpcOutputs["alerts"]["listOrganizationSentAlerts"]["sentAlerts"][number];

export const DeviceDetailPage: FC = memo(() => {
	const navigate = useNavigate();
	const { binId } = useParams({ from: "/authenticated/devices/$binId" });
	const search = useSearch({ from: "/authenticated/devices/$binId" });
	const binName = search.binName || `Bin ${binId}`;
	const storage = useStorage();
	const organizationId = storage.data.activeOrgId;
	const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

	const initialOrgIdRef = useRef<number | null>(organizationId || null);

	const organizationsQuery = useQuery(
		trpc.organizations.listForCurrentUser.queryOptions(),
	);

	const currentOrganization =
		organizationId !== undefined
			? organizationsQuery.data?.find((org) => org.id === organizationId)
			: undefined;

	const isAdmin = currentOrganization?.member?.role === Role.ADMIN;

	if (organizationId === undefined) {
		return <Navigate to="/" />;
	}

	if (
		initialOrgIdRef.current !== null &&
		organizationId !== initialOrgIdRef.current
	) {
		navigate({ to: "/organization-bins" });
	}

	return (
		<>
			<Layout title={`Device Details - ${binName}`}>
				<div className="space-y-8">
					<div className="flex items-center gap-4">
						<Button
							variant="ghost"
							size="sm"
							onClick={() => window.history.back()}
							className="flex items-center gap-2"
						>
							<ArrowLeft className="h-4 w-4" />
							Back to devices
						</Button>
						<h1 className="text-2xl font-bold">{binName}</h1>
					</div>

					{/* Charts */}
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						<FullnessChart binId={binId} />
						<AirQualityChart binId={binId} binName={binName} />
					</div>

					{/* Alert History*/}
					{isAdmin && organizationId && (
						<AlertHistoryContainer
							organizationId={organizationId}
							binId={Number.parseInt(binId, 10)}
							showBinControls={false}
							title={`Alert History for ${binName}`}
							pageSize={20}
							onAlertClick={setSelectedAlert}
						/>
					)}
				</div>
			</Layout>

			<AlertDetailDialog
				open={!!selectedAlert}
				alert={selectedAlert}
				onClose={() => setSelectedAlert(null)}
			/>
		</>
	);
});
