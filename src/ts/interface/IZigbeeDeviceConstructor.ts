import { IZigbeeDeviceParams } from './IZigbeeDeviceParams';

export interface IZigbeeDeviceExtra {
    apmac: string;
    brandId: string;
    description: string;
    mac: string;
    manufacturer: string;
    model: string;
    modelInfo: string;
    ui: string;
    uiid: number;
}

interface IZigbeeDeviceConstructor<P = IZigbeeDeviceParams, E = IZigbeeDeviceExtra> {
    deviceId: string;
    deviceName: string;
    apikey: string;
    online: boolean;
    index: number;
    extra: E;
    params: P;
    disabled?: boolean;
}

export default IZigbeeDeviceConstructor;
