// Function operate with the database
export async function getData(model, operation, criteria = {}, data = {}) {
  try {
    const response = await fetch("/api/db-operation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model,
        operation: operation,
        criteria: criteria,
        data: data,
      }),
    });
    const result = await response.json();
    return result;
    //console.log("MongoDB operation complete:", result);
  } catch (error) {
    console.error("Error MongoDB:", error);
  }
}

// Function to save token transaction to the database
export async function saveTokenTransaction(eventData) {
  try {
    const response = await fetch("/api/db-operation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "TokenTransaction",
        operation: "create",
        criteria: {},
        data: eventData,
      }),
    });

    const result = await response.json();
    console.log("Saved token transaction:", result);
  } catch (error) {
    console.error("Error saving token transaction:", error);
  }
}
