// busAutoRender.js
(function () {
    function groupByArea(routes) {
        const group = {};
        routes.forEach(item => {
            if (!group[item.area]) group[item.area] = [];
            group[item.area].push(item);
        });
        return group;
    }

    function makeDesc(list) {
        const names = list.slice(0, 3).map(item => item.name.replace("公交", ""));
        return `${names.join("、")}等多条公交线路`;
    }

    function createAreaLi(areaName, areaRoutes, type) {
        const pinyin = areaToPinyin[areaName];
        if (!pinyin) return "";

        let pageName, titleText;
        switch (type) {
            case "pov":
                pageName = `pov.html`;
                titleText = `${areaName}公交POV合集`;
                break;
            case "route":
                pageName = `route.html`;
                titleText = `${areaName}公交路线图合集`;
                break;
            case "intro":
                pageName = `introduction.html`;
                titleText = `${areaName}公交线路概况合集`;
                break;
            default:
                return "";
        }

        const descText = makeDesc(areaRoutes);
        return `
            <li class="area-item">
                <a href="./areas/${pinyin}/${pageName}" class="area-link" rel="noopener noreferrer">
                    ${titleText}
                </a>
                <p class="area-desc">${descText}的${type === "pov" ? "POV视频" : type === "route" ? "路线图" : "概况"}</p>
            </li>
        `;
    }

    function renderBlock(h2Text, type) {
        const allH2 = document.querySelectorAll("h2");
        let targetUl = null;
        for (const h2 of allH2) {
            if (h2.textContent.trim() === h2Text) {
                targetUl = h2.nextElementSibling;
                break;
            }
        }
        if (!targetUl || targetUl.tagName !== "UL") return;
        targetUl.innerHTML = "";
        const areaGroups = groupByArea(busRoutes);
        Object.keys(areaGroups).forEach(area => {
            const liHtml = createAreaLi(area, areaGroups[area], type);
            if (liHtml) targetUl.innerHTML += liHtml;
        });
    }
    window.addEventListener("DOMContentLoaded", () => {
        runTask(renderBlock, "POV视频合集", "pov");
        runTask(renderBlock, "路线图合集", "route");
        runTask(renderBlock, "线路概况合集", "intro");
    });
})();