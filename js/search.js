const APP_BASE = (() => {
    if (!/\.github\.io$/i.test(location.hostname)) return '';
    const seg = location.pathname.split('/').filter(Boolean);
    return seg.length ? '/' + seg[0] : '';
})();

// 等待 siteNames + busRoutes 就绪（两者都是异步加载）
async function waitDataReady(timeoutMs = 5000) {
    const start = Date.now();
    while ((siteNames.length === 0 || busRoutes.length === 0)
           && Date.now() - start < timeoutMs) {
        await new Promise(r => setTimeout(r, 100));
    }
}

document.addEventListener('DOMContentLoaded', async function () {
    await waitDataReady();
    initStationPage();
});

function initStationPage() {
    const h1 = document.querySelector('h1');
    if (!h1) return;
    const currentStationName = h1.textContent.trim();
    const stationData = siteNames.find(item => item.name === currentStationName);

    // 1. 重建表格（若站点有 routes 数据）
    if (stationData && stationData.routes) {
        const routes = stationData.routes;
        const allRoutes = Object.entries(routes)
            .flatMap(([key, paths]) => paths.map(p => `${key}公交${p}`));
        const colNodes = document.querySelectorAll('.station-col');
        if (colNodes.length >= 2) {
            const leftTbody  = colNodes[0].querySelector('tbody');
            const rightTbody = colNodes[1].querySelector('tbody');
            if (leftTbody && rightTbody) {
                leftTbody.innerHTML  = '';
                rightTbody.innerHTML = '';

                const splitPoint = Math.ceil(allRoutes.length / 2);
                const leftList  = allRoutes.slice(0, splitPoint);
                const rightList = allRoutes.slice(splitPoint);

                const createLineRow = (routeText) => {
                    const tr = document.createElement('tr');
                    tr.innerHTML = `<td><b>${routeText}</b></td><td></td>`;
                    return tr;
                };

                leftList.forEach(line  => leftTbody.appendChild(createLineRow(line)));
                rightList.forEach(line => rightTbody.appendChild(createLineRow(line)));
            }
        }
    }

    // 2. 填充方向
    const DIR_REGEX = /[:：]\s*([^，,]+)/;
    document.querySelectorAll('.station-table tbody tr').forEach(tr => {
        const bEl  = tr.querySelector('td b');
        const tds  = tr.querySelectorAll('td');
        if (!bEl || tds.length < 2) return;

        const routeName = bEl.textContent.trim();
        const directionCell = tds[1];
        const route = busRoutes.find(item =>
            item.area + '公交' + item.name === routeName);

        if (route && route.desc) {
            const match = route.desc.match(DIR_REGEX);
            if (match && match[1]) {
                directionCell.textContent = match[1].trim();
            }
        }
    });

    // 3. 绑定点击
    document.querySelectorAll('.station-table tbody tr').forEach(tr => {
        const bEl = tr.querySelector('td b');
        if (!bEl) return;

        const routeName = bEl.textContent.trim();
        const route = busRoutes.find(item =>
            item.area + '公交' + item.name === routeName);

        tr.style.cursor = 'pointer';
        if (route) {
            const overview = `https://wiki.wzbus.net/wiki/${route.area}公交${route.name}`;
            tr.onclick = () => window.open(overview, '_blank');
        } else {
            tr.onclick = () => window.location.href = APP_BASE + '/404.html';
        }
    });
}