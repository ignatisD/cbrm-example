import Server from "@ignatisd/cbrm/lib/Server";
import { MongooseConnector } from "@ignatisd/cbrm-mongoose";
import IRoute from "@ignatisd/cbrm/lib/interfaces/helpers/Route";

export class MyServer extends Server {

    public databaseConnection(): Promise<unknown> {
        const connector = new MongooseConnector();
        return connector.init({
            uri: process.env.MONGODB_URI,
            options: {
                socketTimeoutMS: 600000
            }
        })
    }

    public getApplicationRoutes(): IRoute[] {
        const ApplicationController = require("./controllers/ApplicationController").default;
        return new ApplicationController().routes();
    }

    public globalMiddlewares() {
        // ex. APM middleware
        // this.app.use();
    }
}
