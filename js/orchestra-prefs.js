/**
 * Rains 乐池 — 播放模式与收藏
 * 四档模式：顺序/单曲循环/列表循环/随机，点击按钮弹出菜单选择
 * 音量灯泡、收藏 localStorage
 */
(function() {
    'use strict';

    var modeBtn = document.getElementById('opMode');
    var modeMenu = document.getElementById('opModeMenu');
    var modeOptions = modeMenu.querySelectorAll('.op-mode-option');
    var favBtn = document.getElementById('opFav');
    var volBox = document.getElementById('opVolBulbs');

    var state = window.RainsPlayer.getState();
    var FAV_KEY = 'rains_pit_favs';
    var MODE_KEY = 'rains_pit_mode';

    // 当前模式：order / one / all / shuffle
    var mode = localStorage.getItem(MODE_KEY) || 'order';

    // 读取收藏
    function getFavs() {
        try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; }
        catch (e) { return []; }
    }
    function saveFavs(favs) {
        localStorage.setItem(FAV_KEY, JSON.stringify(favs));
    }

    // 渲染音量灯泡（7 颗）
    function renderVol(vol) {
        volBox.innerHTML = '';
        for (var i = 0; i < 7; i++) {
            var b = document.createElement('div');
            b.className = 'op-volume__bulb' + (vol * 7 > i ? ' op-volume__bulb--on' : '');
            b.style.height = (6 + i * 2) + 'px';
            (function(idx) {
                b.addEventListener('click', function(e) {
                    e.stopPropagation();
                    var v = (idx + 1) / 7;
                    window.RainsPlayer.setVolume(v);
                    renderVol(v);
                });
            })(i);
            volBox.appendChild(b);
        }
    }

    // 切换模式图标显示
    function renderModeIcon() {
        var icons = modeBtn.querySelectorAll('.op-mode-icon');
        icons.forEach(function(icon) { icon.style.display = 'none'; });
        var activeIcon = modeBtn.querySelector('.op-mode-icon--' + mode);
        if (activeIcon) activeIcon.style.display = 'block';
        modeBtn.classList.toggle('op-ctrl-btn--active', mode !== 'order');
    }

    // 把模式同步到 player
    function applyMode(m) {
        mode = m;
        localStorage.setItem(MODE_KEY, m);
        // 同步给播放器
        if (m === 'shuffle') {
            window.RainsPlayer.setShuffle(true);
            window.RainsPlayer.setRepeat(false);
        } else if (m === 'one') {
            window.RainsPlayer.setShuffle(false);
            window.RainsPlayer.setRepeat(true);
            state.repeatMode = 'one';
        } else if (m === 'all') {
            window.RainsPlayer.setShuffle(false);
            window.RainsPlayer.setRepeat(true);
            state.repeatMode = 'all';
        } else { // order
            window.RainsPlayer.setShuffle(false);
            window.RainsPlayer.setRepeat(false);
        }
        renderModeIcon();
    }

    // 打开/关闭菜单
    function toggleMenu() {
        modeMenu.classList.toggle('is-open');
    }
    modeBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        toggleMenu();
    });
    // 点外面关闭
    document.addEventListener('click', function(e) {
        if (!modeMenu.contains(e.target) && e.target !== modeBtn && !modeBtn.contains(e.target)) {
            modeMenu.classList.remove('is-open');
        }
    });
    // 选择模式
    modeOptions.forEach(function(opt) {
        opt.addEventListener('click', function(e) {
            e.stopPropagation();
            var m = opt.getAttribute('data-mode');
            applyMode(m);
            // 高亮当前选项
            modeOptions.forEach(function(o) { o.classList.remove('op-mode-option--active'); });
            opt.classList.add('op-mode-option--active');
            modeMenu.classList.remove('is-open');
        });
    });

    // 收藏当前曲
    function currentTrackId() {
        var t = (window.RainsTracks || [])[state.index];
        return t ? t.id : null;
    }
    function refreshFavBtn() {
        var favs = getFavs();
        var id = currentTrackId();
        var fav = favs.indexOf(id) !== -1;
        favBtn.classList.toggle('op-ctrl-btn--active', fav);
    }
    favBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        var id = currentTrackId();
        var favs = getFavs();
        var i = favs.indexOf(id);
        if (i === -1) favs.push(id); else favs.splice(i, 1);
        saveFavs(favs);
        refreshFavBtn();
    });

    // 切歌后刷新收藏状态
    setInterval(refreshFavBtn, 800);

    // 初始化
    renderVol(0.7);
    window.RainsPlayer.setVolume(0.7);
    applyMode(mode);
    // 高亮当前模式选项
    modeOptions.forEach(function(o) {
        o.classList.toggle('op-mode-option--active', o.getAttribute('data-mode') === mode);
    });
    refreshFavBtn();
})();
