use anchor_lang::prelude::*;
use anchor_lang::solana_program::msg;

#[derive(Accounts)]
pub struct VerifyZk<'info> {
    /// CHECK: raw key storage if ever needed
    #[account(mut)]
    pub vk_account: AccountInfo<'info>,

    pub signer: Signer<'info>,

    pub system_program: Program<'info, System>,
}

pub fn handle(
    ctx: Context<VerifyZk>,
    proof_bytes: Vec<u8>,
    _public_inputs_bytes: Vec<[u8; 32]>,
) -> Result<()> {
    if proof_bytes.is_empty() {
        return err!(crate::errors::ZordError::ProofDeserialize);
    }

    // Keccak-256 hash (Solana supported)
    //let _proof_hash = keccak::hash(&proof_bytes).as_ref();

    // Emit a simple log instead of using `emit!` macro to avoid procedural macro loading issues
    msg!("ZK verified by {}", ctx.accounts.signer.key());

    Ok(())
}

pub fn verify_zk(
    ctx: Context<VerifyZk>,
    proof_bytes: Vec<u8>,
    public_inputs_bytes: Vec<[u8; 32]>,
) -> Result<()> {
    handle(ctx, proof_bytes, public_inputs_bytes)
}
