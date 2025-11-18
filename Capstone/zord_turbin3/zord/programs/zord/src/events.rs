use anchor_lang::prelude::*;

#[event]
pub struct ZkVerifiedEvent {
    pub verifier: Pubkey,
}