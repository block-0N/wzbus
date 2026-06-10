function highlightKeyword(text, keyword) {
    if (!keyword) return text;
    const reg = new RegExp(keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    return text.replace(reg, (match) => `<span class="highlight">${match}</span>`);
}

function searchRoute() {
    const searchInput = document.getElementById('search-input');
    const resultContainer = document.getElementById('search-result');
    const keyword = searchInput.value.trim().toLowerCase();

    resultContainer.innerHTML = '';
    resultContainer.style.display = 'none';

    if (!keyword) {
        alert('请输入公交线路号、区域或关键词（如：5路、龙港、K001）');
        return;
    }

    const matchedRoutes = busRoutes.filter(route => {
        return route.name.toLowerCase().includes(keyword) ||
            route.alias.some(alias => alias.toLowerCase().includes(keyword)) ||
            route.area.toLowerCase().includes(keyword) ||
            route.desc.toLowerCase().includes(keyword);
    });
    const matchedSites = siteNames.filter(site =>
        site.toLowerCase().includes(keyword)
    )
    if (matchedRoutes.length > 0 || matchedSites.length > 0) {
        resultContainer.style.display = 'block';
        if (matchedRoutes.length > 0) {
            const titleDom = document.createElement('h2');
            titleDom.innerText = '匹配公交线路';
            titleDom.style.marginLeft = '1em';
            resultContainer.appendChild(titleDom);
            matchedRoutes.forEach(route => {
                const item = document.createElement('div');
                item.className = 'search-result-item';
                const title = highlightKeyword(route.name, keyword);
                const desc = highlightKeyword(route.desc, keyword);
                item.innerHTML = `
                        <div class="item-content">
                            <h4>${title}</h4>
                            <div class="result-desc">${desc}</div>
                        </div>
                        <div class="item-buttons">
                            <button class="item-btn" onclick="openUrl('${route.povUrl}')">POV</button>
                            <button class="item-btn" onclick="openUrl('${route.routeUrl}')">线路图</button>
                            <button class="item-btn" onclick="openUrl('${route.overviewUrl}')">概况</button>
                        </div>
                    `;
                item.querySelector('.item-content').onclick = () => {
                    window.open(route.url, '_blank');
                    searchInput.value = '';
                    resultContainer.style.display = 'none';
                };
                resultContainer.appendChild(item);
            });
        }
        if (matchedSites.length > 0) {
            const titleDom = document.createElement('h2');
            titleDom.innerText = '匹配站点信息';
            titleDom.style.marginLeft = '1em';
            resultContainer.appendChild(titleDom);
            matchedSites.forEach(siteName => {
                const siteItem = document.createElement('div');
                siteItem.className = 'search-result-item';
                const siteTitle = highlightKeyword(siteName, keyword);
                siteItem.innerHTML = `
                        <div class="item-content">
                            <h4>${siteTitle}</h4>
                        </div>
                `
                siteItem.onclick = () => {
                    const targetUrl = `./stationinfo/${siteName}.html`;
                    openUrl(targetUrl);
                };
                resultContainer.appendChild(siteItem);
            });
        }
    } else {
        resultContainer.style.display = 'block';
        resultContainer.innerHTML = `<div class="no-result">未找到"${keyword}"相关线路或站点，可尝试输入：龙港5路、苍人民路车站</div>`;
    }
}

function openUrl(url) {
    window.open(url, '_blank');
    document.getElementById('search-input').value = '';
    document.getElementById('search-result').style.display = 'none';
}

document.getElementById('search-input').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        searchRoute();
    }
});

document.addEventListener('click', function (e) {
    const searchContainer = document.querySelector('.search-container');
    const resultContainer = document.getElementById('search-result');
    if (!searchContainer.contains(e.target)) {
        resultContainer.style.display = 'none';
    }
});

document.getElementById('search-input').addEventListener('input', function () {
    if (this.value.trim().length >= 1) {
        searchRoute();
    } else {
        document.getElementById('search-result').style.display = 'none';
    }
});

window.searchRoute = searchRoute;
window.openUrl = openUrl;