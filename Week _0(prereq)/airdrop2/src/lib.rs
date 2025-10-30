use solana_sdk::signature::{Keypair, Signer};
use std::io::{self, BufRead};

pub fn add(left: u64, right: u64) -> u64 {
    left + right
}

mod tests {
    use bs58;
    use solana_program::example_mocks::solana_sdk::system_program;
    use std::io::{self, BufRead};
    use solana_client::rpc_client::RpcClient;
    use solana_system_interface::instruction::transfer;
    use solana_sdk::{
        hash::hash,
        message::Message,
        pubkey::Pubkey,
        signature::{Keypair, Signer, read_keypair_file},
        transaction::Transaction,
    };
    use std::str::FromStr;
    use solana_sdk::instruction::{Instruction,AccountMeta};

    const RPC_URL: &str = "https://turbine-solanad-4cde.devnet.rpcpool.com/9a9da9cf-6db1-47dc-839a-55aca5c9c80a";

    #[test]
    fn keygen() {
        let kp = Keypair::new();
        println!("You've generated a new Solana wallet: {}\n", kp.pubkey());
        println!("To save your wallet, copy and paste the following into a JSON file:");
        println!("{:?}", kp.to_bytes());
    }

    #[test]
    fn base58_to_wallet() {
        println!("Input your private key as a base58 string:");
        let stdin = std::io::stdin();
        let base58 = stdin.lock().lines().next().unwrap().unwrap();
        println!("Your wallet file format is:");
        let wallet = bs58::decode(base58).into_vec().unwrap();
        println!("{:?}", wallet);
    }

    #[test]
    fn wallet_to_base58() {
        println!("Input your private key as a JSON byte array (e.g. [12,34,...]):");
        let stdin = std::io::stdin();
        let wallet = stdin
            .lock()
            .lines()
            .next()
            .unwrap()
            .unwrap()
            .trim_start_matches('[')
            .trim_end_matches(']')
            .split(',')
            .map(|s| s.trim().parse::<u8>().unwrap())
            .collect::<Vec<u8>>();
        println!("Your Base58-encoded private key is:");
        let base58 = bs58::encode(wallet).into_string();
        println!("{:?}", base58);
    }

    #[test]
    fn claim_airdrop() {
        // Import our keypair
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");

        // We'll establish a connection to Solana devnet using the const we defined above
        let client = RpcClient::new(RPC_URL);

        // We're going to claim 2 devnet SOL tokens (2 billion lamports)
        match client.request_airdrop(&keypair.pubkey(), 2_000_000_000u64) {
            Ok(sig) => {
                println!("Success! Check your TX here:");
                println!("https://explorer.solana.com/tx/{}?cluster=devnet", sig);
            }
            Err(err) => {
                println!("Airdrop failed: {}", err);
            }
        }
    }

