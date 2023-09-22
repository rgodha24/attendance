use lazy_static::lazy_static;
use std::{process, sync::OnceLock};
use tokio::sync::{mpsc::channel, Mutex};

// 15 digits
const MIN_UID: u64 = 100_000_000_000_000;
const MAX_UID: u64 = 999_999_999_999_999;

static SCANNER_NAME: OnceLock<String> = OnceLock::new();
lazy_static! {
    static ref UID: Mutex<u64> = Mutex::new(0);
}

#[tokio::main]
async fn main() {
    let args = std::env::args().collect::<Vec<String>>();

    let (sender, mut receiver) = channel::<u64>(10);
    let (exit_sender, mut exit_receiver) = channel::<bool>(10);

    let scanner_name = args.get(1).expect("No scanner name provided");
    if scanner_name.len() < 2 {
        panic!("Scanner name must be at least 2 characters long");
    }

    SCANNER_NAME.set(scanner_name.to_string()).unwrap();

    ctrlc::set_handler(move || {
        exit_sender.blocking_send(true).unwrap();
    })
    .expect("Error setting Ctrl-C handler");

    tokio::spawn(async move {
        while let Some(_) = exit_receiver.recv().await {
            println!("Exiting...");
            if *UID.lock().await == 0 {
                println!("No UID set, not sending to server");
                process::exit(0);
            }
            change_uid(None, SCANNER_NAME.get().unwrap()).await;
            process::exit(0);
        }
    });

    tokio::spawn(async move {
        while let Some(id) = receiver.recv().await {
            let user_id = { UID.lock().await.clone() };
            if user_id == 0 {
                println!("No UID set, not sending id {id}");
                continue;
            }
            signin(user_id, &SCANNER_NAME.get().unwrap(), id).await;
        }
    });

    println!("using server_url = {}", SERVER_URL);

    loop {
        let mut line = String::new();

        if let Err(e) = std::io::stdin().read_line(&mut line) {
            println!("Error reading line: {}", e);
            continue;
        }

        match u64::from_str_radix(line.trim(), 10) {
            Ok(scanned) => {
                if 10_000 <= scanned && scanned <= 99_999 {
                    if let Err(_) = sender.send(scanned).await {
                        println!("error sending student id to channel, scan again");
                    }
                } else {
                    println!("Invalid input: {}/{}", line, scanned);
                    continue;
                }
            }
            Err(_) => match u64::from_str_radix(line.trim(), 36) {
                Ok(uid) => {
                    if MIN_UID <= uid && uid < MAX_UID {
                        change_uid(Some(uid), scanner_name).await;
                    } else {
                        println!("Invalid input: {}/{}", line, uid);
                        continue;
                    }
                }
                Err(_) => {
                    println!("Invalid input: {}", line,);
                    continue;
                }
            },
        }
    }
}

// only if we're in debug mode
#[cfg(debug_assertions)]
const SERVER_URL: &str = "https://evjh4pszof.execute-api.us-west-1.amazonaws.com";

#[cfg(not(debug_assertions))]
const SERVER_URL: &str = "https://api.batt.rgodha.com";

async fn signin(user_id: u64, scanner_name: &str, student_id: u64) {
    let client = reqwest::Client::new();
    let url = format!("{}/signin", SERVER_URL);
    let query = [
        ("userID", &user_id.to_string()),
        ("scannerName", &scanner_name.to_string()),
        ("studentID", &student_id.to_string()),
    ];

    let res = client.post(&url).query(&query).send().await;

    match res {
        Ok(_) => println!("Successfully sent {student_id} to server"),
        Err(e) => println!("Error sending {student_id} to server: {e}"),
    }
}

async fn change_uid(new: Option<u64>, scanner_name: &str) {
    let client = reqwest::Client::new();
    let url = format!("{}/changeScanner", SERVER_URL);
    let mut query = vec![("scannerName", scanner_name.to_string())];

    // intentionally hold the lock on uid
    let mut old_uid = UID.lock().await;

    if *old_uid != 0 {
        query.push(("oldUID", old_uid.to_string()));
    }

    if let Some(new) = new {
        query.push(("newUID", new.to_string()));
    }

    let res = client.post(&url).query(&query).send().await;
    match res {
        Ok(_) => {
            if let Some(new) = new {
                *old_uid = new;
            }

            println!("Successfully changed UID")
        }
        Err(e) => println!("Error changing UID: {}", e),
    }
}
