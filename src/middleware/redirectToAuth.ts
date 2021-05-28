import _ from 'lodash';
import { Request, Response, NextFunction } from 'express';
import { debugMode } from '../config/config';
import { HaRestURL } from '../config/url';
import AuthClass from '../class/AuthClass';

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

    if (_.get(headers, 'cookie') && process.env.SUPERVISOR_TOKEN) {
        next();
        return;
    }

    if (AuthClass.isValid(ip)) {
        next();
    } else {
        res.json({
            error: 302,
            data: HaRestURL,
        });
    }
};
