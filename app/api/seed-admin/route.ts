import type { NextApiRequest, NextApiResponse } from "next";
import { AdminUserORM } from "../../../src/components/data/orm/orm_admin_user"


export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const orm = AdminUserORM.getInstance();

    const admin = {
      username: "initial_admin",
      email: "tylervanpelt08@gmail.com",
      password_hash: "Bailey2019!!@@",
      role: 1,
      status: 1,
      last_login: null
    };

    const result = await orm.insertAdminUser([admin]);

    res.status(200).json({
      message: "Super admin created!",
      result
    });

  } catch (error: any) {
    console.error(error);
    res.status(500).json({ message: error?.message || "Unknown error" });
  }
}
