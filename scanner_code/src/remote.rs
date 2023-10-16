use crate::{CHOSEN_SERVER, SCANNER_NAME, UID};

// only if we're in debug mode
#[cfg(debug_assertions)]
pub const SERVER_URL: &str = "https://08uhey83g5.execute-api.us-west-1.amazonaws.com";

#[cfg(not(debug_assertions))]
pub const SERVER_URL: &str = "https://api.batt.rgodha.com";

pub async fn signin(user_id: u64, scanner_name: &str, student_id: u64) {
    let client = reqwest::Client::new();
    let url = format!("{}/signin", server_url!());
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

pub async fn change_uid(new: Option<u64>) {
    let client = reqwest::Client::new();
    let url = format!("{}/changeScanner", server_url!());
    let mut query = vec![("scannerName", scanner_name!().to_string())];

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

pub async fn scanner_ping() {
    let client = reqwest::Client::new();
    let url = format!("{}/scannerPing", server_url!());
    // HOLD UID LOCK INTENTIONALLY
    let uid = UID.lock().await;
    let query = [("scannerName", scanner_name!()), ("uid", &uid.to_string())];

    println!("RUNNING!!!");

    let res = client.post(&url).query(&query).send().await;

    match res {
        Ok(_) => println!("pinged server"),
        Err(e) => println!("Error pinging server: {}", e),
    }
}
