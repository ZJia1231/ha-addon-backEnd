export interface IZigbeeDeviceParams {
    bindInfos: any;
    parentid: string;
    subDevId: string;
    trigTime: string;
    battery: number;
}

export interface IZigbeeUIID3026Params extends IZigbeeDeviceParams {
    /**
     * 1--> 开门
     * 0--> 关门
     */
    lock: number;
}
