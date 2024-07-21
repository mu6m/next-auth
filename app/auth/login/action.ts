"use server";

import { signAccessToken, verifyAccessToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function login(prevState: any, formData: FormData) {
	const schema = z.object({
		user: z.string().min(1, { message: "username/email is required" }),
		password: z.string().min(8, { message: "Password Too Short" }),
	});
	const parse = schema.safeParse({
		user: formData.get("user"),
		password: formData.get("password"),
	});

	if (!parse.success) {
		return {
			success: false,
			message: `there is an error in your data ${parse.error.message}`,
		};
	}

	let user = await prisma.user.findFirst({
		where: { OR: [{ username: parse.data.user }, { email: parse.data.user }] },
	});
	if (!user) {
		return {
			success: false,
			message: `user not found`,
		};
	}
	const result = await bcrypt.compare(parse.data.password, user.password);
	if (!result) {
		return {
			success: false,
			message: `password is wrong`,
		};
	}
	delete (user as any)["password"];
	const user_token = await signAccessToken(user);
	cookies().set("user", user_token);
	redirect("/");
}
