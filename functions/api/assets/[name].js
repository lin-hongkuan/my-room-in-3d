/**
 * 读取 R2 中的图片资源
 */
export async function onRequestGet(context) {
    const { env, params } = context
    const r2 = env.ROOMTOUR_ASSETS
    const name = params.name

    if (!r2 || !name) {
        return new Response('Not Found', { status: 404 })
    }

    const object = await r2.get(name)

    if (object === null) {
        return new Response('Object Not Found', { status: 404 })
    }

    const headers = new Headers()
    object.writeHttpMetadata(headers)
    headers.set('etag', object.httpEtag)
    headers.set('Cache-Control', 'public, max-age=31536000') // 缓存一年

    return new Response(object.body, { headers })
}
