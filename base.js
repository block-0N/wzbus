const repo = "填你的仓库名";
const host = location.hostname;
let baseHref;
if (host.includes("github.io")) {
    baseHref = `/${repo}/`;
} else if (location.protocol === "file:") {
    baseHref = "/其他/bus/";
} else {
    baseHref = "./";
}
const base = document.createElement('base');
base.href = baseHref;
document.head.prepend(base);