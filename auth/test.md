# 改造方案：站点可视化编辑器

目标：**不用手动手写 JSON**，可视化添加区域 + 线路列表，底层自动生成 `routes` 对象；同时保留批量导入功能。
直接完整替换 / 追加到你的 `admin-bus.html`，和现有代码兼容。

## HTML 片段（放到站点管理区域）

```html
<hr>
<h2>站点管理（siteNames）</h2>

<div id="stationFormWrap" style="border:1px solid #999;padding:12px;margin-bottom:16px;display:none;">
    <h3 id="stationFormTitle">新增站点</h3>
    <input type="hidden" id="stationEditId">

    <div>站点名称：<input id="stationName" placeholder="例如：龙港客运中心"></div>
    <hr>
    <h4>区域&线路可视化编辑</h4>
    <div>
        新增区域：<input id="newAreaInput" placeholder="龙港 / 苍南">
        <button onclick="addNewArea()">添加区域</button>
    </div>
    <div id="areaListWrap" style="margin:10px 0;"></div>

    <hr>
    <div style="margin-top:8px;">
        <button onclick="saveStation()">保存站点</button>
        <button onclick="closeStationForm()">取消</button>
    </div>

          <!-- 隐藏域，存放最终routes对象 -->
    <input type="hidden" id="stationRoutesRaw">
</div>

<button onclick="openAddStationForm()">新增站点</button>

<!-- 批量导入模块 保留 -->
<div style="margin:10px 0;">
    <h4>批量导入站点JSON数组</h4>
    <textarea id="stationImportBox" rows="8" style="width:95%;box-sizing:border-box;" placeholder="粘贴完整 [] 数组">
    </textarea>
    <br>
    <button onclick="batchImportStation()">执行导入</button>
</div>

<hr>
<div id="stationTableWrap"></div>
```

## JS 站点完整逻辑（直接覆盖旧站点 JS）

```js
let stationList = [];
// 当前正在编辑的routes内存对象
let editRoutes = {};

// 加载所有站点
async function loadStationListAdmin() {
  const { data, error } = await sb
    .from("station_list")
    .select("*")
    .order("name");
  if (error) {
    console.error(error);
    alert("站点加载失败");
    return;
  }
  stationList = data;
  renderStationTable();
}

// 站点列表渲染
function renderStationTable() {
  const wrap = document.getElementById("stationTableWrap");
  wrap.innerHTML = "";

  stationList.forEach(item => {
    const div = document.createElement("div");
    div.style.margin = "8px 0";
    div.style.padding = "8px";
    div.style.border = "1px solid #ccc";

    const routesText = JSON.stringify(item.routes, null, 1);
    div.innerHTML = `
      <div><strong>${item.name}</strong></div>
      <div style="font-size:12px;white-space:pre-wrap;max-height:160px;overflow:auto;margin:4px 0;">${routesText}</div>
      <button onclick="openEditStationForm('${item.id}')">编辑</button>
      <button onclick="deleteStation('${item.id}')">删除</button>
    `;
    wrap.appendChild(div);
  });
}

// 打开新增站点
function openAddStationForm() {
  document.getElementById("stationFormTitle").innerText = "新增站点";
  document.getElementById("stationEditId").value = "";
  document.getElementById("stationName").value = "";
  editRoutes = {};
  renderAreaEditor();
  document.getElementById("stationFormWrap").style.display = "block";
}

// 打开编辑站点
function openEditStationForm(uuid) {
  const target = stationList.find(s => s.id === uuid);
  if (!target) return;

  document.getElementById("stationFormTitle").innerText = "编辑站点";
  document.getElementById("stationEditId").value = target.id;
  document.getElementById("stationName").value = target.name;
  // 复制原始routes到编辑内存
  editRoutes = JSON.parse(JSON.stringify(target.routes));
  renderAreaEditor();
  document.getElementById("stationFormWrap").style.display = "block";
}

function closeStationForm() {
  document.getElementById("stationFormWrap").style.display = "none";
}

// 渲染可视化区域编辑器
function renderAreaEditor() {
  const wrap = document.getElementById("areaListWrap");
  wrap.innerHTML = "";

  const areaNames = Object.keys(editRoutes);
  if (areaNames.length === 0) {
    wrap.innerHTML = "<div>暂无区域，请添加区域</div>";
    return;
  }

  areaNames.forEach(area => {
    const box = document.createElement("div");
    box.style.border = "1px solid #aaa";
    box.style.padding = "8px";
    box.style.margin = "6px 0";

    const routeArr = editRoutes[area];
    let routeHtml = "";
    routeArr.forEach((r, idx) => {
      routeHtml += `
        <span style="display:inline-block;margin:2px 4px;padding:2px 6px;background:#eee;">
          ${r}
          <button onclick="removeRoute('${area}',${idx})">×</button>
        </span>
      `;
    });

    box.innerHTML = `
      <div style="display:flex;align-items:center;gap:8px;">
        <strong>${area}</strong>
        <button onclick="removeArea('${area}')">删除该区域</button>
      </div>
      <div style="margin:6px 0;">${routeHtml}</div>
      <div>
        新增线路：<input data-area="${area}" placeholder="1路">
        <button onclick="addRouteToArea('${area}')">添加</button>
      </div>
    `;
    wrap.appendChild(box);
  });
}

// 添加新区域
function addNewArea() {
  const input = document.getElementById("newAreaInput");
  const area = input.value.trim();
  if (!area) return alert("区域名称不能为空");
  if (editRoutes[area]) return alert("该区域已存在");
  editRoutes[area] = [];
  input.value = "";
  renderAreaEditor();
}

// 删除区域
function removeArea(area) {
  if (!confirm(`确定删除区域【${area}】？`)) return;
  delete editRoutes[area];
  renderAreaEditor();
}

// 向区域添加线路
function addRouteToArea(area) {
  const input = document.querySelector(`input[data-area="${area}"]`);
  const routeName = input.value.trim();
  if (!routeName) return alert("线路名称不能为空");
  if (editRoutes[area].includes(routeName)) return alert("该线路已存在");
  editRoutes[area].push(routeName);
  input.value = "";
  renderAreaEditor();
}

// 删除某一条线路
function removeRoute(area, idx) {
  editRoutes[area].splice(idx, 1);
  // 区域内线路清空后，可以选择保留空数组，或者自动删掉区域
  renderAreaEditor();
}

// 保存站点
async function saveStation() {
  const editId = document.getElementById("stationEditId").value.trim();
  const name = document.getElementById("stationName").value.trim();
  if (!name) {
    alert("站点名称不能为空");
    return;
  }

  const payload = {
    name: name,
    routes: editRoutes
  };

  let res;
  if (!editId) {
    res = await sb.from("station_list").insert([payload]);
  } else {
    res = await sb.from("station_list").update(payload).eq("id", editId);
  }

  const { error } = res;
  if (error) {
    alert("保存失败：" + error.message);
    console.error(error);
    return;
  }

  alert("保存成功");
  closeStationForm();
  loadStationListAdmin();
}

// 删除站点
async function deleteStation(uuid) {
  if (!confirm("确定删除该站点？")) return;
  const { error } = await sb.from("station_list").delete().eq("id", uuid);
  if (error) {
    alert("删除失败");
    console.error(error);
    return;
  }
  loadStationListAdmin();
}

// 批量导入（保留原有逻辑不变）
async function batchImportStation() {
  const jsonStr = document.getElementById("stationImportBox").value.trim();
  if (!jsonStr) return alert("粘贴JSON数组");
  let list;
  try {
    list = JSON.parse(jsonStr);
  } catch (e) {
    return alert("JSON格式错误");
  }
  if (!Array.isArray(list)) return alert("根必须是数组 []");

  const { error } = await sb.from("station_list").insert(list);
  if (error) {
    console.error(error);
    alert("导入失败：" + error.message);
  } else {
    alert(`成功导入${list.length}个站点`);
    document.getElementById("stationImportBox").value = "";
    loadStationListAdmin();
  }
}
```

