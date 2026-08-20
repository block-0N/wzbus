const SUPABASE_URL = "https://iaocxpqpbyztiqpcomiv.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_pEVd5y5gB05gb7C-yAlUzg_e4s6bizJ";

// 只初始化一次，不要覆盖混淆
const sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
    }
});
// 不要再赋值 window.supabase = sb，删掉这一行，避免冲突

/**
 * 用户注册
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{data, error}>}
 */
async function register(email, password) {
    const { data, error } = await sb.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: location.origin + "/login.html"
        }
    });
    return { data, error };
}

/**
 * 邮箱密码登录
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{data, error}>}
 */
async function login(email, password) {
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    return { data, error };
}

/**
 * 退出登录
 */
async function logout() {
    await sb.auth.signOut();
    window.location.href = "./auth/login.html";
}

/**
 * 获取当前会话
 * @returns {Promise<object|null>} session
 */
async function getSession() {
    const { data } = await sb.auth.getSession();
    return data.session;
}

/**
 * 获取用户资料（角色+昵称）
 * @param {string} userId
 * @returns {Promise<{data, error}>}
 */
async function getProfile(userId) {
    const { data, error } = await sb
        .from("profiles")
        .select("id, email, nickname, role ,avatar_url")
        .eq("id", userId)
        .single();
    return { data, error };
}

/**
 * 权限守卫
 * @param {string|null} requiredRole 可选："admin" / "user"
 * @returns {Promise<{session, role, profile}|null>}
 */
async function requireAuth(requiredRole = null) {
    const session = await getSession();
    if (!session) {
        window.location.href = "login.html";
        return null;
    }

    const { data: profile, error } = await getProfile(session.user.id);
    if (error || !profile) {
        window.location.href = "login.html";
        return null;
    }

    if (requiredRole && profile.role !== requiredRole) {
        alert("权限不足");
        window.location.href = "../index.html";
        return null;
    }

    return { session, role: profile.role, profile };
}

// 登录状态监听
sb.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
        const filename = window.location.pathname.split("/").pop();
        const publicPages = ["login.html", "register.html", "", "index.html"];
        if (!publicPages.includes(filename)) {
            window.location.href = "login.html";
        }
    }
});
/**
 * 更新用户昵称
 * @param {string} userId
 * @param {string} nickname
 */
async function setNickname(userId, nickname) {
    const { error } = await sb
        .from("profiles")
        .update({ nickname })
        .eq("id", userId);
    return { error };
}

// 上传头像函数
async function uploadAvatar() {
    const fileInput = document.getElementById("avatarInput");
    const file = fileInput.files[0];
    if (!file) {
        alert("请选择图片");
        return;
    }
    // 限制大小 2MB
    if (file.size > 2 * 1024 * 1024) {
        alert("图片不能超过2MB");
        return;
    }

    const session = await getSession();
    const uid = session.user.id;
    // 文件路径 avatars-public/用户UUID/avatar
    const filePath = `${uid}/avatar`;

    // 上传，覆盖旧头像
    const { error } = await sb.storage
        .from("avatars-public")
        .upload(filePath, file, {
            cacheControl: "3600",
            upsert: true // 覆盖已有文件
        });

    if (error) {
        console.error(error);
        alert("上传失败：" + error.message);
        return;
    }

    // 获取公开访问地址
    const { data } = sb.storage
        .from("avatars-public")
        .getPublicUrl(filePath);

    // 更新到 profiles 表
    const { error: updateErr } = await sb
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("id", uid);

    if (updateErr) {
        alert("头像地址保存失败");
        return;
    }

    alert("头像上传成功！");
    document.getElementById("avatarPreview").src = data.publicUrl;
    loadAvatar();
}

// 页面加载时加载已有头像
async function loadAvatar() {
    const session = await getSession();
    const { data: profile } = await getProfile(session.user.id);
    if (profile?.avatar_url) {
        document.getElementById("avatarPreview").src = profile.avatar_url + "?t=" + Date.now();
    } else {
        // 默认头像
        document.getElementById("avatarPreview").src = "./default-avatar.png";
    }
}
async function loadBusData() {
    const { data, error } = await sb
        .from("bus_routes")
        .select("name, area, desc, pov, route")
        .order("name");

    if (error) {
        alert("线路数据加载失败");
        console.error(error);
        return;
    }
    busRoutes = data;
}