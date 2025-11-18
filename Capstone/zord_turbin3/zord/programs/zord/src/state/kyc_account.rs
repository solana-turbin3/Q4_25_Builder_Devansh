use anchor_lang::prelude::*;

#[account]
pub struct KycAccount {
    pub user: Pubkey,
    pub is_verified: bool,
    pub attestation_hash: [u8; 32],
    pub timestamp: i64,
}

impl KycAccount {
    pub const SIZE: usize =
        32 +    // user
        1  +    // is_verified
        32 +    // attestation_hash
        8;      // timestamp
}
