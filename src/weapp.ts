import { fetch } from "./fetch"

/**
 * 微信小程序api
 */
export default class WxApp {
    appid: string
    secret: string
    /**
     * 微信请求密匙
     */
    token: string
    /**
     * 密匙请求时间戳
     */
    private expreTime: number
    /**
     * 密匙有效期
     */
    private expires_in: number
    /**
     * 用户session缓存
     */
    private sessionCache: Map<string, string>
    /**
     * 
     * @param appid 小程序appid
     * @param secret 小程序secret
     */
    constructor(appid: string, secret: string) {
        this.appid = appid
        this.secret = secret
        this.token = ''
        this.expires_in = 0
        this.expreTime = 0
        this.sessionCache = new Map()
    }

    /**
     * 获取请求密匙
     * @returns 
     */
    private async getToken() {
        // 如果没有密匙或密匙已超时,重新请求密匙
        if (!this.token || Date.now() > (this.expires_in * 1000) + this.expreTime) {
            const url = `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${this.appid}&secret=${this.secret}`
            const { access_token, expires_in, errcode, errmsg } = await fetch<Uart.WX.wxRequestAccess_token>({ url, method: 'GET' })
            if (errcode) throw new Error(errmsg)
            this.token = access_token
            this.expires_in = expires_in
            this.expreTime = Date.now()
        }
        return this.token
    }

    /**
   * @method weapp 获取用户openid,token,unionid
   * @param code 登录时获取的 code
   * @author https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/login/auth.code2Session.html
   */
    async UserOpenID(code: string) {
        const url = `https://api.weixin.qq.com/sns/jscode2session?appid=${this.appid}&secret=${this.secret}&js_code=${code}&grant_type=authorization_code`;
        const { openid, session_key, unionid } = await fetch<Uart.WX.wxRequestCode2Session>({ url, method: 'GET' })
        this.sessionCache.set(openid, session_key)
        return { openid, session_key, unionid }
    }

    /**
     * 获取参数小程序二维码ticket,绑定账号
     * https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/qr-code/wxacode.getUnlimited.html
     * @param scene 二维码携带的参数 
     * @param page 跳转到小程序的页面
     * @returns 返回图片base64格式数据,img src直接引用
     */
    async getTicket(scene: string, page: string = "pages/index/index") {
        const url = `https://api.weixin.qq.com/wxa/getwxacodeunlimit?access_token=${await this.getToken()}`
        const data = {
            //access_token,
            scene,
            page
        }
        const buffer = await fetch({ url, data, method: "POST", responseType: "arraybuffer" }) as unknown as Buffer
        const base64 = buffer.toString("base64")
        return `data:image/png;base64,${base64}`
    }

    /**
   * @method 发送订阅消息
   * @callback 返回发送state
   */
    async SendsubscribeMessage(postData: Uart.WX.wxsubscribeMessage) {
        const url = `https://api.weixin.qq.com/cgi-bin/message/subscribe/send?access_token=${await this.getToken()}`
        return await fetch({ url, method: 'POST', data: postData })
    }

    /**
   * 
   * @method 请求小程序url Scheme码
   * @param query {path:小程序路径,query:请求参数}
   * @host https://developers.weixin.qq.com/miniprogram/dev/api-backend/open-api/url-scheme/urlscheme.generate.html
   */

    public async urlScheme(query: Pick<Uart.WX.urlScheme, "jump_wxa">) {
        const url = `https://api.weixin.qq.com/wxa/generatescheme`
        const data: Uart.WX.urlScheme = {
            access_token: await this.getToken(),
            is_expire: true,
            expire_time: 1606737600,
            jump_wxa: query.jump_wxa
        }
        return fetch<Uart.WX.urlSchemeRequest>({ url, method: "POST", data })
    }
}