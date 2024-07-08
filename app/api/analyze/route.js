import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
	apiKey: process.env.OPENAI_API_KEY,
});

const responseStructures = {
	check: {
		isValid: "boolean",
		error: "array of strings" || null,
	},
};

const recordStructures = {
	service_entry: {
		started_at_ct: "Jul 12, 2021, 11:00 PM",
		vehicle_year: 2013,
		tax_2_type: "percentage",
		vehicle_meter_value: 82204,
		account_is_demo: "false",
		labor_subtotal_cents: 1234,
		tax_1_percentage: 0,
		vehicle_meter_unit: "mi",
		completed_at: "Jul 12, 2021, 11:00 PM",
		tax_2_percentage: 0,
		vendor_contact_phone: "",
		tax_1_dollars: 0,
		discount_percentage: 0,
		fees_dollars: 0,
		vehicle_model: "Equinox",
		discount_cents: 0,
		tax_2_dollars: 0,
		started_at: "Jul 12, 2021, 11:00 PM",
		vmrs_repair_priority_class_code: "",
		tax_1_cents: 0,
		general_notes: "",
		labor_subtotal_dollars: 1234,
		total_amount_dollars: 759.87,
		parts_subtotal_dollars: 759.87,
		total_amount_cents: 75987,
		vehicle_license_plate: "JM707",
		vehicle_vin: "1GNALBEKXDZ106708",
		vehicle_meter_at: "Jun 17, 2024, 7:00 PM",
		vendor_contact_name: "",
		tax_1_type: "fixed",
		parts_subtotal_cents: 75987,
		vehicle_make: "Chevrolet",
		discount_dollars: 0,
		vendor_street_address_line_2: "",
		vehicle_trim: "LS",
		tax_2_cents: 0,
		currency: "USD",
		vendor_street_address: "",
		vendor_name: "ACTION GATOR",
		subtotal_cents: 75987,
		reference: "37-35163",
		is_tax_free_labor: "false",
		fees_cents: 0,
		discount_type: "percentage",
		vendor_postal_code: "",
		subtotal_dollars: 759.87,
	},
	service_entry_line_item: {
		started_at_ct: "2023-05-15T09:30:00Z",
		vehicle_year: 2019,
		vendor_website: "https://example-vendor.com",
		tax_2_type: "state",
		vehicle_meter_value: 45000,
		labor_subtotal_cents: 15000,
		tax_1_percentage: 7.5,
		vehicle_meter_unit: "miles",
		completed_at: "2023-05-15T14:30:00Z",
		tax_2_percentage: 4.5,
		vendor_contact_phone: +1 - 555 - 123 - 4567,
		tax_1_dollars: 11.25,
		discount_percentage: 5,
		fees_dollars: 25.0,
		vehicle_model: "Sprinter",
		discount_cents: 1000,
		tax_2_dollars: 6.75,
		started_at: "2023-05-15T09:30:00Z",
		tax_1_cents: 1125,
		general_notes: "Routine maintenance and brake check",
		labor_subtotal_dollars: 150.0,
		total_amount_dollars: 341.0,
		parts_subtotal_dollars: 150.0,
		total_amount_cents: 34100,
		vehicle_license_plate: "ABC123",
		vendor_contact_email: "contact@example-vendor.com",
		vehicle_vin: "1ABCD23EFGH456789",
		vendor_country: "USA",
		vehicle_meter_at: "2023-05-15T09:30:00Z",
		vendor_contact_name: "John Smith",
		tax_1_type: "sales",
		vendor_city: "San Francisco",
		parts_subtotal_cents: 15000,
		vehicle_make: "Mercedes-Benz",
		discount_dollars: 10.0,
		vendor_street_address_line_2: "Suite 200",
		vehicle_trim: "2500",
		tax_2_cents: 675,
		currency: "USD",
		vendor_street_address: "123 Main St",
		vendor_name: "AutoFix Services",
		subtotal_cents: 30000,
		reference: "REF-2023-05-15-001",
		is_tax_free_labor: "false",
		fees_cents: 2500,
		discount_type: "percentage",
		vendor_postal_code: "94105",
		subtotal_dollars: 300.0,
	},
	fuel_entry: {
		date: "Date of fuel purchase",
		vendor: "Name of the fuel station",
		fuel_type: "Type of fuel (e.g., gasoline, diesel)",
		quantity: "Amount of fuel purchased (in gallons or liters)",
		cost: "Total cost of the fuel purchase",
		mileage: "Vehicle mileage at the time of fueling",
	},
};

