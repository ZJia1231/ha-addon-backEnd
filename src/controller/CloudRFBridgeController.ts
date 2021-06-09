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
    const res = await coolKitWs.updateThing({
        ownerApikey: this.apikey,
        deviceid: this.deviceId,
        params: {
            switch: status,
        },
    });
    if (res.error === 0) {
        this.updateState(status);
        this.params.switch = status;
    }
};

/**
 * @description 更新状态到HA
 */
CloudRFBridgeController.prototype.updateState = async function (status) {
    if (this.disabled || !this.zxyInfo) {
        return;
    }

    let state = status;
    if (!this.online) {
        state = 'unavailable';
    }
    for (let key of this.zxyInfo.keys()) {
        const tmp = this.zxyInfo.get(key)!;
        const attributes = {};
        updateStates(key, {
            entity_id: key,
            state,
            attributes: {
                restored: false,
                supported_features: 4,
                friendly_name: tmp.name,
                state,
            },
        });
    }
};

export default CloudRFBridgeController;
