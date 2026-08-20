const siteNames_old = [
    {
        "name": "龙港客运中心",
        "routes": {
            "龙港": [
                "1路",
                "2路",
                "5路",
                "7路",
                "9路",
                "B1路",
                "D01路",
                "K001路",
                "K002路",
                "K003路",
                "801路",
                "802路",
                "807路",
                "808路",
                "温州-龙港班线"
            ],
            "苍南": [
                "K001路"
            ]
        }
    },
    {
        "name": "龙跃路口"
    },
    {
        "name": "青龙湖实验室"
    },
    {
        "name": "人民路车站"
    },
    {
        "name": "温医大附一院龙港院区"
    },
    {
        "name": "新城华府"
    }
];
let siteNames = [];
async function loadStationData() {
    const { data, error } = await sb.from("station_list").select("*").order("name");
    if (error) console.error("站点加载失败", error);
    siteNames = data || [];
}
(async () => {
    await loadStationData();
    console.log("siteNames加载完成", siteNames);
})();