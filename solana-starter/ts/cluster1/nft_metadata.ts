import wallet from "../turbin3-wallet.json"
import { createUmi } from "@metaplex-foundation/umi-bundle-defaults"
import { createGenericFile, createSignerFromKeypair, signerIdentity } from "@metaplex-foundation/umi"
import { irysUploader } from "@metaplex-foundation/umi-uploader-irys"

// Create a devnet connection
const umi = createUmi('https://api.devnet.solana.com');

let keypair = umi.eddsa.createKeypairFromSecretKey(new Uint8Array(wallet));
const signer = createSignerFromKeypair(umi, keypair);

umi.use(irysUploader());
umi.use(signerIdentity(signer));

(async () => {
    try {
        // Follow this JSON structure
        // https://docs.metaplex.com/programs/token-metadata/changelog/v1.0#json-structure

        const image = "https://gateway.irys.xyz/7snnPCwayYxeimaQLZXxU4JCumQpXWzbxcGvt7Rjiwaq";
        const metadata = {
                name: "Jeff_deny",
                symbol: "Jeff_button",
                description: "Jeff's beloved deny button which they removed ",
                image: image,
                attributes: [
                    {trait_type: 'Rareity', value: 'Omega'}
                ],
                properties: {
                    files: [
                        {
                            type: "image/jpg",
                            uri: "image"
                        },
                    ]
                },
                creators: [
                    {
                        address: signer.publicKey.toString(),
                        share: 100
                    }
                ]
            };

        const metadataFile = createGenericFile(
            Buffer.from(JSON.stringify(metadata)),
            "haze.json", { contentType: "application/json" }
        )

        const [myUri] = await umi.uploader.upload([metadataFile])

        console.log("Your metadata URI: ", myUri);
    }
    catch (error) {
        console.log("Oops.. Something went wrong", error);
    }
})();

//Your metadata URI:  https://gateway.irys.xyz/Fw6pCuMksg3ZzWReUx37fXwsqm32sq5aykTwCEPbC5pT
//---
//Your metadata URI:  https://gateway.irys.xyz/GnndAn3yxj93MS1Fuyp51ivi2PY2fnh4MbaY3ZYpxuiD
//---
//Your metadata URI:  https://gateway.irys.xyz/ECUSUFbHkEFRxUJ9ksR8pLL1pzifoPuPoHTijDd1MYZw
//---
//rug
//Your metadata URI:  https://gateway.irys.xyz/AMwAnLMGA9rePwLBpyiXnwUZGJ2Qr4zaXqwKbRAZAS4t