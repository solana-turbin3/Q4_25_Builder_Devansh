use arcis_imports::*;

#[encrypted]
mod circuits {
    use arcis_imports::*;

    pub struct KycMatchInput {
        pub passport_hash: [u8; 32],
        pub pan_hash: [u8; 32],
    }

    #[instruction]
    pub fn kyc_match(input_ctxt: Enc<Shared, KycMatchInput>) -> Enc<Shared, u8> {
        let input = input_ctxt.to_arcis();
        
        // Compare the two hashes
        let is_match = if input.passport_hash == input.pan_hash {
            1u8
        } else {
            0u8
        };
        
        input_ctxt.owner.from_arcis(is_match)
    }
}

