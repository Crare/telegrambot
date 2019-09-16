
// voice_recognition.js

// This bot was made by Juho. hi! C:
// listens voice messages in telegram
// and sends them as a audio-file to watson(Microsoft, Azure),
// which returns voice-recognition results.
// then we just output what watson thought you said.

const fs = require('fs')
const Telegraf = require('telegraf')
const https = require('https');
const SpeechToTextV1 = require('watson-developer-cloud/speech-to-text/v1');

const { Markup } = Telegraf
let botToken;
let speech_to_text = undefined;

exports.setApiKey = (username_, password_, botToken_) => {
  speech_to_text = new SpeechToTextV1({
    username: username_,
    password: password_
  });
  botToken = botToken_;
}

downloadFile = (url, dest, cb) => {
  let file = fs.createWriteStream(dest);
  https.get(url, function (response) {
    response.pipe(file);
    file.on('finish', function () {
      file.close(function () {
        cb(dest);
      });  // close() is async, call cb after close completes.
    });
  }).on('error', function (err) { // Handle errors
    fs.unlink(dest); // Delete the file async. (But we don't check the result)
    if (cb) cb(err);
  });
};

loadFile = (file_path, callback) => {
  // get the audio file
  let url = "https://api.telegram.org/file/bot" + botToken + "/" + file_path;
  downloadFile(url, 'audio_file', function (res) {
    if (res.message == undefined) {
      callback(res); // res is localpath
    } else {
      console.log(res);
    }
  });
}

exports.speechToText = (filepath, callback) => {

  if (speech_to_text == undefined) {
    console.error("no api key set(username, password, botToken)");
  } else {
    const params = {
      audio: fs.createReadStream(filepath),
      content_type: 'audio/ogg',
      timestamps: true,
      word_alternatives_threshold: 0.9,
      keywords: ['trains', 'news', 'weather'], // could use here people names and tag them?
      keywords_threshold: 0.5
    };

    speech_to_text.recognize(params, function (error, transcript) {
      if (error) {
        console.error(error);
      }
      else {
        let result = {};
        if (transcript.results != undefined && transcript.results.length > 0) {


          result.text = undefined;
          if (transcript.results[0].alternatives[0].transcript) {
            result.text = transcript.results[0].alternatives[0].transcript;
          }
          result.keywords = {};

          if (transcript.results[0].keywords_result) {
            // console.log(transcript.results[0].keywords_result);
            let keywords = transcript.results[0].keywords_result;
          }
          callback(result);
        }
        else {
          callback(result);
        }
      }
    });
  }

}

exports.getFile = (file_id, callback) => {
  // get file path
  let url = "https://api.telegram.org/bot" + botToken + "/getFile?file_id=" + file_id;
  https.get(url, (res) => {
    let body = '';

    res.on('data', (d) => {
      body += d;
    });

    res.on('end', function () {
      const data = JSON.parse(body);
      if (data.ok == true) {
        loadFile(data.result.file_path, function (localpath) {
          callback(localpath);
        });
      }
    });

  });
}

