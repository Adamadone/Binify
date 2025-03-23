import { useStorage } from "@/context/StorageContext";
import { isTokenValid } from "@/helpers/isTokenValid";
import { trpc } from "@/libs/trpc";
import { homeRoute } from "@/pages/HomePage/route";
import { devicesRoute } from "@/pages/admin/DevicesPage/route";
import type { TrpcOutputs } from "@bin/api";
import { useQuery } from "@tanstack/react-query";
import { Link, Outlet } from "@tanstack/react-router";
import { HomeIcon, MicrochipIcon, Trash2Icon } from "lucide-react";
import { DynamicContent, type RenderContent } from "./DynamicContent";
import { NavUser } from "./NavUser";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupContent,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "./sidebar";

export const Layout = () => {
	const storage = useStorage();

	const isLoggedIn = !!storage.data.token && isTokenValid(storage.data.token);
	const userMeQuery = useQuery(
		trpc.userMe.queryOptions(undefined, { enabled: isLoggedIn }),
	);

	const renderUser: RenderContent<TrpcOutputs["userMe"]> = (user) => {
		return <NavUser user={user} />;
	};

	return (
		<SidebarProvider>
			<Sidebar variant="inset">
				<SidebarHeader>
					<SidebarMenu>
						<SidebarMenuItem>
							<SidebarMenuButton
								asChild
								className="data-[slot=sidebar-menu-button]:!p-1.5"
							>
								<Link to={homeRoute.id}>
									<Trash2Icon className="h-5 w-5" />
									<span className="text-base font-semibold">Binify</span>
								</Link>
							</SidebarMenuButton>
						</SidebarMenuItem>
					</SidebarMenu>
				</SidebarHeader>
				<SidebarContent>
					<SidebarGroup>
						<SidebarGroupContent className="flex flex-col gap-2">
							<SidebarMenu>
								<SidebarMenuItem>
									<SidebarMenuButton asChild>
										<Link to={homeRoute.id}>
											<HomeIcon />
											<span>Home</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
								<SidebarMenuItem>
									<SidebarMenuButton asChild>
										<Link to={devicesRoute.id}>
											<MicrochipIcon />
											<span>Devices</span>
										</Link>
									</SidebarMenuButton>
								</SidebarMenuItem>
							</SidebarMenu>
						</SidebarGroupContent>
					</SidebarGroup>
				</SidebarContent>
				<SidebarFooter>
					{isLoggedIn && (
						<DynamicContent {...userMeQuery} renderContent={renderUser} />
					)}
				</SidebarFooter>
			</Sidebar>
			<SidebarInset>
				<div className="flex flex-1 flex-col">
					<SidebarTrigger />
					<Outlet />
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};
