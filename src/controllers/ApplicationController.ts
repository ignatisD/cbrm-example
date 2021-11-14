import { Request, Response } from "express";
import * as path from "path";
import Controller from "@ignatisd/cbrm/lib/controllers/Controller";
import IAppRoutes, { ISimpleRoute } from "@ignatisd/cbrm/lib/interfaces/routes/AppRoutes";
import IRoute from "@ignatisd/cbrm/lib/interfaces/helpers/Route";
import { PermissionLevel } from "@ignatisd/cbrm/lib/interfaces/models/Permission";
import JsonResponse from "@ignatisd/cbrm/lib/helpers/JsonResponse";
import ApplicationBusiness from "../business/ApplicationBusiness";

export default class ApplicationController extends Controller<ApplicationBusiness> implements IAppRoutes {

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
}