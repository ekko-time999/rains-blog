/**
 * Rains 乐池 — 节目单
 * 渲染曲目列表、状态标记、点击切歌
 */
(function() {
    'use strict';

    var tracks = window.RainsTracks || [];
    var body = document.getElementById('opPlaylistBody');
    var countEl = document.getElementById('opTrackCount');
    var state = window.RainsPlayer.getState();

    function getFavs() {
        try { return JSON.parse(localStorage.getItem('rains_pit_favs')) || []; }
        catch (e) { return []; }
    }

    function render() {
        var favs = getFavs();
        countEl.textContent = '共 ' + tracks.length + ' 首';
        body.innerHTML = tracks.map(function(t, i) {
            var playing = i === state.index ? ' op-track--playing' : '';
            var num = i === state.index ? '♪' : String(i + 1).padStart(2, '0');
            var fav = favs.indexOf(t.id) !== -1 ? '<span class="op-track__fav">♥</span>' : '';
            return '<div class="op-track' + playing + '" data-idx="' + i + '">' +
                '<span class="op-track__num">' + num + '</span>' +
                '<span class="op-track__title">' + t.title + ' — ' + t.artist + '</span>' +
                fav +
            '</div>';
        }).join('');

        // 绑定点击
        body.querySelectorAll('.op-track').forEach(function(row) {
            row.addEventListener('click', function() {
                var i = parseInt(row.dataset.idx, 10);
                window.RainsPlayer.playAt(i);
                render();
            });
        });
    }

    // 初始渲染
    render();
    // 暴露刷新（切歌/收藏后调用）
    window.RainsPlaylist = { refresh: render };
})();
