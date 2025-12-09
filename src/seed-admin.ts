import { AdminUserModel } from "@/components/data/resource/admin_user";
import { getAdminUserDataClient } from "@/config/data-clients";

export default async function handler(req, res) {
  try {
    const client = getAdminUserDataClient();

    const admin: AdminUserModel = {
      id: "initial_admin",
      email: "tylervanpelt08@gmail.com",
      password: "Bailey2019!!@@",
      role: "super-admin",
    };

    await client.setAdminUserById("initial_admin", admin);

    res.status(200).json({ message: "Super admin created" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}
