import { debugMode } from './config';

// prod
let appId = '4s1FXKC9FaGfoqXhmXSJneb3qcm1gOak';
let appSecret = 'oKvCM06gvwkRbfetd6qWRrbC3rFrbIpV';

if (debugMode) {
    // 测试环境APPID
    // appId = 'iY6iazKsHokdS9FSci9AKbWTMCXUchaf';
    // appSecret = 'JBLkhfhNH6kiLD1xnsiDCaXPZn4qhi1O';
    
    // 正式环境APPID
    appId = 'KOBxGJna5qkk3JLXw3LHLX3wSNiPjAVi'; 
    appSecret = '4v0sv6X5IM2ASIBiNDj6kGmSfxo40w7n';
}

export { appId, appSecret };
