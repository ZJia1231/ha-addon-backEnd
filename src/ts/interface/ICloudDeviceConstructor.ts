import TypeZxyInfoItem from '../type/TypeZxyInfoItem';
import { ICloudDeviceExtra } from './ICloudDevice';
import { ICloudDeviceParams } from './ICloudDeviceParams';
import { IZigbeeDeviceParams } from './IZigbeeDeviceParams';

interface ICloudDeviceConstructor<T = ICloudDeviceParams | IZigbeeDeviceParams> {
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
        zyx_info: TypeZxyInfoItem[];
    };
}

export default ICloudDeviceConstructor;
