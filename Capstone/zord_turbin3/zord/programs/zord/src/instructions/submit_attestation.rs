use anchor_lang::prelude::*;
use sha2::{Digest, Sha256};
use crate::state::kyc_account::KycAccount;
use crate::errors::ZordError;

#[derive(Accounts)]
pub struct SubmitAttestation<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        mut,
        seeds = [b"kyc", user.key().as_ref()],
        bump
    )]
    pub kyc_account: Account<'info, KycAccount>,
}

pub fn handle(
    ctx: Context<SubmitAttestation>,
    attestation_json: String,
) -> Result<()> {

    let kyc = &mut ctx.accounts.kyc_account;

    // 1. Hash the JSON
    let mut hasher = Sha256::new();
    hasher.update(attestation_json.as_bytes());
    let hash = hasher.finalize();

    // 2. Parse JSON
    let parsed: serde_json::Value =
        serde_json::from_str(&attestation_json)
            .map_err(|_| error!(ZordError::InvalidJson))?;

    let is_valid = parsed["is_valid"]
        .as_bool()
        .ok_or(error!(ZordError::InvalidJson))?;

    // 3. Write into PDA
    kyc.is_verified = is_valid;
    kyc.timestamp = Clock::get()?.unix_timestamp;
    kyc.attestation_hash.copy_from_slice(&hash[..32]);

    Ok(())
}

pub fn submit_attestation(
    ctx: Context<SubmitAttestation>,
    attestation_json: String,
) -> Result<()> {
    handle(ctx, attestation_json)
}
