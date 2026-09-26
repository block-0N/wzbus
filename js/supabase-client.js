// Supabase 客户端初始化（供非 auth/ 页面使用）
// 依赖: 必须先加载 supabase-js CDN
// 说明: 挂到 window.sb，与 auth/auth.js 的 const sb 互不冲突
(function () {
    if (window.sb) return;
    const SUPABASE_URL = "https://iaocxpqpbyztiqpcomiv.supabase.co";
    const SUPABASE_ANON_KEY = "sb_publishable_pEVd5y5gB05gb7C-yAlUzg_e4s6bizJ";
    window.sb = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true }
    });
})();