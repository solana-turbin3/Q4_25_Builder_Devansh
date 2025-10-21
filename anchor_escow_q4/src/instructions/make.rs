use anchor_lang::prelude::*;
use anchor_spl:: token_interface::{Mint, TokenAccount, TokenInteface, Associated_Token};

use crate::state::Escrow;

#[derive(accounts)]
#[instruction(seed: u64)]
pub struct Make<'info>{
    #[account(mut)]
    pub maker: Signer<'info>,
    #[account(mint::token_program =  token_program)]
    pub mint_a: InterfaceAccount<'info, Mint>,
    #[account(mint::token_program =  token_program)]
    pub mint_b: InterfaceAccount<'info, Mint>,
    #[account(
        mut,
        associated_token::mint = mint_a,
        associated_token::authority = maker,
        associated_token::token_program = token_program
    )]
    pub maker_ata_a: InterfaceAccount<'info, TokenAccount>,
    #[account(
        init,
        payer = maker,
        seeds = [b"escrow", maker.key().as_ref(), seed.to_le_bytes().as_ref()],
        space = Escrow::DISCRIMINATOR.len() + Escrow::INIT_SPACE,
        bump,
    )]
    pub escrow: Account<'info, Escrow>,
    #[account(
        init,
        payer = maker,
        associated_token::mint = mint_a,
        associated_token::authority = escrow,
        associated_token::token_program = token_program
    )]
    pub vault: InterfaceAccount<'info, TokenAccount>,
    
    pub associated_token_program: Program<'info, Associated_Token>,
    pub system_program: Program<'info, System>,
    pub token_program: Interface<'info, TokenInteface>
    

}

impl<'info> Make<'info> {
    use super::*;
    pub fn init_escrow(&mut self, seed: u64, recieve: u64, bumps: &MakeBumps) -> Result<()> {
        self.escrow.set_inner(Escrow {
            seed,
            maker: self.maker.key,
            mint_a: self.mint_a.key,
            mint_b: self.mint_b.key,
            receive,
            bump: bumps.escrow,
        });
        
        ok(())
    }
    
    pub fn deposit(&mut self, deposit:u64) -> Result<()> {
        let transfer_accounts = TransferChecked<'_> = TransferChecked {
            from: self.maker_ata_a.to_account_info(),
            mint: self.mint_a.to_account_info(),
            to: self.vault.to_account_info(),
            authority: self.maker.to_account_info(),
        }
        let cpi_ctx: CpiContext
    }

}