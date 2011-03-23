// A bunch of audio/video Javascript.
// By Andrew Scherkus, 2010.

var videoWatcher = null;

function log(text) {
  $('#log_text').prepend(text + '\n');
}

function clearLog() {
  $('#log_text').empty();
}

function pad(text, width) {
  var count = Math.max(0, width- text.length);
  for (var i = 0; i < count; ++i) {
    text = text + ' ';
  }

  return text;
}

function main() {
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

  var v = $('#v').first();
  var watcher = new VideoWatcher(v);

  for (var i = 0; i < events.length; ++i) {
    v.bind(events[i], function(e) {
      log(pad(e.type, 14) + ' (currentTime=' + $(this).attr('currentTime') + ')');
      watcher.update();
    });
  }

  $('#url_button').click(function() {
    var url = $('#url_input').val()
    v.attr('src', url)
    v[0].load();
  });

  log(navigator.userAgent);
}

function CellUpdater(prefix, count, expr) {
  this.prefix = prefix;
  this.count = count;
  this.expr = expr;

  this.update = function() {
    for (var i = 0; i < this.count; ++i) {
      on = this.expr(i);
      $(this.prefix + i).toggleClass('on', on).toggleClass('off', !on);
    }
  };
}

function CountUpdater(prefix, v) {
  this.prefix = prefix;
  this.video = v;
  this.counts = [
    'webkitDecodedFrameCount',
    'webkitDroppedFrameCount',
    'webkitVideoDecodedByteCount',
    'webkitAudioDecodedByteCount'
  ];

  this.update = function() {
    for (var i = 0; i < this.counts.length; ++i) {
      $(this.prefix + i).text(this.video.attr(this.counts[i]))
    }
  };
}

function VideoWatcher(video) {
  this.video = video;

  this.readyStateUpdater = new CellUpdater('#rs_', 5, function(value) {
    return video.attr('readyState') == value;
  });

  this.networkStateUpdater = new CellUpdater('#ns_', 5, function(value) {
    return video.attr('networkState') == value;
  });

  this.errorUpdater = new CellUpdater('#e_', 5, function(value) {
    var error = video.attr('error')
    return (value == 0 && error == null) || (error != null && error.code == value);
  });

  this.countsUpdater = new CountUpdater('#c_', this.video);

  // Load initial values.
  this.readyStateUpdater.update();
  this.networkStateUpdater.update();
  this.errorUpdater.update();
  this.countsUpdater.update();

  this.update = function() {
    this.readyStateUpdater.update();
    this.networkStateUpdater.update();
    this.errorUpdater.update();
    this.countsUpdater.update();
  }
}
