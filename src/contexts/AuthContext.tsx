import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { type AdminUserModel, AdminUserStatus, AdminUserRole } from "@/components/data/orm/orm_admin_user";

// User account interface (non-admin users)
export interface UserAccount {
	id: string;
	email: string;
	password: string; // In preview mode, stored as plain text. In production, use hashed passwords
	createdAt: string;
}

interface AuthContextType {
	// Current user (could be admin or regular user)
	currentUser: UserAccount | null;
	currentAdmin: AdminUserModel | null;
	isAuthenticated: boolean;
	isLoading: boolean;

	// Auth methods
	login: (email: string, password: string) => Promise<boolean>;
	signup: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
	logout: () => Promise<void>;
	checkAuth: () => Promise<void>;

	// Admin management (only for admins)
	addAdminEmail: (email: string) => void;
	removeAdminEmail: (email: string) => void;
	getAdminEmails: () => string[];
	isEmailAdmin: (email: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// LocalStorage keys
const STORAGE_KEYS = {
	USERS: "app_users", // All registered user accounts
	ADMINS: "app_admin_emails", // List of admin email addresses
	SESSION_TOKEN: "app_session_token",
	SESSION_EMAIL: "app_session_email",
};

// Default admin email (always has admin access)
const DEFAULT_ADMIN_EMAIL = "admin@afterhoursstudio.com";

export function AuthProvider({ children }: { children: ReactNode }) {
	const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
	const [currentAdmin, setCurrentAdmin] = useState<AdminUserModel | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	// Initialize default admin account if not exists
	const initializeDefaultAdmin = () => {
		const users = getStoredUsers();
		const defaultAdminExists = users.some(u => u.email === DEFAULT_ADMIN_EMAIL);

		if (!defaultAdminExists) {
			const defaultAdmin: UserAccount = {
				id: `user_${Date.now()}_default`,
				email: DEFAULT_ADMIN_EMAIL,
				password: "admin123",
				createdAt: new Date().toISOString(),
			};
			users.push(defaultAdmin);
			localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
		}

		// Ensure default admin is in admin list
		const adminEmails = getAdminEmails();
		if (!adminEmails.includes(DEFAULT_ADMIN_EMAIL)) {
			adminEmails.push(DEFAULT_ADMIN_EMAIL);
			localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(adminEmails));
		}
	};

	// Get all stored user accounts
	const getStoredUsers = (): UserAccount[] => {
		try {
			const stored = localStorage.getItem(STORAGE_KEYS.USERS);
			return stored ? JSON.parse(stored) : [];
		} catch {
			return [];
		}
	};

	// Get admin email list
	const getAdminEmails = (): string[] => {
		try {
			const stored = localStorage.getItem(STORAGE_KEYS.ADMINS);
			return stored ? JSON.parse(stored) : [DEFAULT_ADMIN_EMAIL];
		} catch {
			return [DEFAULT_ADMIN_EMAIL];
		}
	};

	// Check if an email is in the admin list
	const isEmailAdmin = (email: string): boolean => {
		const adminEmails = getAdminEmails();
		return adminEmails.includes(email.toLowerCase());
	};

	// Add an email to the admin list (only callable by existing admins)
	const addAdminEmail = (email: string) => {
		const adminEmails = getAdminEmails();
		const emailLower = email.toLowerCase();

		if (!adminEmails.includes(emailLower)) {
			adminEmails.push(emailLower);
			localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(adminEmails));
		}
	};

	// Remove an email from the admin list
	const removeAdminEmail = (email: string) => {
		const emailLower = email.toLowerCase();

		// Prevent removing the default admin
		if (emailLower === DEFAULT_ADMIN_EMAIL.toLowerCase()) {
			return;
		}

		const adminEmails = getAdminEmails();
		const filtered = adminEmails.filter(e => e !== emailLower);
		localStorage.setItem(STORAGE_KEYS.ADMINS, JSON.stringify(filtered));
	};

	// Sign up a new user account
	const signup = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
		const emailLower = email.toLowerCase();
		const users = getStoredUsers();

