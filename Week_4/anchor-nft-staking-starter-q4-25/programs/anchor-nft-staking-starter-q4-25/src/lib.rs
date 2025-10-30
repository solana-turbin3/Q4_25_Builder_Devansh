use anchor_lang::prelude::*;

declare_id!("7XxP6tZq7KDbMnkegGTAQWLoSKPfgjvU8BDVFGyUpn8p");

#[program]
pub mod anchor_nft_staking_starter_q4_25 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
