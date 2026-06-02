import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums";
import type * as Prisma from "../internal/prismaNamespace";
export type ProcessModel = runtime.Types.Result.DefaultSelection<Prisma.$ProcessPayload>;
export type AggregateProcess = {
    _count: ProcessCountAggregateOutputType | null;
    _avg: ProcessAvgAggregateOutputType | null;
    _sum: ProcessSumAggregateOutputType | null;
    _min: ProcessMinAggregateOutputType | null;
    _max: ProcessMaxAggregateOutputType | null;
};
export type ProcessAvgAggregateOutputType = {
    number: number | null;
};
export type ProcessSumAggregateOutputType = {
    number: number | null;
};
export type ProcessMinAggregateOutputType = {
    id: string | null;
    number: number | null;
    supplierId: string | null;
    status: $Enums.ProcessStatus | null;
    closedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ProcessMaxAggregateOutputType = {
    id: string | null;
    number: number | null;
    supplierId: string | null;
    status: $Enums.ProcessStatus | null;
    closedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type ProcessCountAggregateOutputType = {
    id: number;
    number: number;
    supplierId: number;
    status: number;
    closedAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type ProcessAvgAggregateInputType = {
    number?: true;
};
export type ProcessSumAggregateInputType = {
    number?: true;
};
export type ProcessMinAggregateInputType = {
    id?: true;
    number?: true;
    supplierId?: true;
    status?: true;
    closedAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ProcessMaxAggregateInputType = {
    id?: true;
    number?: true;
    supplierId?: true;
    status?: true;
    closedAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type ProcessCountAggregateInputType = {
    id?: true;
    number?: true;
    supplierId?: true;
    status?: true;
    closedAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type ProcessAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProcessWhereInput;
    orderBy?: Prisma.ProcessOrderByWithRelationInput | Prisma.ProcessOrderByWithRelationInput[];
    cursor?: Prisma.ProcessWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ProcessCountAggregateInputType;
    _avg?: ProcessAvgAggregateInputType;
    _sum?: ProcessSumAggregateInputType;
    _min?: ProcessMinAggregateInputType;
    _max?: ProcessMaxAggregateInputType;
};
export type GetProcessAggregateType<T extends ProcessAggregateArgs> = {
    [P in keyof T & keyof AggregateProcess]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateProcess[P]> : Prisma.GetScalarType<T[P], AggregateProcess[P]>;
};
export type ProcessGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProcessWhereInput;
    orderBy?: Prisma.ProcessOrderByWithAggregationInput | Prisma.ProcessOrderByWithAggregationInput[];
    by: Prisma.ProcessScalarFieldEnum[] | Prisma.ProcessScalarFieldEnum;
    having?: Prisma.ProcessScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProcessCountAggregateInputType | true;
    _avg?: ProcessAvgAggregateInputType;
    _sum?: ProcessSumAggregateInputType;
    _min?: ProcessMinAggregateInputType;
    _max?: ProcessMaxAggregateInputType;
};
export type ProcessGroupByOutputType = {
    id: string;
    number: number;
    supplierId: string;
    status: $Enums.ProcessStatus;
    closedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: ProcessCountAggregateOutputType | null;
    _avg: ProcessAvgAggregateOutputType | null;
    _sum: ProcessSumAggregateOutputType | null;
    _min: ProcessMinAggregateOutputType | null;
    _max: ProcessMaxAggregateOutputType | null;
};
export type GetProcessGroupByPayload<T extends ProcessGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ProcessGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ProcessGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ProcessGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ProcessGroupByOutputType[P]>;
}>>;
export type ProcessWhereInput = {
    AND?: Prisma.ProcessWhereInput | Prisma.ProcessWhereInput[];
    OR?: Prisma.ProcessWhereInput[];
    NOT?: Prisma.ProcessWhereInput | Prisma.ProcessWhereInput[];
    id?: Prisma.StringFilter<"Process"> | string;
    number?: Prisma.IntFilter<"Process"> | number;
    supplierId?: Prisma.StringFilter<"Process"> | string;
    status?: Prisma.EnumProcessStatusFilter<"Process"> | $Enums.ProcessStatus;
    closedAt?: Prisma.DateTimeNullableFilter<"Process"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Process"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Process"> | Date | string;
    lots?: Prisma.ProcessLotListRelationFilter;
};
export type ProcessOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    supplierId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    closedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    lots?: Prisma.ProcessLotOrderByRelationAggregateInput;
};
export type ProcessWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ProcessWhereInput | Prisma.ProcessWhereInput[];
    OR?: Prisma.ProcessWhereInput[];
    NOT?: Prisma.ProcessWhereInput | Prisma.ProcessWhereInput[];
    number?: Prisma.IntFilter<"Process"> | number;
    supplierId?: Prisma.StringFilter<"Process"> | string;
    status?: Prisma.EnumProcessStatusFilter<"Process"> | $Enums.ProcessStatus;
    closedAt?: Prisma.DateTimeNullableFilter<"Process"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"Process"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Process"> | Date | string;
    lots?: Prisma.ProcessLotListRelationFilter;
}, "id">;
export type ProcessOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    supplierId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    closedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.ProcessCountOrderByAggregateInput;
    _avg?: Prisma.ProcessAvgOrderByAggregateInput;
    _max?: Prisma.ProcessMaxOrderByAggregateInput;
    _min?: Prisma.ProcessMinOrderByAggregateInput;
    _sum?: Prisma.ProcessSumOrderByAggregateInput;
};
export type ProcessScalarWhereWithAggregatesInput = {
    AND?: Prisma.ProcessScalarWhereWithAggregatesInput | Prisma.ProcessScalarWhereWithAggregatesInput[];
    OR?: Prisma.ProcessScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ProcessScalarWhereWithAggregatesInput | Prisma.ProcessScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Process"> | string;
    number?: Prisma.IntWithAggregatesFilter<"Process"> | number;
    supplierId?: Prisma.StringWithAggregatesFilter<"Process"> | string;
    status?: Prisma.EnumProcessStatusWithAggregatesFilter<"Process"> | $Enums.ProcessStatus;
    closedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"Process"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Process"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Process"> | Date | string;
};
export type ProcessCreateInput = {
    id?: string;
    number: number;
    supplierId: string;
    status?: $Enums.ProcessStatus;
    closedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lots?: Prisma.ProcessLotCreateNestedManyWithoutProcessInput;
};
export type ProcessUncheckedCreateInput = {
    id?: string;
    number: number;
    supplierId: string;
    status?: $Enums.ProcessStatus;
    closedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    lots?: Prisma.ProcessLotUncheckedCreateNestedManyWithoutProcessInput;
};
export type ProcessUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    supplierId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumProcessStatusFieldUpdateOperationsInput | $Enums.ProcessStatus;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lots?: Prisma.ProcessLotUpdateManyWithoutProcessNestedInput;
};
export type ProcessUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    supplierId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumProcessStatusFieldUpdateOperationsInput | $Enums.ProcessStatus;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    lots?: Prisma.ProcessLotUncheckedUpdateManyWithoutProcessNestedInput;
};
export type ProcessCreateManyInput = {
    id?: string;
    number: number;
    supplierId: string;
    status?: $Enums.ProcessStatus;
    closedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProcessUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    supplierId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumProcessStatusFieldUpdateOperationsInput | $Enums.ProcessStatus;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcessUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    supplierId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumProcessStatusFieldUpdateOperationsInput | $Enums.ProcessStatus;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcessCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    supplierId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    closedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ProcessAvgOrderByAggregateInput = {
    number?: Prisma.SortOrder;
};
export type ProcessMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    supplierId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    closedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ProcessMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    supplierId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    closedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type ProcessSumOrderByAggregateInput = {
    number?: Prisma.SortOrder;
};
export type ProcessScalarRelationFilter = {
    is?: Prisma.ProcessWhereInput;
    isNot?: Prisma.ProcessWhereInput;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type EnumProcessStatusFieldUpdateOperationsInput = {
    set?: $Enums.ProcessStatus;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type ProcessCreateNestedOneWithoutLotsInput = {
    create?: Prisma.XOR<Prisma.ProcessCreateWithoutLotsInput, Prisma.ProcessUncheckedCreateWithoutLotsInput>;
    connectOrCreate?: Prisma.ProcessCreateOrConnectWithoutLotsInput;
    connect?: Prisma.ProcessWhereUniqueInput;
};
export type ProcessUpdateOneRequiredWithoutLotsNestedInput = {
    create?: Prisma.XOR<Prisma.ProcessCreateWithoutLotsInput, Prisma.ProcessUncheckedCreateWithoutLotsInput>;
    connectOrCreate?: Prisma.ProcessCreateOrConnectWithoutLotsInput;
    upsert?: Prisma.ProcessUpsertWithoutLotsInput;
    connect?: Prisma.ProcessWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.ProcessUpdateToOneWithWhereWithoutLotsInput, Prisma.ProcessUpdateWithoutLotsInput>, Prisma.ProcessUncheckedUpdateWithoutLotsInput>;
};
export type ProcessCreateWithoutLotsInput = {
    id?: string;
    number: number;
    supplierId: string;
    status?: $Enums.ProcessStatus;
    closedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProcessUncheckedCreateWithoutLotsInput = {
    id?: string;
    number: number;
    supplierId: string;
    status?: $Enums.ProcessStatus;
    closedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type ProcessCreateOrConnectWithoutLotsInput = {
    where: Prisma.ProcessWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProcessCreateWithoutLotsInput, Prisma.ProcessUncheckedCreateWithoutLotsInput>;
};
export type ProcessUpsertWithoutLotsInput = {
    update: Prisma.XOR<Prisma.ProcessUpdateWithoutLotsInput, Prisma.ProcessUncheckedUpdateWithoutLotsInput>;
    create: Prisma.XOR<Prisma.ProcessCreateWithoutLotsInput, Prisma.ProcessUncheckedCreateWithoutLotsInput>;
    where?: Prisma.ProcessWhereInput;
};
export type ProcessUpdateToOneWithWhereWithoutLotsInput = {
    where?: Prisma.ProcessWhereInput;
    data: Prisma.XOR<Prisma.ProcessUpdateWithoutLotsInput, Prisma.ProcessUncheckedUpdateWithoutLotsInput>;
};
export type ProcessUpdateWithoutLotsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    supplierId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumProcessStatusFieldUpdateOperationsInput | $Enums.ProcessStatus;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcessUncheckedUpdateWithoutLotsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    supplierId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumProcessStatusFieldUpdateOperationsInput | $Enums.ProcessStatus;
    closedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcessCountOutputType = {
    lots: number;
};
export type ProcessCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    lots?: boolean | ProcessCountOutputTypeCountLotsArgs;
};
export type ProcessCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessCountOutputTypeSelect<ExtArgs> | null;
};
export type ProcessCountOutputTypeCountLotsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProcessLotWhereInput;
};
export type ProcessSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    number?: boolean;
    supplierId?: boolean;
    status?: boolean;
    closedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    lots?: boolean | Prisma.Process$lotsArgs<ExtArgs>;
    _count?: boolean | Prisma.ProcessCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["process"]>;
export type ProcessSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    number?: boolean;
    supplierId?: boolean;
    status?: boolean;
    closedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["process"]>;
export type ProcessSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    number?: boolean;
    supplierId?: boolean;
    status?: boolean;
    closedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["process"]>;
export type ProcessSelectScalar = {
    id?: boolean;
    number?: boolean;
    supplierId?: boolean;
    status?: boolean;
    closedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type ProcessOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "number" | "supplierId" | "status" | "closedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["process"]>;
export type ProcessInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    lots?: boolean | Prisma.Process$lotsArgs<ExtArgs>;
    _count?: boolean | Prisma.ProcessCountOutputTypeDefaultArgs<ExtArgs>;
};
export type ProcessIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type ProcessIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $ProcessPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Process";
    objects: {
        lots: Prisma.$ProcessLotPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        number: number;
        supplierId: string;
        status: $Enums.ProcessStatus;
        closedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["process"]>;
    composites: {};
};
export type ProcessGetPayload<S extends boolean | null | undefined | ProcessDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ProcessPayload, S>;
export type ProcessCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ProcessFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ProcessCountAggregateInputType | true;
};
export interface ProcessDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Process'];
        meta: {
            name: 'Process';
        };
    };
    findUnique<T extends ProcessFindUniqueArgs>(args: Prisma.SelectSubset<T, ProcessFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ProcessClient<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ProcessFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ProcessFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProcessClient<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ProcessFindFirstArgs>(args?: Prisma.SelectSubset<T, ProcessFindFirstArgs<ExtArgs>>): Prisma.Prisma__ProcessClient<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ProcessFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ProcessFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProcessClient<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ProcessFindManyArgs>(args?: Prisma.SelectSubset<T, ProcessFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ProcessCreateArgs>(args: Prisma.SelectSubset<T, ProcessCreateArgs<ExtArgs>>): Prisma.Prisma__ProcessClient<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ProcessCreateManyArgs>(args?: Prisma.SelectSubset<T, ProcessCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ProcessCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ProcessCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ProcessDeleteArgs>(args: Prisma.SelectSubset<T, ProcessDeleteArgs<ExtArgs>>): Prisma.Prisma__ProcessClient<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ProcessUpdateArgs>(args: Prisma.SelectSubset<T, ProcessUpdateArgs<ExtArgs>>): Prisma.Prisma__ProcessClient<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ProcessDeleteManyArgs>(args?: Prisma.SelectSubset<T, ProcessDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ProcessUpdateManyArgs>(args: Prisma.SelectSubset<T, ProcessUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ProcessUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ProcessUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ProcessUpsertArgs>(args: Prisma.SelectSubset<T, ProcessUpsertArgs<ExtArgs>>): Prisma.Prisma__ProcessClient<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ProcessCountArgs>(args?: Prisma.Subset<T, ProcessCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ProcessCountAggregateOutputType> : number>;
    aggregate<T extends ProcessAggregateArgs>(args: Prisma.Subset<T, ProcessAggregateArgs>): Prisma.PrismaPromise<GetProcessAggregateType<T>>;
    groupBy<T extends ProcessGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ProcessGroupByArgs['orderBy'];
    } : {
        orderBy?: ProcessGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ProcessGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ProcessFieldRefs;
}
export interface Prisma__ProcessClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    lots<T extends Prisma.Process$lotsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Process$lotsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ProcessFieldRefs {
    readonly id: Prisma.FieldRef<"Process", 'String'>;
    readonly number: Prisma.FieldRef<"Process", 'Int'>;
    readonly supplierId: Prisma.FieldRef<"Process", 'String'>;
    readonly status: Prisma.FieldRef<"Process", 'ProcessStatus'>;
    readonly closedAt: Prisma.FieldRef<"Process", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"Process", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Process", 'DateTime'>;
}
export type ProcessFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelect<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    include?: Prisma.ProcessInclude<ExtArgs> | null;
    where: Prisma.ProcessWhereUniqueInput;
};
export type ProcessFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelect<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    include?: Prisma.ProcessInclude<ExtArgs> | null;
    where: Prisma.ProcessWhereUniqueInput;
};
export type ProcessFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelect<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    include?: Prisma.ProcessInclude<ExtArgs> | null;
    where?: Prisma.ProcessWhereInput;
    orderBy?: Prisma.ProcessOrderByWithRelationInput | Prisma.ProcessOrderByWithRelationInput[];
    cursor?: Prisma.ProcessWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProcessScalarFieldEnum | Prisma.ProcessScalarFieldEnum[];
};
export type ProcessFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelect<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    include?: Prisma.ProcessInclude<ExtArgs> | null;
    where?: Prisma.ProcessWhereInput;
    orderBy?: Prisma.ProcessOrderByWithRelationInput | Prisma.ProcessOrderByWithRelationInput[];
    cursor?: Prisma.ProcessWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProcessScalarFieldEnum | Prisma.ProcessScalarFieldEnum[];
};
export type ProcessFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelect<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    include?: Prisma.ProcessInclude<ExtArgs> | null;
    where?: Prisma.ProcessWhereInput;
    orderBy?: Prisma.ProcessOrderByWithRelationInput | Prisma.ProcessOrderByWithRelationInput[];
    cursor?: Prisma.ProcessWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProcessScalarFieldEnum | Prisma.ProcessScalarFieldEnum[];
};
export type ProcessCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelect<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    include?: Prisma.ProcessInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProcessCreateInput, Prisma.ProcessUncheckedCreateInput>;
};
export type ProcessCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ProcessCreateManyInput | Prisma.ProcessCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ProcessCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    data: Prisma.ProcessCreateManyInput | Prisma.ProcessCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ProcessUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelect<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    include?: Prisma.ProcessInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProcessUpdateInput, Prisma.ProcessUncheckedUpdateInput>;
    where: Prisma.ProcessWhereUniqueInput;
};
export type ProcessUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ProcessUpdateManyMutationInput, Prisma.ProcessUncheckedUpdateManyInput>;
    where?: Prisma.ProcessWhereInput;
    limit?: number;
};
export type ProcessUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProcessUpdateManyMutationInput, Prisma.ProcessUncheckedUpdateManyInput>;
    where?: Prisma.ProcessWhereInput;
    limit?: number;
};
export type ProcessUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelect<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    include?: Prisma.ProcessInclude<ExtArgs> | null;
    where: Prisma.ProcessWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProcessCreateInput, Prisma.ProcessUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ProcessUpdateInput, Prisma.ProcessUncheckedUpdateInput>;
};
export type ProcessDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelect<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    include?: Prisma.ProcessInclude<ExtArgs> | null;
    where: Prisma.ProcessWhereUniqueInput;
};
export type ProcessDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProcessWhereInput;
    limit?: number;
};
export type Process$lotsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessLotSelect<ExtArgs> | null;
    omit?: Prisma.ProcessLotOmit<ExtArgs> | null;
    include?: Prisma.ProcessLotInclude<ExtArgs> | null;
    where?: Prisma.ProcessLotWhereInput;
    orderBy?: Prisma.ProcessLotOrderByWithRelationInput | Prisma.ProcessLotOrderByWithRelationInput[];
    cursor?: Prisma.ProcessLotWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.ProcessLotScalarFieldEnum | Prisma.ProcessLotScalarFieldEnum[];
};
export type ProcessDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessSelect<ExtArgs> | null;
    omit?: Prisma.ProcessOmit<ExtArgs> | null;
    include?: Prisma.ProcessInclude<ExtArgs> | null;
};
