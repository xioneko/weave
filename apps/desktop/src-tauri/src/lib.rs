mod file;
mod mac_window;

pub fn run() {
  tauri::Builder::default()
    .plugin(file::init())
    .plugin(tauri_plugin_os::init())
    .plugin(mac_window::init())
    .on_window_event(|_window, event| match event {
      tauri::WindowEvent::Resized(_) => {
        // wait for rendering, see https://github.com/tauri-apps/tauri/issues/6322#issuecomment-1437047861
        std::thread::sleep(std::time::Duration::from_millis(1));
      }
      _ => {}
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
