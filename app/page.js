"use client";

import { useState, useEffect, useRef } from "react";
import { Button, Flex, Text, Card, Container, Heading, Box, SegmentedControl } from "@radix-ui/themes";
import { IconCircleCheck, IconCircleCheckFilled, IconCircleFilled } from "@tabler/icons-react";

export default function Home() {
	const [selectedFiles, setSelectedFiles] = useState([]);
	const [recordType, setRecordType] = useState("service_entry");
	const [uploadedUrls, setUploadedUrls] = useState([]);
	const [analysis, setAnalysis] = useState(null);
	const [isLoading, setIsLoading] = useState(false);
	const [previews, setPreviews] = useState([]);
	const [uploadError, setUploadError] = useState(null);
	const [isUploading, setIsUploading] = useState(false);
	const [analysisTime, setAnalysisTime] = useState(null);

	const timerRef = useRef(null);

	useEffect(() => {
		// Create preview URLs for selected files
		const objectUrls = selectedFiles.map((file) => URL.createObjectURL(file));
		setPreviews(objectUrls);

		// Cleanup function to revoke object URLs
		return () => objectUrls.forEach((url) => URL.revokeObjectURL(url));
	}, [selectedFiles]);

	const handleFileChange = (e) => {
		if (e.target.files) {
			setSelectedFiles(Array.from(e.target.files));
		}
	};

	const uploadFiles = async () => {
		setIsUploading(true);
		setUploadError(null);
		try {
			const urls = await Promise.all(
				selectedFiles.map(async (file) => {
					const formData = new FormData();
					formData.append("file", file);
					const response = await fetch("/api/upload", {
						method: "POST",
						body: formData,
					});
					if (!response.ok) {
						throw new Error(`Upload failed for ${file.name}`);
					}
					const data = await response.json();
					return data.url;
				})
			);
			setUploadedUrls(urls);
		} catch (error) {
			console.error("Upload error:", error);
			setUploadError(error.message);
		} finally {
			setIsUploading(false);
		}
	};

	const handleAnalyze = async () => {
		setIsLoading(true);
		setAnalysisTime(null);
		const startTime = Date.now();
		timerRef.current = setInterval(() => {
			setAnalysisTime((Date.now() - startTime) / 1000);
		}, 100);

		try {
			const response = await fetch("/api/analyze", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ urls: uploadedUrls, recordType }),
			});
			const data = await response.json();
			console.log(data);
			if (response.ok) {
				setAnalysis(data);
			} else {
				throw new Error(data.error || "Analysis failed");
			}
		} catch (error) {
			console.error("Analysis error:", error);
			setAnalysis(`Error: ${error.message}`);
		} finally {
			setIsLoading(false);

			clearInterval(timerRef.current);
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
				<Text color="gray">A demo for parsing invoices and receipts into Fleetio records</Text>
				<Text color="gray" align={"center"} style={{ maxWidth: "500px" }}>
					Select images of invoices, reciepts, etc. to upload, then click analyze to attempt parsing them into a fleetio
					record.
				</Text>

				<input type="file" multiple onChange={handleFileChange} />
				<Button onClick={uploadFiles} disabled={selectedFiles.length === 0} loading={isUploading}>
					{isUploading ? "Uploading..." : "Upload Images"}
				</Button>

				{uploadError && (
					<Callout.Root color="red">
						<Callout.Icon>
							<IconAlertTriangle />
						</Callout.Icon>
						<Callout.Text>{uploadError}</Callout.Text>
					</Callout.Root>
				)}

				{/* Display thumbnails */}
				{previews.length > 0 && (
					<Flex wrap="wrap" gap="2" justify="center">
						{previews.map((preview, index) => (
							<Box key={index} position="relative">
								<img src={preview} alt={`Preview ${index + 1}`} width={100} height={100} style={{ objectFit: "cover" }} />
								{uploadedUrls[index] && (
									<Box position="absolute" top={"2"} right={"2"}>
										<IconCircleCheckFilled size={24} color="green" />
									</Box>
								)}
								{isUploading && !uploadedUrls[index] && (
									<Box position="absolute" top={"2"} right={"2"}>
										<IconCircleFilled size={24} color="orange" />
									</Box>
								)}
							</Box>
						))}
					</Flex>
				)}

				<SegmentedControl.Root value={recordType} onValueChange={setRecordType}>
					<SegmentedControl.Item value="service_entry">Service Entry</SegmentedControl.Item>
					<SegmentedControl.Item value="fuel_entry">Fuel Entry</SegmentedControl.Item>
				</SegmentedControl.Root>

				<Button onClick={handleAnalyze} disabled={uploadedUrls.length === 0 || isLoading}>
					{isLoading ? "Analyzing..." : "Convert"}
				</Button>
				{isLoading && <Text>Processing your request... Time elapsed: {analysisTime?.toFixed(1)}s</Text>}
				{analysis && (
					<Card>
						<Flex direction={"column"} gap={"2"}>
							<Text size="3" weight="bold">
								Analysis Results:
							</Text>
							<Text>Analysis completed in {analysisTime?.toFixed(2)} seconds</Text>
							<text style={{ maxWidth: "500px" }}>{JSON.stringify(analysis, null, 2)}</text>
							<Button color="gray" onClick={() => console.log(analysis)}>
								Console Log Results
							</Button>
						</Flex>
					</Card>
				)}
			</Flex>
		</Container>
	);
}
