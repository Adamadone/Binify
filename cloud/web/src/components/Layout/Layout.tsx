import { useStorage } from "@/context/StorageContext";
import { isTokenValid } from "@/helpers/isTokenValid";
import { useUserMeQuery } from "@/hooks/useUserMeQuery";
import { homeRoute } from "@/pages/HomePage/route";
import { loginRoute } from "@/pages/LoginPage/route";
import type { TrpcOutputs } from "@bin/api";
import { Link } from "@tanstack/react-router";
import { Trash2Icon } from "lucide-react";
import type { ReactNode } from "react";
import { DynamicContent, type RenderContent } from "../DynamicContent";
import { NavUser } from "../NavUser";
import { Button } from "../button";
import { Separator } from "../separator";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarInset,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
	SidebarProvider,
	SidebarTrigger,
} from "../sidebar";
import { LayoutNavigation } from "./LayoutNavigation";

export type LayoutProps = {
	children: ReactNode;
	title: string;
};

export const Layout = ({ children, title }: LayoutProps) => {
	const storage = useStorage();

	const isLoggedIn = !!storage.data.token && isTokenValid(storage.data.token);
	const userMeQuery = useUserMeQuery();

	const renderUser: RenderContent<TrpcOutputs["accounts"]["me"]> = (user) => {
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
					<LayoutNavigation />
				</SidebarContent>
				<SidebarFooter>
					{isLoggedIn ? (
						<DynamicContent {...userMeQuery} renderContent={renderUser} />
					) : (
						<SidebarMenu>
							<SidebarMenuItem>
								<Button variant={"outline"} className="w-full" asChild>
									<Link to={loginRoute.id}>Log in</Link>
								</Button>
							</SidebarMenuItem>
							<SidebarMenuItem>
								<Button variant={"ghost"} className="w-full" asChild>
									<Link to={loginRoute.id}>Register</Link>
								</Button>
							</SidebarMenuItem>
						</SidebarMenu>
					)}
				</SidebarFooter>
			</Sidebar>
			<SidebarInset>
				<div className="flex flex-col">
					<header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear">
						<div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
							<SidebarTrigger className="-ml-1" />
							<Separator
								orientation="vertical"
								className="mx-2 data-[orientation=vertical]:h-4"
							/>
							<h1 className="text-base font-medium">{title}</h1>
						</div>
					</header>
					<div className="px-4 lg:px-6 py-2 lg:py-4">{children}</div>
				</div>
			</SidebarInset>
		</SidebarProvider>
	);
};
