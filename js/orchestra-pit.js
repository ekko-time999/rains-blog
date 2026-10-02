/**
 * Rains 乐池 — 展开/收起交互
 * 只管开合，不碰播放逻辑（播放在 orchestra-player.js）
 */
(function() {
    'use strict';

    var pit = document.getElementById('orchestra-pit');
    var bar = document.getElementById('opBar');
    var expandBtn = document.getElementById('opExpand');
    var collapseBtn = document.querySelector('.op-collapse-btn');
    var closeBtn = document.querySelector('.op-close-btn');
    var bulbsBox = document.getElementById('opBulbs');
    var hint = document.getElementById('opHint');

    // 初始化灯珠（7 颗，最后一颗是红灯）
    function initBulbs() {
        var html = '';
        for (var i = 0; i < 7; i++) {
            html += '<span class="op-bulb' + (i === 6 ? ' op-bulb--red' : '') + '"></span>';
        }
        bulbsBox.innerHTML = html;
    }

    function isExpanded() {
        return pit.classList.contains('orchestra-pit--expanded');
    }

    function expand() {
        pit.classList.add('orchestra-pit--expanded');
        if (hint) hint.textContent = '⌄ 合上';
    }

    function collapse() {
        pit.classList.remove('orchestra-pit--expanded');
        if (hint) hint.textContent = '⌃ 掀开';
    }

    function close() {
        collapse();
        // 通知外部停止播放（S3 挂载）
        if (window.RainsPit && typeof window.RainsPit.onClose === 'function') {
            window.RainsPit.onClose();
        }
    }

    function bindEvents() {
        // 移动端下滑手势收起（在面板上向下滑）
        var touchStartY = null;
        var panel = document.querySelector('.op-panel');
        if (panel) {
            panel.addEventListener('touchstart', function(e) {
                touchStartY = e.touches[0].clientY;
            }, { passive: true });
            panel.addEventListener('touchmove', function(e) {
                if (touchStartY === null) return;
                var dy = e.touches[0].clientY - touchStartY;
                if (dy > 60 && isExpanded()) {
                    collapse();
                    touchStartY = null;
                }
            }, { passive: true });
        }

        // 点击灯带 → 切换展开/收起
        bar.addEventListener('click', function(e) {
            // 按钮自己有行为，不重复触发
            if (e.target.closest('.op-bar-btn')) return;
            if (isExpanded()) collapse();
            else expand();
        });
        // 展开按钮
        expandBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            expand();
        });
        // 收起按钮
        collapseBtn.addEventListener('click', collapse);
        // 关闭按钮
        closeBtn.addEventListener('click', close);
        // 键盘 M 切换，Esc 收起
        document.addEventListener('keydown', function(e) {
            if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
            if (e.key === 'm' || e.key === 'M') {
                isExpanded() ? collapse() : expand();
            } else if (e.key === 'Escape' && isExpanded()) {
                collapse();
            }
        });
    }

    initBulbs();
    bindEvents();

    // 首访浮动幅度大一点（3 次呼吸后恢复正常）
    try {
        if (!localStorage.getItem('rains_pit_intro')) {
            pit.classList.add('is-intro');
            setTimeout(function() {
                pit.classList.remove('is-intro');
                localStorage.setItem('rains_pit_intro', '1');
            }, 6000);
        }
    } catch (e) { /* 隐私模式下忽略 */ }

    // footer 浮现：进入视口时淡入+上浮
    var footer = document.getElementById('main-footer');
    if (footer && 'IntersectionObserver' in window) {
        var io = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    footer.classList.add('footer--visible');
                }
            });
        }, { threshold: 0.1 });
        io.observe(footer);
    } else if (footer) {
        footer.classList.add('footer--visible');
    }

    // 对外暴露
    window.RainsPit = window.RainsPit || {};
    window.RainsPit.getPit = function() { return pit; };
    window.RainsPit.expand = expand;
    window.RainsPit.collapse = collapse;
})();
