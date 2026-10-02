/**
 * 内页灯光视差效果
 * 监听滚动，根据滚动百分比移动背景灯光
 * 首页（home）不生效
 */
(function() {
    'use strict';

    function updateSpotlight() {
        // 首页不生效
        if (document.body.dataset.page === 'home') return;

        var scrollTop = window.scrollY || document.documentElement.scrollTop;
        var docHeight = document.documentElement.scrollHeight - window.innerHeight;
        if (docHeight <= 0) return;

        var p = Math.min(1, Math.max(0, scrollTop / docHeight)); // 0 ~ 1

        // 垂直移动：最多 25vh
        var translateY = p * 25;

        // 亮度：顶部 1.0 → 中间 0.75 → 底部 1.1
        var opacity = p < 0.5
            ? 1.0 - p * 0.5  // 0.5 → 0.75
            : 0.75 + (p - 0.5) * 0.7; // 0.5 → 0.75 → 1.1

        // 应用到三束光
        var before = document.body;
        var left = document.querySelector('.spotlight-left');
        var right = document.querySelector('.spotlight-right');

        // body::before 无法直接操作，用 CSS 变量
        document.documentElement.style.setProperty('--spotlight-y', translateY + 'vh');
        document.documentElement.style.setProperty('--spotlight-opacity', opacity);

        if (left) {
            left.style.transform = 'translateY(' + translateY + 'vh)';
            left.style.opacity = opacity;
        }
        if (right) {
            right.style.transform = 'translateY(' + translateY + 'vh)';
            right.style.opacity = opacity;
        }
    }

    var ticking = false;
    function onScroll() {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function() {
            updateSpotlight();
            ticking = false;
        });
    }

    function init() {
        window.addEventListener('scroll', onScroll, { passive: true });
        window.addEventListener('resize', onScroll, { passive: true });
        updateSpotlight();
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
