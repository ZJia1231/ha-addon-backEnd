import CloudDeviceController from './CloudDeviceController';
import { ICloudDualR3Params } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { updateStates } from '../apis/restApi';
import coolKitWs from 'coolkit-ws';
import { getDataSync } from '../utils/dataUtil';
import mergeDeviceParams from '../utils/mergeDeviceParams';

class CloudDualR3Controller extends CloudDeviceController {
    params: ICloudDualR3Params;
    entityId: string;
    uiid: number = 126;
    maxChannel: number = 2;
    rate?: number;
    channelName?: { [key: string]: string };
    updateSwitch!: (switches: ICloudDualR3Params['switches']) => Promise<void>;
    updateState!: (switches: ICloudDualR3Params['switches']) => Promise<void>;
    constructor(params: ICloudDeviceConstructor<ICloudDualR3Params>) {
        super(params);
        this.entityId = `switch.${params.deviceId}`;
        this.params = params.params;
        this.channelName = params.tags?.ck_channel_name;
        this.rate = +getDataSync('rate.json', [this.deviceId]) || 0;
    }
}

CloudDualR3Controller.prototype.updateSwitch = async function (switches) {
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
CloudDualR3Controller.prototype.updateState = async function (switches) {
    console.log('Jia ~ file: CloudDualR3Controller.ts ~ line 44 ~ switches', switches);
    if (this.disabled) {
        return;
    }
    switches &&
        switches.forEach(({ outlet, switch: status }) => {
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
        });
};

export default CloudDualR3Controller;
