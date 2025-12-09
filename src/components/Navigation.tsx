import { Link, useNavigate } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Menu, LogIn, LogOut, UserPlus } from "lucide-react";
import {
	Sheet,
	SheetContent,
	SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/contexts/AuthContext";

export function Navigation() {
	const navigate = useNavigate();
	const { currentAdmin, currentUser, isAuthenticated, logout } = useAuth();

	// Only show admin link if user is logged in AND is an admin
	const isAdmin = isAuthenticated && currentAdmin !== null;

	const publicNavItems = [
		{ name: "Home", href: "/" },
		{ name: "About Us", href: "/about" },
		{ name: "Games", href: "/games" },
		{ name: "Devlog", href: "/devlog" },
		{ name: "Game Suggestions", href: "/suggestions" },
		{ name: "Support", href: "/support" },
		{ name: "Press & Media", href: "/press" },
		{ name: "Contact", href: "/contact" },
	];

	// Add My Tickets and My Suggestions links if user is logged in (not admin-only)
	const userNavItems = isAuthenticated
		? [
			{ name: "My Tickets", href: "/my-tickets" },
			{ name: "My Suggestions", href: "/my-suggestions" }
		]
		: [];

	// Only add admin link if user is an actual admin
	const adminNavItems = isAdmin
		? [{ name: "Admin", href: "/admin" }]
		: [];

	const navItems = [...publicNavItems, ...userNavItems, ...adminNavItems];

	const handleLogout = async () => {
		await logout();
		navigate({ to: "/" });
	};

	return (
		<nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
			<div className="container mx-auto px-4 sm:px-6 lg:px-8">
				<div className="flex h-16 items-center justify-between">
					<Link to="/" className="flex items-center space-x-2">
						<span className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							After Hours Studio
						</span>
					</Link>

					{/* Desktop Navigation */}
					<div className="hidden md:flex md:items-center md:space-x-6">
						{navItems.map((item) => (
							<Link
								key={item.href}
								to={item.href}
								className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
							>
								{item.name}
							</Link>
						))}

						{/* Auth Buttons - Desktop */}
						{isAuthenticated ? (
							<div className="flex items-center gap-3">
								<span className="text-sm text-muted-foreground">
									{currentUser?.email}
								</span>
								<Button
									variant="outline"
									size="sm"
									onClick={handleLogout}
								>
									<LogOut className="h-4 w-4 mr-2" />
									Logout
								</Button>
							</div>
						) : (
							<div className="flex items-center gap-2">
								<Button
									variant="ghost"
									size="sm"
									onClick={() => navigate({ to: "/login" })}
								>
									<LogIn className="h-4 w-4 mr-2" />
									Login
								</Button>
								<Button
									variant="default"
									size="sm"
									onClick={() => navigate({ to: "/signup" })}
								>
									<UserPlus className="h-4 w-4 mr-2" />
									Sign Up
								</Button>
							</div>
						)}
					</div>

					{/* Mobile Navigation */}
					<Sheet>
						<SheetTrigger asChild className="md:hidden">
							<Button variant="ghost" size="icon">
								<Menu className="h-6 w-6" />
							</Button>
						</SheetTrigger>
						<SheetContent side="right" className="w-[300px] sm:w-[400px]">
							<div className="flex flex-col space-y-4 mt-8">
								{navItems.map((item) => (
									<Link
										key={item.href}
										to={item.href}
										className="text-lg font-medium text-foreground/80 transition-colors hover:text-primary"
									>
										{item.name}
									</Link>
								))}

								{/* Auth Buttons - Mobile */}
								<div className="pt-4 border-t border-border space-y-3">
									{isAuthenticated ? (
										<>
											<div className="text-sm text-muted-foreground px-2">
												{currentUser?.email}
											</div>
											<Button
												variant="outline"
												className="w-full"
												onClick={handleLogout}
											>
												<LogOut className="h-4 w-4 mr-2" />
												Logout
											</Button>
										</>
									) : (
										<>
											<Button
												variant="ghost"
												className="w-full"
												onClick={() => navigate({ to: "/login" })}
											>
												<LogIn className="h-4 w-4 mr-2" />
												Login
											</Button>
											<Button
												variant="default"
												className="w-full"
												onClick={() => navigate({ to: "/signup" })}
											>
												<UserPlus className="h-4 w-4 mr-2" />
												Sign Up
											</Button>
										</>
									)}
								</div>
							</div>
						</SheetContent>
					</Sheet>
				</div>
			</div>
		</nav>
	);
}
