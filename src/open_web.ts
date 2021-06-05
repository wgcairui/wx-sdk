import { fetch } from "./fetch"

/**
 * 封装微信开放平台-web应用
 */
export default class WxOpen {
    appid: string
    secret: string
    /**
     * 
     * @param appid 
     * @param secret 
     */
    constructor(appid: string, secret: string) {
        this.appid = appid
        this.secret = secret
    }

    /**
     * 根据登录二维码获得的code值,获取用户信息
     * @param code 
     */
    async userInfo(code: string) {
        // 获取用户acctoken
        const url = `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${this.appid}&secret=${this.secret}&code=${code}&grant_type=authorization_code`
        const result = await fetch<Uart.WX.webLogin>({ url, method: "GET" })

        if (result.errcode) throw new Error(result.errmsg)
        // 获取微信用户信息
        const url2 = `https://api.weixin.qq.com/sns/userinfo?access_token=${result.access_token}&openid=${result.openid}`
        const result2 = await fetch<Uart.WX.webUserInfo>({ url: url2, method: "GET" })
        if (result2.errcode) throw new Error(result.errmsg)
        return result2
    }
}