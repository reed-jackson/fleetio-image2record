"use client";

import { useState } from "react";
import { Button, TextField, Flex, Text, Card, Container, Heading } from "@radix-ui/themes";
import { useCompletion } from "ai/react";

export default function Home() {
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [uploadedUrls, setUploadedUrls] = useState([]);
	const [analysis, setAnalysis] = useState(null);
	const [isLoading, setIsLoading] = useState(false);

	const handleFileChange = (e) => {
		if (e.target.files) {
			setSelectedFiles(Array.from(e.target.files));
		}
	};

	const uploadFiles = async () => {
		const urls = await Promise.all(
			selectedFiles.map(async (file) => {
				const formData = new FormData();
				formData.append("file", file);
				const response = await fetch("/api/upload", {
					method: "POST",
					body: formData,
				});
				const data = await response.json();
				return data.url;
			})
		);
		setUploadedUrls(urls);
	};

	const handleAnalyze = async () => {
		try {
			const response = await fetch("/api/analyze", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ urls: uploadedUrls }),
			});
			const data = await response.json();

			console.log(data);
			if (response.ok) {
				setAnalysis(data.analysis);
			} else {
				throw new Error(data.error || "Analysis failed");
			}
		} catch (error) {
			console.error("Analysis error:", error);
			setAnalysis(`Error: ${error.message}`);
		}
	};

	return (
		<Container size={"2"}>
			<Flex direction="column" align={"center"} gap="4" mt={"9"}>
				<img
					src="https://secure.fleetio.com/assets/fleetio-logo-horizontal-9526cfb05272263cf25e30bacc959c0e0950deabb3e2794d4009a17b751288fc.svg"
					width={120}
				/>
				<Heading size="9">Image2Record</Heading>
				<Text color="gray">A demo for GPT-parsing images into Fleetio records</Text>
				<input type="file" multiple onChange={handleFileChange} />
				<Button onClick={uploadFiles} disabled={selectedFiles.length === 0}>
					Upload Images
				</Button>
				<Button onClick={handleAnalyze} disabled={uploadedUrls.length === 0 || isLoading}>
					{isLoading ? "Analyzing..." : "Analyze Images"}
				</Button>
				{analysis && (
					<Card>
						<Text size="3" weight="bold">
							Analysis Results:
						</Text>
						<pre>{JSON.stringify(analysis, null, 2)}</pre>
					</Card>
				)}
			</Flex>
		</Container>
	);
}
