import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
	try {
		const { urls } = await request.json();

		console.log("urls", urls);

		if (!urls || urls.length === 0) {
			return NextResponse.json({ error: "No image URLs provided" }, { status: 400 });
		}

		const messages = [
			{
				role: "user",
				content: [
					{
						type: "text",
						text: "Analyze these images and provide a detailed description of what you see.",
					},
					...urls.map((url) => ({ type: "image_url", image_url: { url: url } })),
				],
			},
		];

		console.log("messages", messages);

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: messages,
			max_tokens: 4096,
		});

		const analysis = response.choices[0].message.content;

		console.log(analysis);

		return NextResponse.json({ analysis });
	} catch (error) {
		console.error("Analysis error:", error);
		return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
	}
}
