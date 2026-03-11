import { BrowserProvider, Contract } from "ethers";
import contractABI from "./abi.json";

const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || "";

/**
 * Gets an ethers.js contract instance connected to the user's Web3Auth wallet.
 * @param provider - The Web3Auth provider (injected EIP-1193 provider)
 */
export async function getContract(provider: any): Promise<Contract> {
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    return new Contract(CONTRACT_ADDRESS, contractABI, signer);
}

/**
 * Gets the connected wallet address.
 */
export async function getWalletAddress(provider: any): Promise<string> {
    const ethersProvider = new BrowserProvider(provider);
    const signer = await ethersProvider.getSigner();
    return await signer.getAddress();
}

// =============================================
// EXISTING: Record Storage
// =============================================

/**
 * Stores an IPFS CID on the smart contract.
 * The transaction is signed by the user's embedded wallet.
 */
export async function storeRecordOnChain(provider: any, cid: string): Promise<string> {
    const contract = await getContract(provider);
    const tx = await contract.storeRecord(cid);
    const receipt = await tx.wait();
    return receipt.hash;
}

/**
 * Retrieves all IPFS CIDs stored by the current user from the smart contract.
 */
export async function getRecordsFromChain(provider: any): Promise<string[]> {
    const contract = await getContract(provider);
    const records: string[] = await contract.getRecords();
    return records;
}

/**
 * Gets the count of records stored by the current user.
 */
export async function getRecordCountFromChain(provider: any): Promise<number> {
    const contract = await getContract(provider);
    const count = await contract.getRecordCount();
    return Number(count);
}

// =============================================
// NEW: Access Control for Therapist Sharing
// =============================================

/**
 * Grants a therapist access to a specific IPFS CID.
 * Called by the patient (data owner).
 * @param provider     - Web3Auth provider
 * @param therapistAddr - Therapist's wallet address
 * @param cid          - The IPFS CID to share
 */
export async function grantAccessOnChain(
    provider: any,
    therapistAddr: string,
    cid: string
): Promise<string> {
    const contract = await getContract(provider);
    const tx = await contract.grantAccess(therapistAddr, cid);
    const receipt = await tx.wait();
    return receipt.hash;
}

/**
 * Revokes a therapist's access to a specific IPFS CID.
 * Called by the patient (data owner).
 */
export async function revokeAccessOnChain(
    provider: any,
    therapistAddr: string,
    cid: string
): Promise<string> {
    const contract = await getContract(provider);
    const tx = await contract.revokeAccess(therapistAddr, cid);
    const receipt = await tx.wait();
    return receipt.hash;
}

/**
 * Checks if a therapist has access to a patient's specific CID.
 * Can be called by anyone (view function).
 */
export async function checkAccessOnChain(
    provider: any,
    patientAddr: string,
    therapistAddr: string,
    cid: string
): Promise<boolean> {
    const contract = await getContract(provider);
    return await contract.hasAccess(patientAddr, therapistAddr, cid);
}

/**
 * Retrieves all shared records for the calling therapist.
 * Returns arrays of patient addresses and corresponding CIDs.
 */
export async function getSharedRecordsFromChain(
    provider: any
): Promise<{ patients: string[]; cids: string[] }> {
    const contract = await getContract(provider);
    const [patients, cids] = await contract.getSharedRecords();
    return { patients: [...patients], cids: [...cids] };
}
