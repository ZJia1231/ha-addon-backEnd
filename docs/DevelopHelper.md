# DevelopHelper

## 项目目录

```
├─data 持久化存储的数据
├─dist 打包文件
├─docs
├─node_modules
│  ├─coolkit-api
│  └─coolkit-ws
├─src
│  ├─apis
│  ├─class
│  ├─config
│  ├─controller 设备种类文件
│  ├─middleware
│  ├─pages 前端打包好的文件
│  ├─route
│  ├─services
│  ├─ts 接口声明文件
│  │  ├─interface
│  │  └─type
│  └─utils
└─test
```

## 添加设备流程

### CLOUD 设备

1. 新建一个`CloudController`
2. 在`getThings.ts`中添加获取设备列表后的逻辑
3. 在`Controller.ts`中添加`setDevice`的相关逻辑
4. 在`initCkWs.ts`中添加接收到设备相关信息后的操作逻辑
5. 在`proxy2ws`接口添加设备接收到 WebUI 参数后的操作逻辑
6. 在`initHaSocket.ts`中添加接收到 Ha 参数后的操作逻辑
7. 在`formatDevice.ts`中添加格式化设备参数的相关逻辑

---

### LAN 设备

1. 在`MdnsClass.ts`中扫描本地的相关设备
2. 新建一个`LanController`
3. 在`Controller.ts`中添加`setDevice`的相关逻辑
4. 在`getThings.ts`中添加`Controller`的`devicekey`和`selfApikey`
5. 在`initMdns.ts`中添加接收到设备相关信息后的操作逻辑
6. 在`updateLanDevice`接口添加设备接收到 WebUI 参数后的操作逻辑
7. 在`initHaSocket.ts`中添加接收到 Ha 参数后的操作逻辑
8. 在`formatDevice.ts`中添加格式化设备参数的相关逻辑

---

### DIY 设备

-   todo
