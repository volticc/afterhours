/**
 * Admin Role-Based Permissions System
 *
 * This utility provides role checking and permission enforcement for the admin dashboard.
 * Uses localStorage in preview mode to store admin role assignments.
 */

import { AdminUserRole, type AdminUserModel } from "@/components/data/orm/orm_admin_user";

// LocalStorage key for admin role assignments (preview mode)
const ADMIN_ROLES_STORAGE_KEY = "admin_roles_v1";

// Role assignment interface
export interface AdminRoleAssignment {
	email: string;
	role: AdminUserRole;
	assignedBy: string; // Email of the admin who assigned this role
	assignedAt: string; // Unix timestamp
}

/**
 * Load all admin role assignments from localStorage
 */
function loadRoleAssignments(): Record<string, AdminRoleAssignment> {
	try {
		const stored = localStorage.getItem(ADMIN_ROLES_STORAGE_KEY);
		return stored ? JSON.parse(stored) : {};
	} catch (error) {
		console.error("Error loading admin roles from storage:", error);
		return {};
	}
}

/**
 * Save admin role assignments to localStorage
 */
function saveRoleAssignments(assignments: Record<string, AdminRoleAssignment>): void {
	try {
		localStorage.setItem(ADMIN_ROLES_STORAGE_KEY, JSON.stringify(assignments));
		// Dispatch event to notify other components
		window.dispatchEvent(new CustomEvent('admin-roles-updated', { detail: assignments }));
	} catch (error) {
		console.error("Error saving admin roles to storage:", error);
	}
}

/**
 * Get the role for a specific admin email
 * Returns SuperAdmin for default admin, or the assigned role
 */
export function getAdminRole(email: string): AdminUserRole {
	const emailLower = email.toLowerCase();

	// Default admin is always Super Admin
	if (emailLower === "admin@afterhoursstudio.com") {
		return AdminUserRole.SuperAdmin;
	}

	// Check localStorage for role assignment
	const assignments = loadRoleAssignments();
	const assignment = assignments[emailLower];

	// Return assigned role, or default to Admin if no assignment found
	return assignment?.role ?? AdminUserRole.Admin;
}

/**
 * Assign a role to an admin (Super Admin only)
 */
export function assignAdminRole(
	adminEmail: string,
	role: AdminUserRole,
	assignedBy: string
): boolean {
	// Prevent changing default admin's role
	if (adminEmail.toLowerCase() === "admin@afterhoursstudio.com") {
		return false;
	}

	const assignments = loadRoleAssignments();
	assignments[adminEmail.toLowerCase()] = {
		email: adminEmail.toLowerCase(),
		role,
		assignedBy,
		assignedAt: Math.floor(Date.now() / 1000).toString(),
	};

	saveRoleAssignments(assignments);
	return true;
}

/**
 * Get all admin role assignments
 */
export function getAllRoleAssignments(): Record<string, AdminRoleAssignment> {
	return loadRoleAssignments();
}

/**
 * Check if an admin is a Super Admin
 */
export function isSuperAdmin(admin: AdminUserModel): boolean {
	const role = getAdminRole(admin.email);
	return role === AdminUserRole.SuperAdmin;
}

/**
 * Check if an admin is an Admin (not Moderator)
 */
export function isAdmin(admin: AdminUserModel): boolean {
	const role = getAdminRole(admin.email);
	return role === AdminUserRole.Admin || role === AdminUserRole.SuperAdmin;
}

/**
 * Check if an admin is a Moderator
 */
export function isModerator(admin: AdminUserModel): boolean {
	const role = getAdminRole(admin.email);
	return role === AdminUserRole.Moderator;
}

/**
 * Get role label for display
 */
export function getRoleLabel(role: AdminUserRole): string {
	switch (role) {
		case AdminUserRole.SuperAdmin:
			return "Super Admin";
		case AdminUserRole.Admin:
			return "Admin";
		case AdminUserRole.Moderator:
			return "Moderator";
		default:
			return "Unknown";
	}
}

/**
 * Permission check: Can manage admins (add, remove, change roles)
 * Only Super Admins can manage admins
 */
export function canManageAdmins(admin: AdminUserModel): boolean {
	return isSuperAdmin(admin);
}

/**
 * Permission check: Can manage games (create, edit, delete)
 * Super Admins and Admins can manage games
 */
export function canManageGames(admin: AdminUserModel): boolean {
	return isAdmin(admin);
}

/**
 * Permission check: Can publish/edit devlog posts
 * Super Admins and Admins can publish/edit devlogs
 */
export function canManageDevlogs(admin: AdminUserModel): boolean {
	return isAdmin(admin);
}

/**
 * Permission check: Can manage support tickets (view, reply, change status, delete)
 * Super Admins and Admins can fully manage tickets
 * Moderators can view and reply only
 */
export function canManageSupportTickets(admin: AdminUserModel): boolean {
	const role = getAdminRole(admin.email);
	return role !== AdminUserRole.Unspecified; // All authenticated admins can at least view
}

/**
 * Permission check: Can delete support tickets
 * Only Super Admins and Admins can delete tickets
 */
export function canDeleteSupportTickets(admin: AdminUserModel): boolean {
	return isAdmin(admin);
}

/**
 * Permission check: Can view and manage suggestions
 * Super Admins and Admins can manage suggestions
 * Moderators can view only
 */
export function canManageSuggestions(admin: AdminUserModel): boolean {
	const role = getAdminRole(admin.email);
	return role !== AdminUserRole.Unspecified; // All authenticated admins can at least view
}

/**
 * Permission check: Can delete suggestions
 * Only Super Admins and Admins can delete suggestions
 */
export function canDeleteSuggestions(admin: AdminUserModel): boolean {
	return isAdmin(admin);
}

/**
 * Permission check: Can delete content (games, devlogs, etc.)
 * Only Super Admins can delete content
 */
export function canDeleteContent(admin: AdminUserModel): boolean {
	return isSuperAdmin(admin);
}

/**
 * Get the current admin's role
 */
export function getCurrentAdminRole(admin: AdminUserModel): AdminUserRole {
	return getAdminRole(admin.email);
}
