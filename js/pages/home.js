/**
 * 首页初始化逻辑
 */
(function() {
    'use strict';

    function formatDate(dateStr) {
        if (!dateStr) return { date: '01.01', year: '2026' };
        const d = new Date(dateStr);
        return {
            date: String(d.getMonth()+1).padStart(2,'0') + '.' + String(d.getDate()).padStart(2,'0'),
            year: d.getFullYear()
        };
    }

    async function loadLatestPosts() {
        const grid = document.getElementById('latestPostsGrid');
        if (!grid) return;
        try {
            const data = await PublicAPI.getPosts('', 1);
            const posts = data.posts.slice(0, 3);
            if (posts.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:var(--space-lg); color:var(--text-dim);">暂无演出</div>';
                return;
            }
            grid.innerHTML = posts.map(post => {
                const date = formatDate(post.published_at);
                const tagsArr = typeof post.tags === 'string' ? JSON.parse(post.tags || '[]') : (post.tags || []);
                const tags = tagsArr.map(t => '<span class="tag">' + t + '</span>').join('');
                return '<a href="post.html?slug=' + encodeURIComponent(post.slug) + '" class="ticket" data-category="' + post.category + '">' +
                    '<div class="ticket__left"><div class="ticket__date">' + date.date + '</div><div class="ticket__year">' + date.year + '</div></div>' +
                    '<div class="ticket__divider"></div>' +
                    '<div class="ticket__right">' +
                        '<div class="ticket__meta"><span class="ticket__category">' + (post.category || '未分类') + '</span><span class="ticket__read">' + (post.read_time || 5) + ' min</span></div>' +
                        '<h3 class="ticket__title">' + post.title + '</h3>' +
                        '<p class="ticket__excerpt">' + (post.excerpt || '') + '</p>' +
                        '<div class="ticket__tags">' + tags + '</div>' +
                    '</div></a>';
            }).join('');
        } catch (err) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--curtain);">加载失败</div>';
        }
    }

    async function loadLatestProjects() {
        const grid = document.getElementById('latestProjectsGrid');
        if (!grid) return;
        try {
            const data = await PublicAPI.getProjects();
            const projects = (Array.isArray(data) ? data : data.projects).slice(0, 3);
            let html = projects.map((proj, i) => {
                const statusClass = proj.status === 'live' ? 'live' : 'closed';
                const statusText = proj.status === 'live' ? '&#9679; 热演中' : '&#9632; 已落幕';
                const tagsArr = typeof proj.tags === 'string' ? JSON.parse(proj.tags || '[]') : (proj.tags || []);
                const tags = tagsArr.map(t => '<span class="tag">' + t + '</span>').join('');
                return '<a href="' + (proj.url || 'projects.html') + '" target="_blank" rel="noopener" class="clapper-card">' +
                    '<div class="clapper-card__top">' +
                        '<span class="clapper-card__slate">SCENE 0' + (i+1) + '</span>' +
                        '<span class="clapper-card__take">TAKE ' + (i+1) + '</span>' +
                    '</div>' +
                    '<div class="clapper-card__body">' +
                        '<h3 class="clapper-card__title">' + proj.title + '</h3>' +
                        '<p class="clapper-card__desc">' + (proj.description || '') + '</p>' +
                        '<div class="clapper-card__tags">' + tags + '</div>' +
                        '<span class="clapper-card__status clapper-card__status--' + statusClass + '">' + statusText + '</span>' +
                    '</div>' +
                    '<div class="clapper-card__tear">ACTION & REHEARSE</div></a>';
            }).join('');
            grid.innerHTML = html;
        } catch (err) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--curtain);">加载失败</div>';
        }
    }

    async function loadLatestFriends() {
        const grid = document.getElementById('latestFriendsGrid');
        if (!grid) return;
        try {
            const data = await PublicAPI.getFriends();
            const friends = (Array.isArray(data) ? data : (data.featured || data.friends || [])).slice(0, 3);
            let html = friends.map(f => {
                const initial = f.name ? f.name.charAt(0).toUpperCase() : '?';
                // 把签名每个字单独包在 span 里，用于逐字浮现动画
                // 动态设置每个字的延迟，不管名字多长都按顺序显示
                const signChars = (f.name || '').split('').map(function(c, i) {
                    return '<span class="autograph-card__sign-char" style="animation-delay:' + (i * 0.1) + 's">' + c + '</span>';
                }).join('');
                return '<a href="' + f.url + '" target="_blank" rel="noopener" class="autograph-card autograph-card--featured">' +
                    '<div class="autograph-card__avatar">' + initial + '</div>' +
                    '<h3 class="autograph-card__name">' + f.name + '</h3>' +
                    '<p class="autograph-card__desc">' + (f.description || '') + '</p>' +
                    '<div class="autograph-card__sign">' + signChars + '</div>' +
                    '<span class="autograph-card__btn">前往观看 →</span>' +
                    '<div class="autograph-card__tear">MEET & CONNECT</div></a>';
            }).join('');
            grid.innerHTML = html;
        } catch (err) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--curtain);">加载失败</div>';
        }
    }

    async function loadLatestRecs() {
        const grid = document.getElementById('latestRecsGrid');
        if (!grid) return;
        const typeMap = { music: '音乐', musical: '音乐剧', movie: '电影', book: '书籍', software: '软件', other: '其他' };
        const typeIcon = { music: '♪', musical: '♫', movie: '♬', book: '✎', software: '⚙', other: '✦' };
        try {
            const data = await PublicAPI.getRecommendations();
            const recs = (Array.isArray(data) ? data : (data.recommendations || [])).slice(0, 3);
            if (recs.length === 0) {
                grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:var(--space-lg); color:var(--text-dim);">暂无推荐</div>';
                return;
            }
            grid.innerHTML = recs.map(r => {
                const starCount = r.rating || 0;
                const stars = '★'.repeat(starCount) + '☆'.repeat(Math.max(0, 5 - starCount));
                return '<a href="' + (r.link || '#') + '" target="_blank" rel="noopener" class="vinyl-card">' +
                    '<div class="vinyl-card__disc">' +
                        '<div class="vinyl-card__label">' + (typeIcon[r.type] || '✦') + '</div>' +
                    '</div>' +
                    '<div class="vinyl-card__body">' +
                        '<div class="vinyl-card__type">' + (typeMap[r.type] || r.type) + '</div>' +
                        '<h3 class="vinyl-card__title">' + r.title + '</h3>' +
                        (r.creator ? '<div class="vinyl-card__creator">' + r.creator + '</div>' : '') +
                        '<div class="vinyl-card__rating">' + stars + '</div>' +
                    '</div>' +
                    '<div class="vinyl-card__tear">PLAY & ENJOY</div></a>';
            }).join('');
        } catch (err) {
            grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; color:var(--curtain);">加载失败</div>';
        }
    }

    async function loadLatestMessages() {
        const card = document.getElementById('latestMessagesCard');
        if (!card) return;
        try {
            const data = await PublicAPI.getMessages();
            const messages = (data.messages || []).slice(0, 2);
            if (messages.length === 0) {
                card.innerHTML =
                    '<div class="comment-book-card__page-left">' +
                        '<div class="comment-book-card__label">♪ 观众留言簿 · Playbook</div>' +
                        '<div style="text-align:center; padding:var(--space-lg); color:var(--text-dim); font-style:italic;">' +
                        '观众席空无一人，留个言开场吧' +
                        '</div>' +
                    '</div>' +
                    '<div class="comment-book-card__spine"></div>' +
                    '<div class="comment-book-card__page-right">' +
                        '<div style="text-align:center; padding:var(--space-lg); color:var(--text-dim); font-style:italic;">' +
                        '—— 等待第一位观众 ——' +
                        '</div>' +
                    '</div>' +
                    '<div class="comment-book-card__footer" style="grid-column:1/-1; text-align:center;">' +
                        '<a href="audience.html" class="comment-book-card__btn">去观众席写一句 →</a>' +
                    '</div>' +
                    '<div class="comment-book-card__tear">SIT & SAY</div>';
                return;
            }
            const leftItem = messages[0] ? 
                '<div class="comment-book-card__quote">"' + (messages[0].content || '').slice(0, 60) + (messages[0].content && messages[0].content.length > 60 ? '...' : '') + '"</div>' +
                '<div class="comment-book-card__meta">— ' + (messages[0].name || '匿名观众') + '</div>' : '';
            const rightItem = messages[1] ? 
                '<div class="comment-book-card__quote">"' + (messages[1].content || '').slice(0, 60) + (messages[1].content && messages[1].content.length > 60 ? '...' : '') + '"</div>' +
                '<div class="comment-book-card__meta">— ' + (messages[1].name || '匿名观众') + '</div>' : 
                '<div style="text-align:center; padding:var(--space-lg); color:var(--text-dim); font-style:italic;">—— 等待下一位观众 ——</div>';
            card.innerHTML =
                '<div class="comment-book-card__next-page">' +
                    '<div class="comment-book-card__back-text">To Be Continued</div>' +
                '</div>' +
                '<div class="comment-book-card__page comment-book-card__page-left">' +
                    '<div class="comment-book-card__title">观众留言簿</div>' +
                    leftItem +
                '</div>' +
                '<div class="comment-book-card__spine"></div>' +
                '<div class="comment-book-card__page comment-book-card__page-right">' +
                    '<div class="comment-book-card__page-front">' +
                        rightItem +
                    '</div>' +
                    '<div class="comment-book-card__page-back"></div>' +
                '</div>' +
                '<div class="comment-book-card__footer">' +
                    '<a href="audience.html" class="comment-book-card__btn">去观众席写一句 →</a>' +
                '</div>' +
                '<div class="comment-book-card__tear">SIT & SAY</div>';
        } catch (err) {
            card.innerHTML = '<div style="text-align:center; padding:var(--space-lg); color:var(--curtain);">加载失败</div>';
        }
    }

    var heroAnimated = false; // 标记是否已经播过开场动画
    var enterBtnHandler = null;
    function init() {
        // 首次加载（刷新页面）：重播开场动画
        // SPA 路由切换回来：不重播，直接显示
        var hero = document.getElementById('hero');
        if (!heroAnimated) {
            heroAnimated = true;
            setTimeout(function() {
                if (hero) hero.classList.add('hero--lit');
            }, 1500);
        } else {
            if (hero) hero.classList.add('hero--lit');
        }

        // 进入剧场按钮：滚动到"演出即将开始"提示正好在顶部
        var enterBtn = document.getElementById('enterTheatreBtn');
        if (enterBtn) {
            enterBtnHandler = function(e) {
                e.preventDefault();
                var silence = document.getElementById('heroSilence');
                if (silence) {
                    silence.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            };
            enterBtn.addEventListener('click', enterBtnHandler);
        }

        loadLatestPosts();
        loadLatestProjects();
        loadLatestFriends();
        loadLatestRecs();
        loadLatestMessages();
    }

    function cleanup() {
        if (enterBtnHandler) {
            var enterBtn = document.getElementById('enterTheatreBtn');
            if (enterBtn) enterBtn.removeEventListener('click', enterBtnHandler);
            enterBtnHandler = null;
        }
    }

    window.RainsRouter.registerPage('home', init, cleanup);
})();
