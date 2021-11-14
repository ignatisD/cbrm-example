// Interfaces
import { IJobData } from "@ignatisd/cbrm/lib/interfaces/helpers/QueuedJob";
// Helpers
import QueuedJob from "@ignatisd/cbrm/lib/helpers/QueuedJob";
import Logger from "@ignatisd/cbrm/lib/helpers/Logger";
// Business
import Business from "@ignatisd/cbrm/lib/business/Business";
import cronTab from "../config/cronTab";

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
}
