use anchor_lang::prelude::*;
use crate::state::kyc_account::KycAccount;

#[derive(Accounts)]
pub struct InitializeKyc<'info> {
    #[account(mut)]
    pub user: Signer<'info>,

    #[account(
        init,
        payer = user,
        space = 8 + KycAccount::SIZE,
        seeds = [b"kyc", user.key().as_ref()],
        bump
    )]
    pub kyc_account: Account<'info, KycAccount>,

    pub system_program: Program<'info, System>,
}

pub fn handle(ctx: Context<InitializeKyc>) -> Result<()> {
    let kyc = &mut ctx.accounts.kyc_account;

    kyc.user = ctx.accounts.user.key();
    kyc.is_verified = false;
    kyc.attestation_hash = [0u8; 32];
    kyc.timestamp = 0;

    Ok(())
}

pub fn initialize_kyc(ctx: Context<InitializeKyc>) -> Result<()> {
    handle(ctx)
}
