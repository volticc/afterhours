import { createFileRoute } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect, useRef } from "react";
import {
	Users,
	FileText,
	Layout,
	Palette,
	Image as ImageIcon,
	Settings,
	Plus,
	Pencil,
	Trash2,
	Save,
	Lock,
	Mail,
	AlertCircle,
	LogOut,
	Gamepad2,
	MessageSquare,
	ExternalLink,
	ThumbsUp,
	BookOpen,
	BarChart3,
	Send,
	Shield,
	Bell,
	Navigation as NavigationIcon,
	TestTube,
	Globe,
	FileEdit
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useAdminGuard } from "@/hooks/useAdminGuard";
import { AdminUserRole, AdminUserStatus, type AdminUserModel } from "@/components/data/orm/orm_admin_user";
import {
	getAdminRole,
	assignAdminRole,
	getRoleLabel,
	isSuperAdmin,
	canManageAdmins,
	canManageGames,
	canManageDevlogs,
	canDeleteSupportTickets,
	canDeleteSuggestions,
	canDeleteContent
} from "@/lib/admin-permissions";
import { CmsPageStatus, type CmsPageModel } from "@/components/data/orm/orm_cms_page";
import GameORM, { GameStatus, type GameModel } from "@/components/data/orm/orm_game";
import SupportTicketORM, { SupportTicketStatus, SupportTicketInquiryType, type SupportTicketModel } from "@/components/data/orm/orm_support_ticket";
import GameSuggestionORM, { GameSuggestionStatus, type GameSuggestionModel } from "@/components/data/orm/orm_game_suggestion";
import { type GameModelPreview } from "@/lib/game-preview-types";
import { useQueryClient } from "@tanstack/react-query";
import { BlockEditor } from "@/components/BlockEditor";
import { BlockPreview } from "@/components/BlockPreview";
import {
	loadDevlogPostsFromStorage,
	saveDevlogPostsToStorage,
	type DevlogPost,
	createDevlogPost,
	updateDevlogPost,
	deleteDevlogPost,
	reorderDevlogPost
} from "@/lib/devlog-storage";
import {
	loadHeroSectionFromStorage,
	saveHeroSectionToStorage,
	updateHeroSection,
	initializeDefaultHeroSection,
	type HeroSectionConfig
} from "@/lib/hero-section-storage";

export const Route = createFileRoute("/admin")({
	component: AdminPage,
});

function AdminPage() {
	// Admin guard - redirects non-admin users to home page
	const { isAdmin, isLoading: guardLoading } = useAdminGuard();

	const { currentAdmin, isLoading: authLoading, logout } = useAuth();

	const handleLogout = async () => {
		await logout();
	};

	// Show loading state while checking authentication and admin guard
	if (authLoading || guardLoading) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<p className="text-muted-foreground">Loading...</p>
			</div>
		);
	}

	// Guard will redirect non-admin users, but we keep this check for safety
	if (!isAdmin || !currentAdmin) {
		return null;
	}

	// Main admin dashboard (shown when authenticated as admin)
	return <AdminDashboard currentAdmin={currentAdmin} onLogout={handleLogout} />;
}

// Admin Dashboard Component
function AdminDashboard({ currentAdmin, onLogout }: { currentAdmin: AdminUserModel; onLogout: () => void }) {
	const queryClient = useQueryClient();
	const [activeTab, setActiveTab] = useState("overview");

	return (
		<div className="container mx-auto px-4 py-16">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="flex justify-between items-center mb-8">
					<div>
						<h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
							Admin Dashboard
						</h1>
						<p className="text-muted-foreground mt-2">
							Welcome back, {currentAdmin.username}
						</p>
					</div>
					<Button variant="outline" onClick={onLogout}>
						<LogOut className="h-4 w-4 mr-2" />
						Logout
					</Button>
				</div>

				{/* Main Tabs */}
				<Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
					<TabsList className="grid w-full grid-cols-6 lg:grid-cols-12">
						<TabsTrigger value="overview">
							<BarChart3 className="h-4 w-4 mr-2" />
							Overview
						</TabsTrigger>
						<TabsTrigger value="hero">
							<Layout className="h-4 w-4 mr-2" />
							Hero
						</TabsTrigger>
						<TabsTrigger value="customization">
							<Palette className="h-4 w-4 mr-2" />
							Customization
						</TabsTrigger>
						{/* Only Super Admins can see Admins tab */}
						{isSuperAdmin(currentAdmin) && (
							<TabsTrigger value="admins">
								<Users className="h-4 w-4 mr-2" />
								Admins
							</TabsTrigger>
						)}
						<TabsTrigger value="pages">
							<FileText className="h-4 w-4 mr-2" />
							Pages
						</TabsTrigger>
						<TabsTrigger value="navigation">
							<NavigationIcon className="h-4 w-4 mr-2" />
							Nav
						</TabsTrigger>
						<TabsTrigger value="games">
							<Gamepad2 className="h-4 w-4 mr-2" />
							Games
						</TabsTrigger>
						<TabsTrigger value="support">
							<MessageSquare className="h-4 w-4 mr-2" />
							Support
						</TabsTrigger>
						<TabsTrigger value="suggestions">
							<ThumbsUp className="h-4 w-4 mr-2" />
							Suggestions
						</TabsTrigger>
						<TabsTrigger value="devlog">
							<FileEdit className="h-4 w-4 mr-2" />
							Devlog
						</TabsTrigger>
						<TabsTrigger value="newsletter">
							<Send className="h-4 w-4 mr-2" />
							Newsletter
						</TabsTrigger>
						<TabsTrigger value="media">
							<ImageIcon className="h-4 w-4 mr-2" />
							Media
						</TabsTrigger>
						<TabsTrigger value="settings">
							<Globe className="h-4 w-4 mr-2" />
							Settings
						</TabsTrigger>
					</TabsList>

					{/* Overview Tab */}
					<TabsContent value="overview">
						<OverviewTab currentAdmin={currentAdmin} />
					</TabsContent>

					{/* Hero Section Tab */}
					<TabsContent value="hero">
						<HeroSectionTab currentAdmin={currentAdmin} />
					</TabsContent>

					{/* Site Customization Tab */}
					<TabsContent value="customization">
						<CustomizationTab />
					</TabsContent>

					{/* Admins Tab - Super Admin Only */}
					{isSuperAdmin(currentAdmin) && (
						<TabsContent value="admins">
							<AdminsTab currentAdmin={currentAdmin} />
						</TabsContent>
					)}

					{/* Pages Tab */}
					<TabsContent value="pages">
						<PagesTab />
					</TabsContent>

					{/* Navigation Tab */}
					<TabsContent value="navigation">
						<NavigationTab />
					</TabsContent>

					{/* Games Tab */}
					<TabsContent value="games">
						<GamesTab currentAdmin={currentAdmin} />
					</TabsContent>

					{/* Support Tab */}
					<TabsContent value="support">
						<SupportTab currentAdmin={currentAdmin} />
					</TabsContent>

					{/* Suggestions Tab */}
					<TabsContent value="suggestions">
						<SuggestionsTab currentAdmin={currentAdmin} />
					</TabsContent>

					{/* Devlog Tab */}
					<TabsContent value="devlog">
						<DevlogTab currentAdmin={currentAdmin} />
					</TabsContent>

					{/* Newsletter Tab */}
					<TabsContent value="newsletter">
						<NewsletterTab />
					</TabsContent>

					{/* Media Tab */}
					<TabsContent value="media">
						<MediaTab />
					</TabsContent>

					{/* Testers Tab */}
					<TabsContent value="testers">
						<TestersTab />
					</TabsContent>

					{/* Settings Tab */}
					<TabsContent value="settings">
						<SettingsTab />
					</TabsContent>
				</Tabs>
			</div>
		</div>
	);
}

