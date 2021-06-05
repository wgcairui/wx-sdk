import axios, { AxiosRequestConfig, AxiosResponse } from "axios";

export const fetch = async <T extends Uart.WX.wxRequest>(config: AxiosRequestConfig) => {
    const res: AxiosResponse<T> = await axios(config).catch(err => {
        console.log({ config, data: config.data });
        throw new Error(err)
    })
    if (res.data.errcode) {
        console.log({ data: res.data, config });
        throw new Error(res.data.errmsg)
    }
    return res.data;
}