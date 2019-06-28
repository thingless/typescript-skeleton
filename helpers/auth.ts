import { Request, Response } from 'express';
import * as dal from '../dal/dal'
import { HttpError } from '../helpers/util'

const BASIC_AUTH_USERS: { [user: string]: string; } = {
    'admin': 'XXX:this-must-be-a-secret',
}

/**
 * Secures the route with basic auth. Users are defined in `BASIC_AUTH_USERS`. The `admin` user is always allowed otherwise the list of allowed users must be supplied
 * @param allowedUsers
 */
export function basicAuth(...allowedUsers: string[]) {
    allowedUsers.push('admin')
    function _basicAuth(req: Request, res: Response, next: () => void) {
        if (process.env.NODE_ENV === 'testing') return next() //do not enforce auth in tests
        // check for basic auth header
        if (!req.headers.authorization || req.headers.authorization.indexOf('Basic ') === -1) {
            return res.status(401).json({ message: 'Missing Authorization Header' });
        }
        // verify auth credentials
        const base64Credentials = req.headers.authorization.split(' ')[1];
        const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
        const [username, password] = credentials.split(':');
        if (typeof (BASIC_AUTH_USERS[username]) == "undefined" ||
        BASIC_AUTH_USERS[username] !== password ||
            (allowedUsers && allowedUsers.indexOf(username) == -1)
        ) return res.status(401).json({ message: 'Invalid Credentials' });
        next();
    }
    return _basicAuth;
}

export async function userAuth(req: Request, res: Response, next: () => void) {
    const user = await dal.getUser(req.uid)
    if (user && req.uid && (!req.params.uid || req.params.uid === req.uid)) {
      req.user = user
      return next()
    }
    //if the current user is an admin then allow the request... aka impersonation
    if (user && user.is_admin && req.params.uid) {
      if (!(await dal.getUser(req.params.uid))) throw new HttpError(404, "could not find user")
      req.uid = req.params.uid
      req.user = await dal.getUser(req.params.uid) as any
      return next()
    }
    //else redirect to login
    const redirect_uri = `${req.protocol}://${req.get('host')}/login`;
    res.redirect(redirect_uri)
  }
