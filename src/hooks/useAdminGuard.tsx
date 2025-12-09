import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Admin Guard Hook
 *
 * This hook ensures that only authenticated admin users can access admin-only features.
 * If the user is not authenticated or not an admin, they will be redirected to the home page.
 *
 * Usage:
 * - Call this hook at the top of any admin-only component or page
 * - It will automatically redirect non-admin users
 *
 * @returns Object containing isAdmin flag and isLoading state
 */
export function useAdminGuard() {
	const { currentAdmin, isAuthenticated, isLoading } = useAuth();
	const navigate = useNavigate();

	const isAdmin = isAuthenticated && currentAdmin !== null;

	useEffect(() => {
		// Wait for auth to finish loading
		if (isLoading) {
			return;
		}

		// Redirect if not authenticated or not an admin
		if (!isAdmin) {
			navigate({ to: "/" });
		}
	}, [isAdmin, isLoading, navigate]);

	return {
		isAdmin,
		isLoading,
	};
}

/**
 * Hook to check if the current user is an admin (without redirect)
 *
 * Use this for conditional rendering of admin UI elements.
 *
 * @returns Object containing isAdmin flag
 */
export function useIsAdmin() {
	const { currentAdmin, isAuthenticated } = useAuth();

	return {
		isAdmin: isAuthenticated && currentAdmin !== null,
	};
}
