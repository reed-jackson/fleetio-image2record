# Image2Record - Fleetio Parser Demo

This is a demo application that uses GPT to parse images into Fleetio records. It allows users to upload images, analyze them using OpenAI's GPT-4 model, and view the analysis results.

## Prerequisites

- Node.js (version 14 or higher)
- npm (Node Package Manager)
- An OpenAI API key
- A Cloudinary account (for image uploads)

## Setup

1. Clone the repository:

```
   git clone https://github.com/reed-jackson/fleetio-image2record
   cd fleetio-parser-demo
```

2. Install dependencies:

```
   npm install
```

3. Create a `.env.local` file in the root directory and add the following environment variables:

```
   OPENAI_API_KEY=your_openai_api_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Replace the values with your actual API keys and credentials.

4. Start the development server:

```
   npm run dev
```

5. Open your browser and navigate to `http://localhost:3000` to view the application.

## Usage

1. Click the "Choose Files" button to select one or more images from your computer.
2. Click the "Upload Images" button to upload the selected images to Cloudinary.
3. Once the images are uploaded, click the "Analyze Images" button to process them using GPT-4.
4. The analysis results will be displayed on the page.

## Technologies Used

- Next.js
- React
- OpenAI API
- Cloudinary
- Radix UI

## File Structure

- `app/page.js`: Main application component
- `app/api/upload/route.js`: API route for handling image uploads
- `app/api/analyze/route.js`: API route for analyzing images using GPT-4
- `app/layout.js`: Root layout component

## Notes

- This is a demo application and may require additional error handling and optimizations for production use.
- Ensure that your OpenAI API key has sufficient credits for using the GPT-4 model.
- The application uses the `gpt-4o` model, which may need to be updated based on OpenAI's latest model versions.
