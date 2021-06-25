# Change Log

## v2.3.0-beta

-   修复了温湿度传感器同步到 HomeAssistant 失败的问题
-   修复了 ZigBee 无线按键无法连续触发同一指令的问题
-   修复了部分设备禁用实体失败的问题
-   RF-Bridge 已支持同步到 HomeAssistant
-   **WebUI 已支持显示以下设备**
    -   RF-Bridge
    -   ZigBee 温湿度传感器
    -   ZigBee 门磁传感器
    -   ZigBee 移动传感器
    -   ZigBee 灯控制器
    -   ZigBee 无线按键
    -   ZigBee 插座
    -   WiFi 门磁
    -   电动窗帘
    -   律动灯带
    -   五色灯
    -   双色灯

## v2.2.0-beta

-   优化移动端 UI 界面
-   优化卡片渲染和布局
-   修复部分设备控制问题，优化体验
-   **以下设备目前仅同步到 HomeAssistant，WebUI 暂不展示**
    -   ZigBee 温湿度传感器
    -   ZigBee 门磁传感器
    -   ZigBee 移动传感器
    -   ZigBee 灯控制器
    -   ZigBee 无线按键
    -   ZigBee 插座
    -   WiFi 门磁
    -   电动窗帘
    -   律动灯带
    -   五色灯
    -   双色灯

## v2.1.1-beta

-   修复已知问题，优化体验

## v2.1.0-beta

-   **使用 HomeAsistant 内置的鉴权机制，优化认证流程**
-   修复恒温恒湿改装件无法设置温度单位问题

## v2.0.7-beta

-   使用 HomeAsistant 内置的鉴权机制，优化认证流程
-   ~~Docker 版未测试，Docker 用户请谨慎升级~~

## v2.0.6-beta

-   恒温恒湿改装件支持局域网控制
-   DIY 设备支持修改设备名称

## v2.0.5-beta

-   优化页面性能

## v2.0.4-beta

-   优化局域网控制逻辑
-   修复通过 docker 方式安装时的登录状态异常

## v2.0.3-beta

-   DualR3 支持局域网

## v2.0.2-beta

-   更新文档

## v2.0.1-beta

-   修复重启 HA 后无法操控设备问题

## v2.0-beta

-   Web UI 升级

## v1.2-beta

-   优化 BASE 镜像，首次更新可能耗时比较久；解决了部分机型因为环境安装不上问题
-   支持 HA Core 版本，可通过 docker 方式直接安装。
-   支持 HA 的 URL 设置

## v1.1-beta

-   多通道设备自动生成 Lovelace
-   支持 DIY 模式的设备
-   支持 HA 的端口设置

## v1.0-beta

-   支持单通道开关插座
-   支持多通道开关插座
-   ~~支持 RGB 灯带~~
-   ~~支持双色冷暖灯泡~~
