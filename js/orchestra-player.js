/**
 * Rains 乐池 — 播放核心
 * Audio 实例、播放/暂停/上下首、进度条、时间、UI 同步
 */
(function() {
    'use strict';

    var tracks = window.RainsTracks || [];
    var audio = new Audio();
    audio.preload = 'metadata';

    var state = {
        index: 0,
        playing: false,
        shuffle: false,
        repeat: false
    };

    // DOM
    var pit = document.getElementById('orchestra-pit');
    var playBtn = document.getElementById('opPlay');
    var barPlayBtn = document.getElementById('opBarPlay');
    var prevBtn = document.getElementById('opPrev');
    var nextBtn = document.getElementById('opNext');
    var coverEl = document.getElementById('opCover');
    var typeEl = document.getElementById('opType');
    var titleEl = document.getElementById('opTitle');
    var artistEl = document.getElementById('opArtist');
    var barTitle = document.getElementById('opBarTitle');
    var barLabel = document.getElementById('opBarLabel');
    var fill = document.getElementById('opFill');
    var knob = document.getElementById('opKnob');
    var trackEl = document.getElementById('opTrack');
    var curTime = document.getElementById('opCurTime');
    var durTime = document.getElementById('opDurTime');

    function fmt(sec) {
        if (isNaN(sec)) return '0:00';
        var m = Math.floor(sec / 60);
        var s = Math.floor(sec % 60);
        return m + ':' + (s < 10 ? '0' : '') + s;
    }

    function currentTrack() {
        return tracks[state.index];
    }

    // 渲染当前曲目到 UI
    function renderTrack() {
        var t = currentTrack();
        if (!t) return;
        // 统一金色音符封面（避免 emoji 彩色渲染破坏风格）
        coverEl.innerHTML = '<svg viewBox="0 0 24 24" width="22" height="22"><path d="M9 18V5l12-2v13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/><circle cx="6" cy="18" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/><circle cx="18" cy="16" r="3" fill="none" stroke="currentColor" stroke-width="1.8"/></svg>';
        typeEl.textContent = '— ' + t.album + ' —';
        titleEl.textContent = t.title;
        artistEl.textContent = t.artist;
        barLabel.textContent = '正在上演';
        barTitle.textContent = '✦ ' + t.title + ' — ' + t.artist;
        barTitle.classList.remove('is-idle');
        audio.src = t.src;
        audio.load();
    }

    function setPlayingUI(playing) {
        state.playing = playing;
        pit.classList.toggle('is-live', playing);
        pit.classList.toggle('is-paused', !playing && state.hasStarted);
        pit.classList.remove('is-idle');
        // 播放/暂停图标双态切换（SVG）
        playBtn.classList.toggle('is-playing', playing);
        barPlayBtn.classList.toggle('is-playing', playing);
    }

    function play() {
        var p = audio.play();
        if (p && p.catch) {
            p.then(function() {
                state.hasStarted = true;
                setPlayingUI(true);
            }).catch(function(err) {
                console.warn('播放失败:', err);
                setPlayingUI(false);
            });
        }
    }

    function pause() {
        audio.pause();
        setPlayingUI(false);
    }

    function togglePlay() {
        if (audio.paused) play(); else pause();
    }

    function nextIndex() {
        if (state.shuffle) {
            var n;
            do { n = Math.floor(Math.random() * tracks.length); }
            while (tracks.length > 1 && n === state.index);
            return n;
        }
        return (state.index + 1) % tracks.length;
    }

    function prevIndex() {
        // 播放超过 3 秒回到开头，否则上一首
        if (audio.currentTime > 3) return state.index;
        return (state.index - 1 + tracks.length) % tracks.length;
    }

    function load(i) {
        state.index = i;
        renderTrack();
    }

    function next(auto) {
        load(nextIndex());
        play();
    }

    function prev() {
        load(prevIndex());
        play();
    }

    // 进度条拖拽
    function seek(e) {
        var rect = trackEl.getBoundingClientRect();
        var clientX = e.touches ? e.touches[0].clientX : e.clientX;
        var ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
        if (audio.duration) audio.currentTime = ratio * audio.duration;
    }
    var dragging = false;
    trackEl.addEventListener('mousedown', function(e) { dragging = true; seek(e); });
    window.addEventListener('mousemove', function(e) { if (dragging) seek(e); });
    window.addEventListener('mouseup', function() { dragging = false; });

    // 事件绑定
    playBtn.addEventListener('click', togglePlay);
    barPlayBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        togglePlay();
    });
    nextBtn.addEventListener('click', function() { next(false); });
    prevBtn.addEventListener('click', prev);

    audio.addEventListener('timeupdate', function() {
        if (dragging) return;
        var ratio = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
        fill.style.width = ratio + '%';
        knob.style.left = ratio + '%';
        curTime.textContent = fmt(audio.currentTime);
    });
    audio.addEventListener('loadedmetadata', function() {
        durTime.textContent = fmt(audio.duration);
    });
    audio.addEventListener('ended', function() {
        if (state.repeat) {
            audio.currentTime = 0;
            play();
        } else {
            next(false);
        }
    });

    // 异常状态：加载/播放失败
    audio.addEventListener('error', function() {
        setPlayingUI(false);
        state.hasStarted = false;
        pit.classList.add('is-idle');
        coverEl.innerHTML = '<svg viewBox="0 0 24 24" width="20" height="20"><path d="M12 2a10 10 0 100 20 10 10 0 000-20zM12 8v6M12 17v.5" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/></svg>';
        typeEl.textContent = '— 演出意外中断 —';
        titleEl.textContent = '舞台监督正在处理';
        artistEl.textContent = '点击播放重试，或切换到下一幕';
        barLabel.textContent = '乐池 · 演出中断';
        barTitle.textContent = '✦ 演出意外中断';
    });

    // 关闭按钮：停止播放
    window.RainsPit = window.RainsPit || {};
    window.RainsPit.onClose = function() {
        pause();
    };

    // 对外接口：节目单选歌用
    window.RainsPlayer = {
        playAt: function(i) { load(i); play(); },
        getState: function() { return state; },
        setShuffle: function(v) { state.shuffle = v; },
        setRepeat: function(v) { state.repeat = v; },
        setVolume: function(v) { audio.volume = v; }
    };

    // 初始化第一首（不自动播放，等用户点击）
    renderTrack();
})();
