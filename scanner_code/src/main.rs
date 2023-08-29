#[tokio::main]
async fn main() {
    let mut user_id = String::new();
    let args = std::env::args().collect::<Vec<String>>();

    println!("using server_url = {}", SERVER_URL);

    let scanner_name = args.get(1).expect("No scanner name provided");
    if scanner_name.len() < 2 {
        panic!("Scanner name must be at least 2 characters long");
    }

    loop {
        let mut line = String::new();
        if let Err(e) = std::io::stdin().read_line(&mut line) {
            println!("Error reading line: {}", e);
            continue;
        }
        let line = line.trim();
        match line.len() {
            5 => {
                if user_id.is_empty() {
                    println!("not sending to server bc no user_id");
                    continue;
                }

                let student_id = match usize::from_str_radix(line, 10) {
                    Ok(num) => num,
                    Err(_) => continue,
                };

                send_to_server(&user_id, scanner_name, student_id).await;
            }
            20 | 21 | 22 => {
                user_id = line.to_string();
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

async fn send_to_server(user_id: &str, scanner_name: &str, student_id: usize) {
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
