#[macro_export]
macro_rules! info {
    ($($arg:tt)*) => {{
        use colored::Colorize;
        println!("{}", format!($($arg)*).blue());
    }}
}

#[macro_export]
macro_rules! success {
    ($($arg:tt)*) => {{
        use colored::Colorize;
        println!("{}", format!($($arg)*).green());
    }}
}

#[macro_export]
macro_rules! err {
    ($($arg:tt)*) => {{
        use colored::Colorize;
        println!("{}", format!($($arg)*).red());
    }}
}

#[macro_export]
macro_rules! warn {
    ($($arg:tt)*) => {{
        use colored::Colorize;
        println!("{}", format!($($arg)*).yellow());
    }}
}
