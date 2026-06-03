import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models";
import { type PrismaClient } from "./class";
export type * from '../models';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
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
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "user" | "supplier" | "transaction" | "goldBar" | "process" | "processLot" | "worker";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        User: {
            payload: Prisma.$UserPayload<ExtArgs>;
            fields: Prisma.UserFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.UserFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.UserFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findFirst: {
                    args: Prisma.UserFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.UserFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                findMany: {
                    args: Prisma.UserFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                create: {
                    args: Prisma.UserCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                createMany: {
                    args: Prisma.UserCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.UserCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                delete: {
                    args: Prisma.UserDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                update: {
                    args: Prisma.UserUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                deleteMany: {
                    args: Prisma.UserDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.UserUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.UserUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>[];
                };
                upsert: {
                    args: Prisma.UserUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$UserPayload>;
                };
                aggregate: {
                    args: Prisma.UserAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateUser>;
                };
                groupBy: {
                    args: Prisma.UserGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserGroupByOutputType>[];
                };
                count: {
                    args: Prisma.UserCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.UserCountAggregateOutputType> | number;
                };
            };
        };
        Supplier: {
            payload: Prisma.$SupplierPayload<ExtArgs>;
            fields: Prisma.SupplierFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SupplierFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplierPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SupplierFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplierPayload>;
                };
                findFirst: {
                    args: Prisma.SupplierFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplierPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SupplierFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplierPayload>;
                };
                findMany: {
                    args: Prisma.SupplierFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplierPayload>[];
                };
                create: {
                    args: Prisma.SupplierCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplierPayload>;
                };
                createMany: {
                    args: Prisma.SupplierCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SupplierCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplierPayload>[];
                };
                delete: {
                    args: Prisma.SupplierDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplierPayload>;
                };
                update: {
                    args: Prisma.SupplierUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplierPayload>;
                };
                deleteMany: {
                    args: Prisma.SupplierDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SupplierUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SupplierUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplierPayload>[];
                };
                upsert: {
                    args: Prisma.SupplierUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SupplierPayload>;
                };
                aggregate: {
                    args: Prisma.SupplierAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSupplier>;
                };
                groupBy: {
                    args: Prisma.SupplierGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SupplierGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SupplierCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SupplierCountAggregateOutputType> | number;
                };
            };
        };
        Transaction: {
            payload: Prisma.$TransactionPayload<ExtArgs>;
            fields: Prisma.TransactionFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TransactionFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TransactionFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                findFirst: {
                    args: Prisma.TransactionFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TransactionFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                findMany: {
                    args: Prisma.TransactionFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>[];
                };
                create: {
                    args: Prisma.TransactionCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                createMany: {
                    args: Prisma.TransactionCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TransactionCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>[];
                };
                delete: {
                    args: Prisma.TransactionDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                update: {
                    args: Prisma.TransactionUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                deleteMany: {
                    args: Prisma.TransactionDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TransactionUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TransactionUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>[];
                };
                upsert: {
                    args: Prisma.TransactionUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TransactionPayload>;
                };
                aggregate: {
                    args: Prisma.TransactionAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTransaction>;
                };
                groupBy: {
                    args: Prisma.TransactionGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TransactionGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TransactionCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TransactionCountAggregateOutputType> | number;
                };
            };
        };
        GoldBar: {
            payload: Prisma.$GoldBarPayload<ExtArgs>;
            fields: Prisma.GoldBarFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.GoldBarFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GoldBarPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.GoldBarFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GoldBarPayload>;
                };
                findFirst: {
                    args: Prisma.GoldBarFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GoldBarPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.GoldBarFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GoldBarPayload>;
                };
                findMany: {
                    args: Prisma.GoldBarFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GoldBarPayload>[];
                };
                create: {
                    args: Prisma.GoldBarCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GoldBarPayload>;
                };
                createMany: {
                    args: Prisma.GoldBarCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.GoldBarCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GoldBarPayload>[];
                };
                delete: {
                    args: Prisma.GoldBarDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GoldBarPayload>;
                };
                update: {
                    args: Prisma.GoldBarUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GoldBarPayload>;
                };
                deleteMany: {
                    args: Prisma.GoldBarDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.GoldBarUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.GoldBarUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GoldBarPayload>[];
                };
                upsert: {
                    args: Prisma.GoldBarUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$GoldBarPayload>;
                };
                aggregate: {
                    args: Prisma.GoldBarAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateGoldBar>;
                };
                groupBy: {
                    args: Prisma.GoldBarGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GoldBarGroupByOutputType>[];
                };
                count: {
                    args: Prisma.GoldBarCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.GoldBarCountAggregateOutputType> | number;
                };
            };
        };
        Process: {
            payload: Prisma.$ProcessPayload<ExtArgs>;
            fields: Prisma.ProcessFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ProcessFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ProcessFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessPayload>;
                };
                findFirst: {
                    args: Prisma.ProcessFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ProcessFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessPayload>;
                };
                findMany: {
                    args: Prisma.ProcessFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessPayload>[];
                };
                create: {
                    args: Prisma.ProcessCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessPayload>;
                };
                createMany: {
                    args: Prisma.ProcessCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ProcessCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessPayload>[];
                };
                delete: {
                    args: Prisma.ProcessDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessPayload>;
                };
                update: {
                    args: Prisma.ProcessUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessPayload>;
                };
                deleteMany: {
                    args: Prisma.ProcessDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ProcessUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ProcessUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessPayload>[];
                };
                upsert: {
                    args: Prisma.ProcessUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessPayload>;
                };
                aggregate: {
                    args: Prisma.ProcessAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateProcess>;
                };
                groupBy: {
                    args: Prisma.ProcessGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProcessGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ProcessCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProcessCountAggregateOutputType> | number;
                };
            };
        };
        ProcessLot: {
            payload: Prisma.$ProcessLotPayload<ExtArgs>;
            fields: Prisma.ProcessLotFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.ProcessLotFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessLotPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.ProcessLotFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessLotPayload>;
                };
                findFirst: {
                    args: Prisma.ProcessLotFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessLotPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.ProcessLotFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessLotPayload>;
                };
                findMany: {
                    args: Prisma.ProcessLotFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessLotPayload>[];
                };
                create: {
                    args: Prisma.ProcessLotCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessLotPayload>;
                };
                createMany: {
                    args: Prisma.ProcessLotCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.ProcessLotCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessLotPayload>[];
                };
                delete: {
                    args: Prisma.ProcessLotDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessLotPayload>;
                };
                update: {
                    args: Prisma.ProcessLotUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessLotPayload>;
                };
                deleteMany: {
                    args: Prisma.ProcessLotDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.ProcessLotUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.ProcessLotUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessLotPayload>[];
                };
                upsert: {
                    args: Prisma.ProcessLotUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$ProcessLotPayload>;
                };
                aggregate: {
                    args: Prisma.ProcessLotAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateProcessLot>;
                };
                groupBy: {
                    args: Prisma.ProcessLotGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProcessLotGroupByOutputType>[];
                };
                count: {
                    args: Prisma.ProcessLotCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.ProcessLotCountAggregateOutputType> | number;
                };
            };
        };
        Worker: {
            payload: Prisma.$WorkerPayload<ExtArgs>;
            fields: Prisma.WorkerFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.WorkerFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkerPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.WorkerFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkerPayload>;
                };
                findFirst: {
                    args: Prisma.WorkerFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkerPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.WorkerFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkerPayload>;
                };
                findMany: {
                    args: Prisma.WorkerFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkerPayload>[];
                };
                create: {
                    args: Prisma.WorkerCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkerPayload>;
                };
                createMany: {
                    args: Prisma.WorkerCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.WorkerCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkerPayload>[];
                };
                delete: {
                    args: Prisma.WorkerDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkerPayload>;
                };
                update: {
                    args: Prisma.WorkerUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkerPayload>;
                };
                deleteMany: {
                    args: Prisma.WorkerDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.WorkerUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.WorkerUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkerPayload>[];
                };
                upsert: {
                    args: Prisma.WorkerUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WorkerPayload>;
                };
                aggregate: {
                    args: Prisma.WorkerAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateWorker>;
                };
                groupBy: {
                    args: Prisma.WorkerGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkerGroupByOutputType>[];
                };
                count: {
                    args: Prisma.WorkerCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WorkerCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
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
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type EnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role'>;
export type ListEnumRoleFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Role[]'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type EnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType'>;
export type ListEnumTransactionTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'TransactionType[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type EnumWeightUnitFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WeightUnit'>;
export type ListEnumWeightUnitFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WeightUnit[]'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type EnumProcessStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProcessStatus'>;
export type ListEnumProcessStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'ProcessStatus[]'>;
export type EnumWorkerStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WorkerStatus'>;
export type ListEnumWorkerStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WorkerStatus[]'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    accelerateUrl: string;
    adapter?: never;
}) & {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
    queryPlanCacheMaxSize?: number;
};
export type GlobalOmitConfig = {
    user?: Prisma.UserOmit;
    supplier?: Prisma.SupplierOmit;
    transaction?: Prisma.TransactionOmit;
    goldBar?: Prisma.GoldBarOmit;
    process?: Prisma.ProcessOmit;
    processLot?: Prisma.ProcessLotOmit;
    worker?: Prisma.WorkerOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;
