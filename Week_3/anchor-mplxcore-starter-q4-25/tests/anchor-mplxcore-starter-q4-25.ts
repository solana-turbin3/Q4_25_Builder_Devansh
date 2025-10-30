import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { AnchorMplxcoreStarterQ425 } from "../target/types/anchor_mplxcore_starter_q4_25";

describe("anchor-mplxcore-starter-q4-25", () => {
  // Configure the client to use the local cluster.
  anchor.setProvider(anchor.AnchorProvider.env());

  const program = anchor.workspace.anchorMplxcoreStarterQ425 as Program<AnchorMplxcoreStarterQ425>;

  it("Is initialized!", async () => {
    // Add your test here.
    const tx = await program.methods.initialize().rpc();
    console.log("Your transaction signature", tx);
  });
});
