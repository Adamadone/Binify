import { useUserMeQuery } from "@/hooks/useUserMeQuery";
import { homeRoute } from "@/pages/HomePage/route";
import { globalBinsRoute } from "@/pages/authenticated/GlobalBinsPage/route";
import type { TrpcOutputs } from "@bin/api";
import {
	Link,
	type RegisteredRouter,
	type ToPathOption,
} from "@tanstack/react-router";
import { HomeIcon, MicrochipIcon } from "lucide-react";
import type { ReactElement } from "react";
import {
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "../sidebar";

type NavItem = {
	to: ToPathOption<RegisteredRouter>;
	title: string;
	icon: ReactElement;
	visible?: (user?: TrpcOutputs["userMe"]) => boolean;
};

type NavSection = {
	title?: string;
	items: NavItem[];
};

const NAV_SECTIONS: NavSection[] = [
	{
		items: [
			{
				to: homeRoute.id,
				title: "Home",
				icon: <HomeIcon />,
			},
			{
				to: homeRoute.id,
				title: "Devices",
				icon: <MicrochipIcon />,
			},
		],
	},
	{
		title: "Global administration",
		items: [
			{
				to: globalBinsRoute.fullPath,
				title: "Global devices",
				icon: <MicrochipIcon />,
				visible: (user) => !!user?.isSuperAdmin,
			},
		],
	},
];

export const LayoutNavigation = () => {
	const userMeQuery = useUserMeQuery();

	const mappedSection = NAV_SECTIONS.map((section) => {
		const itemsToRender = section.items.filter(
			(item) => !item.visible || item.visible(userMeQuery.data),
		);
		if (itemsToRender.length === 0) return null;

		const mappedItems = itemsToRender.map((item) => (
			<SidebarMenuItem key={item.to}>
				<SidebarMenuButton asChild>
					<Link to={item.to}>
						{item.icon}
						<span>{item.title}</span>
					</Link>
				</SidebarMenuButton>
			</SidebarMenuItem>
		));

		return (
			<SidebarGroup key={section.title}>
				{section.title && (
					<SidebarGroupLabel>{section.title}</SidebarGroupLabel>
				)}
				<SidebarGroupContent className="flex flex-col gap-2">
					<SidebarMenu>{mappedItems}</SidebarMenu>
				</SidebarGroupContent>
			</SidebarGroup>
		);
	});
	return mappedSection;
};
