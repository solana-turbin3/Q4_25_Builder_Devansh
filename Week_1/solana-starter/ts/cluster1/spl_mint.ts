import { Keypair, PublicKey, Connection, Commitment } from "@solana/web3.js";
import { getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import wallet from "../turbin3-wallet.json"

// Import our keypair from the wallet file
const keypair = Keypair.fromSecretKey(new Uint8Array(wallet));

//Create a Solana devnet connection
const commitment: Commitment = "confirmed";
const connection = new Connection("https://api.devnet.solana.com", commitment);

const token_decimals = 1_000_000n;

// Mint address
const mint = new PublicKey("8KurB5v9D4P6BZvW9CBg24MQEyX1wtEYpcXkP6L72RGB");

(async () => {
    try {
        // Create an ATA
        const ata = await getOrCreateAssociatedTokenAccount(connection, keypair, mint, keypair.publicKey)
        console.log(`Your ata is: ${ata.address.toBase58()}`);

    //const amount = 8_444_449n;
    const mintTx = await mintTo(connection, keypair, mint, ata.address, keypair.publicKey, 10_000_000n);
        console.log(`Your mint txid: ${mintTx}`);
    } catch(error) {
        console.log(`Oops, something went wrong: ${error}`)
    }
})()

//Your ata is: DGtFkYiPsYxGevmEk4tZZpjWwNjBSujWrjQ2fXexSeu8
//Your mint txid: d3QtrR9beiY5gufTtK5j6suRkEjiwaCefqH3MUAJ9fjeHMzhdps58K6zUtt9a3QG7GGgiR3kgzTnqtj8TRZbET4

//Your ata is: HQf2JHBvo8pQZokY4tbaF46W5qr1uqqGrc4ZGaUoVxfk
//Your mint txid: HBFs9x9siHjyyP4xfzXpuUTHmD56jLVRqivRDFv6m918nuvyd3S2n3Nde73DhBR3koHCmxJ1iPrdnaUotV2amV1