import IZigbeeDeviceConstructor from '../ts/interface/IZigbeeDeviceConstructor';

abstract class ZigbeeDeviceController {
    type: number = 8;
    deviceId: string;
    deviceName: string;
    apikey: string;
    online: boolean;
    index: number;
    extra: IZigbeeDeviceConstructor['extra'];
    uiid: number;
    disabled: boolean;
    abstract entityId: string;
    abstract params: IZigbeeDeviceConstructor['params'];
    constructor(data: IZigbeeDeviceConstructor) {
        this.extra = data.extra;
        this.uiid = this.extra.uiid;
        this.disabled = data.disabled || false;
        this.deviceId = data.deviceId;
        this.deviceName = data.deviceName;
        this.apikey = data.apikey;
        this.online = data.online;
        this.index = data.index;
    }
}

export default ZigbeeDeviceController;
