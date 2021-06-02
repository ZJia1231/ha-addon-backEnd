import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';

abstract class CloudDeviceController {
    type: number = 4;
    rssi: number;
    apikey: string;
    deviceName: string;
    devicekey: string;
    deviceId: string;
    index: number;
    online: boolean;
    extra: ICloudDeviceConstructor['extra'];
    disabled: boolean;
    abstract uiid: number;
    abstract params: ICloudDeviceConstructor['params'];
    abstract entityId: string;
    constructor(data: ICloudDeviceConstructor) {
        this.rssi = data.params.rssi;
        this.apikey = data.apikey;
        this.deviceId = data.deviceId;
        this.deviceName = data.deviceName;
        this.extra = data.extra;
        this.index = data.index;
        this.online = data.online;
        this.devicekey = data.devicekey;
        this.disabled = data.disabled || false;
    }
}

export default CloudDeviceController;
