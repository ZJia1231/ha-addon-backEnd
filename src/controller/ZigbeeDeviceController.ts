import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import CloudDeviceController from './CloudDeviceController';

abstract class ZigbeeDeviceController extends CloudDeviceController {
    type: number = 8;
    extra: ICloudDeviceConstructor['extra'];
    abstract uiid: number;
    abstract disabled: boolean;
    abstract entityId: string;
    constructor(data: ICloudDeviceConstructor) {
        super(data);
        this.extra = data.extra.extra;
    }
}

export default ZigbeeDeviceController;
