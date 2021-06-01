import CloudDeviceController from './CloudDeviceController';
import { ICloudDeviceParams, ICloudSwitchParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstrucotr from '../ts/interface/ICloudDeviceConstrucotr';
class UnsupportDeviceController {
    uiid: number;
    params: ICloudDeviceParams;
    deviceId: string;
    deviceName: string;
    online: boolean;
    constructor(params: ICloudDeviceConstrucotr<ICloudDeviceParams>) {
        this.params = params.params;
        this.uiid = params.extra.uiid;
        this.online = params.online;
        this.deviceId = params.deviceId;
        this.deviceName = params.deviceName;
    }
}

export default UnsupportDeviceController;
