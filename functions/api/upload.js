/**
 * 图片上传 API (存入 Cloudflare R2)
 */
export async function onRequestPost(context) {
    const { request, env } = context
    const r2 = env.ROOMTOUR_ASSETS
    
    if (!r2) {
        return new Response(JSON.stringify({ error: 'R2 bucket not bound' }), { status: 500 })
    }

    // 安全校验
    const authHeader = request.headers.get('Authorization')
    const adminToken = env.ADMIN_TOKEN || 'admin123'
    if (authHeader !== `Bearer ${adminToken}`) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }

    try {
        const formData = await request.formData()
        const file = formData.get('file')
        if (!file) {
            return new Response(JSON.stringify({ error: 'No file uploaded' }), { status: 400 })
        }

        const fileName = `${Date.now()}-${file.name.replace(/\s+/g, '_')}`
        
        // 存入 R2
        await r2.put(fileName, file.stream(), {
            httpMetadata: { contentType: file.type }
        })

        // 返回图片的访问路径
        // 我们稍后会创建一个专门的路由来访问这些 R2 资源
        const url = `/api/assets/${fileName}`
        
        return new Response(JSON.stringify({ success: true, url }), {
            headers: { 'Content-Type': 'application/json' }
        })
    } catch (e) {
        return new Response(JSON.stringify({ error: e.message }), { status: 500 })
    }
}
