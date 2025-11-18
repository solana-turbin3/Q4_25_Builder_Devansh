use anchor_lang::prelude::*;

pub mod instructions;
pub mod state;
pub mod errors;
pub mod zk;
pub mod events;

use instructions::*;

declare_id!("CxoXZWX49mcTn5bXqEuUMjFubGt1m1fHMGVYyB2uwY3L");

#[program]
pub mod zord {
    use super::*;

    pub fn initialize_kyc(ctx: Context<InitializeKyc>) -> Result<()> {
        instructions::initialize_kyc::handle(ctx)
    }

    pub fn submit_attestation(
        ctx: Context<SubmitAttestation>,
        attestation_json: String,
    ) -> Result<()> {
        instructions::submit_attestation::handle(ctx, attestation_json)
    }

    pub fn verify_zk(
        ctx: Context<VerifyZk>,
        proof_bytes: Vec<u8>,
        public_inputs_bytes: Vec<[u8; 32]>,
    ) -> Result<()> {
        instructions::verify_zk::handle(ctx, proof_bytes, public_inputs_bytes)
    }
}
