/* ============================================
   Rains — site chrome
   Navigation, ticker and footer rendering
   ============================================ */
(function(window) {
    'use strict';

    var navLinks = [
        { page: 'home', label: '首页', href: 'index.html', icon: '\u25C9' },
        { page: 'posts', label: '剧目', href: 'posts.html', icon: '\u2630' },
        { page: 'projects', label: '工坊', href: 'projects.html', icon: '\u2605' },
        { page: 'about', label: '关于', href: 'about.html', icon: '\u25C8' },
        { page: 'friends', label: '友链', href: 'friends.html', icon: '\u266A' },
        { page: 'recommendations', label: '私藏', href: 'recommendations.html', icon: '\u266B' },
        { page: 'archive', label: '归档', href: 'archive.html', icon: '\u2F37' },
        { page: 'audience', label: '观众席', href: 'audience.html', icon: '\u2709' }
    ];

    var tickerPool = [
        '用代码演绎你的想象', '幕布已拉开，请随意落座', '演出即将开始，请保持安静',
        '谢幕时请留下掌声', '中场休息，喝杯咖啡吧', '灯光已就绪，舞台已点亮',
        '下一幕：更精彩的故事', '彩蛋藏在文末', '本场演出由你主导', '屏息期待，好戏开场',
        '今晚的星光为你点亮', '每一场演出都是独一无二的', '掌声是最好的鼓励',
        '压轴好戏不容错过', '欢迎来到 Rains 剧场', '演出时长：约一首歌的时间'
    ];

    var pageIntroMap = {
        home: '主剧场 — 欢迎来到 Rains',
        posts: 'Now Playing — 最新文章已上线',
        projects: '侧幕 — 代码作品集',
        about: '剧场主理人 — Rains',
        friends: '特别感谢 — 每一位访客',
        recommendations: '中场休息 — 私藏曲目单',
        archive: '往期演出 — 全部剧目',
        audience: '观众席 — 写下你的观演感受'
    };

    var stageManagerQuotes = [
        '舞台监督：道具已就位', '舞台监督：灯光检查完毕', '舞台监督：演员已到侧幕',
        '舞台监督：本场演出即将开始', '舞台监督：感谢关闭手机铃声', '舞台监督：中场休息有售吧台',
        '舞台监督：祝您观演愉快', '舞台监督：下一场更精彩', '舞台监督：乐手已就位',
        '舞台监督：幕布检查完毕'
    ];

    function buildNav(currentPage) {
        var linksHtml = navLinks.map(function(link) {
            return '<a href="' + link.href + '" class="nav-marquee__link ' +
                (link.page === currentPage ? 'nav-marquee__link--active' : '') +
                '" data-page="' + link.page + '">' + link.label + '</a>';
        }).join('');
        var pageIntro = pageIntroMap[currentPage] || pageIntroMap.home;
        var UNIT_SIZE = 12;
        var UNIT_COUNT = 8;

        function buildUnit() {
            var quote = stageManagerQuotes[Math.floor(Math.random() * stageManagerQuotes.length)];
            var shuffled = tickerPool.slice().sort(function() { return Math.random() - 0.5; });
            return [quote].concat(shuffled.slice(0, 5), [pageIntro], shuffled.slice(5, 10));
        }

        var units = [];
        for (var u = 0; u < UNIT_COUNT; u++) units.push(buildUnit());
        units.push(units[0].slice());
        var allItems = units.reduce(function(items, unit) { return items.concat(unit); }, []);
        var tickerHtml = allItems.map(function(text, index) {
            var posInUnit = index % UNIT_SIZE;
            var highlight = posInUnit === 0 || posInUnit === 6 ? ' nav-ticker__item--highlight' : '';
            var extraClass = posInUnit === 6 ? ' page-intro' : '';
            return '<span class="nav-ticker__item' + highlight + extraClass + '">\u2726 ' + text + '</span>';
        }).join('');
        var mobileTabs = navLinks.filter(function(link) {
            return ['home', 'posts', 'about', 'friends'].indexOf(link.page) !== -1;
        });
        var mobileHtml = mobileTabs.map(function(link) {
            return '<a href="' + link.href + '" class="mobile-tabbar__item ' +
                (link.page === currentPage ? 'mobile-tabbar__item--active' : '') +
                '" data-page="' + link.page + '"><span class="mobile-tabbar__icon">' +
                link.icon + '</span><span>' + link.label + '</span></a>';
        }).join('');
        return '<div class="nav-marquee"><div class="nav-marquee__bulbs"></div><div class="nav-marquee__inner"><a href="index.html" class="nav-marquee__brand">RAINS</a><nav class="nav-marquee__links">' +
            linksHtml + '</nav><div class="nav-marquee__right" id="navRight"></div></div><div class="nav-ticker"><div class="nav-ticker__track">' +
            tickerHtml + '</div></div></div><div class="mobile-tabbar"><div class="mobile-tabbar__inner">' + mobileHtml + '</div></div>';
    }

    var castList = [
        '剧场主理人 / 导演 / 主演 — Rains', '舞台监督 — JavaScript', '灯光设计 — CSS Spotlight',
        '服装 — Vanilla CSS', '配乐 — 键盘敲击声', '特别感谢 — 每一位访客',
        '剧场主理人 / 导演 / 主演 — Rains', '舞台监督 — JavaScript', '灯光设计 — CSS Spotlight',
        '服装 — Vanilla CSS', '配乐 — 键盘敲击声', '特别感谢 — 每一位访客'
    ];

    function buildFooter() {
        var castHtml = castList.map(function(cast, index) {
            return '<div class="footer-cast__line ' +
                (index === 0 || index === 6 ? 'footer-cast__line--star' : '') +
                '">' + cast + '</div>';
        }).join('');
        return '<div class="footer-cast"><div class="footer-cast__track">' + castHtml +
            '</div></div><div class="footer-bottom container"><div class="footer-social"><a href="https://github.com" target="_blank" rel="noopener" class="footer-social__link" title="GitHub">GH</a><a href="mailto:hello@rains.dev" class="footer-social__link" title="Email">@</a><a href="#" class="footer-social__link" title="RSS">RSS</a></div><div class="footer-copy">♪ &copy; 2026 Rains &nbsp;|&nbsp; 用代码演绎你的想象 ♫</div><div class="footer-signature">Rains</div></div>';
    }

    window.RainsChrome = {
        buildNav: buildNav,
        buildFooter: buildFooter,
        pageIntroMap: pageIntroMap
    };
})(window);