		// Check if user already exists
		if (users.some(u => u.email.toLowerCase() === emailLower)) {
			return { success: false, error: "An account with this email already exists" };
		}

		// Validate email format
		if (!email.includes("@")) {
			return { success: false, error: "Please enter a valid email address" };
		}

		// Validate password length
		if (password.length < 6) {
			return { success: false, error: "Password must be at least 6 characters" };
		}

		// Create new user account
		const newUser: UserAccount = {
			id: `user_${Date.now()}_${Math.random().toString(36).substring(7)}`,
			email: emailLower,
			password, // In preview mode, store plain text. In production, hash this!
			createdAt: new Date().toISOString(),
		};

		users.push(newUser);
		localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));

		console.log("User account created (preview mode - local only):", emailLower);
		return { success: true };
	};

	// Login with email and password
	const login = async (email: string, password: string): Promise<boolean> => {
		const emailLower = email.toLowerCase();
		const users = getStoredUsers();

		// Find user account
		const user = users.find(u => u.email.toLowerCase() === emailLower && u.password === password);

		if (!user) {
			return false;
		}

		// Store session
		const sessionToken = `session_${Date.now()}_${Math.random().toString(36).substring(7)}`;
		localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, sessionToken);
		localStorage.setItem(STORAGE_KEYS.SESSION_EMAIL, user.email);

		setCurrentUser(user);

		// Check if this user is an admin
		if (isEmailAdmin(user.email)) {
			const adminModel: AdminUserModel = {
				id: user.id,
				username: user.email.split("@")[0],
				email: user.email,
				password_hash: user.password,
				role: user.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()
					? AdminUserRole.SuperAdmin
					: AdminUserRole.Admin,
				status: AdminUserStatus.Active,
				last_login: new Date().toISOString(),
				data_creator: "",
				data_updater: "",
				create_time: user.createdAt,
				update_time: new Date().toISOString(),
			};
			setCurrentAdmin(adminModel);
			console.log("Admin logged in (preview mode - local only):", user.email);
		} else {
			setCurrentAdmin(null);
			console.log("User logged in (preview mode - local only):", user.email);
		}

		return true;
	};

	// Logout current user
	const logout = async () => {
		localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
		localStorage.removeItem(STORAGE_KEYS.SESSION_EMAIL);
		setCurrentUser(null);
		setCurrentAdmin(null);
		console.log("User logged out (preview mode - local only)");
	};

	// Check if user is authenticated on mount
	const checkAuth = async () => {
		const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
		const sessionEmail = localStorage.getItem(STORAGE_KEYS.SESSION_EMAIL);

		if (sessionToken && sessionEmail) {
			const users = getStoredUsers();
			const user = users.find(u => u.email === sessionEmail);

			if (user) {
				setCurrentUser(user);

				// Check if this user is an admin
				if (isEmailAdmin(user.email)) {
					const adminModel: AdminUserModel = {
						id: user.id,
						username: user.email.split("@")[0],
						email: user.email,
						password_hash: user.password,
						role: user.email.toLowerCase() === DEFAULT_ADMIN_EMAIL.toLowerCase()
							? AdminUserRole.SuperAdmin
							: AdminUserRole.Admin,
						status: AdminUserStatus.Active,
						last_login: new Date().toISOString(),
						data_creator: "",
						data_updater: "",
						create_time: user.createdAt,
						update_time: new Date().toISOString(),
					};
					setCurrentAdmin(adminModel);
				}
			}
		}

		setIsLoading(false);
	};

	useEffect(() => {
		initializeDefaultAdmin();
		checkAuth();
	}, []);

	return (
		<AuthContext.Provider
			value={{
				currentUser,
				currentAdmin,
				isAuthenticated: currentUser !== null,
				isLoading,
				login,
				signup,
				logout,
				checkAuth,
				addAdminEmail,
				removeAdminEmail,
				getAdminEmails,
				isEmailAdmin,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
}

export function useAuth() {
	const context = useContext(AuthContext);
	if (context === undefined) {
		throw new Error("useAuth must be used within an AuthProvider");
	}
	return context;
}
