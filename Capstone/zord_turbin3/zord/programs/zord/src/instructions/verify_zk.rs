use anchor_lang::prelude::*;

// Arkworks / Groth16 imports
use ark_bn254::{Bn254, Fr};
use ark_groth16::{Groth16, Proof, VerifyingKey};
use ark_serialize::CanonicalDeserialize;
use ark_ff::PrimeField;
use ark_snark::SNARK;

#[derive(Accounts)]
pub struct VerifyZk<'info> {
    /// CHECK: This account stores serialized VerifyingKey bytes.
    /// We manually deserialize using arkworks inside the instruction.
    /// No assumptions are made about account ownership or structure.
    #[account(mut)]
    pub vk_account: AccountInfo<'info>,

    pub signer: Signer<'info>,
    pub system_program: Program<'info, System>,
}

// helper to convert bytes -> ark VerifyingKey<Bn254>
fn deserialize_vk(bytes: &[u8]) -> Result<VerifyingKey<Bn254>> {
    VerifyingKey::<Bn254>::deserialize_compressed(bytes)
        .map_err(|_| error!(crate::errors::ZordError::VerificationKeyDeserialize))
}

// helper to deserialize Proof<Bn254>
fn deserialize_proof(bytes: &[u8]) -> Result<Proof<Bn254>> {
    Proof::<Bn254>::deserialize_compressed(bytes)
        .map_err(|_| error!(crate::errors::ZordError::ProofDeserialize))
}

// Converts a list of 32-byte BE arrays into Bn254::Fr elements
fn bytes_to_public_inputs(public_inputs_bytes: Vec<[u8; 32]>) -> Result<Vec<Fr>> {
    let mut inputs: Vec<Fr> = Vec::with_capacity(public_inputs_bytes.len());
    for b in public_inputs_bytes {
        let mut le = b;
        le.reverse(); // convert BE -> LE for arkworks
        let fe = Fr::from_le_bytes_mod_order(&le);
        inputs.push(fe);
    }
    Ok(inputs)
}

pub fn handle(
    ctx: Context<VerifyZk>,
    proof_bytes: Vec<u8>,
    public_inputs_bytes: Vec<[u8; 32]>,
) -> Result<()> {
    // 1) read vk bytes from account data
    let vk_data = &ctx.accounts.vk_account.data.borrow();
    if vk_data.is_empty() {
        return Err(error!(crate::errors::ZordError::VerificationKeyMissing));
    }

    // 2) deserialize verifying key
    let vk = deserialize_vk(vk_data)?;

    // 3) deserialize proof
    let proof = deserialize_proof(&proof_bytes)?;

    // 4) convert public input bytes -> field elements
    let public_inputs = bytes_to_public_inputs(public_inputs_bytes)?;

    // 5) verify with arkworks Groth16
    let verified = Groth16::<Bn254>::verify(&vk, &public_inputs, &proof)
        .map_err(|_| error!(crate::errors::ZordError::VerificationRoutineFailed))?;

    if !verified {
        return Err(error!(crate::errors::ZordError::VerificationFailed));
    }

    // Emit event
    emit!(crate::events::ZkVerifiedEvent {
        verifier: ctx.accounts.signer.key(),
    });

    Ok(())
}