export const maxDuration = 60; // This function can run for a maximum of 5 seconds

export async function POST(request) {
	try {
		const { urls, recordType } = await request.json();

		if (!urls || urls.length === 0 || !recordType) {
			return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
		}

		const structure = recordStructures[recordType];

		if (!structure || recordType === "fuel_entry") {
			return NextResponse.json({ error: "Invalid record type" }, { status: 400 });
		}

		// First, we ask to confirm what is passed is valid for parsing into the required `recordType`
		const messages = [
			{
				role: "system",
				content:
					"You are an expert at parsing images into records for a fleet management system. You will be given a set of images and asked to provide a detailed description of what you see. Always respond in JSON.",
			},
			{
				role: "user",
				content: [
					{
						type: "text",
						text: `Analyze the following image(s), there may be multiple pages. Confirm whether the information in the provided image(s) is able to be parsed into the require record type: ${recordType}.
          
          Provide your response in a JSON format that matches this structure, with a relevant error message if the information is not able to be parsed:
          
          ${JSON.stringify(responseStructures.check, null, 2)}`,
					},
					...urls.map((url) => ({ type: "image_url", image_url: { url } })),
				],
			},
		];

		const response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: messages,
			max_tokens: 4096,
			response_format: { type: "json_object" },
		});

		console.log(response);

		const check = response.choices[0].message.content;
		const parsedCheck = JSON.parse(check);
		console.log(parsedCheck);

		if (!parsedCheck.isValid) {
			return NextResponse.json({ error: parsedCheck.error }, { status: 400 });
		}

		// If the response is valid, proceed with parsing

		messages.push(response.choices[0].message);

		messages.push({
			role: "user",
			content: `Now, parse information from those image(s) into the ${recordType} record type: ${JSON.stringify(
				structure,
				null,
				2
			)}
        
        Respond with only the JSON of the record you create. Leave any un-filled fields as null.`,
		});

		const analysis_response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: messages,
			max_tokens: 4096,
			response_format: { type: "json_object" },
		});

		const analysis = analysis_response.choices[0].message.content;
		const parsedAnalysis = JSON.parse(analysis);
		console.log(parsedAnalysis);

		// With this we could:
		/**
		 * 1. Search for a matching vehicle in the users account
		 * 2. Search for a matchign vendor in the users account
		 * 3. Create a new vehicle or vendor if one is not found
		 * 4. Create a new service entry or fuel entry
		 * 5. Update the vehicle or vendor with the new information
		 * 6. Update the service entry or fuel entry with the new information
		 * 7. Or, return all of this to the client, then let hte user decide what they want to do.
		 */

		// if it's a service entry, attempt to create service entry line items

		if (!recordType === "service_entry") {
			return NextResponse.json({ analysis: parsedAnalysis });
		}

		console.log("creating service entries");

		messages.push(analysis_response.choices[0].message);

		messages.push({
			role: "user",
			content: `Now, we need to idenfity each line item from the service entry. There may be multiple. Please parse information from those image(s) into an array of service entry line items wiht this structure: 
         
         [${JSON.stringify(recordStructures.service_entry_line_item, null, 2)},...]
        
         If you are unable to discern any line items, return a blank array.
         
         Respond with only the JSON of the record(s) you create. Leave any un-filled fields as null.`,
		});

		const service_entry_line_items_response = await openai.chat.completions.create({
			model: "gpt-4o",
			messages: messages,
			max_tokens: 4096,
			response_format: { type: "json_object" },
		});

		const service_entry_line_items = service_entry_line_items_response.choices[0].message.content;
		const parsedServiceEntryLineItems = JSON.parse(service_entry_line_items);
		console.log(parsedServiceEntryLineItems);

		return NextResponse.json({ service_entry: parsedAnalysis, service_entry_line_items: parsedServiceEntryLineItems });
	} catch (error) {
		console.error("Analysis error:", error);
		return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
	}
}
