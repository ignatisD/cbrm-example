import * as path from "path";
import { Request, Response } from "express";
import { Options } from "nodemailer/lib/mailer";
import {
    Configuration,
    Controller,
    IAppRoutes,
    IRoute,
    ISimpleRoute,
    JsonResponse,
    PermissionLevel
} from "@ignatisd/cbrm";
import { ApplicationBusiness } from "../business/ApplicationBusiness";

export class ApplicationController extends Controller<ApplicationBusiness> implements IAppRoutes {

    constructor() {
        super(ApplicationBusiness);
    }

    public routes(): IRoute[] {
        return [
            {
                name: "Api Index",
                path: "/",
                method: "index",
                verb: "get",
                ctrl: this
            },
            {
                name: "Routes",
                path: "/_routes",
                verb: "get",
                method: "getRoutes",
                ctrl: this,
                permission: PermissionLevel.VIEW,
                permissionsConfig: {
                    model: "Route"
                }
            },
            {
                name: "Test email",
                path: "/email",
                verb: "get",
                method: "testEmail",
                ctrl: this
            },
            {
                name: "Test Queues",
                path: "/queue",
                verb: "get",
                method: "testQueues",
                ctrl: this
            },
            // DO NOT REPLACE OR REMOVE THE BELOW COMMENT!!!!!
            // CRUD

            // CRUD
            // DO NOT REPLACE OR REMOVE THE ABOVE COMMENT!!!!!
        ];
    }

    public getRoutes(req: Request, res: Response) {
        let routes: ISimpleRoute[] = ApplicationController.getRouting(this.routes());
        return res.json(new JsonResponse().ok(routes, "routes"));
    }

    public static getRouting(_routes: IRoute[], parentPath: string = ""): ISimpleRoute[] {
        let routes: ISimpleRoute[] = [];
        _routes.forEach((_route: IRoute) => {
            if (!_route.name) {
                return;
            }
            let route: ISimpleRoute = {
                name: _route.name,
                path: path.join(parentPath, _route.path),
                permissions: _route.permissions
            };
            if (_route.routes && _route.routes.length) {
                route.routes = ApplicationController.getRouting(_route.routes, route.path);
            }
            routes.push(route);
        });
        return routes;
    }

    index(req: Request, res: Response): void {
        try {
            res.json(new JsonResponse().ok({
                title: "Hello world!",
                mode: process.env.NODE_ENV,
                host: process.env.HOSTNAME,
                build: process.env.BUILD,
                pm2: process.env.NODE_APP_INSTANCE
            }));
        } catch (e) {
            res.status(500).json(new JsonResponse().exception(e));
        }
    }

    async testQueues(req: Request, res: Response) {
        try {
            const emailOptions: Options = {
                from: Configuration.get("appEmail"),
                to: "example@example.com",
                subject: "Test email from Queue",
                html: "<h1>Hello Queue!</h1>"
            };
            const response = await this.business(req).testQueues(emailOptions);
            res.json(response);
        } catch (e) {
            res.status(500).json(new JsonResponse().exception(e));
        }
    }

    async testEmail(req: Request, res: Response) {
        try {
            const emailOptions: Options = {
                from: Configuration.get("appEmail"),
                to: "ignatios@drakoulas.gr",
                subject: "Test email",
                html: "<h1>Hello World!</h1>"
            };
            const response = await this.business(req).notifyEmail(emailOptions);
            res.json(response);
        } catch (e) {
            this.exception(req, e, "testEmail");
            res.status(500).json(new JsonResponse().exception(e));
        }
    }
}
