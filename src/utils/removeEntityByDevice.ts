import { removeStates } from '../apis/restApi';
import CloudDeviceController from '../controller/CloudDeviceController';
import CloudDualR3Controller from '../controller/CloudDualR3Controller';
import CloudMultiChannelSwitchController from '../controller/CloudMultiChannelSwitchController';
import CloudTandHModificationController from '../controller/CloudTandHModificationController';
import CloudUIID34Controller from '../controller/CloudUIID34Controller';
import CloudZigbeeUIID1000Controller from '../controller/CloudZigbeeUIID1000Controller';
import CloudZigbeeUIID1770Controller from '../controller/CloudZigbeeUIID1770Controller';
import CloudZigbeeUIID2026Controller from '../controller/CloudZigbeeUIID2026Controller';
import CloudZigbeeUIID3026Controller from '../controller/CloudZigbeeUIID3026Controller';
import DiyDeviceController from '../controller/DiyDeviceController';
import LanDeviceController from '../controller/LanDeviceController';
import LanDualR3Controller from '../controller/LanDualR3Controller';
import LanMultiChannelSwitchController from '../controller/LanMultiChannelSwitchController';
import LanTandHModificationController from '../controller/LanTandHModificationController';
import LanUIID34Controller from '../controller/LanUIID34Controller';

export default (device: LanDeviceController | DiyDeviceController | CloudDeviceController) => {
    console.log('try to remove entity from Ha', device.entityId);

    if (device instanceof DiyDeviceController) {
        return;
    } else if (device instanceof CloudTandHModificationController || device instanceof LanTandHModificationController) {
        removeStates(device.entityId);
        removeStates(`sensor.${device.deviceId}_h`);
        removeStates(`sensor.${device.deviceId}_t`);
        return;
    } else if (device instanceof CloudMultiChannelSwitchController || device instanceof CloudDualR3Controller) {
        for (let i = 0; i < device.maxChannel; i++) {
            removeStates(`${device.entityId}_${i + 1}`);
        }
        return;
    } else if (device instanceof LanMultiChannelSwitchController || device instanceof LanDualR3Controller) {
        if (device.maxChannel) {
            for (let i = 0; i < device.maxChannel; i++) {
                removeStates(`${device.entityId}_${i + 1}`);
            }
        }
        return;
    } else if (device instanceof CloudZigbeeUIID1770Controller) {
        removeStates(`${device.entityId}_temperature`);
        removeStates(`${device.entityId}_humidity`);
        removeStates(`${device.entityId}_battery`);
        return;
    } else if (device instanceof CloudZigbeeUIID1000Controller) {
        removeStates(device.entityId);
        removeStates(`${device.entityId}_battery`);
        return;
    } else if (device instanceof CloudZigbeeUIID2026Controller || device instanceof CloudZigbeeUIID3026Controller) {
        removeStates(device.entityId);
        removeStates(`sensor.${device.deviceId}_battery`);
        return;
    } else if (device instanceof CloudUIID34Controller || device instanceof LanUIID34Controller) {
        removeStates(device.entityId);
        removeStates(`fan.${device.deviceId}`);
        return;
    }
    // todo
    // rfBridge设备
    removeStates(device.entityId);
};
