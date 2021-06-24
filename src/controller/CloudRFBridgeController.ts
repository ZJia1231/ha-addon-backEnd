import _ from 'lodash';
import CloudDeviceController from './CloudDeviceController';
import { ICloudRFBridgeParams } from '../ts/interface/ICloudDeviceParams';
import ICloudDeviceConstructor from '../ts/interface/ICloudDeviceConstructor';
import { updateStates } from '../apis/restApi';
import TypeCkRFBridgeParams from '../ts/type/TypeCkRFBridgeParams';
class CloudRFBridgeController extends CloudDeviceController {
    entityId: string;
    uiid: number = 28;
    params: ICloudRFBridgeParams;
    tags: ICloudDeviceConstructor['tags'];
    entityMap: Map<
        number,
        {
            entityId: string;
            name: string;
            icon?: string;
        }
    > = new Map();
    rfValMap: Map<number, string> = new Map();
    parseCkData2Ha!: (data: TypeCkRFBridgeParams) => number[];
    updateState!: (ids?: number[]) => Promise<void>;
    constructor(params: ICloudDeviceConstructor<ICloudRFBridgeParams>) {
        super(params);
        this.entityId = `binary_sensor.${params.deviceId}`;
        this.params = params.params;
        this.uiid = params.extra.uiid;
        this.tags = params.tags;
        if (Array.isArray(params.params.rfList)) {
            params.params.rfList.forEach(({ rfChl, rfVal }) => {
                this.rfValMap.set(rfChl, rfVal);
            });
        }

        if (params.tags?.zyx_info && this.rfValMap.size) {
            params.tags.zyx_info.forEach(({ name, buttonName, remote_type }) => {
                buttonName.forEach((item) => {
                    const [key, childName] = Object.entries(item)[0];
                    const entityName = `${name}-${childName}`;
                    const suffix = this.rfValMap.get(+key);
                    const entityId = `${this.entityId}_${suffix}`;
                    if (suffix) {
                        this.entityMap.set(+key, {
                            entityId,
                            name: entityName,
                            icon: +remote_type < 6 ? 'mdi:remote' : 'mdi:alert',
                        });
                    }
                });
            });
        }
    }
}

CloudRFBridgeController.prototype.parseCkData2Ha = function (data) {
    const res: number[] = [];
    if (data.cmd === 'trigger') {
        const keys = Object.keys(data);
        keys.forEach((item) => {
            const tmp = item.match(/(?<=rfTrig)\d+/);
            if (tmp && tmp[0]) {
                res.push(+tmp[0]);
            }
        });
    }
    if (data.cmd === 'transmit') {
        const values = Object.values(data);
        values.forEach((item) => {
            if (_.isNumber(item)) {
                res.push(item);
            }
        });
    }
    return res;
};

/**
 * @description 更新状态到HA
 */
CloudRFBridgeController.prototype.updateState = async function (ids) {
    if (this.disabled) {
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
                const entity = this.entityMap.get(id);
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
        }, 1000);
    }
};

export default CloudRFBridgeController;
