const areaToPinyin = {
    "龙港": "longgang",
    "苍南": "cangnan",
    "平阳": "pingyang",
    "瑞安": "ruian",
    "乐清": "yueqing",
    "永嘉": "yongjia",
    "温州": "wenzhou",
    "文成": "wencheng",
    "泰顺": "taishun"
};
/**
 * 
 * @param {string} str 
 * @returns {string}
 */
function StringToUrl(str) {
    const baseUrl = {
        "BV": "https://www.bilibili.com/video/",
        "w": "https://mmbiz.qpic.cn/sz_mmbiz_png/"
    };
    if (str.startsWith("BV")) {
        return baseUrl["BV"] + str;
    } else if (str.startsWith("w")) {
        return baseUrl["w"] + str.slice(2) + '/';
    } else if (str.startsWith("bm")) {
        const sParam = encodeURIComponent(`bsl&bsltp=0&uid=${str.slice(3)}&c=178`);
        return `https://map.baidu.com/?newmap=1&t=B_NORMAL_MAP&s=${sParam}&tpl=map_bus`;
    }
}
let busRoutes = [], flag = false;
async function loadBusRoutes() {
    const { data, error } = await sb.from("bus_routes").select("*");
    if (error) console.error("线路加载失败", error);
    busRoutes = data || [];
}
(async () => {
    await loadBusRoutes();
    console.log("busRoutes加载完成");
    console.table(busRoutes);
    setFlag(true);
})();
const flagEvent = new EventTarget();
/**
 * @param {boolean} value
 */
function setFlag(value) {
    flag = value;
    if (value === true) {
        flagEvent.dispatchEvent(new Event('flagIsTrue'));
    }
}
/**
 * 等待flag变为true，带超时保护
 * @param {number} timeout - 最大等待毫秒数，超时则抛出错误
 * @returns {Promise<void>}
 */
function waitFlagTrue(timeout) {
    return new Promise((resolve, reject) => {
        if (flag === true) {
            resolve();
            return;
        }
        const timeoutTimer = setTimeout(() => {
            flagEvent.removeEventListener('flagIsTrue', onFlagTrigger);
            reject(new Error('等待flag超时'));
        }, timeout);
        function onFlagTrigger() {
            clearTimeout(timeoutTimer);
            resolve();
        }
        flagEvent.addEventListener('flagIsTrue', onFlagTrigger);
    });
}
/**
 * @param {() => void} cb - 无参回调函数
 */
async function runRender(cb) {
    // 运行时安全校验：确保传入的是函数
    if (typeof cb !== 'function') {
        console.warn('runTask：cb必须传入函数');
        return;
    }
    try {
        console.log('开始等待flag，最多等待5000毫秒');
        await waitFlagTrue(5000);
        console.log('flag为true，执行回调');
        cb(); // ✅ 无参数调用
    } catch (error) {
        console.error(error.message);
    }
}
/**
 * @param {(str1: string, str2: string) => void} cb - 回调函数，接收两个字符串参数
 * @param {string} str1 - 传给回调的第一个字符串
 * @param {string} str2 - 传给回调的第二个字符串
 */
