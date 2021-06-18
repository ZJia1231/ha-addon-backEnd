import { TypeLtypeParams, TypeLtype, TypeRGBBulbLtypeParams, TypeRGBBulbLtype } from '../type/TypeLtype';

export interface ICloudDeviceParams {
    bindInfos: any;
    version: number;
    fwVersion: string;
    rssi: number;
    staMac: string;
}

export interface ICloudSwitchParams extends ICloudDeviceParams {
    sledOnline: string;
    ssid: string;
    bssid: string;
    switch: string;
    startup: string;
    init: number;
    pulse: string;
    pulseWidth: number;
}
export interface ICloudPowerDetectionSwitchParams extends ICloudSwitchParams {
    alarmType: string;
    alarmVValue: [number, number];
    alarmCValue: [number, number];
    alarmPValue: [number, number];
    power: string;
    voltage: string;
    current: string;
    oneKwh: string;
    uiActive: number;
    hundredDaysKwh: string;
}

export interface ITemperatureAndHumidityModificationParams extends ICloudDeviceParams {
    sledOnline: string;
    ssid: string;
    bssid: string;
    init: number;
    startup: string;
    pulse: string;
    pulseWidth: number;
    switch: string;
    mainSwitch: string;
    deviceType: string;
    sensorType: string;
    currentHumidity: string;
    currentTemperature: string;
}

export interface ICloudRGBBulbParams extends ICloudDeviceParams {
    /**
     * 冷光
     */
    channel0: string;
    /**
     * 暖光
     */
    channel1: string;
    /**
     * Red
     */
    channel2: string;
    /**
     * Green
     */
    channel3: string;
    /**
     * Blue
     */
    channel4: string;
    /**
     * @description 开 / 关
     */
    state: string;
    /**
     * @ channel0 > channel1时为cold 冷光
     * @ channel0=channel1时为middle 中性光
     * @ channel0<channel1时为warm 暖光
     */
    type: string;
    /**
     * @description 球泡灯模式/情景
     * 1 白光模式(White)
     * 2 彩光模式(Color)
     * 3 晚安情景(Sleep)
     * 4 阅读情景(Reading)
     * 5 聚会情景(Party)
     * 6 休闲情景(Relax)
     */
    zyx_mode: number;
}

export type IDoubleColorLightParams = ICloudDeviceParams &
    TypeLtypeParams & {
        switch: string;
        ltype: TypeLtype;
    };

export type IUIID104Params = ICloudDeviceParams &
    TypeRGBBulbLtypeParams & {
        switch: string;
        ltype: TypeRGBBulbLtype;
    };

export interface ICloudDimmingParams extends ICloudDeviceParams {
    switch: string;
    bright: number;
}

export interface ICloudMultiChannelSwitchParams extends ICloudDeviceParams {
    lock: number;
    configure: {
        startup: string;
        outlet: number;
    }[];
    pulses: {
        pulse: string;
        width: number;
        outlet: number;
    }[];
    switches: {
        outlet: number;
        switch: string;
    }[];
    sledOnline: string;
    zyx_clear_timers: boolean;
}
export interface ICloudDualR3Params extends ICloudDeviceParams {
    configure: {
        startup: string;
        outlet: number;
    }[];
    pulses: {
        pulse: string;
        width: number;
        outlet: number;
    }[];
    switches: {
        outlet: number;
        switch: string;
    }[];
    workMode: 1 | 2 | 3;
    sledBright: 100;
    location: 50;
    currLocation: 50;
    calibration: 1;
    calibState: 1;
    swMode_00: 1;
    swMode_01: 1;
    /**
     * 通道1 的实时电流值
     */
    current_00: number;
    /**
     * 通道1 的实时电压
     */
    voltage_00: number;
    /**
     * 通道1 的实时有功功率
     */
    actPow_00: number;
    /**
     * 通道1 的实时无功功率
     */
    reactPow_00: number;
    /**
     * 通道1 的实时视在功率
     */
    apparentPow_00: number;
    /**
     * 通道1 的单次电量统计的开始时间
     */
    startTime_00: string;
    /**
     * 通道1 的单次电量统计的结束时间
     */
    endTime_00: string;
    /**
     * 通道1  获取用电量统计，1 获取单次统计用电量， 2 获取历史用电量
     */
    getKwh_00: number;
    /**
     * 通道1 的本次用电量的信息，开通单次统计后，app下发refresh查询，设备返回的
     */
    oneKwhData_00: number;
    /**
     * 通道1 的历史用电量（180天）
     */
    kwhHistories_00: string;

