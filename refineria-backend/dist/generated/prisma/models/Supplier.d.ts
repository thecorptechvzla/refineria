import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SupplierModel = runtime.Types.Result.DefaultSelection<Prisma.$SupplierPayload>;
export type AggregateSupplier = {
    _count: SupplierCountAggregateOutputType | null;
    _min: SupplierMinAggregateOutputType | null;
    _max: SupplierMaxAggregateOutputType | null;
};
export type SupplierMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    contactInfo: string | null;
    registrationDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SupplierMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    contactInfo: string | null;
    registrationDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type SupplierCountAggregateOutputType = {
    id: number;
    name: number;
    contactInfo: number;
    registrationDate: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type SupplierMinAggregateInputType = {
    id?: true;
    name?: true;
    contactInfo?: true;
    registrationDate?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SupplierMaxAggregateInputType = {
    id?: true;
    name?: true;
    contactInfo?: true;
    registrationDate?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type SupplierCountAggregateInputType = {
    id?: true;
    name?: true;
    contactInfo?: true;
    registrationDate?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type SupplierAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SupplierWhereInput;
    orderBy?: Prisma.SupplierOrderByWithRelationInput | Prisma.SupplierOrderByWithRelationInput[];
    cursor?: Prisma.SupplierWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SupplierCountAggregateInputType;
    _min?: SupplierMinAggregateInputType;
    _max?: SupplierMaxAggregateInputType;
};
export type GetSupplierAggregateType<T extends SupplierAggregateArgs> = {
    [P in keyof T & keyof AggregateSupplier]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSupplier[P]> : Prisma.GetScalarType<T[P], AggregateSupplier[P]>;
};
export type SupplierGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SupplierWhereInput;
    orderBy?: Prisma.SupplierOrderByWithAggregationInput | Prisma.SupplierOrderByWithAggregationInput[];
    by: Prisma.SupplierScalarFieldEnum[] | Prisma.SupplierScalarFieldEnum;
    having?: Prisma.SupplierScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SupplierCountAggregateInputType | true;
    _min?: SupplierMinAggregateInputType;
    _max?: SupplierMaxAggregateInputType;
};
export type SupplierGroupByOutputType = {
    id: string;
    name: string;
    contactInfo: string;
    registrationDate: Date;
    createdAt: Date;
    updatedAt: Date;
    _count: SupplierCountAggregateOutputType | null;
    _min: SupplierMinAggregateOutputType | null;
    _max: SupplierMaxAggregateOutputType | null;
};
export type GetSupplierGroupByPayload<T extends SupplierGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SupplierGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SupplierGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SupplierGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SupplierGroupByOutputType[P]>;
}>>;
export type SupplierWhereInput = {
    AND?: Prisma.SupplierWhereInput | Prisma.SupplierWhereInput[];
    OR?: Prisma.SupplierWhereInput[];
    NOT?: Prisma.SupplierWhereInput | Prisma.SupplierWhereInput[];
    id?: Prisma.StringFilter<"Supplier"> | string;
    name?: Prisma.StringFilter<"Supplier"> | string;
    contactInfo?: Prisma.StringFilter<"Supplier"> | string;
    registrationDate?: Prisma.DateTimeFilter<"Supplier"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"Supplier"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Supplier"> | Date | string;
    transactions?: Prisma.TransactionListRelationFilter;
};
export type SupplierOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    contactInfo?: Prisma.SortOrder;
    registrationDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    transactions?: Prisma.TransactionOrderByRelationAggregateInput;
};
export type SupplierWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.SupplierWhereInput | Prisma.SupplierWhereInput[];
    OR?: Prisma.SupplierWhereInput[];
    NOT?: Prisma.SupplierWhereInput | Prisma.SupplierWhereInput[];
    name?: Prisma.StringFilter<"Supplier"> | string;
    contactInfo?: Prisma.StringFilter<"Supplier"> | string;
    registrationDate?: Prisma.DateTimeFilter<"Supplier"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"Supplier"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Supplier"> | Date | string;
    transactions?: Prisma.TransactionListRelationFilter;
}, "id">;
export type SupplierOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    contactInfo?: Prisma.SortOrder;
    registrationDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.SupplierCountOrderByAggregateInput;
    _max?: Prisma.SupplierMaxOrderByAggregateInput;
    _min?: Prisma.SupplierMinOrderByAggregateInput;
};
export type SupplierScalarWhereWithAggregatesInput = {
    AND?: Prisma.SupplierScalarWhereWithAggregatesInput | Prisma.SupplierScalarWhereWithAggregatesInput[];
    OR?: Prisma.SupplierScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SupplierScalarWhereWithAggregatesInput | Prisma.SupplierScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Supplier"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Supplier"> | string;
    contactInfo?: Prisma.StringWithAggregatesFilter<"Supplier"> | string;
    registrationDate?: Prisma.DateTimeWithAggregatesFilter<"Supplier"> | Date | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Supplier"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Supplier"> | Date | string;
};
export type SupplierCreateInput = {
    id?: string;
    name: string;
    contactInfo: string;
    registrationDate?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: Prisma.TransactionCreateNestedManyWithoutSupplierInput;
};
export type SupplierUncheckedCreateInput = {
    id?: string;
    name: string;
    contactInfo: string;
    registrationDate?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    transactions?: Prisma.TransactionUncheckedCreateNestedManyWithoutSupplierInput;
};
export type SupplierUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    contactInfo?: Prisma.StringFieldUpdateOperationsInput | string;
    registrationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: Prisma.TransactionUpdateManyWithoutSupplierNestedInput;
};
export type SupplierUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    contactInfo?: Prisma.StringFieldUpdateOperationsInput | string;
    registrationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    transactions?: Prisma.TransactionUncheckedUpdateManyWithoutSupplierNestedInput;
};
export type SupplierCreateManyInput = {
    id?: string;
    name: string;
    contactInfo: string;
    registrationDate?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SupplierUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    contactInfo?: Prisma.StringFieldUpdateOperationsInput | string;
    registrationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SupplierUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    contactInfo?: Prisma.StringFieldUpdateOperationsInput | string;
    registrationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SupplierCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    contactInfo?: Prisma.SortOrder;
    registrationDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SupplierMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    contactInfo?: Prisma.SortOrder;
    registrationDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SupplierMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    contactInfo?: Prisma.SortOrder;
    registrationDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type SupplierNullableScalarRelationFilter = {
    is?: Prisma.SupplierWhereInput | null;
    isNot?: Prisma.SupplierWhereInput | null;
};
export type SupplierCreateNestedOneWithoutTransactionsInput = {
    create?: Prisma.XOR<Prisma.SupplierCreateWithoutTransactionsInput, Prisma.SupplierUncheckedCreateWithoutTransactionsInput>;
    connectOrCreate?: Prisma.SupplierCreateOrConnectWithoutTransactionsInput;
    connect?: Prisma.SupplierWhereUniqueInput;
};
export type SupplierUpdateOneWithoutTransactionsNestedInput = {
    create?: Prisma.XOR<Prisma.SupplierCreateWithoutTransactionsInput, Prisma.SupplierUncheckedCreateWithoutTransactionsInput>;
    connectOrCreate?: Prisma.SupplierCreateOrConnectWithoutTransactionsInput;
    upsert?: Prisma.SupplierUpsertWithoutTransactionsInput;
    disconnect?: Prisma.SupplierWhereInput | boolean;
    delete?: Prisma.SupplierWhereInput | boolean;
    connect?: Prisma.SupplierWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.SupplierUpdateToOneWithWhereWithoutTransactionsInput, Prisma.SupplierUpdateWithoutTransactionsInput>, Prisma.SupplierUncheckedUpdateWithoutTransactionsInput>;
};
export type SupplierCreateWithoutTransactionsInput = {
    id?: string;
    name: string;
    contactInfo: string;
    registrationDate?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SupplierUncheckedCreateWithoutTransactionsInput = {
    id?: string;
    name: string;
    contactInfo: string;
    registrationDate?: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type SupplierCreateOrConnectWithoutTransactionsInput = {
    where: Prisma.SupplierWhereUniqueInput;
    create: Prisma.XOR<Prisma.SupplierCreateWithoutTransactionsInput, Prisma.SupplierUncheckedCreateWithoutTransactionsInput>;
};
export type SupplierUpsertWithoutTransactionsInput = {
    update: Prisma.XOR<Prisma.SupplierUpdateWithoutTransactionsInput, Prisma.SupplierUncheckedUpdateWithoutTransactionsInput>;
    create: Prisma.XOR<Prisma.SupplierCreateWithoutTransactionsInput, Prisma.SupplierUncheckedCreateWithoutTransactionsInput>;
    where?: Prisma.SupplierWhereInput;
};
export type SupplierUpdateToOneWithWhereWithoutTransactionsInput = {
    where?: Prisma.SupplierWhereInput;
    data: Prisma.XOR<Prisma.SupplierUpdateWithoutTransactionsInput, Prisma.SupplierUncheckedUpdateWithoutTransactionsInput>;
};
export type SupplierUpdateWithoutTransactionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    contactInfo?: Prisma.StringFieldUpdateOperationsInput | string;
    registrationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SupplierUncheckedUpdateWithoutTransactionsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    contactInfo?: Prisma.StringFieldUpdateOperationsInput | string;
    registrationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type SupplierCountOutputType = {
    transactions: number;
};
export type SupplierCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    transactions?: boolean | SupplierCountOutputTypeCountTransactionsArgs;
};
export type SupplierCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierCountOutputTypeSelect<ExtArgs> | null;
};
export type SupplierCountOutputTypeCountTransactionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TransactionWhereInput;
};
export type SupplierSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    contactInfo?: boolean;
    registrationDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    transactions?: boolean | Prisma.Supplier$transactionsArgs<ExtArgs>;
    _count?: boolean | Prisma.SupplierCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["supplier"]>;
