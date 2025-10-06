// test.ts

import bs58 from 'bs58';
import promptSync from 'prompt-sync';

// Initialize prompt
const prompt = promptSync();

// Example: your Solana wallet byte array
const walletBytes: number[] = [180,66,220,230,126,181,176,24,150,220,173,117,117,246,163,113,38,161,243,41,23,111,160,156,92,148,140,141,87,137,155,98,234,94,207,122,123,204,28,11,120,241,99,182,173,60,117,220,76,64,217,22,99,160,170,132,191,20,223,54,199,45,74,29];

// Convert byte array to Uint8Array
const walletUint8Array = new Uint8Array(walletBytes);

// Encode to Base58 (Phantom-style)
const base58Key = bs58.encode(walletUint8Array);

console.log("Base58 Encoded Key (Phantom):", base58Key);

// Optional: prompt user for a Base58 key and decode back to byte array
const userInput = prompt("Enter a Base58 private key to decode (or press enter to skip): ");
if (userInput) {
  const decodedBytes = bs58.decode(userInput);
  console.log("Decoded Byte Array:", Array.from(decodedBytes));
}