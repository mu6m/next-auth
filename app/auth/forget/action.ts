"use server";

import { signAccessToken, verifyAccessToken } from "@/lib/jwt";
import prisma from "@/lib/prisma";
import { Resend } from "resend";
import { z } from "zod";

export async function reset(prevState: any, formData: FormData) {
	const schema = z.object({
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
	});
	const parse = schema.safeParse({
		email: formData.get("email"),
	});

	if (!parse.success) {
		return {
			success: false,
			message: `there is an error in your data ${parse.error.message}`,
		};
	}
	const { email } = parse.data;
	let user = await prisma.user.findFirst({
		where: { email },
	});
	if (!user) {
		return {
			success: false,
			message: `could not find the user !`,
		};
	}
	const resend = new Resend(process.env.RESEND_TOKEN);
	const code = await signAccessToken({ email, reset: true });
	const domain = "store.ledraa.space";
	const resp = await resend.emails.send({
		from: "noreply@ledraa.space",
		to: email,
		subject: "Account Password Reset Link",
		html: `<p>here is your <a href="${domain}/auth/forget/${code}">link</a> for reseting your account password</p>`,
	});
	if (resp.error == null) {
		return {
			success: true,
			message: `an email has been sent to you !`,
		};
	} else {
		return {
			success: false,
			message: `could not send the email !`,
		};
	}
}
