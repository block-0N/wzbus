document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.station-table tbody tr').forEach(tr => {
        const stationName = tr.querySelectorAll('td')[1].textContent.trim();
        const station = siteNames.find(item => item === stationName);
        tr.style.cursor = 'pointer';
        tr.onclick = () => station ? window.location.href = `./stationinfo/${station}.html` : `404.html`;
    });
});