import axios from 'axios';
import { setSwitches } from '../apis/lanDeviceApi';
import { updateStates } from '../apis/restApi';
import { ICloudDualR3Params } from '../ts/interface/ICloudDeviceParams';
import ILanDeviceConstructor from '../ts/interface/ILanDeviceConstructor';
import { getDataSync } from '../utils/dataUtil';
import mergeDeviceParams from '../utils/mergeDeviceParams';
import LanDeviceController from './LanDeviceController';

type TypeSwitch = {
    outlet: number;
    switch: string;
};
type TypeSwitches = TypeSwitch[];
class LanDualR3Controller extends LanDeviceController {
    params?: ICloudDualR3Params;
    entityId: string;
    maxChannel: number = 2;
    rate?: number;
    channelName?: { [key: string]: string };
    setSwitch!: (switches: TypeSwitch[]) => Promise<0 | -1>;
    updateState!: (switches: TypeSwitches) => Promise<any>;
    constructor(props: ILanDeviceConstructor) {
        super(props);
        const { deviceId } = props;
        this.entityId = `switch.${deviceId}`;
        this.rate = +getDataSync('rate.json', [this.deviceId]) || 0;
    }
}

LanDualR3Controller.prototype.setSwitch = async function (switches) {
    if (this.devicekey && this.selfApikey) {
        const res = await setSwitches({
            ip: this.ip! || this.target!,
            port: this.port,
            deviceid: this.deviceId,
            devicekey: this.devicekey,
            selfApikey: this.selfApikey,
            data: JSON.stringify({
                switches,
            }),
        });

        if (res && res.data && res.data.error === 0) {
            this.updateState(switches);
            this.params = mergeDeviceParams(this.params, { switches });
            return 0;
        }
    }
    return -1;
};

LanDualR3Controller.prototype.updateState = async function (switches) {
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

export default LanDualR3Controller;
