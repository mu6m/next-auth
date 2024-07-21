"use server";

import { signAccessToken, verifyAccessToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import bcrypt from "bcrypt";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

export async function create(prevState: any, formData: FormData) {
	const schema = z
		.object({
			token: z.string().min(1, { message: "Token is required" }),
			name: z.string().min(1, { message: "Name is required" }),
			username: z
				.string()
				.regex(new RegExp("[A-Za-z0-9]"), {
					message: "Username should have only characters and numbers ",
				})
				.min(1, { message: "Username is required" }),
			password: z.string().min(8, { message: "Password Too Short" }),
			confirm_password: z.string().min(8, { message: "Password Too Short" }),
		})
		.refine((data) => data.password === data.confirm_password, {
			message: "Passwords don't match",
			path: ["confirm_password"],
		});
	const parse = schema.safeParse({
		token: formData.get("token"),
		name: formData.get("name"),
		username: formData.get("username"),
		password: formData.get("password"),
		confirm_password: formData.get("confirm_password"),
	});

	if (!parse.success) {
		return {
			success: false,
			message: `there is an error in your data ${parse.error.message}`,
		};
	}

	const token = await verifyAccessToken(parse.data.token);
	if (token === false || !token) {
		return {
			success: false,
			message: `error in jwt token`,
		};
	}
	parse.data.password = await bcrypt.hash(parse.data.password, 10);
	let user = await prisma.user.create({
		data: {
			email: token.email,
			name: [parse.data.name],
			username: parse.data.username,
			password: parse.data.password,
		},
	});
	delete (user as any)["password"];
	const user_token = await signAccessToken(user);
	cookies().set("user", user_token);
	redirect("/");
}