## 页面初始化补充

找到页面顶部 `init`，确保存在这一行：

```js
await loadStationListAdmin();
```

# 使用操作流程

1. 点【新增站点】→ 填写站点名（龙港客运中心）
2. 在「新增区域」输入：龙港 → 添加区域
3. 在对应区域下方输入线路名 `1路` → 添加
4. 多条线路依次添加；多余线路点 `×` 删除
5. 可以新增多个区域（龙港、苍南）
6. 全部编辑完成，点击【保存站点】

编辑旧站点时，会自动读取数据库里的 `routes`，还原所有区域和线路，可视化修改。

# 前端展示页面加载代码（给你备用，无需改动业务逻辑）

```js
let siteNames = [];
async function loadStationData() {
  const { data } = await sb.from("station_list").select("*").order("name");
  siteNames = data;
  // 你原来遍历 siteNames 的代码完全不用修改
}
```

## 特性总结

✅ 不需要手动编写 JSON
✅ 可视化增删区域、线路
✅ 保留批量导入 JSON 入口，方便大批量初始化
✅ 数据结构和你原来 `siteNames` 完全一致，前后端无缝对接
✅ 兼容新增 / 编辑 / 删除

## 建表 SQL（直接执行）

```sql
CREATE TABLE station_list (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  routes jsonb NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE station_list ENABLE ROW LEVEL SECURITY;

-- 所有人可读
CREATE POLICY "public_select_station_list"
ON station_list FOR SELECT
TO anon, authenticated
USING (true);

-- 仅管理员增删改
CREATE POLICY "admin_manage_station_list"
ON station_list FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.id = auth.uid()
    AND profiles.role = 'admin'
  )
);
```

> 
> `jsonb` 优势：
> 前端传入普通 JS 对象自动兼容；后续也支持数据库内查询 json 内部字段。

# 有什么问题？

```css
.btn {
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: #3498db;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.2s ease;
}
```

```html
<div>
    新增区域：<input id="newAreaInput" placeholder="龙港 / 苍南">
    <button onclick="addNewArea()" class="btn">添加区域</button>
</div>
```