    /**
     * 通道2 的实时电流值
     */
    current_01: number;
    /**
     * 通道2 的实时电压
     */
    voltage_01: number;
    /**
     * 通道2 的实时有功功率
     */
    actPow_01: number;
    /**
     * 通道2 的实时无功功率
     */
    reactPow_01: number;
    /**
     * 通道2 的实时视在功率
     */
    apparentPow_01: number;
    /**
     * 通道2 的单次电量统计的开始时间
     */
    startTime_01: string;
    /**
     * 通道2 的单次电量统计的结束时间
     */
    endTime_01: string;
    /**
     * 通道2  获取用电量统计，1 获取单次统计用电量， 2 获取历史用电量
     */
    getKwh_01: number;
    /**
     * 通道2 的本次用电量的信息，开通单次统计后，app下发refresh查询，设备返回的
     */
    oneKwhData_01: number;
    /**
     * 通道2 的历史用电量（180天）
     */
    kwhHistories_01: string;
    /**
     * 清除服务端所有定时器，true 清除，false不清除
     */
    zyx_clear_timers: boolean;
    /**
     * 激活UI
     */
    uiActive: Object;
}

export interface ICloudRGBLightStripParams extends ICloudDeviceParams {
    sledOnline: string;
    ssid: string;
    bssid: string;
    switch: string;
    /**
     * 1->彩光（色盘） 2->白光（色温）
     */
    light_type: number;
    /**
     * R值，红色通道范围0-255
     */
    colorR: number;
    /**
     * G值，绿色通道范围0-255
     */
    colorG: number;
    /**
     * 激活UI
     */
    /**
     * B值，蓝色通道范围0-255
     */
    colorB: number;
    /**
     * 灯光亮度，范围1-100，值越大越亮
     */
    bright: number;
    /**
     * 灯带可选的模式，总共12个模式
     * 1 七彩（普通）
     * 2 七彩渐变
     * 3 七彩跳变
     * 4 DIY 渐变
     * 5 DIY 流光
     * 6 DIY 跳变
     * 7 DIY 频闪
     * 8 RGB 渐变
     * 9 RGB 流光
     * 10 RGB 跳变
     * 11 RGB 频闪
     * 12 音乐可视化
     */
    mode: number;
    /**
     * 灯带在不同颜色之间的变化快慢速度，取值范围1-100，值越大速度越快
     */
    speed: number;
    /**
     * 灯带在音乐可视化模式下灯光变化的灵敏度，取值范围1-10，值越大灵敏度越高
     */
    sensitive: number;
}

export interface ICloudDW2Params extends ICloudDeviceParams {
    actionTime: string;
    battery: number;
    chipID: string;
    lastUpdateTime: string;
    mac: string;
    switch: string;
    type: number;
}
export interface ICloudRFBridgeParams extends ICloudDeviceParams {
    only_device: any;
    sledOnline: string;
    ssid: string;
    bssid: string;
    init: number;
    setState: string;
    chipID: string;
    /**
     * 指令或者模式
     * capture 进入学习模式
     * captureCancel 退出学习模式
     * edit 更新通道列表
     * transmit 主动触发
     * trigger 收到触发通知
     */
    cmd: string;
    rfList: {
        rfChl: number;
        rfVal: string;
    }[];
    [rfTrig: string]: any;
}


export interface ICloudCoverParams extends ICloudDeviceParams {
    sledOnline: string;
    ssid: string;
    bssid: string;
    
    switch: string;
    setclose: number;
}