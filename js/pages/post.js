/**
 * 文章详情页初始化逻辑
 */
(function() {
    'use strict';

    function init(params) {
        const slug = params.slug;
        if (!slug) {
            document.getElementById('postContainer').innerHTML = 
                renderProgrammeCard('', '', '', '', '', '未找到剧目', '请从剧目表选择一场演出', '');
            return;
        }

        // 加载文章内容
        PublicAPI.getPost(slug)
            .then(function(post) {
                renderPost(post);
            })
            .catch(function(err) {
                console.error('Failed to load post:', err);
                document.getElementById('postContainer').innerHTML = 
                    renderProgrammeCard('', '', '', '', '', '演出加载失败', '请稍后再试', '');
            });
    }

    // 节目单卡片模板
    function renderProgrammeCard(showNumber, dateStr, readTime, seat, title, excerpt, content, category) {
        return `
        <!-- 节目单卡片 -->
        <div style="
            background: #F5F0E1;
            border: 2px solid var(--gold);
            outline: 1px solid rgba(212, 160, 23, 0.3);
            outline-offset: 4px;
            border-radius: 6px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
            padding: 50px 60px;
            position: relative;
        ">
            
            <!-- 页眉：幕布 + 剧院名 -->
            <div style="text-align: center; margin-bottom: 30px;">
                <!-- 小幕布简笔画 -->
                <svg width="80" height="30" viewBox="0 0 80 30" fill="none" style="margin-bottom: 10px;">
                    <!-- 左幕布 -->
                    <path d="M0,5 L25,5 L20,25 L0,25 Z" fill="#8B1A1A"/>
                    <!-- 右幕布 -->
                    <path d="M80,5 L55,5 L60,25 L80,25 Z" fill="#8B1A1A"/>
                    <!-- 中间拉开的部分 -->
                    <rect x="25" y="5" width="30" height="20" fill="transparent"/>
                </svg>
                <p style="font-family: var(--font-display); font-size: 1.1rem; font-weight: 700; color: var(--gold); letter-spacing: 0.3em; margin: 0;">
                    RAINS THEATRE
                </p>
                <p style="font-family: var(--font-mono); font-size: 0.65rem; color: #666; letter-spacing: 0.2em; margin: 5px 0 0 0;">
                    2026 SEASON
                </p>
            </div>

            <!-- 标题区 -->
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="
                    font-family: var(--font-display);
                    font-size: clamp(1.8rem, 3vw, 2.5rem);
                    font-weight: 700;
                    color: #2A2A2A;
                    margin: 0 0 15px 0;
                    line-height: 1.3;
                ">${title}</h1>

                <!-- 标题两侧小音符 -->
                <div style="display: flex; align-items: center; justify-content: center; gap: 15px; margin-bottom: 15px;">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--gold)" opacity="0.6">
                        <circle cx="9" cy="17" r="2.5"/>
                        <line x1="11.5" y1="17" x2="11.5" y2="5"/>
                    </svg>
                    <!-- 五线谱分隔线 -->
                    <div style="flex: 1; max-width: 200px;">
                        <div style="height: 1px; background: var(--gold); opacity: 0.5; margin: 2px 0;"></div>
                        <div style="height: 1px; background: var(--gold); opacity: 0.5; margin: 2px 0;"></div>
                        <div style="height: 1px; background: var(--gold); opacity: 0.5; margin: 2px 0;"></div>
                        <div style="height: 1px; background: var(--gold); opacity: 0.5; margin: 2px 0;"></div>
                        <div style="height: 1px; background: var(--gold); opacity: 0.5; margin: 2px 0;"></div>
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="var(--gold)" opacity="0.6">
                        <circle cx="9" cy="17" r="2.5"/>
                        <line x1="11.5" y1="17" x2="11.5" y2="5"/>
                        <path d="M11.5 5 C 14 5, 15 7, 15 9"/>
                    </svg>
                </div>
            </div>

            <!-- 演出信息栏 -->
            <div style="
                display: flex;
                justify-content: center;
                gap: 2rem;
                flex-wrap: wrap;
                font-family: var(--font-mono);
                font-size: 0.75rem;
                color: #666;
                margin-bottom: 30px;
                padding-bottom: 20px;
                border-bottom: 1px solid rgba(212, 160, 23, 0.2);
            ">
                ${showNumber ? `<span>🎭 第 ${showNumber} 场演出</span>` : ''}
                ${dateStr ? `<span>📅 ${dateStr}</span>` : ''}
                ${readTime ? `<span>⏱️ 演出时长 ${readTime} 分钟</span>` : ''}
                ${seat ? `<span>🎫 座位 ${seat}</span>` : ''}
                ${category ? `<span>🏷️ ${category}</span>` : ''}
            </div>

            <!-- 摘要 -->
            ${excerpt ? `
            <div style="
                text-align: center;
                font-style: italic;
                color: #555;
                margin-bottom: 35px;
                padding: 0 2rem;
                font-size: 1.05rem;
                line-height: 1.7;
            ">
                ${excerpt}
            </div>
            ` : ''}

            <!-- 正文内容 -->
            <article style="
                line-height: 1.9;
                color: #2A2A2A;
                font-size: 1.05rem;
                max-width: 750px;
                margin: 0 auto;
            ">
                ${content || '<p style="text-align: center; color: #999;">暂无内容</p>'}
            </article>

            <!-- 页脚：幕布下摆 + 结束语 -->
            <div style="text-align: center; margin-top: 40px; padding-top: 30px; border-top: 1px solid rgba(212, 160, 23, 0.2);">
                <!-- 小幕布下摆简笔画 -->
                <svg width="80" height="25" viewBox="0 0 80 25" fill="none" style="margin-bottom: 15px;">
                    <!-- 左幕布下摆 -->
                    <path d="M0,0 L25,0 L20,25 Q10,20 0,25 Z" fill="#8B1A1A" opacity="0.8"/>
                    <!-- 右幕布下摆 -->
                    <path d="M80,0 L55,0 L60,25 Q70,20 80,25 Z" fill="#8B1A1A" opacity="0.8"/>
                </svg>
                <p style="font-family: var(--font-mono); font-size: 0.75rem; color: #666; letter-spacing: 0.3em; margin: 0 0 10px 0;">
                    — THANK YOU FOR COMING —
                </p>
                <p style="font-family: var(--font-script); font-size: 1.4rem; color: var(--gold); margin: 0;">
                    Curtain Call
                </p>
            </div>

        </div>
        `;
    }

    function renderPost(post) {
        const container = document.getElementById('postContainer');
        const date = new Date(post.created_at);
        const dateStr = date.toLocaleDateString('zh-CN', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });

        container.innerHTML = renderProgrammeCard(
            '001',  // 场次
            dateStr,  // 演出日期
            post.read_time || 5,  // 阅读时间
            'A-01',  // 座位号
            post.title,  // 标题
            post.excerpt || '',  // 摘要
            post.content || '',  // 正文
            post.category || ''  // 分类
        );
    }

    function cleanup() {}

    window.RainsRouter.registerPage('post', init, cleanup);
})();
