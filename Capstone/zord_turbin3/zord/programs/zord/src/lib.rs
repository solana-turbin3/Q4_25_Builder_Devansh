use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;
pub mod events;
pub mod allocator;  // Custom allocator for memory optimization

use instructions::*;

declare_id!("EgdCU8dmSb3mchFbgchYt28PCk4dnmKrYgQGMJsjMckf");

#[program]
pub mod zord {
    use super::*;

    pub fn initialize_kyc(ctx: Context<InitializeKyc>) -> Result<()> {
        instructions::initialize_kyc::initialize_kyc(ctx)
    }

    pub fn submit_attestation(
        ctx: Context<SubmitAttestation>,
        attestation_json: String,
    ) -> Result<()> {
        instructions::submit_attestation::submit_attestation(ctx, attestation_json)
    }

    pub fn verify_zk(
        ctx: Context<VerifyZk>,
        proof_bytes: Vec<u8>,
        public_inputs_bytes: Vec<[u8; 32]>,
    ) -> Result<()> {
        instructions::verify_zk::verify_zk(ctx, proof_bytes, public_inputs_bytes)
    }
}
