use std::sync::atomic::Ordering;

use crate::{err, info, success, SEND_TO_FIREBASE};
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

    let (res, _firebase) = tokio::join!(
        client.post(&url).query(&query).send(),
        signin_firebase(&client, &student_id)
    );

    match res {
        Ok(_) => success!("Successfully sent {student_id} to server"),
        Err(e) => err!("Error sending {student_id} to server: {e}"),
    }
}

async fn signin_firebase(client: &reqwest::Client, student_id: &u64) {
    if !SEND_TO_FIREBASE.load(Ordering::Relaxed) {
        return;
    }

    let data = serde_json::json!({
        "id": *student_id,
        "time": {".sv": "timestamp"}
    });

    match client
        .post("https://brophyattendance.firebaseio.com/sign-in.json")
        .body(data.to_string())
        .send()
        .await
    {
        Ok(r) => success!("Successfully sent {student_id} to firebase",),
        Err(e) => err!("Error sending {student_id} to firebase: {e}"),
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

    if let Some(uid) = new {
        // theoretically should be in parallel with the above one, but honestly it shouldn't matter
        let _ = tokio::fs::write(uid_file!(), uid.to_string()).await;
    }

    match res {
        Ok(_) => {
            if let Some(new) = new {
                *old_uid = new;
            }

            success!("Successfully changed UID")
        }
        Err(e) => err!("Error changing UID: {}", e),
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
        Ok(_) => info!("pinged server"),
        Err(e) => err!("Error pinging server: {}", e),
    }
}
