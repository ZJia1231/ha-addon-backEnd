import CloudDeviceController from './CloudDeviceController';
import { ICloudRFBridgeParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
import TypeZxyInfoItem from '../ts/type/TypeZxyInfoItem';
class CloudRFBridgeController extends CloudDeviceController {
    entityId: string;
    uiid: number = 28;
    params: ICloudRFBridgeParams;
    zxyInfo?: Map<string, TypeZxyInfoItem>;
    updateSwitch!: (status: string) => Promise<void>;
    updateState!: (status: string) => Promise<void>;
    constructor(params: ICloudDeviceConstructor<ICloudRFBridgeParams>) {
        super(params);
        this.entityId = `remote.${params.deviceId}`;
        this.params = params.params;
        this.uiid = params.extra.uiid;
        if (params.tags?.zyx_info) {
            params.tags.zyx_info.forEach((item) => {
                const { name, buttonName, remote_type } = item;
                const domain = +remote_type < 6 ? 'remote' : 'alert';
                const suffix = buttonName.reduce((prev, curr) => {
                    const [key] = Object.entries(curr);
                    return prev + key;
                }, '');
                const entityId = `${domain}.${this.deviceId}_${suffix}`;
                this.zxyInfo?.set(entityId, item);
            });
        }
    }
}

CloudRFBridgeController.prototype.updateSwitch = async function (status) {
    // todo
};

/**
 * @description 更新状态到HA
 */
CloudRFBridgeController.prototype.updateState = async function (status) {
    // todo
};

export default CloudRFBridgeController;
