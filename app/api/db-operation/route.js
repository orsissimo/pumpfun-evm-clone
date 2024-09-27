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
    // console.log({ model, operation, criteria, data });

    // Perform the database operation
    const result = await performDatabaseOperation(
      model,
      operation,
      criteria,
      data // Pass 'data' as options
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
const performDummyDbOperations = async () => {
      try {
        // Create a dummy object
        const createResponse = await fetch("/api/db-operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "Token",
            operation: "create",
            modelName: "Token",
            data: {
              tokenAddress: "0x1234567890123456789012345678901234567890",
              name: "DummyToken",
              symbol: "DUMMY",
              initialSupply: "1000000",
              description: "A dummy token for testing",
            },
          }),
        });
        const createResult = await createResponse.json();
        // ("Created dummy object:", createResult);

        // Read the created object
        const readResponse = await fetch("/api/db-operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "Token",
            operation: "findOne",
            modelName: "Token",
            criteria: {
              tokenAddress: "0x1234567890123456789012345678901234567890",
            },
          }),
        });
        const readResult = await readResponse.json();
        // console.log("Read dummy object:", readResult);

        // Update the object with random values
        const updateResponse = await fetch("/api/db-operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "Token",
            operation: "findOneAndUpdate",
            modelName: "Token",
            criteria: {
              tokenAddress: "0x1234567890123456789012345678901234567890",
            },
            data: {
              name: `UpdatedToken${Math.floor(Math.random() * 1000)}`,
              initialSupply: (
                Math.floor(Math.random() * 1000000) + 1000000
              ).toString(),
            },
          }),
        });
        const updateResult = await updateResponse.json();
        // console.log("Updated dummy object:", updateResult);

        // Delete the object
        const deleteResponse = await fetch("/api/db-operation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "Token",
            operation: "findOneAndDelete",
            modelName: "Token",
            criteria: {
              tokenAddress: "0x1234567890123456789012345678901234567890",
            },
          }),
        });
        const deleteResult = await deleteResponse.json();
        // console.log("Deleted dummy object:", deleteResult);
      } catch (error) {
        console.error("Error performing dummy DB operations:", error);
      }
    };
  }, []); */
