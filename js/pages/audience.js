/**
 * 观众席（留言板）页初始化逻辑
 */
(function() {
    'use strict';

    let formEl = null;
    let wallEl = null;
    let selectedSeat = '';
    let occupiedSeats = new Set();

    // 座位配置：5排×6座
    const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E'];
    const SEAT_COLS = 6;

    function generateSeatMap() {
        const rowsEl = document.getElementById('seatRows');
        if (!rowsEl) return;

        // 随机选 8-12 个座位标记为已占用
        occupiedSeats.clear();
        const totalSeats = SEAT_ROWS.length * SEAT_COLS;
        const occupyCount = 8 + Math.floor(Math.random() * 5); // 8-12个
        const allSeats = [];
        SEAT_ROWS.forEach(row => {
            for (let col = 1; col <= SEAT_COLS; col++) {
                allSeats.push(row + col);
            }
        });
        // 随机抽 occupyCount 个
        for (let i = 0; i < occupyCount; i++) {
            const idx = Math.floor(Math.random() * allSeats.length);
            occupiedSeats.add(allSeats.splice(idx, 1)[0]);
        }

        // 渲染每一排
        rowsEl.innerHTML = SEAT_ROWS.map(row => {
            const seats = [];
            for (let col = 1; col <= SEAT_COLS; col++) {
                const seatId = row + col;
                const isOccupied = occupiedSeats.has(seatId);
                seats.push('<button type="button" class="seat' + (isOccupied ? ' seat--occupied' : '') + '" data-seat="' + seatId + '" ' + (isOccupied ? 'disabled' : '') + '>' + col + '</button>');
            }
            const rowClass = (row === 'D' || row === 'E') ? 'seat-row seat-row--balcony' : 'seat-row';
            return '<div class="' + rowClass + '" data-row="' + row + '"><span class="seat-row__label">' + row + '</span><div class="seat-row__seats">' + seats.join('') + '</div></div>';
        }).join('');

        // 绑定点击事件
        rowsEl.querySelectorAll('.seat:not(.seat--occupied)').forEach(btn => {
            btn.addEventListener('click', handleSeatClick);
        });
    }

    function handleSeatClick(e) {
        const seat = e.target.dataset.seat;
        if (!seat || occupiedSeats.has(seat)) return;
        // 清除之前的选中
        document.querySelectorAll('.seat--selected').forEach(s => s.classList.remove('seat--selected'));
        // 选中当前
        e.target.classList.add('seat--selected');
        selectedSeat = seat;
    }

    function randomSeat() {
        // 找一个未占用的座位
        const available = [];
        SEAT_ROWS.forEach(row => {
            for (let col = 1; col <= SEAT_COLS; col++) {
                const seatId = row + col;
                if (!occupiedSeats.has(seatId)) available.push(seatId);
            }
        });
        if (available.length === 0) return;
        const randomSeatId = available[Math.floor(Math.random() * available.length)];
        // 清除之前选中
        document.querySelectorAll('.seat--selected').forEach(s => s.classList.remove('seat--selected'));
        // 选中随机的
        const btn = document.querySelector('.seat[data-seat="' + randomSeatId + '"]');
        if (btn) btn.classList.add('seat--selected');
        selectedSeat = randomSeatId;
    }

    function clearSeat() {
        document.querySelectorAll('.seat--selected').forEach(s => s.classList.remove('seat--selected'));
        selectedSeat = '';
    }

    function formatDateTime(isoStr) {
        const d = new Date(isoStr);
        const y = d.getFullYear();
        const m = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const h = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        return y + '.' + m + '.' + day + ' · ' + h + ':' + min;
    }

    function escapeHtml(str) {
        if (typeof str !== 'string') return '';
        return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    function loadMessages() {
        if (!wallEl) return;
        // 模拟留言
        const messages = [
            { name: 'Lemony', content: '这场演出太棒了！幕布拉开的瞬间鸡皮疙瘩都起来了！', seat: 'B3', created_at: '2026-10-01T19:30:00' },
            { name: 'Ekko', content: '票根设计太用心了，舍不得撕啊哈哈', seat: 'A5', created_at: '2026-10-01T19:45:00' },
            { name: '370', content: '乐池的黑胶唱片动效太有感觉了，像真的在剧院里', seat: 'C2', created_at: '2026-10-01T20:15:00' }
        ];
        
        wallEl.innerHTML = messages.map((m, i) => {
            const initial = (m.name || '?').charAt(0).toUpperCase();
            const seatLabel = m.seat || '随机';
            const showNum = String(i + 1).padStart(2, '0');
            return '<div class="message-item">' +
                '<div class="message-item__avatar">' + initial + '</div>' +
                '<div class="message-item__body">' +
                    '<div class="message-item__header">' +
                        '<span class="message-item__name">' + escapeHtml(m.name) + '</span>' +
                        '<span class="message-item__time">' + formatDateTime(m.created_at) + '</span>' +
                    '</div>' +
                    '<div class="message-item__content">' + escapeHtml(m.content) + '</div>' +
                    '<div class="message-item__seat">♪ 加演第 ' + showNum + ' 场 · 座位 ' + seatLabel + '</div>' +
                '</div></div>';
        }).join('');
    }

    async function handleSubmit(e) {
        e.preventDefault();
        const nameEl = document.getElementById('msgName');
        const contentEl = document.getElementById('msgContent');
        const name = nameEl.value.trim();
        const content = contentEl.value.trim();

        if (!name || !content) return;

        const submitBtn = formEl.querySelector('button[type="submit"]');
        // 马上触发票根撕开动效
        if (submitBtn) {
            submitBtn.classList.add('is-torn');
        }
        
        // 1.2秒撕开动效结束后，触发幕布关闭动画
        setTimeout(function() {
            // 触发幕布关闭动画
            if (typeof ensureCurtain === 'function') {
                const curtain = ensureCurtain();
                curtain.style.display = 'block';
                void curtain.offsetWidth;
                curtain.classList.remove('curtain--open');
                curtain.classList.add('curtain--closing');
            }
            // 650毫秒幕布关闭动画结束后，切换内容
            setTimeout(function() {
                // 表单隐藏，感谢信显示
                formEl.style.display = 'none';
                showThankYouCard();
                // 触发幕布打开动画
                if (typeof ensureCurtain === 'function') {
                    const curtain = ensureCurtain();
                    void curtain.offsetWidth;
                    curtain.classList.remove('curtain--closing');
                    curtain.classList.add('curtain--open');
                    // 2.8秒幕布打开动画结束后，隐藏幕布
                    setTimeout(function() {
                        if (curtain && curtain.parentNode) curtain.style.display = 'none';
                    }, 2800);
                }
                // 移除撕开动效 class
                if (submitBtn) {
                    submitBtn.classList.remove('is-torn');
                }
            }, 650);
        }, 1200);
    }

    function showThankYouCard() {
        let card = document.getElementById('thankYouCard');
        if (!card) {
            card = document.createElement('div');
            card.id = 'thankYouCard';
            card.className = 'thank-you-card';
            card.innerHTML = `
                <div class="thank-you-card__postmark">
                    <span>RAINS THEATRE</span>
                    <span class="thank-you-card__postmark-text">ENCORE</span>
                    <span>2026</span>
                </div>
                <div class="thank-you-card__stamp">♪</div>
                <h3 class="thank-you-card__title">✦ 感谢你的留言 ✦</h3>
                <div class="thank-you-card__content">
                    <p>亲爱的观众：</p>
                    <p>你的留言已收到</p>
                    <p>主理人审核后将在观众席展示</p>
                    <p>感谢你为这场演出</p>
                    <p>增添了属于你的掌声</p>
                </div>
                <div class="thank-you-card__footer">—— Rains · 剧场主理人</div>
                <button type="button" class="btn-ticket thank-you-card__btn" id="writeAgainBtn">
                    <span class="btn-ticket__main">
                        <span>再写一句 →</span>
                        <span class="btn-ticket__sub">Write Again</span>
                    </span>
                </button>
            `;
            document.querySelector('.message-form-wrap').appendChild(card);
            
            // 绑定"再写一句"按钮点击事件
            const writeAgainBtn = document.getElementById('writeAgainBtn');
            if (writeAgainBtn) {
                writeAgainBtn.addEventListener('click', function() {
                    // 信封封口动效
                    card.classList.add('thank-you-card--sealing');
                    // 1.2秒动效结束后，触发幕布关闭动画
                    setTimeout(function() {
                        // 触发幕布关闭动画
                        if (typeof ensureCurtain === 'function') {
                            const curtain = ensureCurtain();
                            curtain.style.display = 'block';
                            void curtain.offsetWidth;
                            curtain.classList.remove('curtain--open');
                            curtain.classList.add('curtain--closing');
                        }
                        // 650毫秒幕布关闭动画结束后，切换内容
                        setTimeout(function() {
                            // 感谢信隐藏，表单显示
                            card.style.display = 'none';
                            card.classList.remove('thank-you-card--sealing');
                            formEl.style.display = 'block';
                            // 清空表单
                            document.getElementById('msgName').value = '';
                            document.getElementById('msgContent').value = '';
                            clearSeat();
                            // 触发幕布打开动画
                            if (typeof ensureCurtain === 'function') {
                                const curtain = ensureCurtain();
                                void curtain.offsetWidth;
                                curtain.classList.remove('curtain--closing');
                                curtain.classList.add('curtain--open');
                                // 2.8秒幕布打开动画结束后，隐藏幕布
                                setTimeout(function() {
                                    if (curtain && curtain.parentNode) curtain.style.display = 'none';
                                }, 2800);
                            }
                        }, 650);
                    }, 1700);
                });
            }
        }
        card.style.display = 'block';
    }

    function showToast(msg) {
        let toast = document.getElementById('msgToast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'msgToast';
            toast.style.cssText = 'position:fixed;bottom:100px;left:50%;transform:translateX(-50%);background:var(--spotlight);color:var(--stage);padding:12px 24px;border-radius:24px;font-family:var(--font-mono);font-size:0.85rem;z-index:9999;box-shadow:0 4px 20px rgba(245,197,24,0.3);transition:opacity 0.3s;opacity:0;';
            document.body.appendChild(toast);
        }
        toast.textContent = msg;
        toast.style.opacity = '1';
        setTimeout(function() { toast.style.opacity = '0'; }, 2500);
    }

    function init() {
        formEl = document.getElementById('messageForm');
        wallEl = document.getElementById('messageWall');
        if (formEl) formEl.addEventListener('submit', handleSubmit);

        // 渲染座位图
        generateSeatMap();
        const randomBtn = document.getElementById('randomSeatBtn');
        const clearBtn = document.getElementById('clearSeatBtn');
        if (randomBtn) randomBtn.addEventListener('click', randomSeat);
        if (clearBtn) clearBtn.addEventListener('click', clearSeat);

        loadMessages();
    }

    function cleanup() {
        if (formEl) formEl.removeEventListener('submit', handleSubmit);
        formEl = null;
        wallEl = null;
        selectedSeat = '';
        occupiedSeats.clear();
    }

    window.RainsRouter.registerPage('audience', init, cleanup);
})();
