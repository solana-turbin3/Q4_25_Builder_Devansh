import wallet from "../turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"
import { readFile } from "fs/promises"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

//umi.use(irysUploader());
umi.use(irysUploader({ address: "https://devnet.irys.xyz" }));
umi.use(signerIdentity(signer));

(async () => {
    try {

        //1. Load image
        const image = await readFile("./cluster1/jeff.jpg")
        //2. Convert image to generic file.
        const genericImage = createGenericFile(image , "Haze", {contentType:"image/jpg"});
        //3. Upload image
        const [myUri] = await umi.uploader.upload([genericImage]); 

        console.log("Your image URI: ", myUri);
    }
    catch(error) {
        console.log("Oops.. Something went wrong", error);
    }
})();
//Your image URI:  https://gateway.irys.xyz/TdLsQRnD36FinR6HvBZEYoEF4kNi7aumYbyZexQ3obi
//---
//Your image URI:  https://gateway.irys.xyz/752jLor7wEDSrqXpQM9FTL167ZxB6rcoivpJYeJgx576
//---
//rug
//Your image URI:  https://gateway.irys.xyz/HoJ5w6P2RNcCCwvDFp1Lzt1CxorwEBjN2a7dTZP96wgD
//---
//jeff
//Your image URI:  https://gateway.irys.xyz/7snnPCwayYxeimaQLZXxU4JCumQpXWzbxcGvt7Rjiwaq