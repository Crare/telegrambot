// helper.js

const fs = require('fs'); // used for saving error logs in /tmp

// writes over to file
exports.writeToFile = (text, path) => {
  fs.writeFile(path, text, function (err) {
    if (err) throw err;
    console.log('File written! ' + path);
  });
}

// load file
exports.loadFile = (path, flag, callback) => {
  // check flas at end of this file,
  // or at: https://nodejs.org/api/fs.html#fs_fs_open_path_flags_mode_callback
  // 'w' - Open file for writing. The file is created (if it does not exist) or truncated (if it exists).
  if (flag == undefined) { flag = "w"; }
  fs.open(path, flag, function (err, file) {
    if (err) throw err;
    console.log('Opened file! ' + path);
    callback(file);
  });
}

// append to end of file
exports.appendToFile = (text, path) => {
  fs.appendFile(path, text, function (err) {
    if (err) throw err;
    console.log('File appended! ' + path);
  });
}

exports.deleteFile = (path) => {
  fs.unlink(path, function (err) {
    if (err) throw err;
    console.log('File deleted! ' + path);
  });
}

exports.renameFile = (path, new_file_name) => {
  fs.rename(path, new_file_name, function (err) {
    if (err) throw err;
    console.log('File Renamed! ' + path);
  });
}

/*
'r' - Open file for reading. An exception occurs if the file does not exist.

'r+' - Open file for reading and writing. An exception occurs if the file does not exist.

'rs+' - Open file for reading and writing in synchronous mode. Instructs the operating system to bypass the local file system cache.

This is primarily useful for opening files on NFS mounts as it allows skipping the potentially stale local cache. It has a very real impact on I/O performance so using this flag is not recommended unless it is needed.

Note that this doesn't turn fs.open() into a synchronous blocking call. If synchronous operation is desired fs.openSync() should be used.

'w' - Open file for writing. The file is created (if it does not exist) or truncated (if it exists).

'wx' - Like 'w' but fails if path exists.

'w+' - Open file for reading and writing. The file is created (if it does not exist) or truncated (if it exists).

'wx+' - Like 'w+' but fails if path exists.

'a' - Open file for appending. The file is created if it does not exist.

'ax' - Like 'a' but fails if path exists.

'a+' - Open file for reading and appending. The file is created if it does not exist.

'ax+' - Like 'a+' but fails if path exists.
*/