import Server from "@ignatisd/cbrm/lib/Server";
import { MongooseConnector } from "@ignatisd/cbrm-mongoose";
import IRoute from "@ignatisd/cbrm/lib/interfaces/helpers/Route";
import * as mongoosePaginate from "mongoose-paginate-v2";
import * as mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import * as mongooseSlugUpdater from "mongoose-slug-updater";
import { realIntl } from "@ignatisd/cbrm-mongoose";
import { languageOptions } from "./config/languageOptions";
import { IServerConfiguration } from "@ignatisd/cbrm/lib/helpers/ServerConfiguration";

export class MyServer extends Server {

    constructor(configuration: IServerConfiguration) {
        super(configuration);
    }

    public static bootstrap(configuration: IServerConfiguration): Promise<Server> {
        return new this(configuration).init();
    }

    public databaseConnection(): Promise<unknown> {
        const connector = new MongooseConnector();
        connector.plugins([
            {fn: mongoosePaginate},
            {fn: mongooseAggregatePaginate},
            {fn: mongooseSlugUpdater},
            {
                fn: realIntl,
                opts: {
                    languages: languageOptions.locales,
                    defaultLanguage: languageOptions.defaultLocale,
                    fallback: languageOptions.fallbackLocale
                }
            },

        ]);
        return connector.init({
            uri: process.env.MONGODB_URI,
            options: {
                socketTimeoutMS: 600000
            }
        });
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
