import { ErrorBoundary } from "@/components/ErrorBoundary";
import { FloatingBanner } from "@/components/FloatingBanner";
import { Navigation } from "@/components/Navigation";
import { Footer } from "@/components/Footer";
import { Outlet, createRootRoute } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";

export const Route = createRootRoute({
	component: Root,
});

function Root() {
	return (
		<div className="flex flex-col min-h-screen">
			<Navigation />
			<ErrorBoundary tagName="main" className="flex-1">
				<Outlet />
			</ErrorBoundary>
			<Footer />
			<TanStackRouterDevtools position="bottom-right" />
			<FloatingBanner position="bottom-left" />
		</div>
	);
}
