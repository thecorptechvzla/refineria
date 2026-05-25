import { WorkerStatus } from '../../generated/prisma/client';
export declare class CreateWorkerDto {
    name: string;
    position: string;
    status?: WorkerStatus;
    startDate?: string;
}
