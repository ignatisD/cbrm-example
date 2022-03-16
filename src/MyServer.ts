import { languageOptions } from "./config/languageOptions";
import * as cbrm from "@ignatisd/cbrm";
import {AppConfiguration} from "./interfaces/helpers/AppConfiguration";

// MongoDB - Mongoose
import { MongooseConnector } from "@ignatisd/cbrm-mongoose";
import * as mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import * as mongoosePaginate from "mongoose-paginate-v2";
import { realIntl } from "@ignatisd/cbrm-mongoose";
import {Configuration} from "@ignatisd/cbrm";

export class MyServer extends cbrm.Server<AppConfiguration> {

    constructor(configuration: Configuration<AppConfiguration>) {
        super(configuration);
    }

    public databaseConnection(): Promise<unknown> {
        const connector = new MongooseConnector();
        connector.plugins([
            {fn: mongoosePaginate},
            {fn: mongooseAggregatePaginate},
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

    public getApplicationRoutes(): cbrm.IRoute[] {
        const { ApplicationController } = require("./controllers/ApplicationController");
        return new ApplicationController().routes();
    }

    public globalMiddlewares() {
        // ex. APM middleware
        // this.app.use();
    }
}
