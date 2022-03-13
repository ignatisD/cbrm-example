import Server from "@ignatisd/cbrm/lib/Server";
import { MongooseConnector } from "@ignatisd/cbrm-mongoose";
import IRoute from "@ignatisd/cbrm/lib/interfaces/helpers/Route";
import * as mongoosePaginate from "mongoose-paginate-v2";
import * as mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";
import * as mongooseSlugUpdater from "mongoose-slug-updater";
import { realIntl } from "@ignatisd/cbrm-mongoose";
import { languageOptions } from "./config/languageOptions";
import { IServerConfiguration } from "@ignatisd/cbrm/lib/interfaces/helpers/ServerConfiguration";
import { IMailerOptions, Mailer } from "@ignatisd/cbrm/lib/helpers/Mailer";
import Logger from "@ignatisd/cbrm/lib/helpers/Logger";
import * as path from "path";
import Queue from "@ignatisd/cbrm/lib/helpers/Queue";

export class MyServer extends Server {

    constructor(configuration: IServerConfiguration) {
        super(configuration);
    }

    public static bootstrap(configuration: IServerConfiguration): Promise<Server> {
        return new this(configuration).init();
    }

    public configure() {
        require("events").EventEmitter.defaultMaxListeners = 100;
        const mailOptions: IMailerOptions = {
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 465
        };
        if (process.env.SMTP_SECURE) {
            mailOptions.secure = true;
        }
        if (process.env.SMTP_AUTH_USER && process.env.SMTP_AUTH_PASS) {
            mailOptions.user = process.env.SMTP_AUTH_USER;
            mailOptions.pass = process.env.SMTP_AUTH_PASS;
        }
        global.Mailer = Mailer.setup(mailOptions);
        global.ServerRoot = path.resolve(__dirname);
        global.ViewsRoot = path.join(__dirname, "../views");
        global.pagingLimit = 100;
        Logger.setStatics(process.env.DEBUG !== "false", `${process.env.NODE_ENV}@${process.env.HOSTNAME}`);

        // Initialize Languages

        global.businessRegistry = {};
        global.Redis = {
            host: process.env.REDIS_HOST || "redis",
            port: parseInt(process.env.REDIS_PORT) || 6379
        };
        global.isDevMode = process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
        global.isWorker = global.isDevMode || process.env.NODE_ENV === "worker";
        global.isMainWorker = global.isDevMode || process.env.NODE_TYPE === "main-worker";
        global.API = this.config.apiName || "cbrm";
    }

    public bootstrapWorkers() {
        Logger.debug("Starting queues");
        Queue.bootstrap(global.isMainWorker ? this.app : null);
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
