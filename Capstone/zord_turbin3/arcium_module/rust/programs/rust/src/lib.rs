use anchor_lang::prelude::*;
use arcium_anchor::prelude::*;

declare_id!("6NK6Cejzcj2bJMTSQ2WAhaazQnuDUijESQmW2nWhkNDG");

//
// ARCIUM PROGRAM MODULE
//
#[arcium_program]
pub mod rust {
    use super::*;

    // -----------------------------------------------------------
    //  Initialize computation definition
    // -----------------------------------------------------------
    pub fn init_kyc_match_comp_def(ctx: Context<InitKycMatchCompDef>) -> Result<()> {
        // Arcium helper — requires the accounts struct below
        init_comp_def(ctx.accounts, 0, None, None)?;
        Ok(())
    }

    // -----------------------------------------------------------
    //  Invoke encrypted computation
    // -----------------------------------------------------------
    pub fn kyc_match(
        ctx: Context<KycMatch>,
        computation_offset: u64,
        ciphertext_passport_hash: [u8; 32],
        ciphertext_pan_hash: [u8; 32],
        pub_key: [u8; 32],
        nonce: u128,
    ) -> Result<()> {
        // Required Arcium pattern
        ctx.accounts.sign_pda_account.bump = ctx.bumps.sign_pda_account;

        let args = vec![
            Argument::ArcisPubkey(pub_key),
            Argument::PlaintextU128(nonce),
            Argument::EncryptedU8(ciphertext_passport_hash),
            Argument::EncryptedU8(ciphertext_pan_hash),
        ];

        queue_computation(
            ctx.accounts,
            computation_offset,
            args,
            None,
            vec![KycMatchCallback::callback_ix(&[])],
            1,
        )?;

        Ok(())
    }

    // -----------------------------------------------------------
    //  Callback after encrypted computation completes
    // -----------------------------------------------------------
    #[arcium_callback(encrypted_ix = "kyc_match")]
    pub fn kyc_match_callback(
        ctx: Context<KycMatchCallback>,
        output: ComputationOutputs<KycMatchOutput>,
    ) -> Result<()> {
        let o = match output {
            ComputationOutputs::Success(KycMatchOutput { field_0 }) => field_0,
            _ => return err!(ArciumError::AbortedComputation),
        };

        emit!(KycMatchEvent {
            result: o.ciphertexts[0],
            nonce: o.nonce.to_le_bytes(),
        });

        Ok(())
    }
}

//
// MAKE MODULE PUBLIC FOR MACROS
//
pub use rust::*;


//
//  ARCIUM 0.4 — CORRECT COMP-DEF ACCOUNT STRUCT
//
#[init_computation_definition_accounts("kyc_match", payer)]
#[derive(Accounts)]
pub struct InitKycMatchCompDef<'info> {
    #[account(mut)]
    pub payer: Signer<'info>,

    #[account(mut, address = derive_mxe_pda!())]
    pub mxe_account: Box<Account<'info, MXEAccount>>,

    // Created dynamically by Arcium CPI — must be Unchecked
    #[account(mut)]
    pub comp_def_account: UncheckedAccount<'info>,

    pub arcium_program: Program<'info, Arcium>,
    pub system_program: Program<'info, System>,
}


// -----------------------------------------------------------
//  ERRORS
// -----------------------------------------------------------
#[error_code]
pub enum ArciumError {
    #[msg("Computation was aborted")]
    AbortedComputation,
}
