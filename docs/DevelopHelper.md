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

1. 新建一个`LanController`
2. 在`Controller.ts`中添加`setDevice`的相关逻辑
3. 在`initMdns.ts`中添加接收到设备相关信息后的操作逻辑
4. 在`updateLanDevice`接口添加设备接收到 WebUI 参数后的操作逻辑
5. 在`initHaSocket.ts`中添加接收到 Ha 参数后的操作逻辑
6. 在`formatDevice.ts`中添加格式化设备参数的相关逻辑

---

### DIY 设备

-   todo
