use anchor_lang::prelude::*;

#[error_code]
pub enum ZordError {
    #[msg("Invalid attestation JSON")]
    InvalidJson,

    #[msg("Hashes do not match")]
    HashMismatch,

    #[msg("Verification key missing")]
    VerificationKeyMissing,

    #[msg("Failed to deserialize verification key")]
    VerificationKeyDeserialize,

    #[msg("Failed to deserialize proof")]
    ProofDeserialize,

    #[msg("Failed to deserialize public inputs")]
    PublicInputDeserialize,

    #[msg("Verification routine failed")]
    VerificationRoutineFailed,

    #[msg("ZK proof verification failed")]
    VerificationFailed,
}

