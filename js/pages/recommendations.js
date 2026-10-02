/**
 * 私藏曲目单页初始化逻辑
 */
(function() {
    'use strict';

    let currentType = 'all';
    let filterBtns = [];

    const typeMap = { music: '音乐', musical: '音乐剧', movie: '电影', book: '书籍', software: '软件', other: '其他' };
    const typeIcon = { music: '♪', musical: '♫', movie: '♬', book: '✎', software: '⚙', other: '✦' };

    async function loadRecs() {
        const grid = document.getElementById('recGrid');
        if (!grid) return;
        try {
            const url = currentType === 'all' ? '/api/recommendations' : '/api/recommendations?type=' + currentType;
            const res = await fetch(url);
            const data = await res.json();
            const recs = data.recommendations || [];
            if (recs.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:var(--space-3xl);color:var(--text-dim);">暂无内容</div>';
                return;
            }
            grid.innerHTML = recs.map(r => {
                const starCount = r.rating || 0;
                const stars = '★'.repeat(starCount) + '☆'.repeat(Math.max(0, 5 - starCount));
                return '<a href="recommendation.html?slug=' + encodeURIComponent(r.title) + '" class="vinyl-card">' +
                    '<div class="vinyl-card__disc">' +
                        '<div class="vinyl-card__label">' + (typeIcon[r.type] || '✦') + '</div>' +
                    '</div>' +
                    '<div class="vinyl-card__body">' +
                        '<div class="vinyl-card__type">' + (typeMap[r.type] || r.type) + '</div>' +
                        '<h3 class="vinyl-card__title">' + r.title + '</h3>' +
                        (r.creator ? '<div class="vinyl-card__creator">' + r.creator + '</div>' : '') +
                        '<div class="vinyl-card__rating">' + stars + '</div>' +
                        (r.reason ? '<div class="vinyl-card__reason">' + r.reason + '</div>' : '') +
                    '</div>' +
                    '<div class="vinyl-card__tear">PLAY TRACK</div></a>';
            }).join('');
        } catch (err) {
            grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:var(--space-3xl);color:var(--curtain);">加载失败</div>';
        }
    }

    function handleFilterClick(e) {
        const btn = e.currentTarget;
        filterBtns.forEach(b => b.classList.remove('rec-filter--active'));
        btn.classList.add('rec-filter--active');
        currentType = btn.dataset.type;
        loadRecs();
    }

    function init() {
        currentType = 'all';
        filterBtns = document.querySelectorAll('.rec-filter');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', handleFilterClick);
        });
        loadRecs();
    }

    function cleanup() {
        filterBtns.forEach(btn => {
            btn.removeEventListener('click', handleFilterClick);
        });
        filterBtns = [];
    }

    window.RainsRouter.registerPage('recommendations', init, cleanup);
})();
