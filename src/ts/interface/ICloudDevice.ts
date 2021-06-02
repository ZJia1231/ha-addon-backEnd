import { ICloudDeviceParams } from './ICloudDeviceParams';

export interface ICloudDeviceExtra {
    apmac: string;
    brandId?: string;
    description: string;
    mac: string;
    manufacturer: string;
    model: string;
    modelInfo: string;
    ui: string;
    uiid: number;
    chipid?: string;
    staMac?: string;
}
interface ICloudDevice<P = ICloudDeviceParams, E = ICloudDeviceExtra> {
    name: string;
    deviceid: string;
    apikey: string;
    extra: E;
    brandName: string;
    brandLogo: string;
    showBrand: false;
    productModel: string;
    settings: Object;
    family: {
        familyid: string;
        index: number;
    };
    shareTo: string[];
    devicekey: string;
    online: true;
    params: P;
    denyFeatures: string[];
    tags?: {
        ck_channel_name: {
            [key: string]: string;
        };
    };
    devConfig: {
        // 目前只有DW2-WiFi门磁用到
        lowVolAlarm?: number;
    };
}

export default ICloudDevice;