export type SupplierSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    contactInfo?: boolean;
    registrationDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["supplier"]>;
export type SupplierSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    contactInfo?: boolean;
    registrationDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["supplier"]>;
export type SupplierSelectScalar = {
    id?: boolean;
    name?: boolean;
    contactInfo?: boolean;
    registrationDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type SupplierOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "contactInfo" | "registrationDate" | "createdAt" | "updatedAt", ExtArgs["result"]["supplier"]>;
export type SupplierInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    transactions?: boolean | Prisma.Supplier$transactionsArgs<ExtArgs>;
    _count?: boolean | Prisma.SupplierCountOutputTypeDefaultArgs<ExtArgs>;
};
export type SupplierIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type SupplierIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $SupplierPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Supplier";
    objects: {
        transactions: Prisma.$TransactionPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        contactInfo: string;
        registrationDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["supplier"]>;
    composites: {};
};
export type SupplierGetPayload<S extends boolean | null | undefined | SupplierDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SupplierPayload, S>;
export type SupplierCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SupplierFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SupplierCountAggregateInputType | true;
};
export interface SupplierDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Supplier'];
        meta: {
            name: 'Supplier';
        };
    };
    findUnique<T extends SupplierFindUniqueArgs>(args: Prisma.SelectSubset<T, SupplierFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SupplierClient<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SupplierFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SupplierFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SupplierClient<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SupplierFindFirstArgs>(args?: Prisma.SelectSubset<T, SupplierFindFirstArgs<ExtArgs>>): Prisma.Prisma__SupplierClient<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SupplierFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SupplierFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SupplierClient<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SupplierFindManyArgs>(args?: Prisma.SelectSubset<T, SupplierFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SupplierCreateArgs>(args: Prisma.SelectSubset<T, SupplierCreateArgs<ExtArgs>>): Prisma.Prisma__SupplierClient<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SupplierCreateManyArgs>(args?: Prisma.SelectSubset<T, SupplierCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SupplierCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SupplierCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SupplierDeleteArgs>(args: Prisma.SelectSubset<T, SupplierDeleteArgs<ExtArgs>>): Prisma.Prisma__SupplierClient<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SupplierUpdateArgs>(args: Prisma.SelectSubset<T, SupplierUpdateArgs<ExtArgs>>): Prisma.Prisma__SupplierClient<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SupplierDeleteManyArgs>(args?: Prisma.SelectSubset<T, SupplierDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SupplierUpdateManyArgs>(args: Prisma.SelectSubset<T, SupplierUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SupplierUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SupplierUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SupplierUpsertArgs>(args: Prisma.SelectSubset<T, SupplierUpsertArgs<ExtArgs>>): Prisma.Prisma__SupplierClient<runtime.Types.Result.GetResult<Prisma.$SupplierPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SupplierCountArgs>(args?: Prisma.Subset<T, SupplierCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SupplierCountAggregateOutputType> : number>;
    aggregate<T extends SupplierAggregateArgs>(args: Prisma.Subset<T, SupplierAggregateArgs>): Prisma.PrismaPromise<GetSupplierAggregateType<T>>;
    groupBy<T extends SupplierGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SupplierGroupByArgs['orderBy'];
    } : {
        orderBy?: SupplierGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SupplierGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSupplierGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SupplierFieldRefs;
}
export interface Prisma__SupplierClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    transactions<T extends Prisma.Supplier$transactionsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Supplier$transactionsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TransactionPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SupplierFieldRefs {
    readonly id: Prisma.FieldRef<"Supplier", 'String'>;
    readonly name: Prisma.FieldRef<"Supplier", 'String'>;
    readonly contactInfo: Prisma.FieldRef<"Supplier", 'String'>;
    readonly registrationDate: Prisma.FieldRef<"Supplier", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"Supplier", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Supplier", 'DateTime'>;
}
export type SupplierFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelect<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    include?: Prisma.SupplierInclude<ExtArgs> | null;
    where: Prisma.SupplierWhereUniqueInput;
};
export type SupplierFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelect<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    include?: Prisma.SupplierInclude<ExtArgs> | null;
    where: Prisma.SupplierWhereUniqueInput;
};
export type SupplierFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelect<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    include?: Prisma.SupplierInclude<ExtArgs> | null;
    where?: Prisma.SupplierWhereInput;
    orderBy?: Prisma.SupplierOrderByWithRelationInput | Prisma.SupplierOrderByWithRelationInput[];
    cursor?: Prisma.SupplierWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SupplierScalarFieldEnum | Prisma.SupplierScalarFieldEnum[];
};
export type SupplierFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelect<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    include?: Prisma.SupplierInclude<ExtArgs> | null;
    where?: Prisma.SupplierWhereInput;
    orderBy?: Prisma.SupplierOrderByWithRelationInput | Prisma.SupplierOrderByWithRelationInput[];
    cursor?: Prisma.SupplierWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SupplierScalarFieldEnum | Prisma.SupplierScalarFieldEnum[];
};
export type SupplierFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelect<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    include?: Prisma.SupplierInclude<ExtArgs> | null;
    where?: Prisma.SupplierWhereInput;
    orderBy?: Prisma.SupplierOrderByWithRelationInput | Prisma.SupplierOrderByWithRelationInput[];
    cursor?: Prisma.SupplierWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SupplierScalarFieldEnum | Prisma.SupplierScalarFieldEnum[];
};
export type SupplierCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelect<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    include?: Prisma.SupplierInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SupplierCreateInput, Prisma.SupplierUncheckedCreateInput>;
};
export type SupplierCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SupplierCreateManyInput | Prisma.SupplierCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SupplierCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    data: Prisma.SupplierCreateManyInput | Prisma.SupplierCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SupplierUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelect<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    include?: Prisma.SupplierInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SupplierUpdateInput, Prisma.SupplierUncheckedUpdateInput>;
    where: Prisma.SupplierWhereUniqueInput;
};
export type SupplierUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SupplierUpdateManyMutationInput, Prisma.SupplierUncheckedUpdateManyInput>;
    where?: Prisma.SupplierWhereInput;
    limit?: number;
};
export type SupplierUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SupplierUpdateManyMutationInput, Prisma.SupplierUncheckedUpdateManyInput>;
    where?: Prisma.SupplierWhereInput;
    limit?: number;
};
export type SupplierUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelect<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    include?: Prisma.SupplierInclude<ExtArgs> | null;
    where: Prisma.SupplierWhereUniqueInput;
    create: Prisma.XOR<Prisma.SupplierCreateInput, Prisma.SupplierUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SupplierUpdateInput, Prisma.SupplierUncheckedUpdateInput>;
};
export type SupplierDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelect<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    include?: Prisma.SupplierInclude<ExtArgs> | null;
    where: Prisma.SupplierWhereUniqueInput;
};
export type SupplierDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SupplierWhereInput;
    limit?: number;
};
export type Supplier$transactionsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TransactionSelect<ExtArgs> | null;
    omit?: Prisma.TransactionOmit<ExtArgs> | null;
    include?: Prisma.TransactionInclude<ExtArgs> | null;
    where?: Prisma.TransactionWhereInput;
    orderBy?: Prisma.TransactionOrderByWithRelationInput | Prisma.TransactionOrderByWithRelationInput[];
    cursor?: Prisma.TransactionWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TransactionScalarFieldEnum | Prisma.TransactionScalarFieldEnum[];
};
export type SupplierDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SupplierSelect<ExtArgs> | null;
    omit?: Prisma.SupplierOmit<ExtArgs> | null;
    include?: Prisma.SupplierInclude<ExtArgs> | null;
};
