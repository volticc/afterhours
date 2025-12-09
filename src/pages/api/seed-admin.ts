import { getAdminUserDataClient } from "../src/components/data/orm/admin_users";

export default async function handler(req, res) {
  try {
    const client = getAdminUserDataClient();

    const admin = {
      id: "initial_admin",
      email: "tylervanpelt08@gmail.com",
      password: "Bailey2019!!@@",
      role: "super-admin"
    };

    await client.setAdminUserById("initial_admin", admin);

    res.status(200).json({ message: "Super admin created!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
}
