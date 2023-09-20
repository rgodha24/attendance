use std::{
    sync::{Mutex, OnceLock},
};

use tokio::sync::mpsc::channel;

static SCANNER_NAME: OnceLock<String> = OnceLock::new();
static UID: Mutex<String> = Mutex::new(String::new());

#[tokio::main]
async fn main() {
    let args = std::env::args().collect::<Vec<String>>();

    let (sender, mut receiver) = channel::<usize>(10);

    let scanner_name = args.get(1).expect("No scanner name provided");
    if scanner_name.len() < 2 {
        panic!("Scanner name must be at least 2 characters long");
    }

    SCANNER_NAME.set(scanner_name.to_string()).unwrap();

    tokio::spawn(async move {
        while let Some(id) = receiver.recv().await {
            let user_id = { UID.lock().unwrap().clone() };
            if user_id.is_empty() {
                println!("No UID set, not sending id {id}");
                continue;
            }
            signin(&user_id, &SCANNER_NAME.get().unwrap(), id).await;
        }
    });

    println!("using server_url = {}", SERVER_URL);

    loop {
        let mut line = String::new();
        if let Err(e) = std::io::stdin().read_line(&mut line) {
            println!("Error reading line: {}", e);
            continue;
        }
        let line = line.trim();
        match line.len() {
            5 => {
                let student_id = match usize::from_str_radix(line, 10) {
                    Ok(num) => num,
                    Err(_) => {
                        println!("Invalid input: {}", line);
                        continue;
                    }
                };

                if let Err(_) = sender.send(student_id).await {
                    println!("error sending student id to channel, scan again");
                }
            }
            20 | 21 | 22 => {
                change_uid(line, scanner_name).await;
            }
            _ => {
                println!("Invalid input: {}", line);
                continue;
            }
        }
    }
}

// only if we're in debug mode
#[cfg(debug_assertions)]
const SERVER_URL: &str = "https://evjh4pszof.execute-api.us-west-1.amazonaws.com";

#[cfg(not(debug_assertions))]
const SERVER_URL: &str = "https://api.batt.rgodha.com";

async fn signin(user_id: &str, scanner_name: &str, student_id: usize) {
    let client = reqwest::Client::new();
    let url = format!("{}/signin", SERVER_URL);
    let query = [
        ("userID", user_id),
        ("scannerName", scanner_name),
        ("studentID", &student_id.to_string()),
    ];

    let res = client.post(&url).query(&query).send().await;

    match res {
        Ok(_) => println!("Successfully sent {student_id} to server"),
        Err(e) => println!("Error sending {student_id} to server: {e}"),
    }
}

async fn change_uid(new: &str, scanner_name: &str) {
    let client = reqwest::Client::new();
    let url = format!("{}/changeScanner", SERVER_URL);
    let mut query = vec![("newUID", new), ("scannerName", scanner_name)];

    // intentionally hold the lock on uid
    let mut old_uid = UID.lock().unwrap();

    if !old_uid.is_empty() {
        query.push(("oldUID", &old_uid));
    }

    let res = client.post(&url).query(&query).send().await;
    match res {
        Ok(_) => {
            *old_uid = new.to_string();

            println!("Successfully changed UID")
        }
        Err(e) => println!("Error changing UID: {}", e),
    }
}
