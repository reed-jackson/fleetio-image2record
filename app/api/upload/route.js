import { v2 as cloudinary } from "cloudinary";
import { NextResponse } from "next/server";

cloudinary.config({
	cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
	api_key: process.env.CLOUDINARY_API_KEY,
	api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(request) {
	const formData = await request.formData();
	const file = formData.get("file");

	if (!file) {
		return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
	}

	try {
		const arrayBuffer = await file.arrayBuffer();
		const buffer = Buffer.from(arrayBuffer);

		const result = await new Promise((resolve, reject) => {
			cloudinary.uploader
				.upload_stream({ resource_type: "auto" }, (error, result) => {
					if (error) reject(error);
					else resolve(result);
				})
				.end(buffer);
		});

		return NextResponse.json({ url: result.secure_url });
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json({ error: "Upload failed" }, { status: 500 });
	}
}
