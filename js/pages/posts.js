/**
 * 剧目列表页初始化逻辑
 */
(function() {
    'use strict';

    let currentCategory = '';
    let currentPage = 1;
    let filterBtns = [];

    function formatDate(dateStr) {
        if (!dateStr) return { day: '01', mon: 'JAN', year: '2026' };
        const d = new Date(dateStr);
        const months = ['JAN','FEB','MAR','APR','MAY','JUN','JUL','AUG','SEP','OCT','NOV','DEC'];
        return {
            day: String(d.getDate()).padStart(2, '0'),
            mon: months[d.getMonth()],
            year: d.getFullYear()
        };
    }

    function renderTickets(posts) {
        const grid = document.getElementById('ticketGrid');
        const emptyState = document.getElementById('emptyState');
        if (!grid) return;
        if (!posts || posts.length === 0) {
            grid.innerHTML = '';
            if (emptyState) emptyState.style.display = 'block';
            return;
        }
        if (emptyState) emptyState.style.display = 'none';
        grid.innerHTML = posts.map((post, i) => {
            const date = formatDate(post.published_at);
            const seat = 'A-' + String(i + 1).padStart(2, '0');
            return '<a href="#/post?slug=' + encodeURIComponent(post.slug) + '" class="ticket" data-category="' + post.category + '">' +
                '<div class="ticket__main">' +
                    '<span class="ticket__category">' + (post.category || '未分类') + '</span>' +
                    '<h3 class="ticket__title">' + post.title + '</h3>' +
                    '<p class="ticket__excerpt">' + (post.excerpt || '') + '</p>' +
                '</div>' +
                '<div class="ticket__perforation"></div>' +
                '<div class="ticket__stub">' +
                    '<div class="ticket__stub-date"><strong>' + date.day + '</strong>' + date.mon + ' ' + date.year + '</div>' +
                    '<div class="ticket__stub-meta">演奏 ' + (post.read_time || 5) + ' 分钟 · 已售 ' + (post.view_count || 0) + ' 张</div>' +
                    '<div class="ticket__stub-seat">' + seat + '</div>' +
                    '<div class="ticket__stub-tear">TEAR HERE</div>' +
                '</div>' +
            '</a>';
        }).join('');
    }

    async function loadPosts() {
        const grid = document.getElementById('ticketGrid');
        if (!grid) return;
        grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:var(--space-xl); color:var(--text-dim);"><p style="font-family:var(--font-mono); font-size:0.8rem; letter-spacing:0.2em;">LOADING PLAYBILL...</p></div>';
        try {
            const data = await PublicAPI.getPosts(currentCategory, currentPage);
            renderTickets(data.posts);
        } catch (err) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:var(--space-xl); color:var(--curtain);"><p>加载失败：' + err.message + '</p></div>';
        }
    }

    function init() {
        currentCategory = '';
        currentPage = 1;
        filterBtns = document.querySelectorAll('.filter-btn');
        filterBtns.forEach(btn => {
            btn.addEventListener('click', handleFilterClick);
        });
        loadPosts();
    }

    function handleFilterClick(e) {
        const btn = e.currentTarget;
        filterBtns.forEach(b => b.classList.remove('tag-active'));
        btn.classList.add('tag-active');
        currentCategory = btn.dataset.category;
        currentPage = 1;
        loadPosts();
    }

    function cleanup() {
        filterBtns.forEach(btn => {
            btn.removeEventListener('click', handleFilterClick);
        });
        filterBtns = [];
    }

    window.RainsRouter.registerPage('posts', init, cleanup);
})();
