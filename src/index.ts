import { MyServer } from "./MyServer";
import {Authenticator, Configuration} from "@ignatisd/cbrm";
import { languageOptions } from "./config/languageOptions";
import {AppConfiguration} from "./interfaces/helpers/AppConfiguration";

MyServer.setAuthenticator(Authenticator);
const configuration = Configuration.instance<AppConfiguration>().setup({
    apiName: "test",
    envFile: ".env",
    languageOptions: languageOptions,
    queues: true
});
MyServer.bootstrap(configuration);
