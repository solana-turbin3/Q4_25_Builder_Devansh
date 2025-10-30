import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorNftStakingStarterQ425 } from "../target/types/anchor_nft_staking_starter_q4_25";

describe("anchor-nft-staking-starter-q4-25", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchorNftStakingStarterQ425 as Program<AnchorNftStakingStarterQ425>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
