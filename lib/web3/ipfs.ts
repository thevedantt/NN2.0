import axios from "axios";

const PINATA_API_KEY = process.env.PINATA_API_KEY || "";
const PINATA_SECRET_API_KEY = process.env.PINATA_SECRET_API_KEY || "";
const PINATA_JWT = process.env.PINATA_JWT || "";

/**
 * Uploads encrypted JSON data to IPFS via Pinata.
 * Returns the CID (content identifier).
 */
export async function uploadToIPFS(data: object, name?: string): Promise<string> {
    const response = await axios.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        {
            pinataContent: data,
            pinataMetadata: {
                name: name || `neuronet-chat-${Date.now()}`,
            },
        },
        {
            headers: {
                "Content-Type": "application/json",
                pinata_api_key: PINATA_API_KEY,
                pinata_secret_api_key: PINATA_SECRET_API_KEY,
            },
        }
    );

    return response.data.IpfsHash;
}

/**
 * Fetches content from IPFS by CID via Pinata gateway.
 */
export async function fetchFromIPFS(cid: string): Promise<any> {
    const response = await axios.get(
        `https://gateway.pinata.cloud/ipfs/${cid}`,
        {
            headers: {
                "x-pinata-gateway-token": PINATA_JWT,
            },
        }
    );

    return response.data;
}
