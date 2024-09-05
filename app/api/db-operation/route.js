import { NextResponse } from "next/server";
import {
  initMongoose,
  performDatabaseOperation,
  createDynamicModel,
} from "@/app/api/mongodb/mongodb";

export async function POST(request) {
  try {
    await initMongoose();

    // Parse the JSON body from the request
    const { model, operation, criteria, data } = await request.json();

    // Validate the input
    if (!model || !operation) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    console.log({ model, operation, criteria, data });

    // Perform the database operation
    const result = await performDatabaseOperation(
      model,
      operation,
      criteria,
      data
    );

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Database operation error:", error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/*
-----------Usage in client side-----------------

async function performOperation() {
  const response = await fetch('/api/dbOperation', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'User',  // Replace with your actual model name
      operation: 'find',
      criteria: { age: { $gte: 18 } },
      data: {}  // Additional data if needed for create or update operations
    }),
  });

  const result = await response.json();
  console.log(result);
}
*/
