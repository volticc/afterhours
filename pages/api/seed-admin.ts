import type { NextApiRequest, NextApiResponse } from "next";
import { DataStoreClient } from "../../components/data/orm/client";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const client = DataStoreClient.getInstance();

    const admin = {
      id: "initial_admin",
      email: "tylervanpelt08@gmail.com",
      password: "Bailey2019!!@@",
      role: "super-admin",
    };

    await client.setAdminUserById("initial_admin", admin);

    res.status(200).json({ message: "Super admin created!" });
  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error?.message || "Unknown error" });
  }
}
