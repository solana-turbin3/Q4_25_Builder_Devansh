use anchor_lang::prelude::*;

declare_id!("6JEXe8ciHz5AijpjMnmcE8xUNbJ13EFGRFtuwgixkQf1");

#[program]
pub mod anchor_escow_q4 {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
