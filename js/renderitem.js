const typetochar = {
    "pov": "公交视频",
    "route": "公交线路图",
    "overview": "线路概况"
}
function renderitem(areaname, type) {
    const listContainer = document.querySelector('.bus-list');
    if (!listContainer) {
        console.log('listContainer不见了');
        return;
    }
    console.log('条目渲染中，参数为', areaname, type);
    let num = 0;
    busRoutes.forEach(route => {
        if (!route.area.includes(areaname)) return console.log(route.area + '不是');
        if ((!route[type] || route[type].includes('404.html')) && type !== 'overview') return;
        if (route.desc.includes('已停运')) return;
        const url = type === 'overview' ? `https://wiki.wzbus.net/wiki/${route.area}公交${route.name}` : StringToUrl(route[type]);
        const li = document.createElement('li');
        li.className = 'bus-item';
        li.onclick = () => openUrl(url);
        const a = document.createElement('a');
        a.className = 'bus-link';
        a.textContent = route.area + route.name + typetochar[type];
        li.appendChild(a);
        listContainer.appendChild(li);
        console.log(route.area + route.name + '已渲染');
        num++;
    });
    if (num === 0) console.log("暂无公交线路，快来添加", "color:red;");
    else console.log(`%c渲染了${num}条线路`, "color:green;");

}