// Overview Tab Component
function OverviewTab({ currentAdmin }: { currentAdmin: AdminUserModel }) {
	// Mock data for preview mode (no server calls)
	const admins = [currentAdmin];
	const pages: CmsPageModel[] = [];
	const games: GameModel[] = [];
	const tickets: SupportTicketModel[] = [];
	const suggestions: GameSuggestionModel[] = [];

	const openTickets = 0;
	const activeGames = 0;

	return (
		<div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">Total Admins</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">{admins.length}</div>
					<p className="text-xs text-muted-foreground mt-1">
						Active administrators
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">Published Pages</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">{pages.filter((p: CmsPageModel) => p.status === CmsPageStatus.Published).length}</div>
					<p className="text-xs text-muted-foreground mt-1">
						Total: {pages.length} pages
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">Active Games</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">{activeGames}</div>
					<p className="text-xs text-muted-foreground mt-1">
						In development
					</p>
				</CardContent>
			</Card>

			<Card>
				<CardHeader>
					<CardTitle className="text-sm font-medium">Open Tickets</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="text-3xl font-bold">{openTickets}</div>
					<p className="text-xs text-muted-foreground mt-1">
						Pending support requests
					</p>
				</CardContent>
			</Card>

			<Card className="md:col-span-2 lg:col-span-4">
				<CardHeader>
					<CardTitle>Quick Stats</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="space-y-2">
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Total Suggestions</span>
							<span className="font-medium">{suggestions.length}</span>
						</div>
						<Separator />
						<div className="flex justify-between">
							<span className="text-sm text-muted-foreground">Your Role</span>
							<Badge variant={getAdminRole(currentAdmin.email) === AdminUserRole.SuperAdmin ? "destructive" : getAdminRole(currentAdmin.email) === AdminUserRole.Admin ? "default" : "outline"}>
								{getRoleLabel(getAdminRole(currentAdmin.email))}
							</Badge>
						</div>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}

// Admins Tab Component (Preview Mode - Local Storage)
function AdminsTab({ currentAdmin }: { currentAdmin: AdminUserModel }) {
	const { getAdminEmails, addAdminEmail, removeAdminEmail } = useAuth();
	const [adminEmails, setAdminEmails] = useState<string[]>([]);
	const [newAdminEmail, setNewAdminEmail] = useState("");
	const [newAdminRole, setNewAdminRole] = useState<AdminUserRole>(AdminUserRole.Admin);
	const [addError, setAddError] = useState("");
	const [editingRoleFor, setEditingRoleFor] = useState<string | null>(null);
	const [newRoleValue, setNewRoleValue] = useState<AdminUserRole>(AdminUserRole.Admin);

	// Check if current admin is Super Admin
	const isCurrentAdminSuperAdmin = isSuperAdmin(currentAdmin);

	// Load admin emails on mount and refresh
	const refreshAdminEmails = () => {
		setAdminEmails(getAdminEmails());
	};

	useEffect(() => {
		refreshAdminEmails();
	}, []);

	const handleAddAdmin = (e: React.FormEvent) => {
		e.preventDefault();
		setAddError("");

		// Validate email
		if (!newAdminEmail.includes("@")) {
			setAddError("Please enter a valid email address");
			return;
		}

		// Check if already an admin
		const emailLower = newAdminEmail.toLowerCase();
		if (adminEmails.some(e => e.toLowerCase() === emailLower)) {
			setAddError("This email is already in the admin list");
			return;
		}

		// Add to admin list
		addAdminEmail(newAdminEmail);

		// Assign role (Super Admin only)
		if (isCurrentAdminSuperAdmin && newAdminRole !== AdminUserRole.Admin) {
			assignAdminRole(newAdminEmail, newAdminRole, currentAdmin.email);
		}

		setNewAdminEmail("");
		setNewAdminRole(AdminUserRole.Admin); // Reset to default
		refreshAdminEmails();
	};

	const handleRemoveAdmin = (email: string) => {
		removeAdminEmail(email);
		refreshAdminEmails();
	};

	const handleRoleChange = (email: string) => {
		if (!isCurrentAdminSuperAdmin) return;

		// Assign new role
		const success = assignAdminRole(email, newRoleValue, currentAdmin.email);
		if (success) {
			setEditingRoleFor(null);
			// Trigger re-render to show updated role
			refreshAdminEmails();
		}
	};

	const startEditingRole = (email: string) => {
		setEditingRoleFor(email);
		setNewRoleValue(getAdminRole(email));
	};

	const cancelEditingRole = () => {
		setEditingRoleFor(null);
	};

	return (
		<Card>
			<CardHeader>
				<CardTitle>Manage Administrators</CardTitle>
				<CardDescription>Add or remove admin access for user accounts</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Preview Mode Notice */}
				<Alert>
					<Shield className="h-4 w-4" />
					<AlertDescription>
						<strong>Preview Mode:</strong> Admin emails are stored locally in your browser.
						Users must first create an account via sign-up, then you can add their email to the admin list here.
					</AlertDescription>
				</Alert>

				<Separator />

				{/* Add New Admin Email */}
				<div className="space-y-4">
					<h3 className="font-semibold">Add Admin Access</h3>
					<form onSubmit={handleAddAdmin} className="space-y-4">
						<div className="flex gap-2">
							<div className="flex-1">
								<Input
									type="email"
									placeholder="user@example.com"
									value={newAdminEmail}
									onChange={(e) => setNewAdminEmail(e.target.value)}
									required
								/>
							</div>
							<Button type="submit">
								<Plus className="h-4 w-4 mr-2" />
								Add Admin
							</Button>
						</div>

						{/* Role Selection (Super Admin Only) */}
						{isCurrentAdminSuperAdmin && (
							<div className="space-y-2">
								<Label htmlFor="new-admin-role">Admin Role</Label>
								<Select
									value={newAdminRole.toString()}
									onValueChange={(value) => setNewAdminRole(parseInt(value) as AdminUserRole)}
								>
									<SelectTrigger id="new-admin-role">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={AdminUserRole.SuperAdmin.toString()}>Super Admin</SelectItem>
										<SelectItem value={AdminUserRole.Admin.toString()}>Admin</SelectItem>
										<SelectItem value={AdminUserRole.Moderator.toString()}>Moderator</SelectItem>
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground">
									Select the role for this admin. Super Admins can manage all admins and change roles.
								</p>
							</div>
						)}
					</form>
					{addError && (
						<Alert variant="destructive">
							<AlertCircle className="h-4 w-4" />
							<AlertDescription>{addError}</AlertDescription>
						</Alert>
					)}
					<p className="text-sm text-muted-foreground">
						Add an email address to grant admin access. The user must create an account first.
					</p>
				</div>

				<Separator />

				{/* Admin Emails List */}
				<div>
					<h3 className="font-semibold mb-4">Current Admin Emails ({adminEmails.length})</h3>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Email Address</TableHead>
								<TableHead>Role</TableHead>
								{isCurrentAdminSuperAdmin && <TableHead>Actions</TableHead>}
							</TableRow>
						</TableHeader>
						<TableBody>
							{adminEmails.map((email) => {
								const isDefaultAdmin = email.toLowerCase() === "admin@afterhoursstudio.com";
								const currentRole = getAdminRole(email);
								const roleLabel = getRoleLabel(currentRole);
								const isEditingThis = editingRoleFor === email;

								return (
									<TableRow key={email}>
										<TableCell>{email}</TableCell>
										<TableCell>
											{isEditingThis && isCurrentAdminSuperAdmin ? (
												<div className="flex items-center gap-2">
													<Select
														value={newRoleValue.toString()}
														onValueChange={(value) => setNewRoleValue(parseInt(value) as AdminUserRole)}
													>
														<SelectTrigger className="w-[180px]">
															<SelectValue />
														</SelectTrigger>
														<SelectContent>
															<SelectItem value={AdminUserRole.SuperAdmin.toString()}>Super Admin</SelectItem>
															<SelectItem value={AdminUserRole.Admin.toString()}>Admin</SelectItem>
															<SelectItem value={AdminUserRole.Moderator.toString()}>Moderator</SelectItem>
														</SelectContent>
													</Select>
													<Button
														variant="outline"
														size="sm"
														onClick={() => handleRoleChange(email)}
													>
														<Save className="h-4 w-4" />
													</Button>
													<Button
														variant="ghost"
														size="sm"
														onClick={cancelEditingRole}
													>
														Cancel
													</Button>
												</div>
											) : (
												<div className="flex items-center gap-2">
													<Badge
														variant={currentRole === AdminUserRole.SuperAdmin ? "destructive" : currentRole === AdminUserRole.Admin ? "default" : "outline"}
													>
														{roleLabel}
													</Badge>
													{isCurrentAdminSuperAdmin && !isDefaultAdmin && (
														<Button
															variant="ghost"
															size="sm"
															onClick={() => startEditingRole(email)}
															title="Change role"
														>
															<Pencil className="h-3 w-3" />
														</Button>
													)}
												</div>
											)}
										</TableCell>
										{isCurrentAdminSuperAdmin && (
											<TableCell>
												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleRemoveAdmin(email)}
													disabled={isDefaultAdmin}
													title={isDefaultAdmin ? "Cannot remove default admin" : "Remove admin access"}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</TableCell>
										)}
									</TableRow>
								);
							})}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}

// Pages Tab Component (Preview Mode - No Database)
function PagesTab() {
	// Mock data for preview mode (no server calls)
	const pages: CmsPageModel[] = [];

	return (
		<Card>
			<CardHeader>
				<CardTitle>Manage Pages</CardTitle>
				<CardDescription>Page management (preview mode - database features disabled)</CardDescription>
			</CardHeader>
			<CardContent className="space-y-6">
				{/* Preview Mode Notice */}
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<strong>Preview Mode:</strong> Page creation and management features are disabled.
						This dashboard is for preview purposes only and does not connect to a live database.
					</AlertDescription>
				</Alert>

				<Separator />

				{/* Pages List */}
				<div>
					<h3 className="font-semibold mb-4">All Pages</h3>
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Title</TableHead>
								<TableHead>Slug</TableHead>
								<TableHead>Status</TableHead>
								<TableHead>Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{pages.length === 0 ? (
								<TableRow>
									<TableCell colSpan={4} className="text-center text-muted-foreground">
										No pages found (preview mode)
									</TableCell>
								</TableRow>
							) : (
								pages.map((page: CmsPageModel) => (
									<TableRow key={page.id}>
										<TableCell>{page.title}</TableCell>
										<TableCell>{page.slug}</TableCell>
										<TableCell>
											<Badge>
												{page.status === CmsPageStatus.Published ? "Published" :
												 page.status === CmsPageStatus.Draft ? "Draft" : "Archived"}
											</Badge>
										</TableCell>
										<TableCell className="space-x-2">
											<Button
												variant="outline"
												size="sm"
												disabled
												title="Disabled in preview mode"
											>
												<Pencil className="h-4 w-4" />
											</Button>
											<Button
												variant="destructive"
												size="sm"
												disabled
												title="Disabled in preview mode"
											>
												<Trash2 className="h-4 w-4" />
											</Button>
										</TableCell>
									</TableRow>
								))
							)}
						</TableBody>
					</Table>
				</div>
			</CardContent>
		</Card>
	);
}

// Placeholder components for other tabs
function NavigationTab() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Navigation Management</CardTitle>
				<CardDescription>Manage site navigation tabs and menus</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground">Navigation tab management coming soon...</p>
			</CardContent>
		</Card>
	);
}

// Image Drop Zone Component
function ImageDropZone({ value, onChange }: { value: string; onChange: (url: string) => void }) {
	const [isDragging, setIsDragging] = useState(false);
	const [preview, setPreview] = useState(value);
	const fileInputRef = useRef<HTMLInputElement>(null);

	useEffect(() => {
		setPreview(value);
	}, [value]);

	const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
		e.preventDefault();
		setIsDragging(false);

		const file = e.dataTransfer.files[0];
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (event) => {
				const dataUrl = event.target?.result as string;
				setPreview(dataUrl);
				onChange(dataUrl);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file && file.type.startsWith('image/')) {
			const reader = new FileReader();
			reader.onload = (event) => {
				const dataUrl = event.target?.result as string;
				setPreview(dataUrl);
				onChange(dataUrl);
			};
			reader.readAsDataURL(file);
		}
	};

	const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const url = e.target.value;
		setPreview(url);
		onChange(url);
	};

	return (
		<div className="space-y-4">
			{/* Drag & Drop Area */}
			<div
				onDragOver={handleDragOver}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
				onClick={() => fileInputRef.current?.click()}
				className={`
					relative border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
					transition-colors duration-200
					${isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'}
				`}
			>
				{preview ? (
					<div className="space-y-4">
						<div className="relative w-full h-48 overflow-hidden rounded-md bg-muted">
							<img
								src={preview}
								alt="Preview"
								className="w-full h-full object-cover"
							/>
						</div>
						<p className="text-sm text-muted-foreground">
							Click or drag to replace image
						</p>
					</div>
				) : (
					<div className="space-y-2">
						<ImageIcon className="h-12 w-12 mx-auto text-muted-foreground" />
						<p className="text-sm font-medium">
							Drop image here or click to browse
						</p>
						<p className="text-xs text-muted-foreground">
							Supports JPG, PNG, GIF, WebP
						</p>
					</div>
				)}
				<input
					ref={fileInputRef}
					type="file"
					accept="image/*"
					className="hidden"
					onChange={handleFileSelect}
				/>
			</div>

			{/* URL Input as Alternative */}
			<div className="flex items-center gap-2">
				<Input
					type="text"
					value={value}
					onChange={handleUrlChange}
					placeholder="Or paste image URL here"
					className="flex-1"
				/>
			</div>
		</div>
	);
}

