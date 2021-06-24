import _ from 'lodash';
import { transmitRfChlAPI } from '../apis/lanDeviceApi';
import { updateStates } from '../apis/restApi';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { ICloudRFBridgeParams } from '../ts/interface/ICloudDeviceParams';
import ILanDeviceConstructor from '../ts/interface/ILanDeviceConstructor';
import TypeCkRFBridgeParams from '../ts/type/TypeCkRFBridgeParams';
import mergeDeviceParams from '../utils/mergeDeviceParams';
import LanDeviceController from './LanDeviceController';

class LanRFBridgeController extends LanDeviceController {
    entityId: string;
    params?: ICloudRFBridgeParams;
    tags?: ICloudDeviceConstructor['tags'];
    entityMap: Map<
        number,
        {
            entityId: string;
            name: string;
            icon?: string;
        }
    > = new Map();
    rfValMap: Map<number, string> = new Map();
    parseMdnsData2Ha!: (data: TypeCkRFBridgeParams) => number[];
    transmitRfChl!: (data: any) => Promise<0 | -1>;
    updateState!: (ids?: number[], time?: number) => Promise<void>;
    constructor(props: ILanDeviceConstructor) {
        super(props);
        const { deviceId } = props;
        this.entityId = `binary_sensor.${deviceId}`;
    }
}

LanRFBridgeController.prototype.parseMdnsData2Ha = function (data) {
    const res: number[] = [];
    const keys = Object.keys(data);
    keys.forEach((item) => {
        const tmp = item.match(/(?<=rfTrig)\d+/);
        if (tmp && tmp[0]) {
            res.push(+tmp[0]);
        }
    });
    return res;
};

LanRFBridgeController.prototype.transmitRfChl = async function (data) {
    if (this.devicekey && this.selfApikey) {
        const res = await transmitRfChlAPI({
            ip: this.ip! || this.target!,
            port: this.port,
            deviceid: this.deviceId,
            devicekey: this.devicekey,
            selfApikey: this.selfApikey,
            data: JSON.stringify(data),
        });
        if (res?.data && res.data.error === 0 && _.isNumber(data.rfChl)) {
            this.updateState([data.rfChl], 1000);
            return 0;
        }
    }
    return -1;
};

LanRFBridgeController.prototype.updateState = async function (ids, time = 3000) {
    if (this.disabled || !this.entityMap?.size) {
        return;
    }
    let state = 'on';
    if (!ids) {
        ids = [...this.entityMap.keys()];
        state = 'off';
    }
    for (let i = 0; i < ids.length; i++) {
        const entity = this.entityMap.get(ids[i]);
        if (entity) {
            const { entityId, icon, name } = entity;
            await updateStates(entityId, {
                entity_id: `${entityId}`,
                state,
                attributes: {
                    restored: false,
                    friendly_name: name,
                    state,
                    icon,
                },
            });
        }
    }

    if (state === 'on' && ids) {
        setTimeout(() => {
            ids!.map((id) => {
                const entity = this.entityMap!.get(id);
                if (entity) {
                    const { entityId, icon, name } = entity;
                    updateStates(entityId, {
                        entity_id: `${entityId}`,
                        state: 'off',
                        attributes: {
                            restored: false,
                            friendly_name: name,
                            state: 'off',
                            icon,
                        },
                    });
                }
            });
        }, time);
    }
};

export default LanRFBridgeController;
