import _ from 'lodash';
import HASocket from '../class/HASocketClass';
import Controller from '../controller/Controller';
import DiyDeviceController from '../controller/DiyDeviceController';
import LanSwitchController from '../controller/LanSwitchController';
import CloudSwitchController from '../controller/CloudSwitchController';
import CloudRGBBulbController from '../controller/CloudRGBBulbController';
import CloudDimmingController from '../controller/CloudDimmingController';
import CloudPowerDetectionSwitchController from '../controller/CloudPowerDetectionSwitchController';
import CloudMultiChannelSwitchController from '../controller/CloudMultiChannelSwitchController';
import CloudRGBLightStripController from '../controller/CloudRGBLightStripController';
import { TypeHaSocketCallServiceData } from '../ts/type/TypeHaSocketMsg';
import LanMultiChannelSwitchController from '../controller/LanMultiChannelSwitchController';
import CloudTandHModificationController from '../controller/CloudTandHModificationController';
import CloudDoubleColorBulbController from '../controller/CloudDoubleColorBulbController';
import CloudDualR3Controller from '../controller/CloudDualR3Controller';
import eventBus from './eventBus';
import LanDualR3Controller from '../controller/LanDualR3Controller';
import LanTandHModificationController from '../controller/LanTandHModificationController';
import LanPowerDetectionSwitchController from '../controller/LanPowerDetectionSwitchController';
import LanDoubleColorLightController from '../controller/LanDoubleColorLightController';
import CloudUIID104Controller from '../controller/CloudUIID104Controller';
import haServiceMap from '../config/haServiceMap';
import CloudCoverController from '../controller/CloudCoverController';
import CloudUIID44Controller from '../controller/CloudUIID44Controller';
import CloudUIID34Controller from '../controller/CloudUIID34Controller';
import LanUIID34Controller from '../controller/LanUIID34Controller';

/**
 * @param {string} entity_id 实体id
 * @param {string} state // on | off
 * @param {*} res socket 返回的信息主体
 * @param {{ outlet: number; switch: string }[]} [mutiSwitchState] 可选，控制多通道的全开/全关
 * @return {*}
 */
const handleDeviceByEntityId = async (entity_id: string, state: string, res: any, mutiSwitchState?: { outlet: number; switch: string }[]) => {
    const device = Controller.getDevice(entity_id.replace(/_\d+$/, ''));
    // DIY
    if (device instanceof DiyDeviceController) {
        await device.setSwitch(state);
    }

    // LAN
    else if (device instanceof LanSwitchController) {
        await device.setSwitch(state);
    }

    // LAN
    else if (device instanceof LanMultiChannelSwitchController || device instanceof LanDualR3Controller) {
        if (mutiSwitchState) {
            await device.setSwitch(mutiSwitchState);
        } else {
            const [id, outlet] = entity_id.split('_');
            await device.setSwitch([
                {
                    outlet: +outlet - 1,
                    switch: state,
                },
            ]);
        }
    }
    // lan 恒温恒湿
    else if (device instanceof LanTandHModificationController) {
        device.setSwitch(state);
    }
    // lan 单通道插座增强版（用电统计）
    else if (device instanceof LanPowerDetectionSwitchController) {
        device.setSwitch(state);
    }
    // lan 双色灯球
    else if (device instanceof LanDoubleColorLightController) {
        device.updateLight(
            device.parseHaData2Ck({
                state,
                ...res.service_data,
            })
        );
    }
    // lan 风扇灯
    else if (device instanceof LanUIID34Controller) {
        const params = device.parseHaData2Lan({ state, ...res.service_data });
        params.fan && (await device.setFan(params));
        params.light && (await device.toggleLight(params));
    }

    // Cloud
    else if (device instanceof CloudSwitchController) {
        await device.updateSwitch(state);
    } else if (device instanceof CloudRGBBulbController) {
        await device.updateLight(
            device.parseHaData2Ck({
                state,
                ...res.service_data,
            })
        );
    } else if (device instanceof CloudDimmingController) {
        const { brightness_pct } = res.service_data;
        await device.updateLight({
            switch: state,
            bright: brightness_pct,
        });
    } else if (device instanceof CloudPowerDetectionSwitchController) {
        await device.updateSwitch(state);
    } else if (device instanceof CloudTandHModificationController) {
        await device.updateSwitch(state);
    } else if (device instanceof CloudMultiChannelSwitchController || device instanceof CloudDualR3Controller) {
        if (mutiSwitchState) {
            await device.updateSwitch(mutiSwitchState);
        } else {
            const [id, outlet] = entity_id.split('_');
            await device.updateSwitch([
                {
                    outlet: +outlet - 1,
                    switch: state,
                },
            ]);
        }
    } else if (device instanceof CloudRGBLightStripController) {
        const params = device.parseHaData2Ck({
            state,
            ...res.service_data,
        });
        device.updateLight(params);
    } else if (device instanceof CloudDoubleColorBulbController) {
        await device.updateLight(
            device.parseHaData2Ck({
                state,
                ...res.service_data,
            })
        );
    } else if (device instanceof CloudUIID104Controller) {
        await device.updateLight(
            device.parseHaData2Ck({
                state,
                ...res.service_data,
            })
        );
    } else if (device instanceof CloudCoverController) {
        await device.setCover({ switch: state, setclose: _.get(res, 'service_data.position') });
    } else if (device instanceof CloudUIID44Controller) {
        const { brightness_pct } = res.service_data;
        await device.updateLight({ switch: state, brightness: brightness_pct });
    } else if (device instanceof CloudUIID34Controller) {
        const switches = device.parseHaData2Ck({ state, ...res.service_data });
        await device.updateSwitch(switches);
    }
};

export default async (reconnect = false) => {
    try {
        const res = await HASocket.init(reconnect);
        if (res === 0) {
            HASocket.subscribeEvents('call_service');
            HASocket.handleEvent('call_service', async (res: TypeHaSocketCallServiceData) => {
                console.log('HA emit call_service event', res);

                const {
                    service_data: { entity_id },
                    service,
                } = res;
                const state = haServiceMap.get(service)!;

                if (Array.isArray(entity_id)) {
                    // 暂存多通道设备
                    const tmpMap = new Map<
                        string,
                        {
                            outlet: number;
                            switch: string;
                        }[]
                    >();

                    entity_id.forEach((item) => {
                        const [deviceid, outlet] = item.split('_');
                        const device = Controller.getDevice(deviceid);
                        // 一次性控制多通道设备多个通道
                        if (device instanceof LanMultiChannelSwitchController || device instanceof CloudMultiChannelSwitchController || device instanceof CloudDualR3Controller) {
                            if (tmpMap.has(deviceid)) {
                                tmpMap.get(deviceid)!.push({
                                    outlet: outlet - 1,
                                    switch: state,
                                });
                            } else {
                                tmpMap.set(deviceid, [
                                    {
                                        outlet: outlet - 1,
                                        switch: state,
                                    },
                                ]);
                            }
                        } else {
                            handleDeviceByEntityId(item, state, res);
                        }
                    });

                    for (let [id, mutiSwitchState] of tmpMap.entries()) {
                        await handleDeviceByEntityId(id, state, res, mutiSwitchState);
                    }
                }

                if (typeof entity_id === 'string') {
                    await handleDeviceByEntityId(entity_id, state, res);
                }
                eventBus.emit('sse');
            });
        }
    } catch (err) {
        console.log('Jia ~ file: initHaSocket.ts ~ line 28 ~ err', err);
    }
};
