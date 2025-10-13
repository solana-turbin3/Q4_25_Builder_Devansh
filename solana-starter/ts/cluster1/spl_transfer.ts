import { Commitment, Connection, Keypair, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js"
import wallet from "../turbin3-wallet.json"
import { getOrCreateAssociatedTokenAccount, transfer } from "@solana/spl-token";

// We're going to import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

// Mint address
const mint = new PublicKey("8KurB5v9D4P6BZvW9CBg24MQEyX1wtEYpcXkP6L72RGB");

// Recipient address
const to = new PublicKey("GsJYonU5Kz4MJBHZ5UFx9oyStBpXXswnZcFUorktj2yZ");

(async () => {
    try {
        // Get the token account of the fromWallet address, and if it does not exist, create it
        const ata = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            keypair.publicKey
        );

        // Get the token account of the toWallet address, and if it does not exist, create it
        const toAta = await getOrCreateAssociatedTokenAccount(
            connection,
            keypair,
            mint,
            to
        );

        // Transfer the new token to the "toTokenAccount" we just created
        const tx = await transfer(
            connection,
            keypair,
            ata.address,
            toAta.address,
            keypair,
            1e6
        );
    
    } catch(e) {
        console.error(`Oops, something went wrong: ${e}`)
    }
})();
