pub use notify;
use notify::RecommendedWatcher;
use notify_debouncer_full::{new_debouncer, DebounceEventHandler, RecommendedCache};

use serde::{Deserialize, Serialize};
use std::io::{self, Write};
use std::path::Path;
use std::time::Duration;

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DirEntry {
  pub name: String,
  pub path: String,
  pub is_dir: bool,
  pub ext: Option<String>,
  pub atime: Option<u64>,
  pub mtime: Option<u64>,
  pub ctime: Option<u64>,
}

pub fn read_dir<P: AsRef<Path>>(path: P) -> Result<Vec<DirEntry>, io::Error> {
  let mut items = vec![];
  for entry in path.as_ref().read_dir()? {
    if let Ok(entry) = entry {
      let path = entry.path();
      let file_name = entry.file_name();
      let extension = path.extension();
      let metadata = entry.metadata().ok();
      items.push(DirEntry {
        name: file_name.to_string_lossy().into(),
        path: path.to_string_lossy().into(),
        is_dir: path.is_dir(),
        ext: extension.map(|e| e.to_string_lossy().into()),
        atime: metadata.as_ref().and_then(|m| millis_since(m.accessed())),
        mtime: metadata.as_ref().and_then(|m| millis_since(m.modified())),
        ctime: metadata.and_then(|m| millis_since(m.created())),
      });
    }
  }
  Ok(items)
}

fn millis_since(time: Result<std::time::SystemTime, io::Error>) -> Option<u64> {
  time.ok().map(|t| {
    t.duration_since(std::time::UNIX_EPOCH)
      .unwrap_or_else(|err| err.duration())
      .as_millis() as u64
  })
}

pub fn read_file<P: AsRef<Path>>(path: P) -> Result<Vec<u8>, io::Error> {
  std::fs::read(path)
}

pub fn upsert_file<P: AsRef<Path>, S: AsRef<[u8]>>(path: P, content: S) -> Result<(), io::Error> {
  std::fs::File::options()
    .write(true)
    .create(true)
    .open(path)
    .and_then(|mut file| file.write_all(content.as_ref()))
}

pub fn remove<P: AsRef<Path>>(path: P) -> Result<(), io::Error> {
  if path.as_ref().exists() {
    if path.as_ref().is_file() {
      Ok(std::fs::remove_file(path)?)
    } else {
      Ok(std::fs::remove_dir_all(path)?)
    }
  } else {
    Ok(())
  }
}

pub fn rename<P: AsRef<Path>, Q: AsRef<Path>>(from: P, to: Q) -> Result<(), io::Error> {
  if to.as_ref().exists() {
    return Err(io::Error::new(
      io::ErrorKind::AlreadyExists,
      format!("{} already exists", to.as_ref().display()),
    ));
  }
  Ok(std::fs::rename(from, to)?)
}

pub fn move_file_or_dir<P: AsRef<Path>, Q: AsRef<Path>>(
  from: P,
  to: Q,
  overwrite: bool,
) -> Result<(), io::Error> {
  let result = if from.as_ref().is_file() {
    fs_extra::file::move_file(
      from,
      to,
      &fs_extra::file::CopyOptions {
        overwrite,
        ..Default::default()
      },
    )
  } else {
    fs_extra::dir::move_dir(
      from,
      to,
      &fs_extra::dir::CopyOptions {
        overwrite,
        ..Default::default()
      },
    )
  };
  match result {
    Ok(_) => Ok(()),
    Err(err) => {
      if let fs_extra::error::ErrorKind::AlreadyExists = err.kind {
        Err(io::Error::new(io::ErrorKind::AlreadyExists, err))
      } else {
        Err(io::Error::new(io::ErrorKind::Other, err))
      }
    }
  }
}

pub type Debouncer = notify_debouncer_full::Debouncer<RecommendedWatcher, RecommendedCache>;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
#[serde(default)]
pub struct WatchOptions {
  pub recursive: bool,
  pub debounce: u64,
}

impl Default for WatchOptions {
  fn default() -> Self {
    Self {
      recursive: false,
      debounce: 2000,
    }
  }
}

pub fn watch<P: AsRef<Path>, F: DebounceEventHandler>(
  paths: &[P],
  handler: F,
  options: WatchOptions,
) -> Result<Debouncer, notify::Error> {
  let mut debouncer = new_debouncer(Duration::from_millis(options.debounce), None, handler)?;
  let recursive_mode = if options.recursive {
    notify::RecursiveMode::Recursive
  } else {
    notify::RecursiveMode::NonRecursive
  };
  for path in paths {
    debouncer.watch(path, recursive_mode)?;
  }
  Ok(debouncer)
}
