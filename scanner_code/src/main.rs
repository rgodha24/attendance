#[macro_use]
mod macros;
mod remote;
#[macro_use]
pub mod colors;

use clap::Parser;
use lazy_static::lazy_static;
use remote::{change_uid, scanner_ping, signin, SERVER_URL};
use std::{
    process,
    sync::{Arc, OnceLock},
};
use tokio::sync::{
    mpsc::{channel, Sender},
    Mutex,
};
use tokio_cron_scheduler::{Job, JobScheduler};

// 15 digits
const MIN_UID: u64 = 100_000_000_000_000;
const MAX_UID: u64 = 999_999_999_999_999;

pub static SCANNER_NAME: OnceLock<String> = OnceLock::new();
pub static CHOSEN_SERVER: OnceLock<String> = OnceLock::new();

lazy_static! {
    static ref UID: Mutex<u64> = Mutex::new(0);
}

/// code that runs on the computer or raspberry pi
/// connected to a barcode scanner, made for attendance
/// at Brophy College Prep (brophyprep.org)
#[derive(Parser)]
#[command(version, about, long_about=None)]
struct Args {
    /// the name of the scanner (e.g. "IC", "Piper 201", etc.)
    scanner_name: String,
    #[arg(short, long, default_value = SERVER_URL)]
    server_url: String,
}

#[tokio::main]
async fn main() {
    let args = Args::parse();

    set_scanner_name!(args.scanner_name);
    CHOSEN_SERVER.set(args.server_url.to_string()).unwrap();

    exit_handler!();
    // scanner_ping!();

    let signin_sender = Arc::new(create_signin_handler());

    info!("using server_url = {}", CHOSEN_SERVER.get().unwrap());

    loop {
        let mut line = String::new();

        if let Err(e) = std::io::stdin().read_line(&mut line) {
            err!("Error reading line: {}", e);
            continue;
        }

        scan_line(line, &signin_sender);
    }
}

fn create_signin_handler() -> Sender<u64> {
    let (signin_sender, mut signin_receiver) = channel::<u64>(10);

    tokio::spawn(async move {
        while let Some(id) = signin_receiver.recv().await {
            let user_id = { uid!() };
            if user_id == 0 {
                err!("No UID set, not sending id {id}");
                continue;
            }
            signin(user_id, scanner_name!(), id).await;
        }
    });

    return signin_sender;
}

fn scan_line(line: String, sender: &Arc<Sender<u64>>) {
    match u64::from_str_radix(line.trim(), 10) {
        Ok(scanned) => {
            if 10_000 <= scanned && scanned <= 99_999 {
                let sender = sender.clone();
                tokio::spawn(async move {
                    sender.send(scanned).await.unwrap();
                });
            } else {
                err!("Invalid input: {}/{}", line, scanned);
                return;
            }
        }
        Err(first) => match u64::from_str_radix(line.trim(), 36) {
            Ok(uid) => {
                if MIN_UID <= uid && uid < MAX_UID {
                    tokio::spawn(change_uid(Some(uid)));
                } else {
                    err!("Invalid input: {}/{}", line, uid);
                    return;
                }
            }
            Err(second) => {
                err!("Invalid input: {}. errors: {} {}", line, first, second);
                return;
            }
        },
    };
}
