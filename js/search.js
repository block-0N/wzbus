// function loadRouteDirections() {
//     const rows = document.querySelectorAll('.station-table tbody tr');

//     rows.forEach(tr => {
//         const routeName = tr.querySelector('td b').textContent.trim();
//         const directionCell = tr.querySelectorAll('td')[1];

//         const route = busRoutes.find(item => item.name === routeName);

//         if (route && route.desc) {
//             const reg = /[:：]\s*([^，,]+)/;
//             const match = route.desc.match(reg);
//             if (match && match[1]) {
//                 directionCell.textContent = match[1].trim();
//             }
//         }
//     });
// }

// function bindRowClick() {
//     document.querySelectorAll('.station-table tbody tr').forEach(tr => {
//         const routeName = tr.querySelector('td b').textContent.trim();
//         const route = busRoutes.find(item => item.name === routeName);

//         tr.style.cursor = 'pointer';

//         if (route) {
//             const overview = `https://wiki.wzbus.net/wiki/${ritem.area}公交${ritem.name}`;
//             tr.onclick = () => window.location.href = overview;
//         } else {
//             tr.onclick = () => window.location.href = '../404.html';
//         }
//     });
// }

// document.addEventListener('DOMContentLoaded', function () {
//     loadRouteDirections();
//     bindRowClick();
// });
document.addEventListener('DOMContentLoaded', function () {
    const currentStationName = document.querySelector('h1').textContent;
    const stationData = siteNames.find(item => item.name === currentStationName);
    if (stationData) {
        const routes = stationData.routes;
        const allRoutes = Object.entries(routes).flatMap(([key, paths]) => paths.map(p => `${key}公交${p}`));
        const colNodes = document.querySelectorAll('.station-col');
        const leftTbody = colNodes[0].querySelector('tbody');
        const rightTbody = colNodes[1].querySelector('tbody');
        leftTbody.innerHTML = '';
        rightTbody.innerHTML = '';

        const splitPoint = Math.ceil(allRoutes.length / 2);
        const leftList = allRoutes.slice(0, splitPoint);
        const rightList = allRoutes.slice(splitPoint);

        function createLineRow(routeText) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td><b>${routeText}</b></td><td></td>`;
            return tr;
        }

        leftList.forEach(line => leftTbody.appendChild(createLineRow(line)));
        rightList.forEach(line => rightTbody.appendChild(createLineRow(line)));
    }
    const rows = document.querySelectorAll('.station-table tbody tr');
    rows.forEach(tr => {
        const routeName = tr.querySelector('td b').textContent.trim();
        const directionCell = tr.querySelectorAll('td')[1];
        const route = busRoutes.find(item => item.name === routeName);
        if (route && route.desc) {
            const reg = /[:：]\s*([^，,]+)/;
            const match = route.desc.match(reg);
            if (match && match[1]) {
                directionCell.textContent = match[1].trim();
            }
        }
    });
    document.querySelectorAll('.station-table tbody tr').forEach(tr => {
        const routeName = tr.querySelector('td b').textContent.trim();
        const route = busRoutes.find(item => item.area + '公交' + item.name == routeName);
        tr.style.cursor = 'pointer';
        if (route) {
            const overview = `https://wiki.wzbus.net/wiki/${route.area}公交${route.name}`;
            tr.onclick = () => window.location.href = overview;
        } else
            tr.onclick = () => window.location.href = '../404.html';
    });

});
