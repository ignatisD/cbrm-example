import { MyServer } from "./MyServer";
import * as path from "path";
import Authenticator from "@ignatisd/cbrm/lib/helpers/Authenticator";

MyServer.setAuthenticator(Authenticator);
const server = MyServer.bootstrap({
    apiName: "test",
    envFile: ".env",
    languageOptions: path.join(__dirname, "./config/languageOptions")
});
