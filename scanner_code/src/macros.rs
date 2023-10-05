macro_rules! set_scanner_name {
    ($scanner_name:expr) => {
        SCANNER_NAME.set($scanner_name.to_string()).unwrap()
    };
}

macro_rules! scanner_name {
    () => {
        SCANNER_NAME.get().unwrap()
    };
}

macro_rules! server_url {
    () => {
        CHOSEN_SERVER.get().unwrap()
    };
}

macro_rules! uid {
    () => {
        UID.lock().await.clone()
    };
}

macro_rules! exit_handler {
    () => {
        let (exit_sender, mut exit_receiver) = channel::<bool>(10);

        ctrlc::set_handler(move || {
            exit_sender.blocking_send(true).unwrap();
        })
        .expect("Error setting Ctrl-C handler");

        tokio::spawn(async move {
            while let Some(_) = exit_receiver.recv().await {
                println!("Exiting...");
                if uid!() == 0 {
                    println!("No UID set, not sending to server");
                    process::exit(0);
                }
                change_uid(None).await;
                process::exit(0);
            }
        });
    };
}

macro_rules! scanner_ping {
    () => {
        let sched = JobScheduler::new().await.expect("created scheduler");
        let job = Job::new("1/60 * * * * *", |_id, _l| {
            tokio::spawn(scanner_ping());
        })
        .unwrap();
        sched.add(job).await.unwrap();

        sched.start().await.unwrap();
    };
}
