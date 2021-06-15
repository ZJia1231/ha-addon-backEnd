import _ from 'lodash';
import { Request, Response, NextFunction } from 'express';
import { debugMode, isSupervisor } from '../config/config';
import { HaRestURL } from '../config/url';
import AuthClass from '../class/AuthClass';
import { getCoreInfoAPI } from '../apis/supervisorApi';

const genAuthorizeUrl = (hassUrl: string, clientId: string, redirectUrl: string, state?: string) => {
    let authorizeUrl = `${hassUrl}/auth/authorize?response_type=code&redirect_uri=${encodeURIComponent(redirectUrl)}`;

    authorizeUrl += `&client_id=${encodeURIComponent(clientId)}`;

    if (state) {
        authorizeUrl += `&state=${encodeURIComponent(state)}`;
    }
    return authorizeUrl;
};

export default async (req: Request, res: Response, next: NextFunction) => {
    const { ip, headers } = req;

    if (debugMode) {
        next();
        return;
    }

    if (_.get(headers, 'cookie') && isSupervisor) {
        next();
        return;
    }

    if (AuthClass.isValid(ip)) {
        next();
        return;
    }

    if (isSupervisor) {
        // todo
        res.json({
            error: 302,
            data: 'http://homeassistant:8123',
        });
    } else {
        res.json({
            error: 302,
            data: HaRestURL,
        });
    }
};
