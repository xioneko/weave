use std::path::PathBuf;

use anyhow::anyhow;
use serde::{ser::Serializer, Serialize};
use tauri::{path::BaseDirectory, plugin::TauriPlugin, AppHandle, Manager, Runtime};
use weave_core::fs::{
  notify::{self},
  Debouncer,
};

#[derive(Debug, thiserror::Error)]
pub enum Error {
  #[error(transparent)]
  Any(#[from] anyhow::Error),
  #[error(transparent)]
  Io(#[from] std::io::Error),
  #[error(transparent)]
  Tauri(#[from] tauri::Error),
  #[error(transparent)]
  Watcher(#[from] notify::Error),
}

impl From<String> for Error {
  fn from(s: String) -> Self {
    Self::Any(anyhow!(s))
  }
}

impl Serialize for Error {
  fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
  where
    S: Serializer,
  {
    serializer.serialize_str(&self.to_string())
  }
}

struct WatcherResource(std::sync::Mutex<InnerWatcherResource>);

impl WatcherResource {
  fn new(watcher: Debouncer, paths: Vec<PathBuf>) -> Self {
    Self(std::sync::Mutex::new(InnerWatcherResource {
      watcher,
      paths,
    }))
  }

  fn with<F, T>(&self, f: F) -> T
  where
    F: FnOnce(&mut InnerWatcherResource) -> T,
  {
    f(&mut self.0.lock().unwrap())
  }
}

struct InnerWatcherResource {
  watcher: Debouncer,
  paths: Vec<PathBuf>,
}

impl tauri::Resource for WatcherResource {}

pub fn init<R: Runtime>() -> TauriPlugin<R> {
  tauri::plugin::Builder::<R>::new("file")
    .invoke_handler(tauri::generate_handler![
      cmd::read_dir,
      cmd::read_file,
      cmd::upsert_file,
      cmd::remove,
      cmd::rename,
      cmd::move_file_or_dir,
      cmd::watch,
      cmd::unwatch,
    ])
    .build()
}

fn resolve_path<R: Runtime>(
  app: &AppHandle<R>,
  path: PathBuf,
  base_dir: Option<BaseDirectory>,
) -> Result<PathBuf, Error> {
  if let Some(base_dir) = base_dir {
    Ok(app.path().resolve(path, base_dir)?)
  } else {
    Ok(path)
  }
}

pub mod cmd {
  use std::path::PathBuf;

  use super::*;
  use tauri::{ipc::Channel, path::BaseDirectory, AppHandle, Manager, ResourceId, Runtime};
  use weave_core::fs::{self, DirEntry, WatchOptions};

  #[tauri::command]
  pub async fn read_dir<R: Runtime>(
    app: AppHandle<R>,
    path: PathBuf,
    base_dir: Option<BaseDirectory>,
  ) -> Result<Vec<DirEntry>, Error> {
    let path = resolve_path(&app, path, base_dir)?;
    fs::read_dir(&path).map_err(Into::into)
  }

  #[tauri::command]
  pub async fn read_file<R: Runtime>(
    app: AppHandle<R>,
    path: PathBuf,
    base_dir: Option<BaseDirectory>,
  ) -> Result<tauri::ipc::Response, Error> {
    let path = resolve_path(&app, path, base_dir)?;
    fs::read_file(&path)
      .map(|content| tauri::ipc::Response::new(content))
      .map_err(Into::into)
  }

  #[tauri::command]
  pub async fn upsert_file<R: Runtime>(
    app: AppHandle<R>,
    path: PathBuf,
    content: String,
    base_dir: Option<BaseDirectory>,
  ) -> Result<(), Error> {
    let path = resolve_path(&app, path, base_dir)?;
    fs::upsert_file(path, content).map_err(Into::into)
  }

  #[tauri::command]
  pub async fn remove<R: Runtime>(
    app: AppHandle<R>,
    path: PathBuf,
    base_dir: Option<BaseDirectory>,
  ) -> Result<(), Error> {
    let path = resolve_path(&app, path, base_dir)?;
    fs::remove(&path).map_err(Into::into)
  }

  #[tauri::command]
  pub async fn rename<R: Runtime>(
    app: AppHandle<R>,
    path: PathBuf,
    new_name: String,
    base_dir: Option<BaseDirectory>,
  ) -> Result<(), Error> {
    let path = resolve_path(&app, path, base_dir)?;
    fs::rename(&path, path.with_file_name(new_name)).map_err(Into::into)
  }

  #[tauri::command]
  pub async fn move_file_or_dir<R: Runtime>(
    app: AppHandle<R>,
    from: PathBuf,
    to: PathBuf,
    overwrite: bool,
    base_dir: Option<BaseDirectory>,
  ) -> Result<(), Error> {
    let from = resolve_path(&app, from, base_dir)?;
    let to = resolve_path(&app, to, base_dir)?;
    fs::move_file_or_dir(from, to, overwrite).map_err(Into::into)
  }

  #[tauri::command]
  pub async fn watch<R: Runtime>(
    app: AppHandle<R>,
    paths: Vec<PathBuf>,
    on_event: Channel<notify::Event>,
    options: Option<WatchOptions>,
  ) -> Result<ResourceId, Error> {
    let (tx, rx) = std::sync::mpsc::channel();
    let watch_options = options.unwrap_or_default();
    let watcher = fs::watch(&paths, tx, watch_options)?;
    std::thread::spawn(move || {
      while let Ok(events) = rx.recv() {
        if let Ok(events) = events {
          events.into_iter().for_each(|debounced_event| {
            _ = on_event.send(debounced_event.event);
          });
        }
      }
    });
    let rid = app
      .resources_table()
      .add(WatcherResource::new(watcher, paths));
    Ok(rid)
  }

  #[tauri::command]
  pub async fn unwatch<R: Runtime>(app: AppHandle<R>, rid: ResourceId) -> Result<(), Error> {
    let watcher_resource = app.resources_table().take::<WatcherResource>(rid)?;
    watcher_resource.with(|inner| {
      inner.paths.iter().for_each(|path| {
        if let Err(e) = inner.watcher.unwatch(path.clone()) {
          log::warn!("failed to unwatch path {}: {}", path.display(), e);
        }
      });
    });
    Ok(())
  }
}
