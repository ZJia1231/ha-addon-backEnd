import { ICloudDeviceExtra } from './ICloudDevice';
import { ICloudDeviceParams } from './ICloudDeviceParams';

interface ICloudDeviceConstructor<T = ICloudDeviceParams> {
    deviceId: string;
    devicekey: string;
    deviceName: string;
    apikey: string;
    online: boolean;
    index: number;
    extra: ICloudDeviceExtra;
    params: T;
    disabled?: boolean;
    tags?: {
        ck_channel_name: {
            [key: string]: string;
        };
    };
}

export default ICloudDeviceConstructor;
