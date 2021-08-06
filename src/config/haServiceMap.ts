const haServiceMap = new Map<string, string>([
    ['turn_on', 'on'],
    ['turn_off', 'off'],
    ['open_cover', 'on'],
    ['close_cover', 'off'],
    ['stop_cover', 'pause'],
    ['set_cover_position', 'on'],
    ['set_preset_mode', 'on'], // Fan
]);
export default haServiceMap;
