export interface IZigbeeDeviceParams {
    bindInfos: any;
    parentid: string;
    subDevId: string;
    trigTime: string;
    battery: number;
}
export interface IZigbeeUIID1000Params extends IZigbeeDeviceParams {
    /**
     * 0--> 单击
     * 1--> 双击
     * 2--> 长按
     */
    key: number;
}
export interface IZigbeeUIID1770Params extends IZigbeeDeviceParams {
    humidity: string;
    temperature: string;
}
export interface IZigbeeUIID2026Params extends IZigbeeDeviceParams {
    /**
     * 1--> 有人
     * 0--> ⽆⼈
     */
    motion: number;
}
export interface IZigbeeUIID3026Params extends IZigbeeDeviceParams {
    /**
     * 1--> 开门
     * 0--> 关门
     */
    lock: number;
}
