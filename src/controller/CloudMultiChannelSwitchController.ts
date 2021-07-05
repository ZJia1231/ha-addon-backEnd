import CloudDeviceController from './CloudDeviceController';
import { ICloudMultiChannelSwitchParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
import { getMaxChannelByUiid } from '../config/channelMap';
import mergeDeviceParams from '../utils/mergeDeviceParams';
class CloudMultiChannelSwitchController extends CloudDeviceController {
    entityId: string;
    uiid: number;
    maxChannel: number;
    channelName?: { [key: string]: string };
    params: ICloudMultiChannelSwitchParams;
    updateSwitch!: (switches: ICloudMultiChannelSwitchParams['switches']) => Promise<void>;
    updateState!: (switches: ICloudMultiChannelSwitchParams['switches']) => Promise<void>;
    constructor(params: ICloudDeviceConstructor<ICloudMultiChannelSwitchParams>) {
        super(params);
        this.entityId = `switch.${params.deviceId}`;
        this.uiid = params.extra.uiid;
        this.channelName = params.tags?.ck_channel_name;
        this.maxChannel = getMaxChannelByUiid(params.extra.uiid);
        this.params = params.params;
    }
}

CloudMultiChannelSwitchController.prototype.updateSwitch = async function (switches) {
    const res = await coolKitWs.updateThing({
        ownerApikey: this.apikey,
        deviceid: this.deviceId,
        params: {
            switches,
        },
    });
    if (res.error === 0) {
        this.updateState(switches);
        this.params = mergeDeviceParams(this.params, { switches });
    }
};

/**
 * @description 更新状态到HA
 */
CloudMultiChannelSwitchController.prototype.updateState = async function (switches) {
    if (this.disabled) {
        return;
    }
    for (let i = 0; i < this.maxChannel; i++) {
        const { outlet, switch: status } = switches[i];
        const name = this.channelName ? this.channelName[outlet] : outlet + 1;

        let state = status;
        if (!this.online) {
            state = 'unavailable';
        }

        updateStates(`${this.entityId}_${outlet + 1}`, {
            entity_id: `${this.entityId}_${outlet + 1}`,
            state,
            attributes: {
                restored: false,
                supported_features: 0,
                friendly_name: `${this.deviceName}-${name}`,
                state,
            },
        });
    }
};

export default CloudMultiChannelSwitchController;
