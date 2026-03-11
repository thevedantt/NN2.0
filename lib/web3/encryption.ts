import CryptoJS from "crypto-js";

const SALT = "neuronet-web3-vault-v1";

/**
 * Derives an encryption key from the wallet address + salt.
 * This ensures only the wallet owner can decrypt their data.
 */
function deriveKey(walletAddress: string): string {
    return CryptoJS.SHA256(walletAddress.toLowerCase() + SALT).toString();
}

/**
 * Encrypts data using AES-256 with wallet-derived key.
 */
export function encryptData(data: string, walletAddress: string): string {
    const key = deriveKey(walletAddress);
    return CryptoJS.AES.encrypt(data, key).toString();
}

/**
 * Decrypts AES-256 encrypted data using wallet-derived key.
 */
export function decryptData(ciphertext: string, walletAddress: string): string {
    const key = deriveKey(walletAddress);
    const bytes = CryptoJS.AES.decrypt(ciphertext, key);
    return bytes.toString(CryptoJS.enc.Utf8);
}
