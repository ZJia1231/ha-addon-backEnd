import CloudDeviceController from './CloudDeviceController';
import { ICloudDeviceParams, ICloudSwitchParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
class UnsupportDeviceController {
    uiid: number;
    params: ICloudDeviceParams;
    deviceId: string;
    deviceName: string;
    online: boolean;
    constructor(params: ICloudDeviceConstructor<ICloudDeviceParams>) {
        this.params = params.params;
        this.uiid = params.extra.uiid;
        this.online = params.online;
        this.deviceId = params.deviceId;
        this.deviceName = params.deviceName;
    }
}

export default UnsupportDeviceController;
