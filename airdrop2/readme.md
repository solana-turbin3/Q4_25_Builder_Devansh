# airdrop2 - Rust assignment for Turbin3 Q4 builder's cohort

This is a rust assignment specifically of Turbin3 Q4 builder cohort

## Airdrop2

Basically this codebase generates a new key pairs through `keygen` function locally and then gets airdrop of 2 sol from Turbin3's official RPC URL through `claim_airdrop` function.

Before claiming the airdrop `dev-wallet.json` is created and the base58 encoded private key is pasted into it, to convert it two seperate funcions are created namely `base58_to_wallet` and `wallet_to_base58` which converts the encoding from base58 to the private key which wallets like phantom uses.

`transfer_sol` function is created to transfer 0.01 sol to the wallet which was submitted in turbin's application

Then the function `empty_wallet` is created to get the balance of the wallet and then calculate how much the transactions will cost and then transfers the sol.

Then the final function `submit_rs` takes the `tubin-wallet.json" and then a lot of public keys are stated along with the pda keys from the typescript assignment and then a nft is minted and singed with Turbin3's keys. Then finally the link of the transaction is printed in the terminal.