export declare const Role: {
    readonly ADMIN: "ADMIN";
    readonly SUPERADMIN: "SUPERADMIN";
};
export type Role = (typeof Role)[keyof typeof Role];
export declare const TransactionType: {
    readonly IN: "IN";
    readonly OUT: "OUT";
};
export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
export declare const WeightUnit: {
    readonly g: "g";
    readonly kg: "kg";
};
export type WeightUnit = (typeof WeightUnit)[keyof typeof WeightUnit];
export declare const WorkerStatus: {
    readonly active: "active";
    readonly inactive: "inactive";
};
export type WorkerStatus = (typeof WorkerStatus)[keyof typeof WorkerStatus];
