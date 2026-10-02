/*
 * Rains Blog 本地冒烟测试
 * 用法：npm run test:smoke
 * 可用 SMOKE_BASE_URL 指向候选端口，例如 http://127.0.0.1:3003
 */
'use strict';

const baseUrl = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:' + (process.env.PORT || '3002')).replace(/\/$/, '');

const checks = [
    { path: '/api/health', status: 200, json: value => value && value.status === 'ok' },
    { path: '/api/posts', status: 200, json: value => Array.isArray(value && value.posts) && value.posts.every(post => post.status === 'published') },
    { path: '/api/projects', status: 200, json: value => Array.isArray(value && value.projects) },
    { path: '/api/friends', status: 200, json: value => Array.isArray(value && value.friends) },
    { path: '/api/recommendations', status: 200, json: value => Array.isArray(value && value.recommendations) },
    { path: '/api/messages', status: 200, json: value => Array.isArray(value && value.messages) },
    { path: '/api/posts/private-article', status: 404 },
    { path: '/api/posts/draft-article', status: 404 },
    { path: '/', status: 200, html: text => text.includes('Rains') },
    { path: '/posts.html', status: 200, html: text => text.includes('id="app"') },
    { path: '/archive.html', status: 200, html: text => text.includes('id="app"') },
    { path: '/recommendations.html', status: 200, html: text => text.includes('id="app"') }
];

async function run() {
    let failed = 0;
    for (const check of checks) {
        const url = baseUrl + check.path;
        try {
            const response = await fetch(url);
            const body = await response.text();
            if (response.status !== check.status) {
                throw new Error('expected HTTP ' + check.status + ', got ' + response.status);
            }
            if (check.json) {
                let value;
                try { value = JSON.parse(body); } catch (error) { throw new Error('response is not JSON'); }
                if (!check.json(value)) throw new Error('JSON shape check failed');
            }
            if (check.html && !check.html(body)) throw new Error('HTML content check failed');
            console.log('PASS', check.path);
        } catch (error) {
            failed += 1;
            console.error('FAIL', check.path + ':', error.message);
        }
    }
    if (failed) {
        console.error('\nSmoke test failed:', failed + '/' + checks.length);
        process.exitCode = 1;
        return;
    }
    console.log('\nSmoke test passed:', checks.length + '/' + checks.length, 'at', baseUrl);
}

run().catch(error => {
    console.error('Smoke test could not start:', error.message);
    process.exitCode = 1;
});
