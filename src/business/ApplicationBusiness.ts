import { Options } from "nodemailer/lib/mailer";
// Interfaces
import { IJobData } from "@ignatisd/cbrm/lib/interfaces/helpers/QueuedJob";
// Helpers
import QueuedJob from "@ignatisd/cbrm/lib/helpers/QueuedJob";
import Logger from "@ignatisd/cbrm/lib/helpers/Logger";
// Business
import Business from "@ignatisd/cbrm/lib/business/Business";
import cronTab from "../config/cronTab";
import Email from "@ignatisd/cbrm/lib/helpers/Email";
import JsonResponse from "@ignatisd/cbrm/lib/helpers/JsonResponse";

export default class ApplicationBusiness extends Business {

    constructor() {
        super();
    }

    public static cron() {
        Object.keys(cronTab).forEach(pattern => {
            const jobs: IJobData[] = cronTab[pattern];
            jobs.forEach(job => {
                const q = new QueuedJob(job.business);
                q.setup(job.method, job.inputs);
                const res = q.fireCron(pattern);
                Logger.info(res.get());
            });
        });
    }

    public async testQueues() {
        const emailOptions: Options = {
            from: "ignatios@drakoulas.gr",
            to: process.env.APPLICATION_EMAIL,
            subject: "Test email from Queue",
            html: "<h1>Hello Queue!</h1>"
        };
        return this.queue()
            .setup("notifyEmail", [emailOptions])
            .later(20000)
            .fire();
    }

    public async notifyEmail(emailOptions: Options) {
        try {
            // Logger.info(emailOptions);
            const email = new Email(emailOptions);
            return await email.send();
        } catch (e) {
            this.exception(e, "notifyEmail");
            return JsonResponse.caught(e);
        }
    }
}
