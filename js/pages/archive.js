/**
 * 归档页初始化逻辑
 */
(function() {
    'use strict';

    async function loadArchive() {
        const container = document.getElementById('archiveContainer');
        if (!container) return;
        try {
            const data = await PublicAPI.getArchive();
            const posts = Array.isArray(data) ? data : (data.posts || []);
            if (posts.length === 0) {
                container.innerHTML = '<div style="text-align:center; padding:var(--space-xl); color:var(--text-dim);">暂无归档内容</div>';
                return;
            }
            container.innerHTML = posts.map(post => {
                const date = new Date(post.published_at);
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return '<div class="archive-item" style="display:flex; gap:var(--space-md); padding:var(--space-md); border-bottom:1px solid var(--border);">' +
                    '<div style="min-width:80px; color:var(--gold); font-family:var(--font-mono);">' + month + '.' + day + '</div>' +
                    '<div>' +
                        '<a href="post.html?slug=' + encodeURIComponent(post.slug) + '" style="color:inherit; text-decoration:none;">' + post.title + '</a>' +
                        '<div style="color:var(--text-dim); font-size:0.9rem; margin-top:0.25rem;">' + (post.category || '') + '</div>' +
                    '</div>' +
                '</div>';
            }).join('');
        } catch (err) {
            container.innerHTML = '<div style="text-align:center; padding:var(--space-xl); color:var(--curtain);">加载失败</div>';
        }
    }

    function init() {
        loadArchive();
    }
    function cleanup() {}

    window.RainsRouter.registerPage('archive', init, cleanup);
})();
