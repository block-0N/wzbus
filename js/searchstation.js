const APP_BASE = (() => {
    if (!/\.github\.io$/i.test(location.hostname)) return '';
    const seg = location.pathname.split('/').filter(Boolean);
    return seg.length ? '/' + seg[0] : '';
})();
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.station-table tbody tr').forEach(tr => {
        const stationName = tr.querySelectorAll('td')[1].textContent.trim();
        const station = siteNames.find(item => item.name === stationName);
        tr.style.cursor = 'pointer';
        tr.onclick = () => station
            ? window.location.href = `${APP_BASE}/stations/${station.name}.html`
            : window.location.href = `${APP_BASE}/404.html`;
    });
});