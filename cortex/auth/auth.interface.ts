import { CRequest, CResponse } from "../http/chttpx";

export interface IMiddleware {
    handle(req: CRequest, res: CResponse, next: () => void): void | Promise<void>;
}