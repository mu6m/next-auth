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
			email: z
				.string()
				.min(1, { message: "Email is required" })
				.email({ message: "Please enter a valid email address." })
				.refine(
					(email: string) => {
						const usernamePart = email.substring(0, email.indexOf("@"));
						return (
							!usernamePart.includes("+") &&
							!usernamePart.includes(".") &&
							email.endsWith("@gmail.com")
						);
					},
					{
						message:
							"Only Gmail addresses (without + or . in email) are allowed.",
					}
				),
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
		email: formData.get("email"),
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
	const admin = await prisma.user.findFirst({
		where: {
			type: "ADMIN",
		},
	});
	if (admin) {
		return {
			success: false,
			message: `admin user already exsits`,
		};
	}
	parse.data.password = await bcrypt.hash(parse.data.password, 10);
	let user = await prisma.user.upsert({
		where: {
			email: parse.data.email,
		},
		create: {
			email: parse.data.email,
			name: [parse.data.name],
			username: parse.data.username,
			password: parse.data.password,
			type: "ADMIN",
		},
		update: {
			type: "ADMIN",
		},
	});
	delete (user as any)["password"];
	const user_token = await signAccessToken(user);
	cookies().set("user", user_token);
	redirect("/admin");
}
