/* ============================================
   Rains — bell.js
   开场铃声与导航栏声音开关
   ============================================ */
(function() {
    'use strict';

    function createToggle(initialMuted) {
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
        function applyMuted(muted) {
            icon.classList.toggle('is-muted', muted);
            btn.setAttribute('aria-label', muted ? '开启声音' : '静音');
        }
        applyMuted(initialMuted);
        btn.appendChild(icon);
        btn.addEventListener('click', function(e) {
            e.stopPropagation();
            var nowMuted = window.RainsAudio.isMuted();
            window.RainsAudio.setMuted(!nowMuted);
            applyMuted(!nowMuted);
        });
        var navRight = document.getElementById('navRight');
        if (navRight) navRight.appendChild(btn);
        else document.body.appendChild(btn);
    }

    function playBell() {
        var ctx;
        try { ctx = new (window.AudioContext || window.webkitAudioContext)(); }
        catch(e) { window.RainsCurtain.open(); return; }
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
    }

    function init(currentPage, prefersReducedMotion) {
        createToggle(window.RainsAudio.isMuted());
        if (currentPage !== 'home' || prefersReducedMotion) return;
        if (window.matchMedia('(hover: none)').matches) window.RainsAudio.setMuted(true);
        if (window.RainsAudio.isMuted()) return;

        var bellTriggered = false;
        function trigger() {
            if (bellTriggered) return;
            bellTriggered = true;
            window.RainsAudio.unlock();
            playBell();
            window.RainsAudio.playOverture();
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

    window.RainsBell = { init: init };
})();