# 备选更稳妥方案（推荐，不用绝对定位，无遮挡问题）

改用 Flex，不需要 absolute，不会出现文字遮挡，布局更稳定：

```css
.wrap {
  display: flex;
  align-items: center;
  gap:10px;
}
.btn {
    background: #3498db;
    color: white;
    border: none;
    padding: 8px 15px;
    border-radius: 20px;
    cursor: pointer;
    transition: background-color 0.2s ease;
    flex-shrink: 0; /* 按钮不压缩 */
}
.btn:hover {
    background: #2980b9;
}
```

```html
<div class="wrap">
    新增区域：<input id="newAreaInput" placeholder="龙港 / 苍南">
    <button onclick="addNewArea()" class="btn">添加区域</button>
</div>
```

> 
> 如果你坚持要用绝对定位实现靠右悬浮按钮，必须记住两点：
> 
> 
> 1. 父容器 `position:relative`
> 2. 父容器预留右侧 padding，避免长文本和按钮重叠。

**把这里面的CSS部分单独抽离，加以美化**

```javascript
const div = document.createElement("div");
div.style.margin = "8px 0";
div.style.padding = "8px";
div.style.border = "1px solid #ccc";
div.innerHTML = `
    <div>${item.area}${item.name}</div>
    <div>${item.desc}</div>
    <div>POV:${item.pov} | Route:${item.route}</div>
    <div class="btg">
        <button onclick="openEditForm('${item.id}')">编辑</button>
        <button onclick="deleteItem('${item.id}')">删除</button>
    </div>
`;
```

```js
let siteNames=[];
const loadStationData=async()=>{const{data,error}=await sb.from("station_list").select("*").order("name");
error&&console.error("加载站点失败",error),siteNames=data};
await loadStationData();
```
# 函数执行时序问题

```js
// 创建事件目标对象，用于自定义事件的监听与派发
const flagEvent = new EventTarget();

// 状态标记变量
let flag = false;

/**
 * 修改flag值，当flag变为true时，派发"flagIsTrue"自定义事件
 * @param {boolean} value - 要设置的flag新值
 */
function setFlag(value) {
  // 将传入的值赋值给flag
  flag = value;
  // 判断：只有新值为true的时候，才触发事件，通知等待的代码
  if (value === true) {
    // 派发自定义事件，所有监听该事件的回调会被执行
    flagEvent.dispatchEvent(new Event('flagIsTrue'));
  }
}

/**
 * 等待flag变为true，带超时保护
 * @param {number} timeout - 最大等待毫秒数，超时则抛出错误
 * @returns {Promise<void>}
 */
function waitFlagTrue(timeout) {
  // 返回Promise，外部可以用await接收
  return new Promise((resolve, reject) => {
    // 如果当前flag已经是true，直接resolve，不需要等待
    if (flag === true) {
      resolve();
      return;
    }

    // 定义定时器，超时后执行
    const timeoutTimer = setTimeout(() => {
      // 超时：移除事件监听，防止内存残留
      flagEvent.removeEventListener('flagIsTrue', onFlagTrigger);
      // Promise拒绝，抛出超时错误，外部try‑catch捕获
      reject(new Error('等待flag超时'));
    }, timeout);

    // 事件触发回调：flag变成true时执行
    function onFlagTrigger() {
      // 清除超时定时器，避免超时逻辑还会运行
      clearTimeout(timeoutTimer);
      // Promise成功结束等待，await之后代码继续执行
      resolve();
    }

    // 监听自定义事件，flag变为true就执行onFlagTrigger
    flagEvent.addEventListener('flagIsTrue', onFlagTrigger);
  });
}

/**
 * 需要执行的目标函数，flag为true之后运行
 */
function render() {
  console.log('✅ flag为true，执行render()');
  // 在这里写你真正要执行的业务代码
}

/**
 * 主业务异步函数
 */
async function runTask() {
  try {
    console.log('开始等待flag，最多等待5000毫秒');
    // 等待flag变为true，最多等待5秒
    await waitFlagTrue(5000);
    // await结束后执行目标语句render()
    render();
  } catch (error) {
    // 捕获超时错误
    console.error(error.message);
  }
}

// 启动任务
runTask();

// ----------------------测试代码----------------------
// 2秒后把flag置为true，实际使用时删掉这一段，在你的业务里调用 setFlag(true)
setTimeout(() => {
  setFlag(true);
}, 2000);
```

### 关键注意点

1. **不要直接写 `flag = true`**，必须调用 `setFlag(true)`，否则事件不会派发，会直接超时。
2. `await` 只能写在被 `async` 修饰的函数内，这里是 `runTask`。
3. 超时时间传入 `waitFlagTrue(5000)`，单位毫秒；超时会进入 `catch`。
4. `render()` 就是你要执行的那条业务语句。

如果你想测试**超时场景**，把下面测试代码替换，5 秒内不设置 flag 就会打印错误：

```js
// 测试超时：注释掉setFlag(true)
// setTimeout(() => {
//   setFlag(true);
// }, 2000);
```