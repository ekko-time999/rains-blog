/* ============================================
   Rains — curtain.js
   页面幕布入场、离场与动态注入
   ============================================ */
(function() {
    'use strict';

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

    function buildCurtain(className) {
        var curtain = document.createElement('div');
        curtain.className = className;
        curtain.id = 'curtain';
        curtain.innerHTML =
            '<div class="curtain__panel curtain__panel--left"><div class="curtain__velvet"></div></div>' +
            '<div class="curtain__panel curtain__panel--right"><div class="curtain__velvet"></div></div>' +
            '<div class="curtain__valance"></div>' +
            '<div class="curtain__light-beam"></div>';
        return curtain;
    }

    /* 统一所有页面的幕布入场动画 */
    function initPage(currentPage, prefersReducedMotion) {
        var urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('noCurtain') === '1') {
            var hiddenCurtain = document.getElementById('curtain');
            if (hiddenCurtain) hiddenCurtain.style.display = 'none';
            return;
        }

        var curtain = document.getElementById('curtain');
        if (!curtain) {
            curtain = buildCurtain('curtain');
            document.body.insertBefore(curtain, document.body.firstChild);
        }
        curtain.style.display = 'block';

        if (currentPage === 'home') {
            var hero = document.getElementById('hero');
            if (hero) hero.classList.add('hero--lit');
        }
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

    function ensureCurtain() {
        var curtain = document.getElementById('curtain');
        if (curtain) return curtain;
        curtain = buildCurtain('curtain curtain--open');
        document.body.insertBefore(curtain, document.body.firstChild);
        return curtain;
    }

    /* 页面退出幕布关闭 */
    function initExit(prefersReducedMotion) {
        if (prefersReducedMotion) return;
        document.addEventListener('click', function(e) {
            var link = e.target.closest('a[href]');
            if (!link) return;
            var href = link.getAttribute('href');
            if (!href) return;
            if (link.closest('.comment-book-card')) return;
            if (link.target === '_blank' ||
                href.indexOf('http') === 0 ||
                href.charAt(0) === '#' ||
                href.indexOf('mailto:') === 0 ||
                href.indexOf('javascript:') === 0 ||
                href.indexOf('.html') === -1) return;
            if (e.ctrlKey || e.metaKey || e.shiftKey || e.which === 2) return;

            e.preventDefault();
            window.RainsAudio.playEntracte();
            var curtain = ensureCurtain();
            curtain.style.display = 'block';
            void curtain.offsetWidth;
            curtain.classList.remove('curtain--open');
            curtain.classList.add('curtain--closing');
            setTimeout(function() {
                window.RainsRouter.push(href);
            }, 650);
        });
    }

    window.RainsCurtain = {
        open: openCurtain,
        initPage: initPage,
        initExit: initExit,
        ensure: ensureCurtain
    };
    // 保留旧的全局入口，兼容页面脚本和外部调用。
    window.ensureCurtain = ensureCurtain;
})();