async function runTask(cb, str1, str2) {
    if (typeof cb !== 'function') {
        console.warn('runTask：第一个参数必须传入函数');
        return;
    }
    try {
        console.log('开始等待flag，最多等待5000毫秒');
        await waitFlagTrue(5000);
        console.log('flag为true，执行回调');
        cb(str1, str2);
    } catch (error) {
        console.error(error.message);
    }
}
const busRoutes_old = [
    {
        "name": "1路",
        "area": "龙港",
        "desc": "龙港1路：龙港客运中心 - 现代印务港，途经人民路、世纪大道、新城产业园，覆盖龙港主城区与新城核心产业区",
        "pov": "BV1c6U5BAEA6",
        "route": "w:ro8I65aPUwnIQgdCq8PuPtbba8FBXP4xkcGQSzVwksZwUDP8euexq1q01N1meCySvjsA0tSgwicyD4ZE85qGDRw"
    },
    {
        "name": "2路",
        "area": "龙港",
        "desc": "龙港2路：龙港客运中心 - 经济产业发展中心，途经龙翔路、临港大道，覆盖龙港主城区与新城住宅区",
        "pov": "BV1QqqrBfEJh",
        "route": "bm:7dbcc3b69768d5cf130daad7"
    },
    {
        "name": "5路",
        "area": "龙港",
        "desc": "龙港5路：龙港客运中心 - 青龙湖实验室，世纪大道主干线，接驳温医大附一院龙港院区、政务客厅、新城片区",
        "pov": "BV1xBrDB9EfZ",
        "route": "bm:07c8bdd7f3a0c16be01103e7"
    },
    {
        "name": "6路",
        "area": "龙港",
        "desc": "龙港6路：城中首末站 - 陈家堡，途经龙港城区、埭金线",
        "pov": "BV1Pe5T6PESs",
        "route": "bm:e1218d013daf92bf1d580001"
    },
    {
        "name": "7路",
        "area": "龙港",
        "desc": "龙港7路：龙港客运中心 - 陈处社区，途经苍南县钱库镇，是芦浦、海城等片区前往龙港城区的主干线路之一",
        "pov": "BV1a7BxBnEPB",
        "route": "bm:560155ad3106fc7f047ce8e0"
    },
    {
        "name": "8路",
        "area": "龙港",
        "desc": "【已停运】龙港8路（园博会专线）：城市公园 - 体育中心，园博公交接驳专线，途经青龙湖、图书馆、月湖公园",
        "pov": "BV1g7QJBPErF",
        "route": "w:1hHpFxg2JumHg3oPqCAQVQKZjQNsTkrQ6rQYQ6ZGEzibiczqWM1jibPpeMRibChMt5clyjcEfIHujkK9rL9XItpNibOgvqrhSWicSF33V4pBFj0w0"
    },
    {
        "name": "9路",
        "area": "龙港",
        "desc": "龙港9路：龙港客运中心 - 新城华府，连接龙港城区、白沙、海城、芦浦及舥艚，是龙翔路的主干线路",
        "pov": "BV17gCQBSEQm",
        "route": "bm:4a8ffef3d8a732ecc4f025cb"
    },
    {
        "name": "10路",
        "area": "龙港",
        "desc": "龙港10路：月湖公园 - 礼品城，连接龙港新城中央商务区、城东工业园区、人民路、龙港大道及礼品城",
        "pov": "BV12FuA6GEZm",
        "route": "bm:bd27ca067379884eed74f820"
    },
    {
        "name": "11路",
        "area": "龙港",
        "desc": "龙港11路：城中首末站 - 上对口，途经人民路、镇前路、西一路、东新街、湖振线、湖前",
        "pov": "BV1uzmqBMEuH",
        "route": "w:2zUuK4nSAefmMZSP37MJsiaoXX6PWnYfiae9jichiaSibbEssXoqoarC8vzjtgoEcXj2icGghg4LpLCpZn7EbBRYzmRNgMxjFu1Vat2YoeqOaYibjE"
    },
    {
        "name": "12路",
        "area": "龙港",
        "desc": "龙港12路：韩家垟 - 姜立夫故居，连接韩家垟、人民路、西一街、客运中心、金田集团、新雅工业园、小微企业创业园、凰浦及麟头",
        "pov": "BV1n3mABbEDH",
        "route": ""
    },
    {
        "name": "13路",
        "area": "龙港",
        "desc": "【已停运】龙港13路：城中首末站 - 姜立夫故居，途经西三街、龙港大道、姜立夫故居、中对口社区、江山社区、湖前",
        "pov": "BV1FCydBqET6",
        "route": ""
    },
    {
        "name": "15路",
        "area": "龙港",
        "desc": "龙港15路：城中首末站 - 长连屋，城郊居民区接驳线，连接三垟社区、湖前",
        "pov": "BV1VkxEzoEHD",
        "route": ""
    },
    {
        "name": "16路",
        "area": "龙港",
        "desc": "龙港16路：城中首末站 - 龙源社区，连接三垟社区、湖前、中对口社区",
        "pov": "BV1gTw1zAEaJ",
        "route": "w:2zUuK4nSAecMgXlkShajuVBkEphd93drrojyxTW9m1SOCnUTwZKQMxibDwxmleBFfK6vroOtvlhW58uDiaYx1hEF4ndVES1icagbbFqKQa3mlA"
    },
    {
        "name": "17路",
        "area": "龙港",
        "desc": "龙港17路：温州医科大学附属第一医院龙港院区 - 滨江社区，途径新城大道、世纪大道、人民路、通港路、西一路、宜山镇",
        "pov": "BV1qRCQBUETX",
        "route": ""
    },
    {
        "name": "A1路",
        "area": "龙港",
        "desc": "龙港A1路：江滨公园 - 新鸿世纪广场，夜间覆盖的社区便民线，支持招手即停",
        "pov": "",
        "route": ""
    },
    {
        "name": "A2路",
        "area": "龙港",
        "desc": "龙港A2路：财富广场 - 经济产业发展中心，夜间覆盖的社区便民线，支持招手即停",
        "pov": "",
        "route": ""
    },
    {
        "name": "A5路",
        "area": "龙港",
        "desc": "龙港A5路：政务客厅首末站环线，市区西环线社区巴士",
        "pov": "BV1W92YBEE9A",
        "route": "w:2zUuK4nSAefMRkneRuJ34iar2AdD4KXOyxPUDWT7HUF6GA3udXH9qlY3zGlR2z625J3TqYibibQ0tqOE2X0ibe3dibz7MicAxWcobIvdmkoVtxmnE"
    },
    {
        "name": "A6路",
        "area": "龙港",
        "desc": "龙港A6路：政务客厅首末站环线，市区北环线社区巴士",
        "pov": "",
        "route": "w:2zUuK4nSAefWdlicj0Vjzt18RMEKoKj08mDOlZjYl6bmpeBscwwj8NQbfvxfiaC2PsasHn41z5BjhDUj5YLYvxgbF25EaWuicCToPicPp4p7icvA"
    },
    {
        "name": "B1路",
        "area": "龙港",
        "desc": "龙港B1路：龙港客运中心 - 政务客厅首末站，途径龙港卫生院、西排社区、财富广场、城中首末站、东城园区的社区巴士",
        "pov": "BV1fZNH6rEUg",
        "route": ""
    },
    {
        "name": "B2路",
        "area": "龙港",
        "desc": "龙港B2路：温州医科大学附属第一医院龙港院区 - 江滨公园，途径新鸿未来城、政务客厅、东城园区、龙跃路口、中西医结合医院的社区巴士",
        "pov": "",
        "route": ""
    },
    {
        "name": "B3路",
        "area": "龙港",
        "desc": "龙港B3路：薛家桥社区 - 江滨公园，途径体育馆、城市公园、城中首末站、财富广场、中西医结合医院的社区巴士",
        "pov": "",
        "route": ""
    },
    {
        "name": "B5路",
        "area": "龙港",
        "desc": "龙港B5路：湖前西桥首末站 - 祥龙里公交首末站，连接湖前、客运中心、财富广场、人民路、政务客厅与龙港新城中央商务区，湖前—老城—新城社区巴士",
        "pov": "",
        "route": ""
    },
    {
        "name": "B11路",
        "area": "龙港",
        "desc": "龙港B11路：温州医科大学附属第一医院龙港院区 - 新城华府，舥艚—新城社区巴士",
        "pov": "",
        "route": "bm:ca7f4d493ded1a3f96f08c0e"
    },
    {
        "name": "B12路",
        "area": "龙港",
        "desc": "【已废弃】龙港B12路：三园社区 - 政务客厅首末站，计划开通但未有实施的线路，现已被废弃",
        "pov": "",
        "route": ""
    },
    {
        "name": "D01路",
        "area": "龙港",
        "desc": "龙港D01路：龙港客运中心 - 青龙湖实验室，龙港东部通勤快线",
        "pov": "BV1c142187w7",
        "route": ""
    }
];
busRoutes.forEach(item => { if (item.name === "") console.log(StringToUrl(item.route)); });