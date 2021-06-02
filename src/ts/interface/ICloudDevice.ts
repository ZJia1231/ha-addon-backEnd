import { ICloudDeviceParams } from './ICloudDeviceParams';

export interface ICloudDeviceExtra {
    model: string;
    ui: string;
    uiid: number;
    description: string;
    manufacturer: string;
    mac: string;
    apmac: string;
    modelInfo: string;
    brandId?: string;
    chipid?: string;
    staMac: string;
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
