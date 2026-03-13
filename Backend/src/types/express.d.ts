import type { IUserDocument } from "../modules/user/user.types.js";

declare global {
    namespace Express {

        interface User extends IUserDocument {}

        interface Request {
            user?: IUserDocument; 
        }
    }
}

export {};