    #[test]
    fn transfer_sol() {
        // Load your devnet keypair from file
        let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");

        // Generate a signature from the keypair
        let pubkey = keypair.pubkey();
        let message_bytes = b"I verify my Solana Keypair!";
        let sig = keypair.sign_message(message_bytes);
        let sig_hashed = hash(sig.as_ref());

        let to_pubkey = Pubkey::from_str("2K3atHLaheVvxYd2z3Cad9toHkXdHHzioNTu3fAwDiqr").unwrap();
        let rpc_client = RpcClient::new(RPC_URL);

    let recent_blockhash = rpc_client
        .get_latest_blockhash()
        .expect("Failed to get recent blockhash");

        let transaction = Transaction::new_signed_with_payer(
            &[transfer(&keypair.pubkey(), &to_pubkey, 1_00_000_000)],
            Some(&keypair.pubkey()),
            &vec![&keypair],
            recent_blockhash,
        );

        let signature = rpc_client
            .send_and_confirm_transaction(&transaction)
            .expect("Failed to send transaction");

        println!(
            "Success! Check out your TX here:
https://explorer.solana.com/tx/{}/?cluster=devnet",
            signature
        );
    }

#[test]
fn empty_wallet() {
    let keypair = read_keypair_file("dev-wallet.json").expect("Couldn't find wallet file");
    let to_pubkey = Pubkey::from_str("2K3atHLaheVvxYd2z3Cad9toHkXdHHzioNTu3fAwDiqr").unwrap();
    let rpc_client = RpcClient::new(RPC_URL);

    let balance = rpc_client
        .get_balance(&keypair.pubkey())
        .expect("Failed to get balance");
    println!("Current balance: {} lamports", balance);

    let recent_blockhash = rpc_client
        .get_latest_blockhash()
        .expect("Failed to get recent blockhash");

    let message = Message::new_with_blockhash(
        &[transfer(&keypair.pubkey(), &to_pubkey, balance)],
        Some(&keypair.pubkey()),
        &recent_blockhash,
    );

    let fee = rpc_client
        .get_fee_for_message(&message)
        .expect("Failed to get fee calculator");
    println!("Estimated fee: {} lamports", fee);

    let transaction = Transaction::new_signed_with_payer(
        &[transfer(&keypair.pubkey(), &to_pubkey, balance - fee)],
        Some(&keypair.pubkey()),
        &vec![&keypair],
        recent_blockhash,
    );

    let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send final transaction");

    println!(
        "Success! Entire balance transferred:\nhttps://explorer.solana.com/tx/{}?cluster=devnet",
        signature
    );
}

#[test]
fn submit_rs() {
    const RPC_URL: &str = "https://turbine-solanad-4cde.devnet.rpcpool.com/9a9da9cf-6db1-47dc-839a-55aca5c9c80a";

    let rpc_client = RpcClient::new(RPC_URL);
    let signer = read_keypair_file("turbin-wallet.json").expect("Couldn't find wallet file");

    let mint = Keypair::new();
    println!("Mint pubkey: {}", mint.pubkey());
    let turbin3_prereq_program =
        Pubkey::from_str("TRBZyQHB3m68FGeVsqTK39Wm4xejadjVhP5MAZaKWDM").unwrap();
    let collection =
        Pubkey::from_str("5ebsp5RChCGK7ssRZMVMufgVZhd2kFbNaotcZ5UvytN2").unwrap();
    let mpl_core_program =
        Pubkey::from_str("CoREENxT6tW1HoK8ypY1SxRMZTcVPm7R94rH4PZNhX7d").unwrap();
    let system_program = system_program::id();
    let authority =
        Pubkey::from_str("5xstXUdRJKxRrqbJuo5SAfKf68y7afoYwTeH1FXbsA3k").unwrap();
    let prereq_pda =
        Pubkey::from_str("vmd7XmUvcBArNYPtnbiqaD5UL7WXQE6SGFnxpitpSEb").unwrap();

    let signer_pubkey = signer.pubkey();
    let seeds = &[b"prereqs", signer_pubkey.as_ref()];
    let (prereq_pda, _bump) = Pubkey::find_program_address(seeds, &turbin3_prereq_program);
    println!("Prereq PDA: {}", prereq_pda);

    let data = vec![77, 124, 82, 163, 21, 133, 181, 206];

    let accounts = vec![
        AccountMeta::new(signer.pubkey(), true),      // user
        AccountMeta::new(prereq_pda, false),          // account (PDA)
        AccountMeta::new(mint.pubkey(), true),        // mint
        AccountMeta::new(collection, false),          // collection
        AccountMeta::new_readonly(authority, false),  // authority
        AccountMeta::new_readonly(mpl_core_program, false), // mpl core program
        AccountMeta::new_readonly(system_program, false),   // system program
    ];

    let blockhash = rpc_client
        .get_latest_blockhash()
        .expect("Failed to get recent blockhash");

        let instruction = Instruction {
        program_id: turbin3_prereq_program,
        accounts,
        data,
    };

    let transaction = Transaction::new_signed_with_payer(
        &[instruction],
        Some(&signer.pubkey()),
        &[&signer, &mint], // signer + mint both sign
        blockhash,
    );

    let signature = rpc_client
        .send_and_confirm_transaction(&transaction)
        .expect("Failed to send transaction");

    println!(
        "Success! Completion submitted:\nhttps://explorer.solana.com/tx/{}?cluster=devnet",
        signature
    );
}

}


