export async function pinFileToIPFS(file) {
  try {
    const data = new FormData();
    data.append("file", file);

    const request = await fetch(
      "https://api.pinata.cloud/pinning/pinFileToIPFS",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_PINATA_JWT}`,
        },
        body: data,
      }
    );
    const response = await request.json();
    return response.IpfsHash;
  } catch (error) {
    // console.log(error);
    throw new Error("Image upload failed");
  }
}

export async function fetchFileFromIPFS(CID) {
  const GATEWAY = "gateway.pinata.cloud";
  const url = `https://${GATEWAY}/ipfs/${CID}`;
  try {
    const response = await fetch(url, { method: "HEAD" }); // Use HEAD to check if the file exists without downloading it
    if (response.ok) {
      return true; // File exists
    }
    return false; // File doesn't exist
  } catch (error) {
    console.error("Error fetching from IPFS:", error);
    return false; // Error in fetching, treat as non-existent
  }
}
