import { Options } from "nodemailer/lib/mailer";
import { Business, Email, IJobData, JsonResponse, Logger, QueuedJob } from "@ignatisd/cbrm";
import { cronTab } from "../config/cronTab";

export class ApplicationBusiness extends Business {

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

    public async testQueues(emailOptions) {
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
