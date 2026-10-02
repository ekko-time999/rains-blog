/**
 * Rains Blog SPA Router
 * 前端路由，切换页面时不刷新整个文档，只替换内容区域
 * 支持 hash 路由（GitHub Pages 兼容）
 */
(function() {
    'use strict';

    // 路由表：路径模式 → 页面名
    var routes = [
        { pattern: /^\/(index\.html)?$/, name: 'home', file: 'pages/home.html' },
        { pattern: /^\/posts(\.html)?$/, name: 'posts', file: 'pages/posts.html' },
        { pattern: /^\/post(\.html)?/, name: 'post', file: 'pages/post.html' },
        { pattern: /^\/projects(\.html)?$/, name: 'projects', file: 'pages/projects.html' },
        { pattern: /^\/about(\.html)?$/, name: 'about', file: 'pages/about.html' },
        { pattern: /^\/friends(\.html)?$/, name: 'friends', file: 'pages/friends.html' },
        { pattern: /^\/recommendations(\.html)?$/, name: 'recommendations', file: 'pages/recommendations.html' },
        { pattern: /^\/archive(\.html)?$/, name: 'archive', file: 'pages/archive.html' },
        { pattern: /^\/audience(\.html)?$/, name: 'audience', file: 'pages/audience.html' }
    ];

    var currentPageName = null;
    var currentParams = {};
    var pageInitMap = {};   // 页面名 → { init, cleanup }
    var onPageChange = null; // 切换动画回调（幕布关闭/打开）

    /**
     * 注册页面初始化逻辑
     */
    function registerPage(name, init, cleanup) {
        pageInitMap[name] = { init: init, cleanup: cleanup || function() {} };
    }

    /**
     * 设置页面切换动画回调
     */
    function setTransitionCallbacks(onStart, onEnd) {
        onPageChange = { onStart: onStart, onEnd: onEnd };
    }

    /**
     * 从 hash 中获取当前路径
     */
    function getPathFromHash() {
        var hash = window.location.hash.slice(1); // 去掉 #
        if (!hash) return '/';
        // 去掉查询参数
        var queryIndex = hash.indexOf('?');
        if (queryIndex !== -1) {
            return hash.slice(0, queryIndex);
        }
        return hash;
    }

    /**
     * 从 hash 中获取查询参数
     */
    function getParamsFromHash() {
        var hash = window.location.hash.slice(1);
        var queryIndex = hash.indexOf('?');
        if (queryIndex === -1) return {};
        return parseQuery(hash.slice(queryIndex));
    }

    /**
     * 解析当前 URL，匹配路由
     */
    function matchRoute(pathname) {
        for (var i = 0; i < routes.length; i++) {
            if (routes[i].pattern.test(pathname)) {
                return routes[i];
            }
        }
        return null;
    }

    /**
     * 解析查询参数
     */
    function parseQuery(search) {
        var params = {};
        if (!search || search === '?') return params;
        var query = search.charAt(0) === '?' ? search.slice(1) : search;
        query.split('&').forEach(function(pair) {
            if (!pair) return;
            var parts = pair.split('=');
            params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1] || '');
        });
        return params;
    }

    /**
     * 加载页面 HTML 片段
     */
    function loadPageFile(file) {
        return fetch(file)
            .then(function(res) {
                if (!res.ok) throw new Error('Failed to load: ' + file);
                return res.text();
            });
    }

    /**
     * 渲染页面内容到容器
     */
    function renderContent(html) {
        var app = document.getElementById('app');
        if (!app) throw new Error('Content container #app not found');
        app.innerHTML = html;
    }

    /**
     * 执行页面初始化
     */
    function runInit(pageName, params) {
        var page = pageInitMap[pageName];
        if (page && typeof page.init === 'function') {
            page.init(params);
        }
    }

    /**
     * 清理上一页
     */
    function runCleanup() {
        if (currentPageName && pageInitMap[currentPageName]) {
            pageInitMap[currentPageName].cleanup();
        }
    }

    /**
     * 导航到指定 URL
     */
    function push(url, options) {
        options = options || {};
        // 转换成 hash 格式
        var hashUrl = '#/' + url.replace(/^\//, '').replace(/\.html$/, '');
        window.location.hash = hashUrl;
    }

    /**
     * 执行导航
     */
    function navigate(route, params) {
        // 关闭幕布
        if (onPageChange && onPageChange.onStart) {
            onPageChange.onStart(function() {
                doNavigate(route, params);
            });
        } else {
            doNavigate(route, params);
        }
    }

    /**
     * 实际执行导航
     */
    function doNavigate(route, params) {
        // 清理上一页
        runCleanup();

        // 加载并渲染新页面
        loadPageFile(route.file)
            .then(function(html) {
                renderContent(html);
                currentPageName = route.name;
                currentParams = params || {};
                document.body.dataset.page = route.name;
                runInit(route.name, currentParams);
                updateTitle(route.name);

                // 新页面加载完成后直接跳到顶部，无滚动动画
                window.scrollTo({ top: 0, left: 0, behavior: 'instant' });

                // 打开幕布
                if (onPageChange && onPageChange.onEnd) {
                    onPageChange.onEnd();
                }
            })
            .catch(function(err) {
                console.error('Router error:', err);
                if (onPageChange && onPageChange.onEnd) {
                    onPageChange.onEnd();
                }
            });
    }

    /**
     * 更新页面标题
     */
    function updateTitle(pageName) {
        var titles = {
            home: 'Rains — 用代码演绎你的想象',
            posts: '剧目 — Rains',
            post: '演出 — Rains',
            projects: '工坊 — Rains',
            about: '关于 — Rains',
            friends: '友链 — Rains',
            recommendations: '私藏曲目单 — Rains',
            archive: '归档 — Rains',
            audience: '观众席 — Rains'
        };
        document.title = titles[pageName] || 'Rains';
    }

    /**
     * 初始化路由（首次加载）
     */
    function init() {
        // 禁用浏览器自动恢复滚动位置，刷新后强制回到顶部
        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        function handleRoute() {
            var path = getPathFromHash();
            var route = matchRoute(path);
            if (!route) {
                // 默认跳转到首页
                window.location.hash = '#/home';
                return;
            }
            var params = getParamsFromHash();

            // 加载并渲染页面内容
            loadPageFile(route.file)
                .then(function(html) {
                    renderContent(html);
                    currentPageName = route.name;
                    currentParams = params;
                    document.body.dataset.page = route.name;
                    runInit(route.name, params);
                    updateTitle(route.name);

                    // 首次加载（刷新页面）：直接滚动到顶部
                    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                })
                .catch(function(err) {
                    console.error('Router init error:', err);
                });
        }

        handleRoute();

        // 监听 hashchange 事件
        window.addEventListener('hashchange', function(e) {
            var path = getPathFromHash();
            var route = matchRoute(path);
            if (route) {
                var params = getParamsFromHash();
                navigate(route, params);
            }
        });
    }

    // 导出到全局
    window.RainsRouter = {
        init: init,
        push: push,
        registerPage: registerPage,
        setTransitionCallbacks: setTransitionCallbacks,
        getCurrentPage: function() { return currentPageName; },
        getParams: function() { return currentParams; }
    };
})();
