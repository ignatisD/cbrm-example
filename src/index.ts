import { MyServer } from "./MyServer";
import Authenticator from "@ignatisd/cbrm/lib/helpers/Authenticator";
import { languageOptions } from "./config/languageOptions";

MyServer.setAuthenticator(Authenticator);
const server = MyServer.bootstrap({
    apiName: "test",
    envFile: ".env",
    languageOptions: languageOptions
});
