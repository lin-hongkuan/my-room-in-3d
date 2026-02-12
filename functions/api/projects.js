/**
 * 项目配置 API
 * 存储在 KV 中的 key 为 'projects_config'
 */
const KEY = 'projects_config'

// 初始默认数据（包含修复：直接跳转到真实链接）
const DEFAULT_CONFIG = {
    pcScreen: {
        title: 'About Me',
        subtitle: '一些关于我的链接',
        intro: '喜欢写代码和做 3D 小项目，这个房间是用 Three.js 搭的。',
        video: '/assets/videoPortfolio.mp4',
        cards: [
            {
                href: 'https://blog.linhk.top',
                img: '/imgs/Cover-Keyboard.jpg',
                title: '个人博客',
                desc: '记录技术与生活的博客 · blog.linhk.top'
            },
            {
                href: 'https://github.com/linhk160',
                img: '/imgs/Cover-Questopia.jpg',
                title: 'GitHub',
                desc: '查看我的开源项目'
            }
        ]
    },
    macScreen: {
        title: '实用工具',
        subtitle: '开发和效率相关的小工具',
        video: '/assets/videoStream.mp4',
        cards: [
            {
                href: 'https://excalidraw.com',
                img: '/imgs/vue-chemistry.jpg',
                title: 'Excalidraw',
                desc: '手绘风白板 · 画原型/草图'
            },
            {
                href: 'https://carbon.now.sh',
                img: '/imgs/Cover-Pkg.jpg',
                title: 'Carbon',
                desc: '将代码片段导出为漂亮图片'
            }
        ]
    },
    tv: {
        title: '我的网站',
        subtitle: '一些想推荐给你的站点',
        video: '/assets/videoGame.mp4',
        cards: [
            {
                href: 'https://www.google.com',
                img: '/imgs/Cover-KOB.jpg',
                title: '搜索',
                desc: '探索世界'
            }
        ]
    },
    bookshelf: {
        title: '书影音',
        subtitle: '我喜欢的书籍、电影和音乐',
        cards: [
            {
                href: 'https://book.douban.com',
                img: '/imgs/Cover-Keyboard.jpg',
                title: '豆瓣读书',
                desc: '发现好书 · 记录阅读'
            }
        ]
    }
}

function json(body, status = 200) {
    return new Response(JSON.stringify(body), {
        status,
        headers: { 
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
    })
}

export async function onRequestGet(context) {
    const { env } = context
    const kv = env.ROOMTOUR_SETTINGS
    if (!kv) return json(DEFAULT_CONFIG)
    
    try {
        const raw = await kv.get(KEY)
        return json(raw ? JSON.parse(raw) : DEFAULT_CONFIG)
    } catch (_) {
        return json(DEFAULT_CONFIG)
    }
}

export async function onRequestPost(context) {
    const { request, env } = context
    const kv = env.ROOMTOUR_SETTINGS
    if (!kv) return json({ error: 'KV not configured' }, 500)

    // 简单的 Token 验证，防止他人恶意修改
    // 你可以在 Cloudflare Pages 设置中添加环境变量 ADMIN_TOKEN
    const authHeader = request.headers.get('Authorization')
    const adminToken = env.ADMIN_TOKEN || 'admin123' // 默认 token
    
    if (authHeader !== `Bearer ${adminToken}`) {
        return json({ error: 'Unauthorized' }, 401)
    }

    try {
        const body = await request.json()
        await kv.put(KEY, JSON.stringify(body))
        return json({ success: true, data: body })
    } catch (e) {
        return json({ error: String(e.message) }, 400)
    }
}

// 处理跨域预检
export async function onRequestOptions() {
    return new Response(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    })
}
