# Interface

### Error Code Description

| 值  |          说明          |
| :-: | :--------------------: |
|  0  |          成功          |
| 404 | 请求地址错误，路由错误 |
| 401 |   传递参数错误或为空   |
| 402 |      查询不到设备      |
| 500 |       服务器错误       |


#### 登录

-   URL: /user/login
-   方法: POST
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | countryCode | string | N | 国家码 |
    | phoneNumber | string | Y | 手机号 |
    | email | string | Y | 邮箱 |
    | password | string | N | 密码 |
    | lang | string | N | 语言 |

-   返回值:
    {error:0,msg:"success",data: v2 接口返回值}

#### 登出

-   URL: /user/logout
-   方法: POST
-   业务请求参数:无

-   返回值:
    {error:0,msg:"success",data: null}

#### 获取登录状态

-   URL: /user/isLogin
-   方法: POST
-   业务请求参数:　无

-   返回值:
    {error:0,msg:"success",data: { isLogin: boolean }}

#### Auth

-   URL: /user/auth
-   方法: POST
-   业务请求参数:

    | 名称     | 类型   | 允许空 | 说明 |
    | -------- | ------ | :----: | ---- |
    | code     | string |   N    |      |
    | clientId | string |   N    |      |

-   返回值:
    {error:0,msg:"success",data: null}

#### 判断是否获取了 HA 授权

-   URL: /user/auth
-   方法: POST
-   业务请求参数: 无

-   返回值:
    {error:0,msg:"success",data: { isAuth: boolean }}

#### 获取设备列表

-   URL: /devices
-   方法: GET
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | type | number | N | 1:diy;2:lan;4:cloud |

-   返回值:
    {error:0,msg:"success",data:any}

#### 刷新设备列表

-   URL: /devices/refresh
-   方法: GET
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | type | number | N | 1:diy;2:lan;4:cloud |

-   返回值:
    {error:0,msg:"success",data:any}

#### 禁用/启用设备

-   URL: /devices/disabled
-   方法: POST
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | id | string | N | deviceid |
    | disabled | boolean | N | 禁用/启用 |

-   返回值:
    {error:0,msg:"success",data:boolean}

#### 修改设备名称

-   URL: /devices/updateName
-   方法: POST
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | id | string | N | deviceid |
    | newName | string | N | 新名字 |

-   返回值:
    {error:0,data:null}

#### 修改设备子通道名称

-   URL: /devices/updateChannelName
-   方法: POST
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | id | string | N | deviceid |
    | tags | Object | N | {[outlet: string]: string} |

-   返回值:
    {error:0,data:null}

#### 设置设备通电反应/点动状态/网络指示灯/互锁

-   URL: /devices/proxy2ws
-   代理访问 CK-WebSocket
-   方法: POST
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | id | string | N | deviceid |
    | apikey | string | N | apikey |
    | params | Object | N |any |

-   返回值:
    {error:0,data:null}

#### 获取设备更新固件信息

-   URL: /devices/getOTAinfo
-   方法: POST
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | list | Array<{ deviceid: string; model: string; version: string; }> | N |deviceid:设备 ID,model:设备的模块型号,version:当前设备的固件版本号 |

-   返回值:
    {error:0,data:null}

#### 修改 DIY 设备状态/通电反应/点动状态

-   URL: /devices/diy
-   方法: POST
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | id | string | N | deviceid |
    | type | string | N | 'switch' or 'startup' or 'pulse' or 'sledOnline' |
    | params | Object | N | { state: string; width?: number} |
-   返回值:
    {error:0,data:null}

#### 修改恒温恒湿设备温度单位

-   URL: /devices/device/unit
-   方法: POST
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | id | string | N | deviceid |
    | unit | string | N | 'c' or 'f' |
-   返回值:
    {error:0,data:null}

#### 升级固件

-   URL: /devices/device/upgrade
-   方法: POST
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | id | string | N | deviceid |
    | apikey | string | N | apikey |
    | params | object | N | getOTAinfo 接口返回的数据 |
-   返回值:
    {error:0,data:null}

#### 删除 DIY 设备

-   URL: /devices/diy
-   方法: DELETE
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | id | string | N | deviceid |
-   返回值:
    {error:0,data:null}

#### 设置费率

-   URL: /devices/device/rate
-   方法: POST
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | id | string | N | deviceid |
    | rate | number | N | |
-   返回值:
    {error:0,data:null}

#### 开关局域网设备

-   URL: /devices/lan
-   方法: POST
-   业务请求参数:
    | 名称 | 类型 | 允许空 | 说明 |
    | ------- | ------ | :----: | --- |
    | id | string | N | deviceid |
-   返回值:
    {error:0,data:null}

#### 获取 HA 默认语言

-   URL: /language
-   方法: POST
-   业务请求参数:无
-   返回值:
    {error:0,data: string}

#### sse

-   URL: /stream
-   方法: POST
-   业务请求参数:无
-   返回值:
    {error:0,data: any}
