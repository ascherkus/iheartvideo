
function generateSrc(src) {
  var ch = src.indexOf('?') >= 0 ? '&' : '?';
  return src + ch + 't=' + (new Date()).getTime();
}

function Timer() {
  this.start_ = 0;
  this.times_ = [];
  new Date().getTime();
}

Timer.prototype = {
  start: function() {
    this.start_ = new Date().getTime();
  },

  stop: function() {
    this.times_.push((new Date().getTime()) - this.start_);
    console.log(this.times_[this.times_.length - 1]);
  },

  average: function() {
    var sum = 0;
    for (var i in this.times_) {
      sum += this.times_[i]; 
    }
    return sum / this.times_.length;
  },

  reset: function() {
    this.start_ = 0;
    this.times_ = [];
  }
}

function Benchmark(video, src) {
  this.video_ = video;
  this.src_ = src;
  this.cached_src_ = generateSrc(src);
  this.timer_ = new Timer;

  var me = this;
  this.video_.addEventListener('playing', function() { me.playing(); });
  this.video_.addEventListener('seeked', function() { me.seeked(); });
  this.video_.addEventListener('suspend', function() { me.suspend(); });
};

Benchmark.prototype = {
  reset: function() {
    this.playing = function() {};
    this.seeked = function() {};
    this.suspend = function() {};

    this.video_.src = '';
    this.video_.load();
  },

  testCached: function(done_cb) {
    console.log('Starting cached tests...');

    var times = -1;
    var timer = new Timer;
    this.playing = function() {
      times++;

      // Ignore the first result.
      if (times > 0) {
        timer.stop();
      }

      if (times == 5) {
        this.reset();
        done_cb(timer.average());
        return;
      }

      this.video_.src = '';
      this.video_.load();

      timer.start();
      this.video_.src = this.cached_src_;
      this.video_.load();
    };

    timer.start();
    this.video_.src = this.cached_src_;
    this.video_.load();
  },

  testUncached: function(done_cb) {
    console.log('Starting uncached tests...');
    this.reset();

    var times = 0;
    var timer = new Timer;
    this.playing = function() {
      timer.stop();
      times++;

      if (times == 5) {
        this.reset();
        done_cb(timer.average());
        return;
      }

      timer.start();
      this.video_.src = generateSrc(this.src_);
      this.video_.load();
    }

    timer.start();
    this.video_.src = generateSrc(this.src_);
    this.video_.load();
  },

  testShortSeek: function(done_cb) {
    console.log('Starting short seek tests...');
    this.reset();

    var times = 0;
    var timer = new Timer;
    var firstPlaying = function() {
      this.playing = function() {}

      timer.start();
      this.video_.currentTime = 1;
    };

    this.seeked = function() {
      timer.stop();
      times++;

      if (times == 5) {
        this.reset();
        done_cb(timer.average());
        return;
      }

      this.playing = firstPlaying;
      this.video_.src = generateSrc(this.src_);
      this.video_.load();
    };

    this.playing = firstPlaying;
    this.video_.src = generateSrc(this.src_);
    this.video_.load();
  },

  testLongSeek: function(done_cb) {
    console.log('Starting long seek tests...');
    this.reset();

    var times = 0;
    var timer = new Timer;
    var firstPlaying = function() {
      this.playing = function() {}

      timer.start();
      this.video_.currentTime = this.video_.duration - 1;
    };

    this.seeked = function() {
      timer.stop();
      times++;

      if (times == 5) {
        this.reset();
        done_cb(timer.average());
        return;
      }

      this.playing = firstPlaying;
      this.video_.src = generateSrc(this.src_);
      this.video_.load();
    };

    this.playing = firstPlaying;
    this.video_.src = generateSrc(this.src_);
    this.video_.load();
  }
};
