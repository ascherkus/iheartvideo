// A bunch of audio/video Javascript.
// By Andrew Scherkus, 2010.

var videoWatcher = null;

function log(text) {
  $("log_text").innerHTML = text + "\n" + $("log_text").innerHTML;
}

function clearLog() {
  $("log_text").innerHTML = "";
}

function pad(text, width) {
  var count = Math.max(0, width- text.length);
  for (var i = 0; i < count; ++i) {
    text = text + " ";
  }
  return text;
}

function main() {
  var v = $("v");
  var watcher = new VideoWatcher(v);

  function onMediaEvent(e) {
    log(pad(e.type, 14) + " (currentTime=" + v.currentTime + ")");
    watcher.update();
  }

  // As defined in Section 4.8.9.12:
  // http://www.whatwg.org/specs/web-apps/current-work/#mediaevents
  var events = [
    'loadstart',
    'progress',
    'suspend',
    'abort',
    'error',
    'emptied',
    'stalled',
    'play',
    'pause',
    'loadedmetadata',
    'loadeddata',
    'waiting',
    'playing',
    'canplay',
    'canplaythrough',
    'seeking',
    'seeked',
    'timeupdate',
    'ended',
    'ratechange',
    'durationchange',
    'volumechange',
  ];

  for (var i = 0; i < events.length; ++i) {
    v.addEventListener(events[i], onMediaEvent, false);
  }

  log(navigator.userAgent);
}

function loadMedia(url) {
  var v = $("v");
  v.src = url;
  v.load();
}

function CellUpdater(prefix, count, expr) {
  this.prefix = prefix;
  this.count = count;
  this.expr = expr;

  this.update = function() {
    for (var i = 0; i < this.count; ++i) {
      $(this.prefix + i).setAttribute("class", (expr(i) ? "on" : "off"));
    }
  }
}

function VideoWatcher(video) {
  this.video = video;

  this.readyStateUpdater = new CellUpdater("rs_", 5, function(value) { return video.readyState == value; })
  this.networkStateUpdater = new CellUpdater("ns_", 5, function(value) { return video.networkState == value; })
  this.errorUpdater = new CellUpdater("e_", 5, function(value) { return (value == 0 && video.error == null) || (video.error != null && video.error.code == value); });

  // Load initial values.
  this.readyStateUpdater.update();
  this.networkStateUpdater.update();
  this.errorUpdater.update();

  this.update = function() {
    this.readyStateUpdater.update();
    this.networkStateUpdater.update();
    this.errorUpdater.update();
  }
}