function GamesTab({ currentAdmin }: { currentAdmin: AdminUserModel }) {
	const queryClient = useQueryClient();
	const [games, setGames] = useState<GameModelPreview[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedGame, setSelectedGame] = useState<GameModelPreview | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isAdding, setIsAdding] = useState(false);

	// Permission checks
	const canManage = canManageGames(currentAdmin);
	const canDelete = canDeleteContent(currentAdmin);

	// Form state
	const [formData, setFormData] = useState<Partial<GameModelPreview>>({
		title: "",
		short_description: "",
		long_description: "",
		category: "",
		status: GameStatus.InDevelopment,
		cover_image: "",
		screenshots: [],
		tags: [],
		steam_link: "",
		wishlist_link: "",
		is_hidden: false,
		display_order: 0,
		release_date: null,
		show_countdown: true,
	});

	// Separate state for tags input as plain text string
	const [tagsInputValue, setTagsInputValue] = useState<string>("");

	// Load games from localStorage preview storage
	const loadGames = async () => {
		try {
			setLoading(true);
			// Load preview games from localStorage
			const allGames = loadPreviewGamesFromStorage();

			// Sort by display_order
			allGames.sort((a: GameModel, b: GameModel) => {
				const orderA = a.display_order ?? 999999;
				const orderB = b.display_order ?? 999999;
				return orderA - orderB;
			});
			setGames(allGames);
		} catch (error) {
			console.error("Error loading games:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadGames();
	}, []);

	const handleAdd = () => {
		setFormData({
			title: "",
			short_description: "",
			long_description: "",
			category: "",
			status: GameStatus.InDevelopment,
			cover_image: "",
			screenshots: [],
			tags: [],
			steam_link: "",
			wishlist_link: "",
			is_hidden: false,
			display_order: games.length,
			release_date: null,
			show_countdown: true,
		});
		setTagsInputValue("");
		setIsAdding(true);
		setIsEditing(false);
		setSelectedGame(null);
	};

	const handleEdit = (game: GameModel) => {
		setFormData(game);
		// Convert tags array to plain text string for the input field
		setTagsInputValue(game.tags?.[0] || "");
		setSelectedGame(game);
		setIsEditing(true);
		setIsAdding(false);
	};

	const handleCancel = () => {
		setIsAdding(false);
		setIsEditing(false);
		setSelectedGame(null);
		setFormData({
			title: "",
			short_description: "",
			long_description: "",
			category: "",
			status: GameStatus.InDevelopment,
			cover_image: "",
			screenshots: [],
			tags: [],
			steam_link: "",
			wishlist_link: "",
			is_hidden: false,
			display_order: 0,
			release_date: null,
			show_countdown: true,
		});
		setTagsInputValue("");
	};

	const handleSave = async () => {
		try {
			// Load current preview games from localStorage
			const currentGames = loadPreviewGamesFromStorage();

			if (isEditing && selectedGame) {
				// Update existing game - find and replace in array
				const updatedGames = currentGames.map(game =>
					game.id === selectedGame.id
						? { ...selectedGame, ...formData } as GameModel
						: game
				);
				savePreviewGamesToStorage(updatedGames);
			} else {
				// Add new game - generate ID and metadata fields for preview mode
				const newGame: GameModelPreview = {
					id: `preview-game-${Date.now()}-${Math.random().toString(36).substring(7)}`,
					data_creator: 'preview-user',
					data_updater: 'preview-user',
					create_time: Math.floor(Date.now() / 1000).toString(),
					update_time: Math.floor(Date.now() / 1000).toString(),
					title: formData.title || '',
					short_description: formData.short_description || '',
					long_description: formData.long_description || null,
					category: formData.category || '',
					status: formData.status ?? GameStatus.InDevelopment,
					cover_image: formData.cover_image || '',
					screenshots: formData.screenshots || null,
					tags: formData.tags || null,
					steam_link: formData.steam_link || null,
					wishlist_link: formData.wishlist_link || null,
					is_hidden: formData.is_hidden ?? false,
					display_order: formData.display_order ?? currentGames.length,
					release_date: formData.release_date || null,
					show_countdown: formData.show_countdown ?? true,
				};
				// Add to preview games array
				savePreviewGamesToStorage([...currentGames, newGame]);
			}

			// Reload games from localStorage and invalidate query cache
			await loadGames();
			queryClient.invalidateQueries({ queryKey: ["games"] });
			handleCancel();
		} catch (error) {
			console.error("Error saving game:", error);
			alert("Failed to save game. Please try again.");
		}
	};

	const handleDelete = async (gameId: string) => {
		if (!confirm("Are you sure you want to delete this game?")) return;

		try {
			// Load current preview games and filter out the deleted one
			const currentGames = loadPreviewGamesFromStorage();
			const updatedGames = currentGames.filter(game => game.id !== gameId);
			savePreviewGamesToStorage(updatedGames);

			await loadGames();
			queryClient.invalidateQueries({ queryKey: ["games"] });
			if (selectedGame?.id === gameId) {
				handleCancel();
			}
		} catch (error) {
			console.error("Error deleting game:", error);
			alert("Failed to delete game. Please try again.");
		}
	};

	const handleToggleVisibility = async (game: GameModel) => {
		try {
			// Load current preview games and toggle visibility
			const currentGames = loadPreviewGamesFromStorage();
			const updatedGames = currentGames.map(g =>
				g.id === game.id
					? { ...g, is_hidden: !g.is_hidden }
					: g
			);
			savePreviewGamesToStorage(updatedGames);

			await loadGames();
			queryClient.invalidateQueries({ queryKey: ["games"] });
		} catch (error) {
			console.error("Error toggling visibility:", error);
		}
	};

	const handleReorder = async (gameId: string, direction: "up" | "down") => {
		const currentIndex = games.findIndex(g => g.id === gameId);
		if (currentIndex === -1) return;

		const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
		if (newIndex < 0 || newIndex >= games.length) return;

		try {
			// Load current preview games and swap display_order values
			const currentGames = loadPreviewGamesFromStorage();
			const game1 = games[currentIndex];
			const game2 = games[newIndex];

			const order1 = game1.display_order ?? currentIndex;
			const order2 = game2.display_order ?? newIndex;

			const updatedGames = currentGames.map(g => {
				if (g.id === game1.id) return { ...g, display_order: order2 };
				if (g.id === game2.id) return { ...g, display_order: order1 };
				return g;
			});

			savePreviewGamesToStorage(updatedGames);

			await loadGames();
			queryClient.invalidateQueries({ queryKey: ["games"] });
		} catch (error) {
			console.error("Error reordering games:", error);
		}
	};

	const getStatusLabel = (status: GameStatus) => {
		switch (status) {
			case GameStatus.Released:
				return "Released";
			case GameStatus.InDevelopment:
				return "In Development";
			case GameStatus.ComingSoon:
				return "Coming Soon";
			default:
				return "Unknown";
		}
	};

	// Show permission error if user doesn't have access
	if (!canManage) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Manage Games</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							You do not have permission to manage games. Only Super Admins and Admins can create, edit, and manage game showcase entries.
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Manage Games</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Loading games...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Manage Games ({games.length})</CardTitle>
							<CardDescription>Add, edit, and manage game showcase entries</CardDescription>
						</div>
						<Button onClick={handleAdd}>
							<Plus className="h-4 w-4 mr-2" />
							Add Game
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{games.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground mb-4">No games added yet</p>
							<Button onClick={handleAdd}>
								<Plus className="h-4 w-4 mr-2" />
								Add Your First Game
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Order</TableHead>
									<TableHead>Title</TableHead>
									<TableHead>Category</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Tags</TableHead>
									<TableHead>Visibility</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{games.map((game, index) => (
									<TableRow key={game.id}>
										<TableCell>
											<div className="flex items-center gap-1">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleReorder(game.id, "up")}
													disabled={index === 0}
												>
													↑
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleReorder(game.id, "down")}
													disabled={index === games.length - 1}
												>
													↓
												</Button>
											</div>
										</TableCell>
										<TableCell className="font-medium">{game.title}</TableCell>
										<TableCell>{game.category}</TableCell>
										<TableCell>
											<Badge variant="outline">{getStatusLabel(game.status)}</Badge>
										</TableCell>
										<TableCell>
											{game.tags && game.tags.length > 0 ? (
												<div className="flex flex-wrap gap-1 max-w-xs">
													{game.tags.slice(0, 2).map((tag: string, index: number) => (
														<Badge key={index} variant="secondary" className="text-xs">
															{tag}
														</Badge>
													))}
													{game.tags.length > 2 && (
														<Badge variant="secondary" className="text-xs">
															+{game.tags.length - 2}
														</Badge>
													)}
												</div>
											) : (
												<span className="text-muted-foreground text-sm">No tags</span>
											)}
										</TableCell>
										<TableCell>
											<Button
												variant="ghost"
												size="sm"
												onClick={() => handleToggleVisibility(game)}
											>
												{game.is_hidden ? "Hidden" : "Visible"}
											</Button>
										</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleEdit(game)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleDelete(game.id)}
													disabled={!canDelete}
													title={!canDelete ? "Only Super Admins can delete games" : "Delete game"}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Edit/Add Form */}
			{(isEditing || isAdding) && (
				<Card>
					<CardHeader>
						<CardTitle>{isEditing ? "Edit Game" : "Add New Game"}</CardTitle>
						<CardDescription>
							{isEditing ? `Editing: ${selectedGame?.title}` : "Fill in the details for the new game"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="title">Title *</Label>
								<Input
									id="title"
									value={formData.title}
									onChange={(e) => setFormData({ ...formData, title: e.target.value })}
									placeholder="Game title"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="category">Category/Genre *</Label>
								<Input
									id="category"
									value={formData.category}
									onChange={(e) => setFormData({ ...formData, category: e.target.value })}
									placeholder="e.g., Horror, Adventure"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="status">Status *</Label>
								<Select
									value={formData.status?.toString()}
									onValueChange={(value) => setFormData({ ...formData, status: parseInt(value) as GameStatus })}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={GameStatus.ComingSoon.toString()}>Coming Soon</SelectItem>
										<SelectItem value={GameStatus.Released.toString()}>Released</SelectItem>
										<SelectItem value={GameStatus.InDevelopment.toString()}>In Development</SelectItem>
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* Cover Image Upload Area with Drag & Drop */}
						<div className="space-y-2">
							<Label htmlFor="cover_image">Cover Image *</Label>
							<ImageDropZone
								value={formData.cover_image || ""}
								onChange={(url) => setFormData({ ...formData, cover_image: url })}
							/>
							<p className="text-xs text-muted-foreground">
								Drag and drop an image or paste a URL
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="short_description">Short Description *</Label>
							<Textarea
								id="short_description"
								value={formData.short_description}
								onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
								placeholder="Brief summary shown in game cards"
								rows={3}
								required
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="long_description">Long Description</Label>
							<Textarea
								id="long_description"
								value={formData.long_description || ""}
								onChange={(e) => setFormData({ ...formData, long_description: e.target.value })}
								placeholder="Detailed description shown on game detail page"
								rows={6}
							/>
						</div>

						<div className="space-y-2">
							<Label htmlFor="tags">Tags</Label>
							<Input
								id="tags"
								value={tagsInputValue}
								onChange={(e) => {
									// Store exactly what the user types - no parsing or splitting
									setTagsInputValue(e.target.value);
									// Store as single-item array to satisfy GameModel type
									setFormData({ ...formData, tags: [e.target.value] });
								}}
								placeholder="horror, indie, simulation"
							/>
							<p className="text-xs text-muted-foreground">
								Enter tags as plain text. Commas and all characters will be preserved exactly as typed.
							</p>
						</div>

						<div className="space-y-2">
							<Label htmlFor="screenshots">Screenshot URLs (one per line)</Label>
							<Textarea
								id="screenshots"
								value={formData.screenshots?.join("\n") || ""}
								onChange={(e) => setFormData({ ...formData, screenshots: e.target.value.split("\n").filter(s => s.trim()) })}
								placeholder="https://example.com/screenshot1.jpg"
								rows={4}
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="steam_link">Steam Link (optional)</Label>
								<Input
									id="steam_link"
									value={formData.steam_link || ""}
									onChange={(e) => setFormData({ ...formData, steam_link: e.target.value })}
									placeholder="https://store.steampowered.com/app/..."
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="wishlist_link">Wishlist Link (optional)</Label>
								<Input
									id="wishlist_link"
									value={formData.wishlist_link || ""}
									onChange={(e) => setFormData({ ...formData, wishlist_link: e.target.value })}
									placeholder="https://..."
								/>
							</div>
						</div>

						<Separator />

						<div className="space-y-4">
							<h3 className="font-semibold text-lg">Release Date & Countdown</h3>
							<p className="text-sm text-muted-foreground">
								Set a release date to automatically display a live countdown on the public game showcase
							</p>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<Label htmlFor="release_date">Release Date (optional)</Label>
									<Input
										id="release_date"
										type="date"
										value={formData.release_date || ""}
										onChange={(e) => setFormData({ ...formData, release_date: e.target.value })}
									/>
									<p className="text-xs text-muted-foreground">
										Select a future date to enable countdown timer
									</p>
								</div>

								<div className="space-y-2">
									<Label htmlFor="show_countdown">Countdown Display</Label>
									<div className="flex items-center gap-2 h-10">
										<input
											type="checkbox"
											id="show_countdown"
											checked={formData.show_countdown ?? true}
											onChange={(e) => setFormData({ ...formData, show_countdown: e.target.checked })}
											className="h-4 w-4"
										/>
										<Label htmlFor="show_countdown" className="cursor-pointer">
											Show countdown when release date is set
										</Label>
									</div>
									<p className="text-xs text-muted-foreground">
										Toggle countdown visibility (only shown if date is in the future)
									</p>
								</div>
							</div>
						</div>

						<Separator />

						<div className="flex items-center gap-2">
							<input
								type="checkbox"
								id="is_hidden"
								checked={formData.is_hidden || false}
								onChange={(e) => setFormData({ ...formData, is_hidden: e.target.checked })}
							/>
							<Label htmlFor="is_hidden">Hide from public view</Label>
						</div>

						<Separator />

						<div className="flex gap-2 justify-end">
							<Button variant="outline" onClick={handleCancel}>
								Cancel
							</Button>
							<Button onClick={handleSave}>
								<Save className="h-4 w-4 mr-2" />
								{isEditing ? "Update Game" : "Add Game"}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

// Reply interface for storing ticket replies
export interface TicketReply {
	text: string;
	timestamp: string;
	authorName: string;
	authorType: 'admin' | 'user'; // Track whether reply is from admin or user
}

// Extended ticket model with replies
export interface SupportTicketWithReplies extends SupportTicketModel {
	replies?: TicketReply[];
}

// LocalStorage key for storing ticket replies (now stores with ticket ID as key)
const TICKET_REPLIES_STORAGE_KEY = "support_ticket_replies_v2";
// LocalStorage key for storing preview game entries
const PREVIEW_GAMES_STORAGE_KEY = "preview_games_v1";

// Helper functions for localStorage persistence - Ticket Replies
function loadRepliesFromStorage(): Record<string, TicketReply[]> {
	try {
		const stored = localStorage.getItem(TICKET_REPLIES_STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch (error) {
		console.error("Error loading replies from storage:", error);
		return {};
	}
}

function saveRepliesToStorage(replies: Record<string, TicketReply[]>): void {
	try {
		localStorage.setItem(TICKET_REPLIES_STORAGE_KEY, JSON.stringify(replies));
		// Dispatch event to notify other components
		window.dispatchEvent(new CustomEvent('ticket-replies-updated', { detail: replies }));
	} catch (error) {
		console.error("Error saving replies to storage:", error);
	}
}

// Export helper to get replies for a specific ticket (can be used by user-facing pages)
export function getTicketReplies(ticketId: string): TicketReply[] {
	const allReplies = loadRepliesFromStorage();
	return allReplies[ticketId] || [];
}

// Export helper to add a reply to a ticket
export function addTicketReply(ticketId: string, reply: TicketReply): void {
	const allReplies = loadRepliesFromStorage();
	allReplies[ticketId] = [...(allReplies[ticketId] || []), reply];
	saveRepliesToStorage(allReplies);
}

// Helper functions for localStorage persistence - Preview Games
function loadPreviewGamesFromStorage(): GameModel[] {
	try {
		const stored = localStorage.getItem(PREVIEW_GAMES_STORAGE_KEY);
		return stored ? JSON.parse(stored) : [];
	} catch (error) {
		console.error("Error loading preview games from storage:", error);
		return [];
	}
}

function savePreviewGamesToStorage(games: GameModel[]): void {
	try {
		localStorage.setItem(PREVIEW_GAMES_STORAGE_KEY, JSON.stringify(games));
		// Dispatch event to notify other components (e.g., public Games page)
		window.dispatchEvent(new CustomEvent('preview-games-updated', { detail: games }));
	} catch (error) {
		console.error("Error saving preview games to storage:", error);
	}
}

// Export helper to get all preview games (can be used by public Games page)
export function getPreviewGames(): GameModel[] {
	return loadPreviewGamesFromStorage();
}

function SupportTab({ currentAdmin }: { currentAdmin: AdminUserModel }) {
	const [tickets, setTickets] = useState<SupportTicketModel[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedTicket, setSelectedTicket] = useState<SupportTicketModel | null>(null);
	const [replyText, setReplyText] = useState("");
	const [filterStatus, setFilterStatus] = useState<string>("all");
	// Store replies per ticket ID (persists across page refreshes via localStorage)
	const [ticketReplies, setTicketReplies] = useState<Record<string, TicketReply[]>>(() => loadRepliesFromStorage());

	// Permission checks
	const canDelete = canDeleteSupportTickets(currentAdmin);

	// Load tickets
	const loadTickets = async () => {
		try {
			setLoading(true);
			const orm = SupportTicketORM.getInstance();
			const allTickets = await orm.getAllSupportTicket();

			// Sort by date (newest first)
			allTickets.sort((a: SupportTicketModel, b: SupportTicketModel) => parseInt(b.create_time) - parseInt(a.create_time));
			setTickets(allTickets);
		} catch (error) {
			console.error("Error loading support tickets:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadTickets();
	}, []);

	// Update ticket status
	const updateTicketStatus = async (ticket: SupportTicketModel, newStatus: SupportTicketStatus) => {
		try {
			const orm = SupportTicketORM.getInstance();
			const updatedTicket = { ...ticket, status: newStatus };
			await orm.setSupportTicketById(ticket.id, updatedTicket);
			await loadTickets();
			if (selectedTicket?.id === ticket.id) {
				setSelectedTicket(updatedTicket);
			}
		} catch (error) {
			console.error("Error updating ticket status:", error);
		}
	};

	// Delete ticket
	const deleteTicket = async (ticketId: string) => {
		if (!confirm("Are you sure you want to delete this ticket?")) return;

		try {
			const orm = SupportTicketORM.getInstance();
			await orm.deleteSupportTicketById(ticketId);
			await loadTickets();
			if (selectedTicket?.id === ticketId) {
				setSelectedTicket(null);
			}
		} catch (error) {
			console.error("Error deleting ticket:", error);
		}
	};

	// Handle reply - add to ticket's reply list and save to localStorage
	const handleReply = () => {
		if (!selectedTicket || !replyText.trim()) return;

		// Create new reply object
		const newReply: TicketReply = {
			text: replyText.trim(),
			timestamp: Math.floor(Date.now() / 1000).toString(), // Unix timestamp
			authorName: currentAdmin.username || "Admin",
			authorType: 'admin',
		};

		// Add reply to the ticket's replies
		const updatedReplies = {
			...ticketReplies,
			[selectedTicket.id]: [...(ticketReplies[selectedTicket.id] || []), newReply],
		};

		setTicketReplies(updatedReplies);

		// Persist to localStorage
		saveRepliesToStorage(updatedReplies);

		// Clear reply text
		setReplyText("");
	};

	// Filter tickets by status
	const filteredTickets = filterStatus === "all"
		? tickets
		: tickets.filter(t => {
			if (filterStatus === "open") return t.status === SupportTicketStatus.Open;
			if (filterStatus === "in_progress") return t.status === SupportTicketStatus.InProgress;
			if (filterStatus === "resolved") return t.status === SupportTicketStatus.Resolved;
			return true;
		});

	// Format category label
	const getCategoryLabel = (type: SupportTicketInquiryType) => {
		switch (type) {
			case SupportTicketInquiryType.Technical: return "Technical";
			case SupportTicketInquiryType.Business: return "Business";
			case SupportTicketInquiryType.General: return "General";
			default: return "Unspecified";
		}
	};

	// Format status label
	const getStatusLabel = (status: SupportTicketStatus) => {
		switch (status) {
			case SupportTicketStatus.Open: return "New";
			case SupportTicketStatus.InProgress: return "In Progress";
			case SupportTicketStatus.Resolved: return "Resolved";
			default: return "Unknown";
		}
	};

	// Get status badge variant
	const getStatusVariant = (status: SupportTicketStatus): "default" | "secondary" | "destructive" | "outline" => {
		switch (status) {
			case SupportTicketStatus.Open: return "destructive";
			case SupportTicketStatus.InProgress: return "default";
			case SupportTicketStatus.Resolved: return "secondary";
			default: return "outline";
		}
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Support Tickets</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Loading tickets...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Tickets List */}
			<Card className="lg:col-span-2">
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Support Tickets ({filteredTickets.length})</CardTitle>
							<CardDescription>View and manage support requests</CardDescription>
						</div>
						<Select value={filterStatus} onValueChange={setFilterStatus}>
							<SelectTrigger className="w-[150px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Tickets</SelectItem>
								<SelectItem value="open">New</SelectItem>
								<SelectItem value="in_progress">In Progress</SelectItem>
								<SelectItem value="resolved">Resolved</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					{filteredTickets.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">No tickets found</p>
					) : (
						<div className="space-y-4">
							{filteredTickets.map((ticket) => {
								const replyCount = ticketReplies[ticket.id]?.length || 0;
								return (
									<Card
										key={ticket.id}
										className={`cursor-pointer transition-colors ${selectedTicket?.id === ticket.id ? 'border-primary' : ''}`}
										onClick={() => setSelectedTicket(ticket)}
									>
										<CardContent className="pt-6">
											<div className="flex justify-between items-start mb-2">
												<div className="flex-1">
													<div className="flex items-center gap-2 mb-1">
														<Badge variant={getStatusVariant(ticket.status)}>
															{getStatusLabel(ticket.status)}
														</Badge>
														<Badge variant="outline">
															{getCategoryLabel(ticket.inquiry_type)}
														</Badge>
														{replyCount > 0 && (
															<Badge variant="secondary" className="text-xs">
																{replyCount} {replyCount === 1 ? 'reply' : 'replies'}
															</Badge>
														)}
													</div>
													<p className="font-medium">{ticket.sender_name}</p>
													<p className="text-sm text-muted-foreground">{ticket.email}</p>
												</div>
												<p className="text-xs text-muted-foreground">
													{new Date(parseInt(ticket.create_time) * 1000).toLocaleDateString()}
												</p>
											</div>
											<p className="text-sm line-clamp-2 text-muted-foreground mt-2">
												{ticket.message}
											</p>
										</CardContent>
									</Card>
								);
							})}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Ticket Details */}
			<Card>
				<CardHeader>
					<CardTitle>Ticket Details</CardTitle>
					<CardDescription>View and manage selected ticket</CardDescription>
				</CardHeader>
				<CardContent>
					{!selectedTicket ? (
						<p className="text-muted-foreground text-sm">Select a ticket to view details</p>
					) : (
						<div className="space-y-4">
							<div>
								<Label className="text-xs text-muted-foreground">Status</Label>
								<Select
									value={selectedTicket.status.toString()}
									onValueChange={(value) => updateTicketStatus(selectedTicket, parseInt(value) as SupportTicketStatus)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={SupportTicketStatus.Open.toString()}>New</SelectItem>
										<SelectItem value={SupportTicketStatus.InProgress.toString()}>In Progress</SelectItem>
										<SelectItem value={SupportTicketStatus.Resolved.toString()}>Resolved</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<Separator />

							<div>
								<Label className="text-xs text-muted-foreground">From</Label>
								<p className="font-medium">{selectedTicket.sender_name}</p>
								<p className="text-sm text-muted-foreground">{selectedTicket.email}</p>
							</div>

							<div>
								<Label className="text-xs text-muted-foreground">Category</Label>
								<p className="text-sm">{getCategoryLabel(selectedTicket.inquiry_type)}</p>
							</div>

							<div>
								<Label className="text-xs text-muted-foreground">Date Submitted</Label>
								<p className="text-sm">
									{new Date(parseInt(selectedTicket.create_time) * 1000).toLocaleString()}
								</p>
							</div>

							<div>
								<Label className="text-xs text-muted-foreground">Message</Label>
								<p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md mt-1">
									{selectedTicket.message}
								</p>
							</div>

							<Separator />

							{/* Replies Section */}
							{ticketReplies[selectedTicket.id] && ticketReplies[selectedTicket.id].length > 0 && (
								<div className="space-y-2">
									<Label className="text-xs text-muted-foreground">
										Conversation ({ticketReplies[selectedTicket.id].length} {ticketReplies[selectedTicket.id].length === 1 ? 'reply' : 'replies'})
									</Label>
									<div className="space-y-3 max-h-64 overflow-y-auto">
										{ticketReplies[selectedTicket.id].map((reply, index) => (
											<div
												key={index}
												className={reply.authorType === 'admin'
													? "bg-primary/5 p-3 rounded-md border border-primary/10"
													: "bg-accent/5 p-3 rounded-md border border-accent/10"
												}
											>
												<div className="flex justify-between items-start mb-2">
													<Badge variant="outline" className="text-xs">
														{reply.authorType === 'admin' ? 'Admin Reply' : 'User Reply'}
													</Badge>
													<span className="text-xs text-muted-foreground">
														{new Date(parseInt(reply.timestamp) * 1000).toLocaleString()}
													</span>
												</div>
												<p className="text-sm whitespace-pre-wrap">
													{reply.text}
												</p>
												<p className="text-xs text-muted-foreground mt-2">
													— {reply.authorName}
												</p>
											</div>
										))}
									</div>
									<Separator />
								</div>
							)}

							<div className="space-y-2">
								<Label htmlFor="reply">Send Reply</Label>
								<Textarea
									id="reply"
									placeholder="Type your reply..."
									rows={4}
									value={replyText}
									onChange={(e) => setReplyText(e.target.value)}
								/>
								<Button
									onClick={handleReply}
									disabled={!replyText.trim()}
									className="w-full"
									size="sm"
								>
									<Mail className="h-4 w-4 mr-2" />
									Send Reply
								</Button>
								<p className="text-xs text-muted-foreground">
									Replies are visible to users immediately and persist until browser data is cleared
								</p>
							</div>

							<Separator />

							<Button
								variant="destructive"
								onClick={() => deleteTicket(selectedTicket.id)}
								className="w-full"
								size="sm"
								disabled={!canDelete}
								title={!canDelete ? "Only Super Admins and Admins can delete tickets" : "Delete ticket"}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete Ticket
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function SuggestionsTab({ currentAdmin }: { currentAdmin: AdminUserModel }) {
	const [suggestions, setSuggestions] = useState<GameSuggestionModel[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedSuggestion, setSelectedSuggestion] = useState<GameSuggestionModel | null>(null);
	const [filterStatus, setFilterStatus] = useState<string>("all");

	// Permission checks
	const canDelete = canDeleteSuggestions(currentAdmin);

	// Load suggestions
	const loadSuggestions = async () => {
		try {
			setLoading(true);
			const orm = GameSuggestionORM.getInstance();
			const allSuggestions = await orm.getAllGameSuggestion();

			// Sort by date (newest first)
			allSuggestions.sort((a: GameSuggestionModel, b: GameSuggestionModel) => parseInt(b.create_time) - parseInt(a.create_time));
			setSuggestions(allSuggestions);
		} catch (error) {
			console.error("Error loading game suggestions:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadSuggestions();
	}, []);

	// Update suggestion status
	const updateSuggestionStatus = async (suggestion: GameSuggestionModel, newStatus: GameSuggestionStatus) => {
		try {
			const orm = GameSuggestionORM.getInstance();
			const updatedSuggestion = { ...suggestion, status: newStatus };
			await orm.setGameSuggestionById(suggestion.id, updatedSuggestion);
			await loadSuggestions();
			if (selectedSuggestion?.id === suggestion.id) {
				setSelectedSuggestion(updatedSuggestion);
			}
		} catch (error) {
			console.error("Error updating suggestion status:", error);
		}
	};

	// Delete suggestion
	const deleteSuggestion = async (suggestionId: string) => {
		if (!confirm("Are you sure you want to delete this suggestion?")) return;

		try {
			const orm = GameSuggestionORM.getInstance();
			await orm.deleteGameSuggestionById(suggestionId);
			await loadSuggestions();
			if (selectedSuggestion?.id === suggestionId) {
				setSelectedSuggestion(null);
			}
		} catch (error) {
			console.error("Error deleting suggestion:", error);
		}
	};

	// Filter suggestions by status
	const filteredSuggestions = filterStatus === "all"
		? suggestions
		: suggestions.filter(s => {
			if (filterStatus === "new") return s.status === GameSuggestionStatus.New;
			if (filterStatus === "under_review") return s.status === GameSuggestionStatus.UnderReview;
			if (filterStatus === "accepted") return s.status === GameSuggestionStatus.Accepted;
			if (filterStatus === "rejected") return s.status === GameSuggestionStatus.Rejected;
			return true;
		});

	// Format status label
	const getStatusLabel = (status: GameSuggestionStatus) => {
		switch (status) {
			case GameSuggestionStatus.New: return "New";
			case GameSuggestionStatus.UnderReview: return "Under Review";
			case GameSuggestionStatus.Accepted: return "Accepted";
			case GameSuggestionStatus.Rejected: return "Rejected";
			default: return "Unknown";
		}
	};

	// Get status badge variant
	const getStatusVariant = (status: GameSuggestionStatus): "default" | "secondary" | "destructive" | "outline" => {
		switch (status) {
			case GameSuggestionStatus.New: return "destructive";
			case GameSuggestionStatus.UnderReview: return "default";
			case GameSuggestionStatus.Accepted: return "secondary";
			case GameSuggestionStatus.Rejected: return "outline";
			default: return "outline";
		}
	};

	// Get status color for accepted
	const getStatusColor = (status: GameSuggestionStatus): string => {
		if (status === GameSuggestionStatus.Accepted) {
			return "bg-green-500 text-white hover:bg-green-600";
		}
		return "";
	};

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Game Suggestions</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Loading suggestions...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
			{/* Suggestions List */}
			<Card className="lg:col-span-2">
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Game Suggestions ({filteredSuggestions.length})</CardTitle>
							<CardDescription>View and manage user submissions</CardDescription>
						</div>
						<Select value={filterStatus} onValueChange={setFilterStatus}>
							<SelectTrigger className="w-[180px]">
								<SelectValue placeholder="Filter by status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="all">All Suggestions</SelectItem>
								<SelectItem value="new">New</SelectItem>
								<SelectItem value="under_review">Under Review</SelectItem>
								<SelectItem value="accepted">Accepted</SelectItem>
								<SelectItem value="rejected">Rejected</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</CardHeader>
				<CardContent>
					{filteredSuggestions.length === 0 ? (
						<p className="text-muted-foreground text-center py-8">No suggestions found</p>
					) : (
						<div className="space-y-4">
							{filteredSuggestions.map((suggestion) => (
								<Card
									key={suggestion.id}
									className={`cursor-pointer transition-colors ${selectedSuggestion?.id === suggestion.id ? 'border-primary' : ''}`}
									onClick={() => setSelectedSuggestion(suggestion)}
								>
									<CardContent className="pt-6">
										<div className="flex justify-between items-start mb-2">
											<div className="flex-1">
												<div className="flex items-center gap-2 mb-1">
													<Badge
														variant={getStatusVariant(suggestion.status)}
														className={getStatusColor(suggestion.status)}
													>
														{getStatusLabel(suggestion.status)}
													</Badge>
												</div>
												<p className="font-medium text-lg mb-1">{suggestion.title}</p>
												{suggestion.email && (
													<p className="text-sm text-muted-foreground">{suggestion.email}</p>
												)}
											</div>
											<p className="text-xs text-muted-foreground">
												{new Date(parseInt(suggestion.create_time) * 1000).toLocaleDateString()}
											</p>
										</div>
										{suggestion.description && (
											<p className="text-sm line-clamp-2 text-muted-foreground mt-2">
												{suggestion.description}
											</p>
										)}
									</CardContent>
								</Card>
							))}
						</div>
					)}
				</CardContent>
			</Card>

			{/* Suggestion Details */}
			<Card>
				<CardHeader>
					<CardTitle>Suggestion Details</CardTitle>
					<CardDescription>View and manage selected suggestion</CardDescription>
				</CardHeader>
				<CardContent>
					{!selectedSuggestion ? (
						<p className="text-muted-foreground text-sm">Select a suggestion to view details</p>
					) : (
						<div className="space-y-4">
							<div>
								<Label className="text-xs text-muted-foreground">Status</Label>
								<Select
									value={selectedSuggestion.status.toString()}
									onValueChange={(value) => updateSuggestionStatus(selectedSuggestion, parseInt(value) as GameSuggestionStatus)}
								>
									<SelectTrigger>
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value={GameSuggestionStatus.New.toString()}>New</SelectItem>
										<SelectItem value={GameSuggestionStatus.UnderReview.toString()}>Under Review</SelectItem>
										<SelectItem value={GameSuggestionStatus.Accepted.toString()}>Accepted</SelectItem>
										<SelectItem value={GameSuggestionStatus.Rejected.toString()}>Rejected</SelectItem>
									</SelectContent>
								</Select>
							</div>

							<Separator />

							<div>
								<Label className="text-xs text-muted-foreground">Title</Label>
								<p className="font-medium">{selectedSuggestion.title}</p>
							</div>

							{selectedSuggestion.email && (
								<div>
									<Label className="text-xs text-muted-foreground">Submitted By</Label>
									<p className="text-sm">{selectedSuggestion.email}</p>
								</div>
							)}

							<div>
								<Label className="text-xs text-muted-foreground">Date Submitted</Label>
								<p className="text-sm">
									{new Date(parseInt(selectedSuggestion.create_time) * 1000).toLocaleString()}
								</p>
							</div>

							{selectedSuggestion.description && (
								<div>
									<Label className="text-xs text-muted-foreground">Description</Label>
									<p className="text-sm whitespace-pre-wrap bg-muted p-3 rounded-md mt-1">
										{selectedSuggestion.description}
									</p>
								</div>
							)}

							<Separator />

							<Button
								variant="destructive"
								onClick={() => deleteSuggestion(selectedSuggestion.id)}
								className="w-full"
								size="sm"
								disabled={!canDelete}
								title={!canDelete ? "Only Super Admins and Admins can delete suggestions" : "Delete suggestion"}
							>
								<Trash2 className="h-4 w-4 mr-2" />
								Delete Suggestion
							</Button>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

function DevlogTab({ currentAdmin }: { currentAdmin: AdminUserModel }) {
	const queryClient = useQueryClient();
	const [posts, setPosts] = useState<DevlogPost[]>([]);
	const [loading, setLoading] = useState(true);
	const [selectedPost, setSelectedPost] = useState<DevlogPost | null>(null);
	const [isEditing, setIsEditing] = useState(false);
	const [isAdding, setIsAdding] = useState(false);

	// Permission checks
	const canManage = canManageDevlogs(currentAdmin);
	const canDelete = canDeleteContent(currentAdmin);

	// Form state
	const [formData, setFormData] = useState<Partial<DevlogPost>>({
		title: "",
		author_name: "",
		author_email: "",
		body: "",
		image_url: "",
		display_order: 0,
	});

	// Load devlog posts from localStorage
	const loadPosts = () => {
		try {
			setLoading(true);
			const allPosts = loadDevlogPostsFromStorage();
			// Sort by creation time (newest first)
			allPosts.sort((a, b) => parseInt(b.create_time) - parseInt(a.create_time));
			setPosts(allPosts);
		} catch (error) {
			console.error("Error loading devlog posts:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPosts();
	}, []);

	const handleAdd = () => {
		setFormData({
			title: "",
			author_name: currentAdmin.username || currentAdmin.email,
			author_email: currentAdmin.email,
			body: "",
			image_url: "",
			display_order: posts.length,
		});
		setIsAdding(true);
		setIsEditing(false);
		setSelectedPost(null);
	};

	const handleEdit = (post: DevlogPost) => {
		setFormData(post);
		setSelectedPost(post);
		setIsEditing(true);
		setIsAdding(false);
	};

	const handleCancel = () => {
		setIsAdding(false);
		setIsEditing(false);
		setSelectedPost(null);
		setFormData({
			title: "",
			author_name: "",
			author_email: "",
			body: "",
			image_url: "",
			display_order: 0,
		});
	};

	const handleSave = () => {
		try {
			if (isEditing && selectedPost) {
				// Update existing post
				updateDevlogPost(selectedPost.id, formData);
			} else {
				// Create new post
				createDevlogPost({
					title: formData.title || "",
					author_name: formData.author_name || currentAdmin.username || currentAdmin.email,
					author_email: formData.author_email || currentAdmin.email,
					body: formData.body || "",
					image_url: formData.image_url || null,
					display_order: formData.display_order ?? posts.length,
				});
			}

			loadPosts();
			queryClient.invalidateQueries({ queryKey: ["devlog-posts"] });
			handleCancel();
		} catch (error) {
			console.error("Error saving devlog post:", error);
			alert("Failed to save post. Please try again.");
		}
	};

	const handleDelete = (postId: string) => {
		if (!confirm("Are you sure you want to delete this devlog post?")) return;

		try {
			deleteDevlogPost(postId);
			loadPosts();
			queryClient.invalidateQueries({ queryKey: ["devlog-posts"] });
			if (selectedPost?.id === postId) {
				handleCancel();
			}
		} catch (error) {
			console.error("Error deleting devlog post:", error);
			alert("Failed to delete post. Please try again.");
		}
	};

	const handleReorder = (postId: string, direction: "up" | "down") => {
		try {
			const success = reorderDevlogPost(postId, direction);
			if (success) {
				loadPosts();
				queryClient.invalidateQueries({ queryKey: ["devlog-posts"] });
			}
		} catch (error) {
			console.error("Error reordering devlog post:", error);
		}
	};

	const formatDate = (timestamp: string) => {
		const date = new Date(parseInt(timestamp) * 1000);
		return date.toLocaleDateString();
	};

	// Show permission error if user doesn't have access
	if (!canManage) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Manage Devlog Posts</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							You do not have permission to manage devlog posts. Only Super Admins and Admins can create, edit, and publish devlogs.
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	if (loading) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Manage Devlog Posts</CardTitle>
				</CardHeader>
				<CardContent>
					<p className="text-muted-foreground">Loading posts...</p>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Manage Devlog Posts ({posts.length})</CardTitle>
							<CardDescription>Create, edit, and manage development log posts</CardDescription>
						</div>
						<Button onClick={handleAdd}>
							<Plus className="h-4 w-4 mr-2" />
							Add Post
						</Button>
					</div>
				</CardHeader>
				<CardContent>
					{posts.length === 0 ? (
						<div className="text-center py-12">
							<p className="text-muted-foreground mb-4">No devlog posts yet</p>
							<Button onClick={handleAdd}>
								<Plus className="h-4 w-4 mr-2" />
								Add Your First Post
							</Button>
						</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Order</TableHead>
									<TableHead>Title</TableHead>
									<TableHead>Author</TableHead>
									<TableHead>Date</TableHead>
									<TableHead>Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{posts.map((post, index) => (
									<TableRow key={post.id}>
										<TableCell>
											<div className="flex items-center gap-1">
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleReorder(post.id, "up")}
													disabled={index === 0}
												>
													↑
												</Button>
												<Button
													variant="ghost"
													size="sm"
													onClick={() => handleReorder(post.id, "down")}
													disabled={index === posts.length - 1}
												>
													↓
												</Button>
											</div>
										</TableCell>
										<TableCell className="font-medium">{post.title}</TableCell>
										<TableCell>{post.author_name}</TableCell>
										<TableCell>{formatDate(post.create_time)}</TableCell>
										<TableCell>
											<div className="flex items-center gap-2">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleEdit(post)}
												>
													<Pencil className="h-4 w-4" />
												</Button>
												<Button
													variant="destructive"
													size="sm"
													onClick={() => handleDelete(post.id)}
													disabled={!canDelete}
													title={!canDelete ? "Only Super Admins can delete devlog posts" : "Delete post"}
												>
													<Trash2 className="h-4 w-4" />
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>

			{/* Edit/Add Form */}
			{(isEditing || isAdding) && (
				<Card>
					<CardHeader>
						<CardTitle>{isEditing ? "Edit Devlog Post" : "Add New Devlog Post"}</CardTitle>
						<CardDescription>
							{isEditing ? `Editing: ${selectedPost?.title}` : "Fill in the details for the new post"}
						</CardDescription>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="space-y-2">
							<Label htmlFor="title">Title *</Label>
							<Input
								id="title"
								value={formData.title}
								onChange={(e) => setFormData({ ...formData, title: e.target.value })}
								placeholder="Post title"
								required
							/>
						</div>

						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="space-y-2">
								<Label htmlFor="author_name">Author Name *</Label>
								<Input
									id="author_name"
									value={formData.author_name}
									onChange={(e) => setFormData({ ...formData, author_name: e.target.value })}
									placeholder="Your name"
									required
								/>
							</div>

							<div className="space-y-2">
								<Label htmlFor="author_email">Author Email *</Label>
								<Input
									id="author_email"
									type="email"
									value={formData.author_email}
									onChange={(e) => setFormData({ ...formData, author_email: e.target.value })}
									placeholder="your@email.com"
									required
								/>
							</div>
						</div>

						<div className="space-y-2">
							<Label htmlFor="body">Post Content *</Label>
							<Textarea
								id="body"
								value={formData.body}
								onChange={(e) => setFormData({ ...formData, body: e.target.value })}
								placeholder="Write your devlog post content here..."
								rows={12}
								required
							/>
						</div>

						{/* Image Upload Area with Drag & Drop */}
						<div className="space-y-2">
							<Label htmlFor="image_url">Optional Image (Screenshot, Progress Graphic, etc.)</Label>
							<ImageDropZone
								value={formData.image_url || ""}
								onChange={(url) => setFormData({ ...formData, image_url: url })}
							/>
							<p className="text-xs text-muted-foreground">
								Drag and drop an image or paste a URL
							</p>
						</div>

						<Separator />

						<div className="flex gap-2 justify-end">
							<Button variant="outline" onClick={handleCancel}>
								Cancel
							</Button>
							<Button onClick={handleSave}>
								<Save className="h-4 w-4 mr-2" />
								{isEditing ? "Update Post" : "Publish Post"}
							</Button>
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}

function NewsletterTab() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Newsletter Management</CardTitle>
				<CardDescription>Manage subscribers and campaigns</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground">Newsletter management coming soon...</p>
			</CardContent>
		</Card>
	);
}

function MediaTab() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Media Library</CardTitle>
				<CardDescription>Upload and manage media files</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground">Media library coming soon...</p>
			</CardContent>
		</Card>
	);
}

function TestersTab() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Beta Tester Management</CardTitle>
				<CardDescription>Manage beta testers and access keys</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground">Tester management coming soon...</p>
			</CardContent>
		</Card>
	);
}

function SettingsTab() {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Website Settings</CardTitle>
				<CardDescription>Configure site settings and maintenance mode</CardDescription>
			</CardHeader>
			<CardContent>
				<p className="text-muted-foreground">Settings management coming soon...</p>
			</CardContent>
		</Card>
	);
}

// Hero Section Management Tab Component
function HeroSectionTab({ currentAdmin }: { currentAdmin: AdminUserModel }) {
	const queryClient = useQueryClient();
	const [heroConfig, setHeroConfig] = useState<HeroSectionConfig>(() => {
		const config = loadHeroSectionFromStorage();
		return config || initializeDefaultHeroSection();
	});
	const [games, setGames] = useState<GameModelPreview[]>([]);
	const [isEditing, setIsEditing] = useState(false);
	const [isSaving, setIsSaving] = useState(false);

	// Form state
	const [formData, setFormData] = useState<Partial<HeroSectionConfig>>({
		featured_game_id: heroConfig.featured_game_id,
		hero_title: heroConfig.hero_title,
		hero_tagline: heroConfig.hero_tagline,
		hero_background_image: heroConfig.hero_background_image,
	});

	// Permission check - only admins and super admins can manage hero section
	const canManage = isSuperAdmin(currentAdmin) || currentAdmin.role === AdminUserRole.Admin;

	// Load games for dropdown
	useEffect(() => {
		const allGames = loadPreviewGamesFromStorage();
		setGames(allGames.filter((g: GameModelPreview) => !g.is_hidden));
	}, []);

	const handleEdit = () => {
		setFormData({
			featured_game_id: heroConfig.featured_game_id,
			hero_title: heroConfig.hero_title,
			hero_tagline: heroConfig.hero_tagline,
			hero_background_image: heroConfig.hero_background_image,
		});
		setIsEditing(true);
	};

	const handleCancel = () => {
		setIsEditing(false);
		setFormData({
			featured_game_id: heroConfig.featured_game_id,
			hero_title: heroConfig.hero_title,
			hero_tagline: heroConfig.hero_tagline,
			hero_background_image: heroConfig.hero_background_image,
		});
	};

	const handleSave = () => {
		setIsSaving(true);

		const updated = updateHeroSection({
			featured_game_id: formData.featured_game_id || null,
			hero_title: formData.hero_title || '',
			hero_tagline: formData.hero_tagline || '',
			hero_background_image: formData.hero_background_image || '',
		});

		if (updated) {
			setHeroConfig(updated);
			setIsEditing(false);
		}

		setIsSaving(false);
	};

	// Get selected game details
	const selectedGame = games.find(g => g.id === formData.featured_game_id);

	if (!canManage) {
		return (
			<Card>
				<CardHeader>
					<CardTitle>Hero Section Manager</CardTitle>
				</CardHeader>
				<CardContent>
					<Alert variant="destructive">
						<AlertCircle className="h-4 w-4" />
						<AlertDescription>
							You do not have permission to manage the hero section. Only Super Admins and Admins can customize the homepage hero.
						</AlertDescription>
					</Alert>
				</CardContent>
			</Card>
		);
	}

	return (
		<div className="space-y-6">
			<Card>
				<CardHeader>
					<div className="flex justify-between items-center">
						<div>
							<CardTitle>Homepage Hero Section Manager</CardTitle>
							<CardDescription>Customize the hero banner displayed on the homepage</CardDescription>
						</div>
						{!isEditing && (
							<Button onClick={handleEdit}>
								<Pencil className="h-4 w-4 mr-2" />
								Edit Hero Section
							</Button>
						)}
					</div>
				</CardHeader>
				<CardContent className="space-y-6">
					<Alert>
						<Shield className="h-4 w-4" />
						<AlertDescription>
							<strong>Hero Section:</strong> The hero section is the large banner at the top of the homepage.
							Select a featured game to automatically display its countdown and CTA button.
						</AlertDescription>
					</Alert>

					{isEditing ? (
						// Edit Mode
						<div className="space-y-4">
							<div className="space-y-2">
								<Label htmlFor="hero_title">Hero Title *</Label>
								<Input
									id="hero_title"
									value={formData.hero_title}
									onChange={(e) => setFormData({ ...formData, hero_title: e.target.value })}
									placeholder="Welcome to After Hours Studio"
									required
								/>
								<p className="text-xs text-muted-foreground">
									Main heading displayed in the hero section
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="hero_tagline">Tagline *</Label>
								<Textarea
									id="hero_tagline"
									value={formData.hero_tagline}
									onChange={(e) => setFormData({ ...formData, hero_tagline: e.target.value })}
									placeholder="Creating unsettling experiences that live After Hours"
									rows={2}
									required
								/>
								<p className="text-xs text-muted-foreground">
									Short description or tagline under the title
								</p>
							</div>

							<div className="space-y-2">
								<Label htmlFor="featured_game">Featured Game (Optional)</Label>
								<Select
									value={formData.featured_game_id || "none"}
									onValueChange={(value) => setFormData({ ...formData, featured_game_id: value === "none" ? null : value })}
								>
									<SelectTrigger id="featured_game">
										<SelectValue placeholder="Select a game to feature" />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="none">None (No featured game)</SelectItem>
										{games.map((game) => (
											<SelectItem key={game.id} value={game.id}>
												{game.title}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								<p className="text-xs text-muted-foreground">
									The featured game's title, countdown, and CTA button will automatically appear in the hero section
								</p>
							</div>

							{selectedGame && (
								<Alert>
									<Gamepad2 className="h-4 w-4" />
									<AlertDescription>
										<strong>Selected Game:</strong> {selectedGame.title}
										<br />
										<span className="text-xs text-muted-foreground">
											CTA: {selectedGame.wishlist_link ? 'Wishlist Button' : selectedGame.steam_link ? 'Buy Button' : 'No CTA'}
											{selectedGame.release_date && selectedGame.show_countdown && ' • Countdown will display'}
										</span>
									</AlertDescription>
								</Alert>
							)}

							<div className="space-y-2">
								<Label htmlFor="hero_background">Background Image URL (Optional)</Label>
								<ImageDropZone
									value={formData.hero_background_image || ""}
									onChange={(url) => setFormData({ ...formData, hero_background_image: url })}
								/>
								<p className="text-xs text-muted-foreground">
									Background image for the hero section (will be overlaid with a dark gradient)
								</p>
							</div>

							<Separator />

							<div className="flex gap-2 justify-end">
								<Button variant="outline" onClick={handleCancel} disabled={isSaving}>
									Cancel
								</Button>
								<Button onClick={handleSave} disabled={isSaving}>
									<Save className="h-4 w-4 mr-2" />
									{isSaving ? 'Saving...' : 'Save Changes'}
								</Button>
							</div>
						</div>
					) : (
						// View Mode
						<div className="space-y-4">
							<div>
								<Label className="text-sm text-muted-foreground">Hero Title</Label>
								<p className="text-lg font-semibold">{heroConfig.hero_title}</p>
							</div>

							<div>
								<Label className="text-sm text-muted-foreground">Tagline</Label>
								<p className="text-base">{heroConfig.hero_tagline}</p>
							</div>

							<div>
								<Label className="text-sm text-muted-foreground">Featured Game</Label>
								<p className="text-base">
									{heroConfig.featured_game_id ? (
										games.find(g => g.id === heroConfig.featured_game_id)?.title || 'Unknown Game'
									) : (
										<span className="text-muted-foreground">None selected</span>
									)}
								</p>
							</div>

							{heroConfig.hero_background_image && (
								<div>
									<Label className="text-sm text-muted-foreground">Background Image</Label>
									<div className="mt-2 relative w-full h-48 overflow-hidden rounded-md bg-muted">
										<img
											src={heroConfig.hero_background_image}
											alt="Hero background"
											className="w-full h-full object-cover"
										/>
									</div>
								</div>
							)}

							<Alert>
								<AlertCircle className="h-4 w-4" />
								<AlertDescription>
									Changes to the hero section will be visible immediately on the homepage. Click "Edit Hero Section" to customize.
								</AlertDescription>
							</Alert>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

// Site Customization Tab Component
function CustomizationTab() {
	const [customizationTab, setCustomizationTab] = useState("content");

	return (
		<Card>
			<CardHeader>
				<CardTitle>Site Customization</CardTitle>
				<CardDescription>Edit page content and customize your site theme</CardDescription>
			</CardHeader>
			<CardContent>
				<Tabs value={customizationTab} onValueChange={setCustomizationTab}>
					<TabsList className="grid w-full grid-cols-3">
						<TabsTrigger value="content">
							<FileText className="h-4 w-4 mr-2" />
							Edit Text Content
						</TabsTrigger>
						<TabsTrigger value="blocks">
							<Layout className="h-4 w-4 mr-2" />
							Block Editor
						</TabsTrigger>
						<TabsTrigger value="theme">
							<Palette className="h-4 w-4 mr-2" />
							Theme & Colors
						</TabsTrigger>
					</TabsList>

					<TabsContent value="content" className="space-y-4">
						<ContentEditorTab />
					</TabsContent>

					<TabsContent value="blocks" className="space-y-4">
						<BlockEditorTab />
					</TabsContent>

					<TabsContent value="theme" className="space-y-4">
						<ThemeEditorTab />
					</TabsContent>
				</Tabs>
			</CardContent>
		</Card>
	);
}

// Block Editor Sub-Tab
function BlockEditorTab() {
	return (
		<div className="space-y-6 pt-4">
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					<strong>Block Editor Mode:</strong> Add, reorder, align, and delete content blocks.
					All changes update instantly with no rebuild required.
				</AlertDescription>
			</Alert>

			<BlockEditor />
		</div>
	);
}

// Content Editor Sub-Tab
function ContentEditorTab() {
	const [selectedPage, setSelectedPage] = useState<string>("");
	const [selectedBlock, setSelectedBlock] = useState<string>("");
	const [editingContent, setEditingContent] = useState<string>("");
	const [isSaving, setIsSaving] = useState(false);

	const handlePageSelect = (pageSlug: string) => {
		setSelectedPage(pageSlug);
		setSelectedBlock("");
		setEditingContent("");
	};

	const handleBlockSelect = async (blockId: string) => {
		setSelectedBlock(blockId);

		// Load existing content or default
		const { getContentByBlock, EDITABLE_BLOCKS } = await import('@/lib/content-manager');
		const storedContent = getContentByBlock(selectedPage, blockId);
		const pageBlocks = EDITABLE_BLOCKS[selectedPage] || [];
		const defaultBlock = pageBlocks.find(block => block.id === blockId);

		setEditingContent(storedContent?.content || defaultBlock?.defaultContent || "");
	};

	const handleSave = async () => {
		if (!selectedPage || !selectedBlock) return;

		setIsSaving(true);

		const { saveContent, EDITABLE_BLOCKS } = await import('@/lib/content-manager');
		const pageBlocks = EDITABLE_BLOCKS[selectedPage] || [];
		const block = pageBlocks.find(b => b.id === selectedBlock);

		saveContent({
			pageSlug: selectedPage,
			blockId: selectedBlock,
			content: editingContent,
			label: block?.label,
		});

		// Trigger custom event for live updates
		window.dispatchEvent(new Event('content-updated'));

		setIsSaving(false);

		// Show success message (you could add a toast here)
		alert('Content saved successfully!');
	};

	const handleCancel = () => {
		setSelectedBlock("");
		setEditingContent("");
	};

	return (
		<div className="space-y-6 pt-4">
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					<strong>Preview Mode:</strong> Changes are stored locally and will reset on browser clear.
					For production, content will be persisted to Supabase.
				</AlertDescription>
			</Alert>

			{/* Page Selection */}
			<div className="space-y-2">
				<Label>Select Page</Label>
				<ContentPageSelector selectedPage={selectedPage} onPageSelect={handlePageSelect} />
			</div>

			{/* Content Blocks List */}
			{selectedPage && (
				<ContentBlocksList
					selectedPage={selectedPage}
					selectedBlock={selectedBlock}
					onBlockSelect={handleBlockSelect}
				/>
			)}

			{/* Content Editor */}
			{selectedBlock && (
				<ContentBlockEditor
					selectedPage={selectedPage}
					selectedBlock={selectedBlock}
					editingContent={editingContent}
					isSaving={isSaving}
					onContentChange={setEditingContent}
					onSave={handleSave}
					onCancel={handleCancel}
				/>
			)}
		</div>
	);
}

// Helper components for ContentEditorTab
function ContentPageSelector({ selectedPage, onPageSelect }: { selectedPage: string; onPageSelect: (page: string) => void }) {
	const [pages, setPages] = useState<Array<{ slug: string; name: string; path: string }>>([]);
	const [blockCounts, setBlockCounts] = useState<Record<string, number>>({});

	useEffect(() => {
		import('@/lib/content-manager').then(({ AVAILABLE_PAGES, EDITABLE_BLOCKS }) => {
			setPages(AVAILABLE_PAGES);

			// Calculate block counts for each page
			const counts: Record<string, number> = {};
			for (const page of AVAILABLE_PAGES) {
				counts[page.slug] = EDITABLE_BLOCKS[page.slug]?.length || 0;
			}
			setBlockCounts(counts);
		});
	}, []);

	return (
		<Select value={selectedPage} onValueChange={onPageSelect}>
			<SelectTrigger>
				<SelectValue placeholder="Choose a page to edit..." />
			</SelectTrigger>
			<SelectContent>
				{pages.map(page => (
					<SelectItem key={page.slug} value={page.slug}>
						{page.name} ({page.path}) - {blockCounts[page.slug] || 0} blocks
					</SelectItem>
				))}
			</SelectContent>
		</Select>
	);
}

function ContentBlocksList({
	selectedPage,
	selectedBlock,
	onBlockSelect,
}: {
	selectedPage: string;
	selectedBlock: string;
	onBlockSelect: (blockId: string) => void;
}) {
	const [blocks, setBlocks] = useState<Array<{ id: string; label: string; defaultContent: string }>>([]);

	useEffect(() => {
		import('@/lib/content-manager').then(({ EDITABLE_BLOCKS }) => {
			const pageBlocks = EDITABLE_BLOCKS[selectedPage] || [];
			setBlocks(pageBlocks);
		});
	}, [selectedPage]);

	if (blocks.length === 0) {
		return (
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					No editable blocks defined for this page yet.
				</AlertDescription>
			</Alert>
		);
	}

	return (
		<div className="space-y-2">
			<Label>Editable Content Blocks</Label>
			<div className="border rounded-lg divide-y">
				{blocks.map(block => (
					<ContentBlockItem
						key={block.id}
						block={block}
						selectedPage={selectedPage}
						isSelected={selectedBlock === block.id}
						onClick={() => onBlockSelect(block.id)}
					/>
				))}
			</div>
		</div>
	);
}

function ContentBlockItem({
	block,
	selectedPage,
	isSelected,
	onClick,
}: {
	block: { id: string; label: string; defaultContent: string };
	selectedPage: string;
	isSelected: boolean;
	onClick: () => void;
}) {
	const [preview, setPreview] = useState(block.defaultContent);

	useEffect(() => {
		import('@/lib/content-manager').then(({ getContentByBlock }) => {
			const content = getContentByBlock(selectedPage, block.id);
			if (content) {
				setPreview(content.content);
			}
		});
	}, [selectedPage, block.id]);

	return (
		<button
			onClick={onClick}
			className={`w-full text-left px-4 py-3 hover:bg-accent/50 transition-colors ${
				isSelected ? 'bg-accent/30' : ''
			}`}
		>
			<div className="font-medium">{block.label}</div>
			<div className="text-sm text-muted-foreground truncate">{preview}</div>
		</button>
	);
}

function ContentBlockEditor({
	selectedPage,
	selectedBlock,
	editingContent,
	isSaving,
	onContentChange,
	onSave,
	onCancel,
}: {
	selectedPage: string;
	selectedBlock: string;
	editingContent: string;
	isSaving: boolean;
	onContentChange: (content: string) => void;
	onSave: () => void;
	onCancel: () => void;
}) {
	const [blockLabel, setBlockLabel] = useState("");

	useEffect(() => {
		import('@/lib/content-manager').then(({ EDITABLE_BLOCKS }) => {
			const pageBlocks = EDITABLE_BLOCKS[selectedPage] || [];
			const block = pageBlocks.find(b => b.id === selectedBlock);
			if (block) {
				setBlockLabel(block.label);
			}
		});
	}, [selectedPage, selectedBlock]);

	return (
		<div className="space-y-4 p-4 border rounded-lg bg-card/50">
			<div className="flex items-center justify-between">
				<Label htmlFor="content-editor" className="text-lg font-semibold">
					Edit: {blockLabel}
				</Label>
			</div>

			<Textarea
				id="content-editor"
				value={editingContent}
				onChange={(e) => onContentChange(e.target.value)}
				rows={8}
				className="font-mono text-sm"
				placeholder="Enter content..."
			/>

			<div className="flex gap-2 justify-end">
				<Button variant="outline" onClick={onCancel}>
					Cancel
				</Button>
				<Button onClick={onSave} disabled={isSaving}>
					<Save className="h-4 w-4 mr-2" />
					{isSaving ? 'Saving...' : 'Save Changes'}
				</Button>
			</div>
		</div>
	);
}

// Theme Editor Sub-Tab
function ThemeEditorTab() {
	const [themeSettings, setThemeSettings] = useState({
		primary: '',
		accent: '',
		background: '',
		foreground: '',
		card: '',
		cardForeground: '',
	});
	const [isSaving, setIsSaving] = useState(false);

	// Load theme settings on mount
	useEffect(() => {
		if (typeof window !== 'undefined') {
			import('@/lib/content-manager').then(({ getThemeSettings }) => {
				setThemeSettings(getThemeSettings());
			});
		}
	}, []);

	const handleColorChange = (key: string, value: string) => {
		setThemeSettings(prev => ({
			...prev,
			[key]: value,
		}));
	};

	const handleSave = async () => {
		setIsSaving(true);

		const { saveThemeSettings } = await import('@/lib/content-manager');
		saveThemeSettings(themeSettings);

		setIsSaving(false);
		alert('Theme saved and applied successfully!');
	};

	const handleReset = async () => {
		const { resetThemeSettings, DEFAULT_THEME } = await import('@/lib/content-manager');
		resetThemeSettings();
		setThemeSettings(DEFAULT_THEME);
		alert('Theme reset to defaults!');
	};

	return (
		<div className="space-y-6 pt-4">
			<Alert>
				<AlertCircle className="h-4 w-4" />
				<AlertDescription>
					<strong>Preview Mode:</strong> Theme changes are stored locally.
					For production, settings will be persisted to Supabase.
				</AlertDescription>
			</Alert>

			<div className="space-y-4">
				<h3 className="font-semibold text-lg">Customize Theme Colors</h3>
				<p className="text-sm text-muted-foreground">
					Modify the site-wide color scheme. Changes apply immediately across the website.
				</p>

				{/* Color Pickers */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div className="space-y-2">
						<Label htmlFor="primary-color">Primary Color</Label>
						<Input
							id="primary-color"
							type="text"
							value={themeSettings.primary}
							onChange={(e) => handleColorChange('primary', e.target.value)}
							placeholder="oklch(0.21 0.006 285.885)"
							className="font-mono text-sm"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="accent-color">Accent Color</Label>
						<Input
							id="accent-color"
							type="text"
							value={themeSettings.accent}
							onChange={(e) => handleColorChange('accent', e.target.value)}
							placeholder="oklch(0.967 0.001 286.375)"
							className="font-mono text-sm"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="background-color">Background Color</Label>
						<Input
							id="background-color"
							type="text"
							value={themeSettings.background}
							onChange={(e) => handleColorChange('background', e.target.value)}
							placeholder="oklch(1 0 0)"
							className="font-mono text-sm"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="foreground-color">Text Color</Label>
						<Input
							id="foreground-color"
							type="text"
							value={themeSettings.foreground}
							onChange={(e) => handleColorChange('foreground', e.target.value)}
							placeholder="oklch(0.141 0.005 285.823)"
							className="font-mono text-sm"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="card-color">Card Background</Label>
						<Input
							id="card-color"
							type="text"
							value={themeSettings.card}
							onChange={(e) => handleColorChange('card', e.target.value)}
							placeholder="oklch(1 0 0)"
							className="font-mono text-sm"
						/>
					</div>

					<div className="space-y-2">
						<Label htmlFor="card-foreground-color">Card Text Color</Label>
						<Input
							id="card-foreground-color"
							type="text"
							value={themeSettings.cardForeground}
							onChange={(e) => handleColorChange('cardForeground', e.target.value)}
							placeholder="oklch(0.141 0.005 285.823)"
							className="font-mono text-sm"
						/>
					</div>
				</div>

				{/* Color Format Helper */}
				<Alert>
					<AlertCircle className="h-4 w-4" />
					<AlertDescription>
						<strong>Color Format:</strong> Use OKLCH format: <code className="text-xs">oklch(lightness chroma hue)</code>
						<br />
						Example: <code className="text-xs">oklch(0.7 0.25 280)</code> for a purple color
					</AlertDescription>
				</Alert>

				{/* Action Buttons */}
				<div className="flex gap-2 justify-end pt-4">
					<Button variant="outline" onClick={handleReset}>
						Reset to Default
					</Button>
					<Button onClick={handleSave} disabled={isSaving}>
						<Save className="h-4 w-4 mr-2" />
						{isSaving ? 'Applying...' : 'Save & Apply Theme'}
					</Button>
				</div>
			</div>
		</div>
	);
}
