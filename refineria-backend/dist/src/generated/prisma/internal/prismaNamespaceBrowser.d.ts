import * as runtime from "@prisma/client/runtime/index-browser";
export type * from '../models';
export type * from './prismaNamespace';
export declare const Decimal: typeof runtime.Decimal;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: import("@prisma/client/runtime/client").DbNullClass;
export declare const JsonNull: import("@prisma/client/runtime/client").JsonNullClass;
export declare const AnyNull: import("@prisma/client/runtime/client").AnyNullClass;
export declare const ModelName: {
    readonly User: "User";
    readonly Supplier: "Supplier";
    readonly Transaction: "Transaction";
    readonly GoldBar: "GoldBar";
    readonly Process: "Process";
    readonly ProcessLot: "ProcessLot";
    readonly Worker: "Worker";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const UserScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly email: "email";
    readonly password: "password";
    readonly role: "role";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type UserScalarFieldEnum = (typeof UserScalarFieldEnum)[keyof typeof UserScalarFieldEnum];
export declare const SupplierScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly contactInfo: "contactInfo";
    readonly registrationDate: "registrationDate";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type SupplierScalarFieldEnum = (typeof SupplierScalarFieldEnum)[keyof typeof SupplierScalarFieldEnum];
export declare const TransactionScalarFieldEnum: {
    readonly id: "id";
    readonly type: "type";
    readonly weight: "weight";
    readonly weightUnit: "weightUnit";
    readonly purity: "purity";
    readonly supplierId: "supplierId";
    readonly date: "date";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TransactionScalarFieldEnum = (typeof TransactionScalarFieldEnum)[keyof typeof TransactionScalarFieldEnum];
export declare const GoldBarScalarFieldEnum: {
    readonly id: "id";
    readonly code: "code";
    readonly supplierId: "supplierId";
    readonly grossWeight: "grossWeight";
    readonly ley: "ley";
    readonly analytical: "analytical";
    readonly expected: "expected";
    readonly recovered: "recovered";
    readonly available: "available";
    readonly registrationDate: "registrationDate";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type GoldBarScalarFieldEnum = (typeof GoldBarScalarFieldEnum)[keyof typeof GoldBarScalarFieldEnum];
export declare const ProcessScalarFieldEnum: {
    readonly id: "id";
    readonly number: "number";
    readonly supplierId: "supplierId";
    readonly status: "status";
    readonly closedAt: "closedAt";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type ProcessScalarFieldEnum = (typeof ProcessScalarFieldEnum)[keyof typeof ProcessScalarFieldEnum];
export declare const ProcessLotScalarFieldEnum: {
    readonly id: "id";
    readonly processId: "processId";
    readonly number: "number";
    readonly barIds: "barIds";
    readonly recovered: "recovered";
    readonly creationDate: "creationDate";
};
export type ProcessLotScalarFieldEnum = (typeof ProcessLotScalarFieldEnum)[keyof typeof ProcessLotScalarFieldEnum];
export declare const WorkerScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly position: "position";
    readonly status: "status";
    readonly startDate: "startDate";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type WorkerScalarFieldEnum = (typeof WorkerScalarFieldEnum)[keyof typeof WorkerScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
