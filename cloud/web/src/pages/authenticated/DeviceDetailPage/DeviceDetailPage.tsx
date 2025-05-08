import { Layout } from "@/components/Layout/Layout";
import { Button } from "@/components/button";
import { useStorage } from "@/context/StorageContext";
import {
	Navigate,
	useNavigate,
	useParams,
	useSearch,
} from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { type FC, memo, useRef } from "react";
import { AirQualityChart } from "./charts/AirQualityChart";
import { FullnessChart } from "./charts/FullnessChart";

export const DeviceDetailPage: FC = memo(() => {
	const navigate = useNavigate();
	const { binId } = useParams({ from: "/authenticated/devices/$binId" });
	const search = useSearch({ from: "/authenticated/devices/$binId" });
	const binName = search.binName || `Bin ${binId}`;
	const storage = useStorage();
	const organizationId = storage.data.activeOrgId;

	const initialOrgIdRef = useRef<number | null>(organizationId || null);

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
			</div>
		</Layout>
	);
});
