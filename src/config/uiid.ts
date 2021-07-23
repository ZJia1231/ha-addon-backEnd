const switchUiidSet = new Set<number>([
    1, // 单通道插座
    6, // 单通道开关
    14, // 开关改装模块
    1009, // Zigbee单通道插座
    1256, // Zigbee单通道开关
]);

const multiChannelSwitchUiidSet = new Set<number>([
    2, // 双通道插座
    3, // 三通道插座
    4, // 四通道插座
    7, // 双通道开关
    8, // 三通道开关
    9, // 四通道开关
    77, // 单通道插座-多通道版
    78, // 单通道开关-多通道版
    112, // 单通道开关微波雷达版
    113, // 双通道开关微波雷达版
    114, // 三通道开关微波雷达版
    138, // MiniR3
]);

// 有局域网功能但不支持的设备
const unsupportedLanModeUiidSet = new Set<number>([
    138, // MiniR3
]);

export { switchUiidSet, multiChannelSwitchUiidSet, unsupportedLanModeUiidSet };
