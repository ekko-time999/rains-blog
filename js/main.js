/* ============================================
   Rains — main.js
   S2: Nav & Footer | S3: Hero | S5: Filter | S6: Post detail
   ============================================ */
(function() {
    'use strict';

    // ===== S6: RainsAudio 全局声音系统 =====
    window.RainsAudio = (function() {
        var ctx = null;
        var muted = localStorage.getItem('rains_audio_muted') === '1';
        var NOTES = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.50, Cs5: 554.37 };

        function ensureCtx() {
            if (!ctx) {
                try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
                catch (e) { return null; }
            }
            if (ctx.state === 'suspended') { try { ctx.resume(); } catch(e) {} }
            return ctx;
        }

        function tone(freq, start, dur, type, vol) {
            var c = ensureCtx();
            if (!c || muted) return;
            var osc = c.createOscillator();
            var gain = c.createGain();
            osc.type = type || 'sine';
            osc.frequency.setValueAtTime(freq, c.currentTime + start);
            gain.gain.setValueAtTime(0, c.currentTime + start);
            gain.gain.linearRampToValueAtTime(vol || 0.2, c.currentTime + start + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + start + dur);
            osc.connect(gain);
            gain.connect(c.destination);
            osc.start(c.currentTime + start);
            osc.stop(c.currentTime + start + dur + 0.05);
        }

        return {
            isMuted: function() { return muted; },
            setMuted: function(m) {
                muted = m;
                if (m) localStorage.setItem('rains_audio_muted', '1');
                else localStorage.removeItem('rains_audio_muted');
            },
            unlock: function() { ensureCtx(); },
            // 序曲：C5-E5-G5-C6 大三和弦琶音 + 混响感
            playOverture: function(cb) {
                if (muted) { if (cb) cb(); return; }
                var c = ensureCtx();
                if (!c) { if (cb) cb(); return; }
                var seq = [[NOTES.C5,0,0.35],[NOTES.E5,0.32,0.35],[NOTES.G5,0.64,0.35],[NOTES.C6,0.96,0.7]];
                seq.forEach(function(n) { tone(n[0], n[1], n[2], 'triangle', 0.18); });
                // 加一个低音铺底
                tone(NOTES.C5 / 2, 0, 1.8, 'sine', 0.08);
                if (cb) setTimeout(cb, 1700);
            },
            // 间奏：G5-C6 上行四度
            playEntracte: function() {
                tone(NOTES.G5, 0, 0.18, 'triangle', 0.15);
                tone(NOTES.C6, 0.16, 0.3, 'triangle', 0.15);
            },
            // 终曲：C6-G5-E5 下行收束
            playFinale: function() {
                tone(NOTES.C6, 0, 0.4, 'triangle', 0.18);
                tone(NOTES.G5, 0.35, 0.4, 'triangle', 0.16);
                tone(NOTES.E5, 0.7, 0.8, 'triangle', 0.14);
                tone(NOTES.C5, 0.7, 0.8, 'sine', 0.08);
            },
            // 掌声：白噪声带通滤波渐强渐弱
            playApplause: function() {
                var c = ensureCtx();
                if (!c || muted) return;
                var bufferSize = c.sampleRate * 2;
                var buffer = c.createBuffer(1, bufferSize, c.sampleRate);
                var data = buffer.getChannelData(0);
                for (var i = 0; i < bufferSize; i++) {
                    data[i] = (Math.random() * 2 - 1) * (1 - Math.abs(i / bufferSize - 0.5) * 1.5);
                }
                var src = c.createBufferSource();
                src.buffer = buffer;
                var filter = c.createBiquadFilter();
                filter.type = 'bandpass';
                filter.frequency.value = 1200;
                filter.Q.value = 0.8;
                var gain = c.createGain();
                gain.gain.setValueAtTime(0, c.currentTime);
                gain.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.3);
                gain.gain.linearRampToValueAtTime(0.1, c.currentTime + 1.2);
                gain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 2);
                src.connect(filter);
                filter.connect(gain);
                gain.connect(c.destination);
                src.start();
                src.stop(c.currentTime + 2.1);
            },
            // 成功：C-E-G 大三和弦
            playSuccess: function() {
                tone(NOTES.C5, 0, 0.4, 'triangle', 0.15);
                tone(NOTES.E5, 0, 0.4, 'triangle', 0.12);
                tone(NOTES.G5, 0, 0.5, 'triangle', 0.12);
            },
            // 失败：C-C# 小二度不和谐
            playError: function() {
                tone(NOTES.C5, 0, 0.35, 'sawtooth', 0.1);
                tone(NOTES.Cs5, 0, 0.35, 'sawtooth', 0.1);
            }
        };
    })();

    // 根据 URL 判断当前页（刷新时 body.dataset.page 还没设）
    var path = window.location.pathname;
    var initialPage = 'home';
    if (/posts\.html/.test(path)) initialPage = 'posts';
    else if (/post\.html/.test(path)) initialPage = 'post';
    else if (/projects\.html/.test(path)) initialPage = 'projects';
    else if (/about\.html/.test(path)) initialPage = 'about';
    else if (/friends\.html/.test(path)) initialPage = 'friends';
    else if (/recommendations\.html/.test(path)) initialPage = 'recommendations';
    else if (/archive\.html/.test(path)) initialPage = 'archive';
    var currentPage = document.body.dataset.page || initialPage;
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var navLinks = [
        { page: 'home', label: '首页', href: '#/home', icon: '\u25C9' },
        { page: 'posts', label: '剧目', href: '#/posts', icon: '\u2630' },
        { page: 'projects', label: '工坊', href: '#/projects', icon: '\u2605' },
        { page: 'about', label: '关于', href: '#/about', icon: '\u25C8' },
        { page: 'friends', label: '友链', href: '#/friends', icon: '\u266A' },
        { page: 'recommendations', label: '私藏', href: '#/recommendations', icon: '\u266B' },
        { page: 'archive', label: '归档', href: '#/archive', icon: '\u2F37' },
        { page: 'audience', label: '观众席', href: '#/audience', icon: '\u2709' }
    ];
    /* 固定标语池（每次随机选5条） */
    var tickerPool = [
        '用代码演绎你的想象',
        '幕布已拉开，请随意落座',
        '演出即将开始，请保持安静',
        '谢幕时请留下掌声',
        '中场休息，喝杯咖啡吧',
        '灯光已就绪，舞台已点亮',
        '下一幕：更精彩的故事',
        '彩蛋藏在文末',
        '本场演出由你主导',
        '屏息期待，好戏开场',
        '今晚的星光为你点亮',
        '每一场演出都是独一无二的',
        '掌声是最好的鼓励',
        '压轴好戏不容错过',
        '欢迎来到 Rains 剧场',
        '演出时长：约一首歌的时间'
    ];

    /* 页面对应的演出介绍 */
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

    /* 舞台监督随机提示语库 */
    var stageManagerQuotes = [
        '舞台监督：道具已就位',
        '舞台监督：灯光检查完毕',
        '舞台监督：演员已到侧幕',
        '舞台监督：本场演出即将开始',
        '舞台监督：感谢关闭手机铃声',
        '舞台监督：中场休息有售吧台',
        '舞台监督：祝您观演愉快',
        '舞台监督：下一场更精彩',
        '舞台监督：乐手已就位',
        '舞台监督：幕布检查完毕'
    ];

    function buildNav() {
        var linksHtml = navLinks.map(function(l) {
            return '<a href="' + l.href + '" class="nav-marquee__link ' + (l.page === currentPage ? 'nav-marquee__link--active' : '') + '" data-page="' + l.page + '">' + l.label + '</a>';
        }).join('');

        /* 跑马灯：循环单元 = [舞台监督] + [5灰] + [页面介绍] + [5灰] = 12条
           两个黄色高亮项之间隔5条灰色，不会挨着 */
        var pageIntro = pageIntroMap[currentPage] || pageIntroMap.home;
        var UNIT_SIZE = 12;
        var UNIT_COUNT = 8;

        function buildUnit() {
            var quote = stageManagerQuotes[Math.floor(Math.random() * stageManagerQuotes.length)];
            var shuffled = tickerPool.slice().sort(function() { return Math.random() - 0.5; });
            var fixedA = shuffled.slice(0, 5);
            var fixedB = shuffled.slice(5, 10);
            return [quote].concat(fixedA, [pageIntro], fixedB);
        }

        var units = [];
        for (var u = 0; u < UNIT_COUNT; u++) {
            units.push(buildUnit());
        }
        units.push(units[0].slice());

        var allItems = units.reduce(function(acc, unit) { return acc.concat(unit); }, []);
        var tickerHtml = allItems.map(function(t, i) {
            var posInUnit = i % UNIT_SIZE;
            var highlight = '';
            var extraClass = '';
            if (posInUnit === 0) {
                highlight = ' nav-ticker__item--highlight'; // 舞台监督
            } else if (posInUnit === 6) {
                highlight = ' nav-ticker__item--highlight'; // 页面介绍
                extraClass = ' page-intro';
            }
            return '<span class="nav-ticker__item' + highlight + extraClass + '">\u2726 ' + t + '</span>';
        }).join('');
        var mobileTabs = navLinks.filter(function(l) { return ['home','posts','about','friends'].indexOf(l.page) !== -1; });
        var mobileHtml = mobileTabs.map(function(l) {
            return '<a href="' + l.href + '" class="mobile-tabbar__item ' + (l.page === currentPage ? 'mobile-tabbar__item--active' : '') + '" data-page="' + l.page + '"><span class="mobile-tabbar__icon">' + l.icon + '</span><span>' + l.label + '</span></a>';
        }).join('');
        return '<div class="nav-marquee"><div class="nav-marquee__bulbs"></div><div class="nav-marquee__inner"><a href="#/home" class="nav-marquee__brand">RAINS</a><nav class="nav-marquee__links">' + linksHtml + '</nav><div class="nav-marquee__right" id="navRight"></div></div><div class="nav-ticker"><div class="nav-ticker__track">' + tickerHtml + '</div></div></div><div class="mobile-tabbar"><div class="mobile-tabbar__inner">' + mobileHtml + '</div></div>';
    }

    var castList = ['剧场主理人 / 导演 / 主演 — Rains','舞台监督 — JavaScript','灯光设计 — CSS Spotlight','服装 — Vanilla CSS','配乐 — 键盘敲击声','特别感谢 — 每一位访客','剧场主理人 / 导演 / 主演 — Rains','舞台监督 — JavaScript','灯光设计 — CSS Spotlight','服装 — Vanilla CSS','配乐 — 键盘敲击声','特别感谢 — 每一位访客'];
    function buildFooter() {
        var castHtml = castList.map(function(c, i) {
            return '<div class="footer-cast__line ' + (i === 0 || i === 6 ? 'footer-cast__line--star' : '') + '">' + c + '</div>';
        }).join('');
        return '<div class="footer-cast"><div class="footer-cast__track">' + castHtml + '</div></div><div class="footer-bottom container"><div class="footer-social"><a href="https://github.com" target="_blank" rel="noopener" class="footer-social__link" title="GitHub">GH</a><a href="mailto:hello@rains.dev" class="footer-social__link" title="Email">@</a><a href="#" class="footer-social__link" title="RSS">RSS</a></div><div class="footer-copy">♪ &copy; 2026 Rains &nbsp;|&nbsp; 用代码演绎你的想象 ♫</div><div class="footer-signature">Rains</div></div>';
    }

    var curtainOpened = false;
    function openCurtain() {
        if (curtainOpened) return;
        curtainOpened = true;
        var curtain = document.getElementById('curtain');
        var hero = document.getElementById('hero');
        var silence = document.getElementById('heroSilence');
        if (curtain) curtain.classList.add('curtain--open');
        if (hero) hero.classList.add('hero--lit');
        setTimeout(function() { if (silence) silence.classList.add('hero__silence--fade'); }, 4000);
        setTimeout(function() { if (curtain && curtain.parentNode) curtain.style.display = 'none'; }, 2800);
    }

    /* 统一所有页面的幕布入场动画 */
    function initPageCurtain() {
        // 检测是否有 noCurtain 参数，如果有就隐藏幕布
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('noCurtain') === '1') {
            var curtain = document.getElementById('curtain');
            if (curtain) {
                curtain.style.display = 'none';
            }
            return;
        }
        
        // 复用 HTML 中已有的幕布（首页），不存在则动态创建（非首页）
        var curtain = document.getElementById('curtain');
        if (!curtain) {
            curtain = document.createElement('div');
            curtain.className = 'curtain';
            curtain.id = 'curtain';
            curtain.innerHTML =
                '<div class="curtain__panel curtain__panel--left"><div class="curtain__velvet"></div></div>' +
                '<div class="curtain__panel curtain__panel--right"><div class="curtain__velvet"></div></div>' +
                '<div class="curtain__valance"></div>' +
                '<div class="curtain__light-beam"></div>';
            document.body.insertBefore(curtain, document.body.firstChild);
        }
        curtain.style.display = 'block';
        // 首页额外点亮 hero 灯光
        if (currentPage === 'home') {
            var hero = document.getElementById('hero');
            if (hero) hero.classList.add('hero--lit');
        }
        // 减少动画或触屏：直接打开幕布，无过渡
        if (prefersReducedMotion || window.matchMedia('(hover: none)').matches) {
            curtain.classList.add('curtain--open');
            curtain.style.display = 'none';
            return;
        }
        setTimeout(function() {
            curtain.classList.add('curtain--open');
            setTimeout(function() {
                if (curtain && curtain.parentNode) curtain.style.display = 'none';
            }, 2800);
        }, 300);
    }

    /* S4: 开场铃声（Web Audio API 合成三声剧场铃） */
    function initOpeningBell() {
        // 先创建声音开关（所有页面都有）
        createBellToggle(window.RainsAudio.isMuted());

        if (currentPage !== 'home') return;
        if (prefersReducedMotion) return;
        var isTouch = window.matchMedia('(hover: none)').matches;
        if (isTouch) window.RainsAudio.setMuted(true);
        if (window.RainsAudio.isMuted()) return; // 静音时不播放铃声，幕布由 initPageCurtain 统一打开

        var bellTriggered = false;

        function trigger() {
            if (bellTriggered) return;
            bellTriggered = true;
            window.RainsAudio.unlock();
            // 三声剧场铃
            (function playBell() {
                var c = window.RainsAudio._ctx || null;
                // 用 RainsAudio 内部 tone 不方便，直接用简单实现
                var ctx = null;
                try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { openCurtain(); return; }
                if (ctx.state === 'suspended') ctx.resume();
                var now = ctx.currentTime;
                [0, 0.42, 0.84].forEach(function(t) {
                    var osc = ctx.createOscillator();
                    var gain = ctx.createGain();
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(880, now + t);
                    osc.frequency.exponentialRampToValueAtTime(860, now + t + 0.25);
                    gain.gain.setValueAtTime(0, now + t);
                    gain.gain.linearRampToValueAtTime(0.2, now + t + 0.01);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + t + 0.3);
                    osc.connect(gain); gain.connect(ctx.destination);
                    osc.start(now + t); osc.stop(now + t + 0.35);
                });
            })();
            // 序曲（与铃声同时开始）
            window.RainsAudio.playOverture();
            // 幕布由 initPageCurtain 统一在 300ms 后打开，此处不再控制时序
        }

        trigger();
        if (!bellTriggered) {
            var onInteract = function() {
                trigger();
                document.removeEventListener('mousemove', onInteract);
                document.removeEventListener('click', onInteract);
                document.removeEventListener('keydown', onInteract);
                document.removeEventListener('touchstart', onInteract);
            };
            document.addEventListener('mousemove', onInteract);
            document.addEventListener('click', onInteract);
            document.addEventListener('keydown', onInteract);
            document.addEventListener('touchstart', onInteract);
        }
    }

    function createBellToggle(initialMuted) {
        var btn = document.createElement('button');
        btn.className = 'bell-toggle';
        btn.setAttribute('aria-label', initialMuted ? '开启声音' : '静音');
        var icon = document.createElement('span');
        icon.className = 'bell-toggle__icon';
        icon.innerHTML =
            '<svg class="bt-sound" viewBox="0 0 24 24" width="18" height="18">' +
            '<path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>' +
            '<path d="M15.5 8.5a5 5 0 010 7M18.5 5.5a9 9 0 010 13" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
            '</svg>' +
            '<svg class="bt-muted" viewBox="0 0 24 24" width="18" height="18">' +
            '<path d="M11 5L6 9H2v6h4l5 4V5z" fill="currentColor"/>' +
            '<path d="M15 9l6 6M21 9l-6 6" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"/>' +
            '</svg>';
        function applyMuted(m) {
            icon.classList.toggle('is-muted', m);
            btn.setAttribute('aria-label', m ? '开启声音' : '静音');
        }
        applyMuted(initialMuted);
        btn.appendChild(icon);
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var nowMuted = window.RainsAudio.isMuted();
            if (nowMuted) {
                window.RainsAudio.setMuted(false);
                applyMuted(false);
            } else {
                window.RainsAudio.setMuted(true);
                applyMuted(true);
            }
        });
        // 放入导航栏右侧容器（与导航文字 flex 垂直居中），找不到时兜底挂到 body
        var navRight = document.getElementById('navRight');
        if (navRight) navRight.appendChild(btn);
        else document.body.appendChild(btn);
    }

    function initPostFilter() {
        if (currentPage !== 'posts') return;
        var filterBar = document.getElementById('filterBar');
        var grid = document.getElementById('ticketGrid');
        var emptyState = document.getElementById('emptyState');
        if (!filterBar || !grid) return;
        var buttons = filterBar.querySelectorAll('.filter-btn');
        var tickets = grid.querySelectorAll('.ticket');
        buttons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                var filter = btn.dataset.filter;
                buttons.forEach(function(b) { b.classList.remove('tag-active'); });
                btn.classList.add('tag-active');
                var count = 0;
                tickets.forEach(function(t) {
                    if (filter === 'all' || t.dataset.category === filter) { t.style.display = 'flex'; count++; }
                    else { t.style.display = 'none'; }
                });
                if (emptyState) emptyState.style.display = count === 0 ? 'block' : 'none';
            });
        });
    }

    function initProgressBar() {
        if (currentPage !== 'post') return;
        var bar = document.getElementById('progressBar');
        var actLabel = document.getElementById('progressAct');
        var nodes = document.querySelectorAll('.progress-node');
        if (!bar) return;
        var acts = [
            { max: 10, name: '序曲' },
            { max: 35, name: 'Act I' },
            { max: 60, name: 'Intermission' },
            { max: 85, name: 'Act II' },
            { max: 101, name: 'Finale' }
        ];
        function update() {
            var st = window.pageYOffset || document.documentElement.scrollTop;
            var dh = document.documentElement.scrollHeight - window.innerHeight;
            var pct = dh > 0 ? (st / dh) * 100 : 0;
            bar.style.width = pct + '%';
            // S3: 更新当前幕次
            if (actLabel) {
                for (var i = 0; i < acts.length; i++) {
                    if (pct < acts[i].max) { actLabel.textContent = acts[i].name; break; }
                }
            }
            // S3: 高亮已到达节点
            nodes.forEach(function(node) {
                var nodePos = parseFloat(node.style.left);
                if (pct >= nodePos - 2) { node.classList.add('progress-node--active'); }
                else { node.classList.remove('progress-node--active'); }
            });
            // S6 hook: 到达 100% 触发终曲
            if (pct >= 99 && !window._finalePlayed) {
                window._finalePlayed = true;
                if (window.RainsAudio && window.RainsAudio.playFinale) window.RainsAudio.playFinale();
            }
        }
        window.addEventListener('scroll', update, { passive: true });
        update();
    }

    function initMetronome() {
        // S5: 节拍指示灯，prefers-reduced-motion 时禁用
        if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
        var saved = localStorage.getItem('rains_metronome_bpm');
        var bpms = [120, 90, 60, 0]; // 0 = off
        var idx = saved !== null ? bpms.indexOf(parseInt(saved)) : 0;
        if (idx < 0) idx = 0;
        var light = document.createElement('div');
        light.className = 'metronome-light';
        light.title = '节拍器 · 点击切换 BPM';
        function applyBpm() {
            var bpm = bpms[idx];
            if (bpm === 0) {
                light.style.animation = 'none';
                light.style.opacity = '0.15';
            } else {
                light.style.animation = 'metronome-pulse ' + (60000 / bpm) + 'ms ease-in-out infinite';
                light.style.opacity = '1';
            }
            localStorage.setItem('rains_metronome_bpm', bpms[idx]);
        }
        light.addEventListener('click', function() {
            idx = (idx + 1) % bpms.length;
            applyBpm();
        });
        document.body.appendChild(light);
        applyBpm();
    }

    function initTOC() {
        if (currentPage !== 'post') return;
        var tocLinks = document.querySelectorAll('.post-toc__link');
        var sections = document.querySelectorAll('.act-title');
        if (!tocLinks.length || !sections.length) return;
        var toggle = document.getElementById('tocToggle');
        var toc = document.getElementById('postToc');
        if (toggle && toc) { toggle.addEventListener('click', function() { toc.classList.toggle('post-toc--open'); }); }
        tocLinks.forEach(function(link) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                var target = document.getElementById(link.dataset.target);
                if (target) { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); if (toc) toc.classList.remove('post-toc--open'); }
            });
        });
        if ('IntersectionObserver' in window) {
            var observer = new IntersectionObserver(function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        var id = entry.target.id;
                        tocLinks.forEach(function(l) { l.classList.toggle('post-toc__link--active', l.dataset.target === id); });
                    }
                });
            }, { rootMargin: '-20% 0px -70% 0px' });
            sections.forEach(function(s) { observer.observe(s); });
        }
    }

    function initTearAnimation() {
        if (currentPage !== 'post') return;
        var fromList = sessionStorage.getItem('rains_tear_from_list');
        if (!fromList || prefersReducedMotion) { sessionStorage.removeItem('rains_tear_from_list'); return; }
        var main = document.getElementById('main-content');
        if (main) {
            main.style.opacity = '0';
            main.style.transform = 'scale(0.98)';
            main.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            setTimeout(function() { main.style.opacity = '1'; main.style.transform = 'scale(1)'; }, 100);
        }
        sessionStorage.removeItem('rains_tear_from_list');
    }

    function initTearSource() {
        if (currentPage !== 'posts') return;
        document.querySelectorAll('.ticket').forEach(function(t) {
            t.addEventListener('click', function() { sessionStorage.setItem('rains_tear_from_list', '1'); });
        });
    }

    /* S2: 确保幕布元素存在（非首页动态注入） */
    function ensureCurtain() {
        var curtain = document.getElementById('curtain');
        if (curtain) return curtain;
        curtain = document.createElement('div');
        curtain.className = 'curtain curtain--open';
        curtain.id = 'curtain';
        curtain.innerHTML =
            '<div class="curtain__panel curtain__panel--left"><div class="curtain__velvet"></div></div>' +
            '<div class="curtain__panel curtain__panel--right"><div class="curtain__velvet"></div></div>' +
            '<div class="curtain__valance"></div>' +
            '<div class="curtain__light-beam"></div>';
        document.body.insertBefore(curtain, document.body.firstChild);
        return curtain;
    }
    
    // 暴露到全局，供其他页面调用
    window.ensureCurtain = ensureCurtain;

    /* S2: 页面退出幕布关闭 */
    function initCurtainExit() {
        if (prefersReducedMotion) return;
        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href]');
            if (!link) return;
            var href = link.getAttribute('href');
            if (!href) return;
            // 排除：观众席卡片里面的链接，由专门的事件处理
            if (link.closest('.comment-book-card')) return;
            // 排除：新标签页、外链、锚点、mailto、javascript、非 html 页面
            if (link.target === '_blank' ||
                href.indexOf('http') === 0 ||
                href.charAt(0) === '#' ||
                href.indexOf('mailto:') === 0 ||
                href.indexOf('javascript:') === 0 ||
                href.indexOf('.html') === -1) return;
            // 排除修饰键（Ctrl/Cmd/Shift+点击 = 新标签页）
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return;

            e.preventDefault();
            window.RainsAudio.playEntracte();
            var curtain = ensureCurtain();
            curtain.style.display = 'block';
            // 强制重排以确保 transition 生效
            void curtain.offsetWidth;
            curtain.classList.remove('curtain--open');
            curtain.classList.add('curtain--closing');
            setTimeout(function() {
                window.RainsRouter.push(href);
            }, 650);
        });
    }

    /* S5: 散场灯光 — 滚动到谢幕区时背景渐亮 */
    function initHouseLights() {
        if (currentPage !== 'post') return;
        var curtainCall = document.querySelector('.curtain-cta');
        if (!curtainCall) return;

        function setLights(on) {
            document.body.style.backgroundColor = on ? '#2A2520' : '';
        }

        if (!('IntersectionObserver' in window)) {
            window.addEventListener('scroll', function() {
                var rect = curtainCall.getBoundingClientRect();
                setLights(rect.top < window.innerHeight * 0.7);
            }, { passive: true });
            return;
        }

        var applausePlayed = false;
        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                setLights(entry.isIntersecting);
                if (entry.isIntersecting && !applausePlayed) {
                    applausePlayed = true;
                    window.RainsAudio.playApplause();
                }
            });
        }, { threshold: 0.25 });

        observer.observe(curtainCall);
    }

    document.addEventListener('DOMContentLoaded', function() {
        var navSlot = document.querySelector('[data-nav]');
        var footerSlot = document.querySelector('[data-footer]');
        if (navSlot) navSlot.outerHTML = buildNav();
        if (footerSlot) footerSlot.outerHTML = '<footer class="site-footer" id="main-footer">' + buildFooter() + '</footer>';
        // 计算跑马灯循环宽度：8个单元×12条=96条，loop-width=前8个单元总宽
        function computeLoopWidth() {
            var track = document.querySelector('.nav-ticker__track');
            if (!track) return;
            var items = track.querySelectorAll('.nav-ticker__item');
            var UNIT_SIZE = 12, UNIT_COUNT = 8;
            if (items.length < UNIT_SIZE * UNIT_COUNT) return;
            var lastIdx = UNIT_SIZE * UNIT_COUNT - 1;
            var loopWidth = items[lastIdx].offsetLeft + items[lastIdx].offsetWidth - items[0].offsetLeft;
            track.style.setProperty('--loop-width', loopWidth + 'px');
        }
        requestAnimationFrame(computeLoopWidth);
        // 字体加载完成后重算，避免 fallback 字体导致宽度不准
        if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function() {
                requestAnimationFrame(computeLoopWidth);
            });
        }
        // 设置路由切换回调：新页面加载完成后打开幕布
        window.RainsRouter.setTransitionCallbacks(
            function(onComplete) {
                // onStart: 幕布关闭动画已由 initCurtainExit 处理
                onComplete();
            },
            function() {
                // onEnd: 新页面加载完成，打开幕布
                // 检测是否有 noCurtain 参数，如果有就保持幕布关闭状态
                var urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('noCurtain') === '1') {
                    // 更新 body 的 page 属性
                    var newPage = window.RainsRouter.getCurrentPage();
                    document.body.dataset.page = newPage;
                    // 更新跑马灯页面介绍文本
                    var newIntro = pageIntroMap[newPage] || pageIntroMap.home;
                    document.querySelectorAll('.page-intro').forEach(function(el) {
                        el.textContent = newIntro;
                    });
                    // 保持幕布关闭状态
                    var curtain = document.getElementById('curtain');
                    if (curtain) {
                        curtain.style.display = 'none';
                    }
                    return;
                }
                
                var curtain = document.getElementById('curtain');
                if (curtain) {
                    curtain.style.display = 'block';
                    curtain.classList.remove('curtain--closing');
                    void curtain.offsetWidth;
                    curtain.classList.add('curtain--open');
                    setTimeout(function() {
                        if (curtain && curtain.parentNode) curtain.style.display = 'none';
                    }, 2800);
                }
                // 更新 body 的 page 属性
                var newPage = window.RainsRouter.getCurrentPage();
                document.body.dataset.page = newPage;
                // 更新跑马灯页面介绍文本
                var newIntro = pageIntroMap[newPage] || pageIntroMap.home;
                document.querySelectorAll('.page-intro').forEach(function(el) {
                    el.textContent = '\u2726 ' + newIntro;
                });
                // 更新导航高亮
                document.querySelectorAll('.nav-marquee__link').forEach(function(link) {
                    link.classList.toggle('nav-marquee__link--active', link.getAttribute('data-page') === newPage);
                });
                document.querySelectorAll('.mobile-tabbar__item').forEach(function(item) {
                    item.classList.toggle('mobile-tabbar__item--active', item.getAttribute('data-page') === newPage);
                });
            }
        );

        // 初始化路由（加载首页内容）
        window.RainsRouter.init();

        initPageCurtain();
        initOpeningBell();
        initPostFilter();
        initProgressBar(); initMetronome();
        initTOC();
        initTearAnimation();
        initTearSource();
        initCurtainExit();
        initHouseLights();
        initCurrentTime();
        console.log('Rains loaded — page:', currentPage);
        
        // Ticket Tear Animation
        console.log('initTearButton loaded');
        document.addEventListener('click', function(e) {
            // 观众席卡片：点击任意位置都触发翻页
            var commentCard = e.target.closest('.comment-book-card');
            if (commentCard) {
                commentCard.classList.add('is-opening');
                // 1.2秒翻页动画结束后，触发幕布动画，然后跳转
                setTimeout(function() {
                    // 手动触发幕布关闭动画
                    var curtain = ensureCurtain();
                    curtain.style.display = 'block';
                    void curtain.offsetWidth;
                    curtain.classList.remove('curtain--open');
                    curtain.classList.add('curtain--closing');
                    // 650毫秒幕布动画结束后，用 SPA 路由跳转
                    setTimeout(function() {
                        window.RainsRouter.push('audience.html');
                    }, 650);
                }, 1200);
                e.preventDefault();
                return;
            }
            
            // 排除：如果是观众席卡片里面的链接，不触发 initCurtainExit
            if (e.target.closest('.comment-book-card')) return;
            
            var btn = e.target.closest('.btn-ticket, .ticket, .clapper-card, .vinyl-card, .autograph-card');
            if (!btn) return;
            
            // 排除：表单提交按钮，由表单自己的逻辑处理
            if (btn.tagName === 'BUTTON' && btn.type === 'submit') return;
            // 排除：感谢信里的"再写一句"按钮，由感谢信自己的逻辑处理
            if (btn.id === 'writeAgainBtn') return;
            
            // 根据卡片类型添加对应的动效 class
            var tearClass = 'is-torn';
            if (btn.classList.contains('clapper-card')) {
                tearClass = 'is-striking';
            } else if (btn.classList.contains('vinyl-card')) {
                tearClass = 'is-playing';
                // 计算唱片中心应该移到卡片中心的距离
                var disc = btn.querySelector('.vinyl-card__disc');
                if (disc) {
                    var cardWidth = btn.offsetWidth;
                    var discWidth = disc.offsetWidth;
                    var discLeft = disc.offsetLeft;
                    var cardCenterX = cardWidth / 2;
                    var discCenterX = discLeft + discWidth / 2;
                    var moveX = cardCenterX - discCenterX;
                    btn.style.setProperty('--disc-move-x', moveX + 'px');
                }
            } else if (btn.classList.contains('autograph-card')) {
                tearClass = 'is-signed';
            }
            
            // 对于 javascript:void(0) 的按钮，先播放撕开动效，再延迟执行原来的点击事件
            var href = btn.getAttribute('href');
            if (href && href === 'javascript:void(0)') {
                e.preventDefault();
                e.stopPropagation();
                btn.classList.add(tearClass);
                
                setTimeout(function() {
                    btn.classList.remove(tearClass);
                    
                    // 手动执行向下滚动（进入剧场按钮）
                    var silence = document.getElementById('heroSilence');
                    if (silence) {
                        silence.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                }, 1200);
                return;
            }
            
            // 对于链接和表单，先阻止默认行为，播放撕开动效，再手动播放幕布动画
            console.log('tear animation triggered');
            e.preventDefault();
            e.stopPropagation();
            btn.classList.add(tearClass);
            
            // 撕开动效播放完后，保持撕开状态，再播放幕布动画
            setTimeout(function() {
                // 保持撕开状态，不回转
                // 如果是链接，手动执行幕布动画和跳转
                if (btn.tagName === 'A' && href && href.indexOf('.html') !== -1) {
                    // 播放幕布关闭动画
                    window.RainsAudio.playEntracte();
                    var curtain = ensureCurtain();
                    curtain.style.display = 'block';
                    void curtain.offsetWidth;
                    curtain.classList.remove('curtain--open');
                    curtain.classList.add('curtain--closing');
                    
                    // 幕布动画结束后跳转
                    setTimeout(function() {
                        window.RainsRouter.push(href);
                    }, 650);
                }
                
                // 如果是表单提交，延迟提交
                if (btn.type === 'submit') {
                    var form = btn.closest('form');
                    if (form) {
                        setTimeout(function() {
                            form.submit();
                        }, 1000);
                    }
                }
            }, 1200);
        }, true);
    });
})();
/* ---------- S7: Global Spotlight ---------- */
(function() {
    if (window.matchMedia('(hover: none)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    var layer = document.createElement('div');
    layer.className = 'spotlight-layer';
    document.body.appendChild(layer);

    var mouseX = window.innerWidth / 2;
    var mouseY = window.innerHeight / 2;
    var currentX = mouseX;
    var currentY = mouseY;
    var rafId = null;

    document.addEventListener('mousemove', function(e) {
        mouseX = e.clientX;
        mouseY = e.clientY;
        if (!rafId) {
            rafId = requestAnimationFrame(update);
        }
    });

    function update() {
        currentX += (mouseX - currentX) * 0.15;
        currentY += (mouseY - currentY) * 0.15;
        layer.style.setProperty('--spot-x', currentX + 'px');
        layer.style.setProperty('--spot-y', currentY + 'px');
        if (Math.abs(mouseX - currentX) > 0.5 || Math.abs(mouseY - currentY) > 0.5) {
            rafId = requestAnimationFrame(update);
        } else {
            rafId = null;
        }
    }

    document.addEventListener('mouseleave', function() {
        layer.style.opacity = '0';
    });
    document.addEventListener('mouseenter', function() {
        layer.style.opacity = '1';
    });
})();

/* ---------- S8: Real-time Clock on Ticket Stub ---------- */
function initCurrentTime() {
    function updateTime() {
        var el = document.getElementById('currentTime');
        if (!el) return;
        var now = new Date();
        var h = String(now.getHours()).padStart(2, '0');
        var m = String(now.getMinutes()).padStart(2, '0');
        el.textContent = h + ':' + m;
    }
    updateTime();
    setInterval(updateTime, 1000);
}

/* ---------- S9: Ticket Tear Animation ---------- */
function initTearButton() {
    console.log('initTearButton loaded');
    document.addEventListener('click', function(e) {
        var btn = e.target.closest('.btn-ticket');
        if (!btn) {
            console.log('no btn-ticket found');
            return;
        }
        console.log('btn-ticket clicked');
        btn.classList.add('is-torn');
        setTimeout(function() {
            btn.classList.remove('is-torn');
        }, 600);
    });
}