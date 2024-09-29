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
    // console.log("MongoDB operation complete:", result);
  } catch (error) {
    console.error("Error MongoDB:", error);
  }
}

export async function saveTokenTransaction(eventData) {
  try {
    const response = await fetch("/api/db-operation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "TokenTransaction",
        operation: "findOneAndUpdate",
        criteria: { transactionHash: eventData.transactionHash },
        data: eventData,
      }),
    });

    const result = await response.json();
    // console.log("Saved token transaction:", result);
    return result;
  } catch (error) {
    console.error("Error saving token transaction:", error);
  }
}
export async function createNewTokenTransaction(eventData) {
  try {
    const response = await fetch("/api/db-operation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "TokenTransaction",
        operation: "findOneAndUpdateIfNotExist",
        criteria: { transactionHash: eventData.transactionHash },
        data: eventData,
      }),
    });

    const result = await response.json();
    // console.log("Saved token transaction:", result);
    return result;
  } catch (error) {
    console.error("Error saving token transaction:", error);
  }
}

export async function saveTokenData(tokenData) {
  try {
    const response = await fetch("/api/db-operation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "Token",
        operation: "findOneAndUpdate",
        criteria: { tokenAddress: tokenData.tokenAddress },
        data: tokenData,
      }),
    });

    const result = await response.json();
    // console.log("Token data saved:", result);
  } catch (error) {
    console.error("Error saving token data:", error);
  }
}

/* export async function deleteTransactionData(tokenAddress) {
  try {
    const response = await fetch("/api/db-operation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "TokenTransaction",
        operation: "delete",
        criteria: { tokenAddress: tokenAddress }, // The criteria for deletion
      }),
    });

    const result = await response.json();
    // console.log("Token data deleted:", result);
  } catch (error) {
    console.error("Error deleting token data:", error);
  }
} */
