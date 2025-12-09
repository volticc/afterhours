/**
 * Script to create an admin user
 * This script adds tylervanpelt08@gmail.com as an Administrator
 */
import { AdminUserORM, AdminUserRole, AdminUserStatus, type AdminUserModel } from "../src/components/data/orm/orm_admin_user";

async function createAdmin() {
	try {
		const orm = AdminUserORM.getInstance();

		const email = "tylervanpelt08@gmail.com";

		// Check if admin already exists
		console.log(`Checking if admin with email ${email} already exists...`);
		const existingAdmins = await orm.getAdminUserByEmail(email);

		if (existingAdmins.length > 0) {
			console.log("✓ Admin user already exists!");
			console.log("Username:", existingAdmins[0].username);
			console.log("Email:", existingAdmins[0].email);
			console.log("Role:", AdminUserRole[existingAdmins[0].role]);
			console.log("Status:", AdminUserStatus[existingAdmins[0].status]);
			return;
		}

		// Create new admin user
		console.log("Creating new admin user...");
		const newAdmin = {
			username: "Tyler",
			email: email,
			password_hash: "admin123", // Default password - CHANGE THIS IMMEDIATELY after first login
			role: AdminUserRole.SuperAdmin,
			status: AdminUserStatus.Active,
			// These fields will be auto-populated by backend
			id: "",
			data_creator: "",
			data_updater: "",
			create_time: "",
			update_time: "",
			last_login: null,
		} as AdminUserModel;
		await orm.insertAdminUser([newAdmin]);

		console.log("✓ Admin user created successfully!");
		console.log("Username: Tyler");
		console.log("Email:", email);
		console.log("Password: admin123 (CHANGE THIS AFTER FIRST LOGIN)");
		console.log("Role: Super Admin");
		console.log("Status: Active");
		console.log("\nYou can now login at /admin with these credentials.");

	} catch (error) {
		console.error("Error creating admin user:", error);
		process.exit(1);
	}
}

createAdmin();
