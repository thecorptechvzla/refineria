import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace";
export type ProcessLotModel = runtime.Types.Result.DefaultSelection<Prisma.$ProcessLotPayload>;
export type AggregateProcessLot = {
    _count: ProcessLotCountAggregateOutputType | null;
    _avg: ProcessLotAvgAggregateOutputType | null;
    _sum: ProcessLotSumAggregateOutputType | null;
    _min: ProcessLotMinAggregateOutputType | null;
    _max: ProcessLotMaxAggregateOutputType | null;
};
export type ProcessLotAvgAggregateOutputType = {
    number: number | null;
    recovered: number | null;
    egresadoG: number | null;
};
export type ProcessLotSumAggregateOutputType = {
    number: number | null;
    recovered: number | null;
    egresadoG: number | null;
};
export type ProcessLotMinAggregateOutputType = {
    id: string | null;
    processId: string | null;
    number: number | null;
    recovered: number | null;
    egresadoG: number | null;
    creationDate: Date | null;
};
export type ProcessLotMaxAggregateOutputType = {
    id: string | null;
    processId: string | null;
    number: number | null;
    recovered: number | null;
    egresadoG: number | null;
    creationDate: Date | null;
};
export type ProcessLotCountAggregateOutputType = {
    id: number;
    processId: number;
    number: number;
    barIds: number;
    recovered: number;
    egresadoG: number;
    creationDate: number;
    _all: number;
};
export type ProcessLotAvgAggregateInputType = {
    number?: true;
    recovered?: true;
    egresadoG?: true;
};
export type ProcessLotSumAggregateInputType = {
    number?: true;
    recovered?: true;
    egresadoG?: true;
};
export type ProcessLotMinAggregateInputType = {
    id?: true;
    processId?: true;
    number?: true;
    recovered?: true;
    egresadoG?: true;
    creationDate?: true;
};
export type ProcessLotMaxAggregateInputType = {
    id?: true;
    processId?: true;
    number?: true;
    recovered?: true;
    egresadoG?: true;
    creationDate?: true;
};
export type ProcessLotCountAggregateInputType = {
    id?: true;
    processId?: true;
    number?: true;
    barIds?: true;
    recovered?: true;
    egresadoG?: true;
    creationDate?: true;
    _all?: true;
};
export type ProcessLotAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProcessLotWhereInput;
    orderBy?: Prisma.ProcessLotOrderByWithRelationInput | Prisma.ProcessLotOrderByWithRelationInput[];
    cursor?: Prisma.ProcessLotWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | ProcessLotCountAggregateInputType;
    _avg?: ProcessLotAvgAggregateInputType;
    _sum?: ProcessLotSumAggregateInputType;
    _min?: ProcessLotMinAggregateInputType;
    _max?: ProcessLotMaxAggregateInputType;
};
export type GetProcessLotAggregateType<T extends ProcessLotAggregateArgs> = {
    [P in keyof T & keyof AggregateProcessLot]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateProcessLot[P]> : Prisma.GetScalarType<T[P], AggregateProcessLot[P]>;
};
export type ProcessLotGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProcessLotWhereInput;
    orderBy?: Prisma.ProcessLotOrderByWithAggregationInput | Prisma.ProcessLotOrderByWithAggregationInput[];
    by: Prisma.ProcessLotScalarFieldEnum[] | Prisma.ProcessLotScalarFieldEnum;
    having?: Prisma.ProcessLotScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: ProcessLotCountAggregateInputType | true;
    _avg?: ProcessLotAvgAggregateInputType;
    _sum?: ProcessLotSumAggregateInputType;
    _min?: ProcessLotMinAggregateInputType;
    _max?: ProcessLotMaxAggregateInputType;
};
export type ProcessLotGroupByOutputType = {
    id: string;
    processId: string;
    number: number;
    barIds: string[];
    recovered: number | null;
    egresadoG: number;
    creationDate: Date;
    _count: ProcessLotCountAggregateOutputType | null;
    _avg: ProcessLotAvgAggregateOutputType | null;
    _sum: ProcessLotSumAggregateOutputType | null;
    _min: ProcessLotMinAggregateOutputType | null;
    _max: ProcessLotMaxAggregateOutputType | null;
};
export type GetProcessLotGroupByPayload<T extends ProcessLotGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<ProcessLotGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof ProcessLotGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], ProcessLotGroupByOutputType[P]> : Prisma.GetScalarType<T[P], ProcessLotGroupByOutputType[P]>;
}>>;
export type ProcessLotWhereInput = {
    AND?: Prisma.ProcessLotWhereInput | Prisma.ProcessLotWhereInput[];
    OR?: Prisma.ProcessLotWhereInput[];
    NOT?: Prisma.ProcessLotWhereInput | Prisma.ProcessLotWhereInput[];
    id?: Prisma.StringFilter<"ProcessLot"> | string;
    processId?: Prisma.StringFilter<"ProcessLot"> | string;
    number?: Prisma.IntFilter<"ProcessLot"> | number;
    barIds?: Prisma.StringNullableListFilter<"ProcessLot">;
    recovered?: Prisma.FloatNullableFilter<"ProcessLot"> | number | null;
    egresadoG?: Prisma.FloatFilter<"ProcessLot"> | number;
    creationDate?: Prisma.DateTimeFilter<"ProcessLot"> | Date | string;
    process?: Prisma.XOR<Prisma.ProcessScalarRelationFilter, Prisma.ProcessWhereInput>;
};
export type ProcessLotOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    processId?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    barIds?: Prisma.SortOrder;
    recovered?: Prisma.SortOrderInput | Prisma.SortOrder;
    egresadoG?: Prisma.SortOrder;
    creationDate?: Prisma.SortOrder;
    process?: Prisma.ProcessOrderByWithRelationInput;
};
export type ProcessLotWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.ProcessLotWhereInput | Prisma.ProcessLotWhereInput[];
    OR?: Prisma.ProcessLotWhereInput[];
    NOT?: Prisma.ProcessLotWhereInput | Prisma.ProcessLotWhereInput[];
    processId?: Prisma.StringFilter<"ProcessLot"> | string;
    number?: Prisma.IntFilter<"ProcessLot"> | number;
    barIds?: Prisma.StringNullableListFilter<"ProcessLot">;
    recovered?: Prisma.FloatNullableFilter<"ProcessLot"> | number | null;
    egresadoG?: Prisma.FloatFilter<"ProcessLot"> | number;
    creationDate?: Prisma.DateTimeFilter<"ProcessLot"> | Date | string;
    process?: Prisma.XOR<Prisma.ProcessScalarRelationFilter, Prisma.ProcessWhereInput>;
}, "id">;
export type ProcessLotOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    processId?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    barIds?: Prisma.SortOrder;
    recovered?: Prisma.SortOrderInput | Prisma.SortOrder;
    egresadoG?: Prisma.SortOrder;
    creationDate?: Prisma.SortOrder;
    _count?: Prisma.ProcessLotCountOrderByAggregateInput;
    _avg?: Prisma.ProcessLotAvgOrderByAggregateInput;
    _max?: Prisma.ProcessLotMaxOrderByAggregateInput;
    _min?: Prisma.ProcessLotMinOrderByAggregateInput;
    _sum?: Prisma.ProcessLotSumOrderByAggregateInput;
};
export type ProcessLotScalarWhereWithAggregatesInput = {
    AND?: Prisma.ProcessLotScalarWhereWithAggregatesInput | Prisma.ProcessLotScalarWhereWithAggregatesInput[];
    OR?: Prisma.ProcessLotScalarWhereWithAggregatesInput[];
    NOT?: Prisma.ProcessLotScalarWhereWithAggregatesInput | Prisma.ProcessLotScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"ProcessLot"> | string;
    processId?: Prisma.StringWithAggregatesFilter<"ProcessLot"> | string;
    number?: Prisma.IntWithAggregatesFilter<"ProcessLot"> | number;
    barIds?: Prisma.StringNullableListFilter<"ProcessLot">;
    recovered?: Prisma.FloatNullableWithAggregatesFilter<"ProcessLot"> | number | null;
    egresadoG?: Prisma.FloatWithAggregatesFilter<"ProcessLot"> | number;
    creationDate?: Prisma.DateTimeWithAggregatesFilter<"ProcessLot"> | Date | string;
};
export type ProcessLotCreateInput = {
    id?: string;
    number: number;
    barIds?: Prisma.ProcessLotCreatebarIdsInput | string[];
    recovered?: number | null;
    egresadoG?: number;
    creationDate?: Date | string;
    process: Prisma.ProcessCreateNestedOneWithoutLotsInput;
};
export type ProcessLotUncheckedCreateInput = {
    id?: string;
    processId: string;
    number: number;
    barIds?: Prisma.ProcessLotCreatebarIdsInput | string[];
    recovered?: number | null;
    egresadoG?: number;
    creationDate?: Date | string;
};
export type ProcessLotUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    barIds?: Prisma.ProcessLotUpdatebarIdsInput | string[];
    recovered?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    egresadoG?: Prisma.FloatFieldUpdateOperationsInput | number;
    creationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    process?: Prisma.ProcessUpdateOneRequiredWithoutLotsNestedInput;
};
export type ProcessLotUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    processId?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    barIds?: Prisma.ProcessLotUpdatebarIdsInput | string[];
    recovered?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    egresadoG?: Prisma.FloatFieldUpdateOperationsInput | number;
    creationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcessLotCreateManyInput = {
    id?: string;
    processId: string;
    number: number;
    barIds?: Prisma.ProcessLotCreatebarIdsInput | string[];
    recovered?: number | null;
    egresadoG?: number;
    creationDate?: Date | string;
};
export type ProcessLotUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    barIds?: Prisma.ProcessLotUpdatebarIdsInput | string[];
    recovered?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    egresadoG?: Prisma.FloatFieldUpdateOperationsInput | number;
    creationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcessLotUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    processId?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    barIds?: Prisma.ProcessLotUpdatebarIdsInput | string[];
    recovered?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    egresadoG?: Prisma.FloatFieldUpdateOperationsInput | number;
    creationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcessLotListRelationFilter = {
    every?: Prisma.ProcessLotWhereInput;
    some?: Prisma.ProcessLotWhereInput;
    none?: Prisma.ProcessLotWhereInput;
};
export type ProcessLotOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type ProcessLotCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    processId?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    barIds?: Prisma.SortOrder;
    recovered?: Prisma.SortOrder;
    egresadoG?: Prisma.SortOrder;
    creationDate?: Prisma.SortOrder;
};
export type ProcessLotAvgOrderByAggregateInput = {
    number?: Prisma.SortOrder;
    recovered?: Prisma.SortOrder;
    egresadoG?: Prisma.SortOrder;
};
export type ProcessLotMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    processId?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    recovered?: Prisma.SortOrder;
    egresadoG?: Prisma.SortOrder;
    creationDate?: Prisma.SortOrder;
};
export type ProcessLotMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    processId?: Prisma.SortOrder;
    number?: Prisma.SortOrder;
    recovered?: Prisma.SortOrder;
    egresadoG?: Prisma.SortOrder;
    creationDate?: Prisma.SortOrder;
};
export type ProcessLotSumOrderByAggregateInput = {
    number?: Prisma.SortOrder;
    recovered?: Prisma.SortOrder;
    egresadoG?: Prisma.SortOrder;
};
export type ProcessLotCreateNestedManyWithoutProcessInput = {
    create?: Prisma.XOR<Prisma.ProcessLotCreateWithoutProcessInput, Prisma.ProcessLotUncheckedCreateWithoutProcessInput> | Prisma.ProcessLotCreateWithoutProcessInput[] | Prisma.ProcessLotUncheckedCreateWithoutProcessInput[];
    connectOrCreate?: Prisma.ProcessLotCreateOrConnectWithoutProcessInput | Prisma.ProcessLotCreateOrConnectWithoutProcessInput[];
    createMany?: Prisma.ProcessLotCreateManyProcessInputEnvelope;
    connect?: Prisma.ProcessLotWhereUniqueInput | Prisma.ProcessLotWhereUniqueInput[];
};
export type ProcessLotUncheckedCreateNestedManyWithoutProcessInput = {
    create?: Prisma.XOR<Prisma.ProcessLotCreateWithoutProcessInput, Prisma.ProcessLotUncheckedCreateWithoutProcessInput> | Prisma.ProcessLotCreateWithoutProcessInput[] | Prisma.ProcessLotUncheckedCreateWithoutProcessInput[];
    connectOrCreate?: Prisma.ProcessLotCreateOrConnectWithoutProcessInput | Prisma.ProcessLotCreateOrConnectWithoutProcessInput[];
    createMany?: Prisma.ProcessLotCreateManyProcessInputEnvelope;
    connect?: Prisma.ProcessLotWhereUniqueInput | Prisma.ProcessLotWhereUniqueInput[];
};
export type ProcessLotUpdateManyWithoutProcessNestedInput = {
    create?: Prisma.XOR<Prisma.ProcessLotCreateWithoutProcessInput, Prisma.ProcessLotUncheckedCreateWithoutProcessInput> | Prisma.ProcessLotCreateWithoutProcessInput[] | Prisma.ProcessLotUncheckedCreateWithoutProcessInput[];
    connectOrCreate?: Prisma.ProcessLotCreateOrConnectWithoutProcessInput | Prisma.ProcessLotCreateOrConnectWithoutProcessInput[];
    upsert?: Prisma.ProcessLotUpsertWithWhereUniqueWithoutProcessInput | Prisma.ProcessLotUpsertWithWhereUniqueWithoutProcessInput[];
    createMany?: Prisma.ProcessLotCreateManyProcessInputEnvelope;
    set?: Prisma.ProcessLotWhereUniqueInput | Prisma.ProcessLotWhereUniqueInput[];
    disconnect?: Prisma.ProcessLotWhereUniqueInput | Prisma.ProcessLotWhereUniqueInput[];
    delete?: Prisma.ProcessLotWhereUniqueInput | Prisma.ProcessLotWhereUniqueInput[];
    connect?: Prisma.ProcessLotWhereUniqueInput | Prisma.ProcessLotWhereUniqueInput[];
    update?: Prisma.ProcessLotUpdateWithWhereUniqueWithoutProcessInput | Prisma.ProcessLotUpdateWithWhereUniqueWithoutProcessInput[];
    updateMany?: Prisma.ProcessLotUpdateManyWithWhereWithoutProcessInput | Prisma.ProcessLotUpdateManyWithWhereWithoutProcessInput[];
    deleteMany?: Prisma.ProcessLotScalarWhereInput | Prisma.ProcessLotScalarWhereInput[];
};
export type ProcessLotUncheckedUpdateManyWithoutProcessNestedInput = {
    create?: Prisma.XOR<Prisma.ProcessLotCreateWithoutProcessInput, Prisma.ProcessLotUncheckedCreateWithoutProcessInput> | Prisma.ProcessLotCreateWithoutProcessInput[] | Prisma.ProcessLotUncheckedCreateWithoutProcessInput[];
    connectOrCreate?: Prisma.ProcessLotCreateOrConnectWithoutProcessInput | Prisma.ProcessLotCreateOrConnectWithoutProcessInput[];
    upsert?: Prisma.ProcessLotUpsertWithWhereUniqueWithoutProcessInput | Prisma.ProcessLotUpsertWithWhereUniqueWithoutProcessInput[];
    createMany?: Prisma.ProcessLotCreateManyProcessInputEnvelope;
    set?: Prisma.ProcessLotWhereUniqueInput | Prisma.ProcessLotWhereUniqueInput[];
    disconnect?: Prisma.ProcessLotWhereUniqueInput | Prisma.ProcessLotWhereUniqueInput[];
    delete?: Prisma.ProcessLotWhereUniqueInput | Prisma.ProcessLotWhereUniqueInput[];
    connect?: Prisma.ProcessLotWhereUniqueInput | Prisma.ProcessLotWhereUniqueInput[];
    update?: Prisma.ProcessLotUpdateWithWhereUniqueWithoutProcessInput | Prisma.ProcessLotUpdateWithWhereUniqueWithoutProcessInput[];
    updateMany?: Prisma.ProcessLotUpdateManyWithWhereWithoutProcessInput | Prisma.ProcessLotUpdateManyWithWhereWithoutProcessInput[];
    deleteMany?: Prisma.ProcessLotScalarWhereInput | Prisma.ProcessLotScalarWhereInput[];
};
export type ProcessLotCreatebarIdsInput = {
    set: string[];
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type ProcessLotUpdatebarIdsInput = {
    set?: string[];
    push?: string | string[];
};
export type ProcessLotCreateWithoutProcessInput = {
    id?: string;
    number: number;
    barIds?: Prisma.ProcessLotCreatebarIdsInput | string[];
    recovered?: number | null;
    egresadoG?: number;
    creationDate?: Date | string;
};
export type ProcessLotUncheckedCreateWithoutProcessInput = {
    id?: string;
    number: number;
    barIds?: Prisma.ProcessLotCreatebarIdsInput | string[];
    recovered?: number | null;
    egresadoG?: number;
    creationDate?: Date | string;
};
export type ProcessLotCreateOrConnectWithoutProcessInput = {
    where: Prisma.ProcessLotWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProcessLotCreateWithoutProcessInput, Prisma.ProcessLotUncheckedCreateWithoutProcessInput>;
};
export type ProcessLotCreateManyProcessInputEnvelope = {
    data: Prisma.ProcessLotCreateManyProcessInput | Prisma.ProcessLotCreateManyProcessInput[];
    skipDuplicates?: boolean;
};
export type ProcessLotUpsertWithWhereUniqueWithoutProcessInput = {
    where: Prisma.ProcessLotWhereUniqueInput;
    update: Prisma.XOR<Prisma.ProcessLotUpdateWithoutProcessInput, Prisma.ProcessLotUncheckedUpdateWithoutProcessInput>;
    create: Prisma.XOR<Prisma.ProcessLotCreateWithoutProcessInput, Prisma.ProcessLotUncheckedCreateWithoutProcessInput>;
};
export type ProcessLotUpdateWithWhereUniqueWithoutProcessInput = {
    where: Prisma.ProcessLotWhereUniqueInput;
    data: Prisma.XOR<Prisma.ProcessLotUpdateWithoutProcessInput, Prisma.ProcessLotUncheckedUpdateWithoutProcessInput>;
};
export type ProcessLotUpdateManyWithWhereWithoutProcessInput = {
    where: Prisma.ProcessLotScalarWhereInput;
    data: Prisma.XOR<Prisma.ProcessLotUpdateManyMutationInput, Prisma.ProcessLotUncheckedUpdateManyWithoutProcessInput>;
};
export type ProcessLotScalarWhereInput = {
    AND?: Prisma.ProcessLotScalarWhereInput | Prisma.ProcessLotScalarWhereInput[];
    OR?: Prisma.ProcessLotScalarWhereInput[];
    NOT?: Prisma.ProcessLotScalarWhereInput | Prisma.ProcessLotScalarWhereInput[];
    id?: Prisma.StringFilter<"ProcessLot"> | string;
    processId?: Prisma.StringFilter<"ProcessLot"> | string;
    number?: Prisma.IntFilter<"ProcessLot"> | number;
    barIds?: Prisma.StringNullableListFilter<"ProcessLot">;
    recovered?: Prisma.FloatNullableFilter<"ProcessLot"> | number | null;
    egresadoG?: Prisma.FloatFilter<"ProcessLot"> | number;
    creationDate?: Prisma.DateTimeFilter<"ProcessLot"> | Date | string;
};
export type ProcessLotCreateManyProcessInput = {
    id?: string;
    number: number;
    barIds?: Prisma.ProcessLotCreatebarIdsInput | string[];
    recovered?: number | null;
    egresadoG?: number;
    creationDate?: Date | string;
};
export type ProcessLotUpdateWithoutProcessInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    barIds?: Prisma.ProcessLotUpdatebarIdsInput | string[];
    recovered?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    egresadoG?: Prisma.FloatFieldUpdateOperationsInput | number;
    creationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcessLotUncheckedUpdateWithoutProcessInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    barIds?: Prisma.ProcessLotUpdatebarIdsInput | string[];
    recovered?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    egresadoG?: Prisma.FloatFieldUpdateOperationsInput | number;
    creationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcessLotUncheckedUpdateManyWithoutProcessInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    number?: Prisma.IntFieldUpdateOperationsInput | number;
    barIds?: Prisma.ProcessLotUpdatebarIdsInput | string[];
    recovered?: Prisma.NullableFloatFieldUpdateOperationsInput | number | null;
    egresadoG?: Prisma.FloatFieldUpdateOperationsInput | number;
    creationDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type ProcessLotSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    processId?: boolean;
    number?: boolean;
    barIds?: boolean;
    recovered?: boolean;
    egresadoG?: boolean;
    creationDate?: boolean;
    process?: boolean | Prisma.ProcessDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["processLot"]>;
export type ProcessLotSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    processId?: boolean;
    number?: boolean;
    barIds?: boolean;
    recovered?: boolean;
    egresadoG?: boolean;
    creationDate?: boolean;
    process?: boolean | Prisma.ProcessDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["processLot"]>;
export type ProcessLotSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    processId?: boolean;
    number?: boolean;
    barIds?: boolean;
    recovered?: boolean;
    egresadoG?: boolean;
    creationDate?: boolean;
    process?: boolean | Prisma.ProcessDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["processLot"]>;
export type ProcessLotSelectScalar = {
    id?: boolean;
    processId?: boolean;
    number?: boolean;
    barIds?: boolean;
    recovered?: boolean;
    egresadoG?: boolean;
    creationDate?: boolean;
};
export type ProcessLotOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "processId" | "number" | "barIds" | "recovered" | "egresadoG" | "creationDate", ExtArgs["result"]["processLot"]>;
export type ProcessLotInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    process?: boolean | Prisma.ProcessDefaultArgs<ExtArgs>;
};
export type ProcessLotIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    process?: boolean | Prisma.ProcessDefaultArgs<ExtArgs>;
};
export type ProcessLotIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    process?: boolean | Prisma.ProcessDefaultArgs<ExtArgs>;
};
export type $ProcessLotPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "ProcessLot";
    objects: {
        process: Prisma.$ProcessPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        processId: string;
        number: number;
        barIds: string[];
        recovered: number | null;
        egresadoG: number;
        creationDate: Date;
    }, ExtArgs["result"]["processLot"]>;
    composites: {};
};
export type ProcessLotGetPayload<S extends boolean | null | undefined | ProcessLotDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload, S>;
export type ProcessLotCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<ProcessLotFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: ProcessLotCountAggregateInputType | true;
};
export interface ProcessLotDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['ProcessLot'];
        meta: {
            name: 'ProcessLot';
        };
    };
    findUnique<T extends ProcessLotFindUniqueArgs>(args: Prisma.SelectSubset<T, ProcessLotFindUniqueArgs<ExtArgs>>): Prisma.Prisma__ProcessLotClient<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends ProcessLotFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, ProcessLotFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProcessLotClient<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends ProcessLotFindFirstArgs>(args?: Prisma.SelectSubset<T, ProcessLotFindFirstArgs<ExtArgs>>): Prisma.Prisma__ProcessLotClient<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends ProcessLotFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, ProcessLotFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__ProcessLotClient<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends ProcessLotFindManyArgs>(args?: Prisma.SelectSubset<T, ProcessLotFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends ProcessLotCreateArgs>(args: Prisma.SelectSubset<T, ProcessLotCreateArgs<ExtArgs>>): Prisma.Prisma__ProcessLotClient<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends ProcessLotCreateManyArgs>(args?: Prisma.SelectSubset<T, ProcessLotCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends ProcessLotCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, ProcessLotCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends ProcessLotDeleteArgs>(args: Prisma.SelectSubset<T, ProcessLotDeleteArgs<ExtArgs>>): Prisma.Prisma__ProcessLotClient<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends ProcessLotUpdateArgs>(args: Prisma.SelectSubset<T, ProcessLotUpdateArgs<ExtArgs>>): Prisma.Prisma__ProcessLotClient<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends ProcessLotDeleteManyArgs>(args?: Prisma.SelectSubset<T, ProcessLotDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends ProcessLotUpdateManyArgs>(args: Prisma.SelectSubset<T, ProcessLotUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends ProcessLotUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, ProcessLotUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends ProcessLotUpsertArgs>(args: Prisma.SelectSubset<T, ProcessLotUpsertArgs<ExtArgs>>): Prisma.Prisma__ProcessLotClient<runtime.Types.Result.GetResult<Prisma.$ProcessLotPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends ProcessLotCountArgs>(args?: Prisma.Subset<T, ProcessLotCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], ProcessLotCountAggregateOutputType> : number>;
    aggregate<T extends ProcessLotAggregateArgs>(args: Prisma.Subset<T, ProcessLotAggregateArgs>): Prisma.PrismaPromise<GetProcessLotAggregateType<T>>;
    groupBy<T extends ProcessLotGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: ProcessLotGroupByArgs['orderBy'];
    } : {
        orderBy?: ProcessLotGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, ProcessLotGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetProcessLotGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: ProcessLotFieldRefs;
}
export interface Prisma__ProcessLotClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    process<T extends Prisma.ProcessDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.ProcessDefaultArgs<ExtArgs>>): Prisma.Prisma__ProcessClient<runtime.Types.Result.GetResult<Prisma.$ProcessPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface ProcessLotFieldRefs {
    readonly id: Prisma.FieldRef<"ProcessLot", 'String'>;
    readonly processId: Prisma.FieldRef<"ProcessLot", 'String'>;
    readonly number: Prisma.FieldRef<"ProcessLot", 'Int'>;
    readonly barIds: Prisma.FieldRef<"ProcessLot", 'String[]'>;
    readonly recovered: Prisma.FieldRef<"ProcessLot", 'Float'>;
    readonly egresadoG: Prisma.FieldRef<"ProcessLot", 'Float'>;
    readonly creationDate: Prisma.FieldRef<"ProcessLot", 'DateTime'>;
}
export type ProcessLotFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessLotSelect<ExtArgs> | null;
    omit?: Prisma.ProcessLotOmit<ExtArgs> | null;
    include?: Prisma.ProcessLotInclude<ExtArgs> | null;
    where: Prisma.ProcessLotWhereUniqueInput;
};
export type ProcessLotFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessLotSelect<ExtArgs> | null;
    omit?: Prisma.ProcessLotOmit<ExtArgs> | null;
    include?: Prisma.ProcessLotInclude<ExtArgs> | null;
    where: Prisma.ProcessLotWhereUniqueInput;
};
export type ProcessLotFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ProcessLotFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ProcessLotFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type ProcessLotCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessLotSelect<ExtArgs> | null;
    omit?: Prisma.ProcessLotOmit<ExtArgs> | null;
    include?: Prisma.ProcessLotInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProcessLotCreateInput, Prisma.ProcessLotUncheckedCreateInput>;
};
export type ProcessLotCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.ProcessLotCreateManyInput | Prisma.ProcessLotCreateManyInput[];
    skipDuplicates?: boolean;
};
export type ProcessLotCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessLotSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProcessLotOmit<ExtArgs> | null;
    data: Prisma.ProcessLotCreateManyInput | Prisma.ProcessLotCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.ProcessLotIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type ProcessLotUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessLotSelect<ExtArgs> | null;
    omit?: Prisma.ProcessLotOmit<ExtArgs> | null;
    include?: Prisma.ProcessLotInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProcessLotUpdateInput, Prisma.ProcessLotUncheckedUpdateInput>;
    where: Prisma.ProcessLotWhereUniqueInput;
};
export type ProcessLotUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.ProcessLotUpdateManyMutationInput, Prisma.ProcessLotUncheckedUpdateManyInput>;
    where?: Prisma.ProcessLotWhereInput;
    limit?: number;
};
export type ProcessLotUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessLotSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.ProcessLotOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.ProcessLotUpdateManyMutationInput, Prisma.ProcessLotUncheckedUpdateManyInput>;
    where?: Prisma.ProcessLotWhereInput;
    limit?: number;
    include?: Prisma.ProcessLotIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type ProcessLotUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessLotSelect<ExtArgs> | null;
    omit?: Prisma.ProcessLotOmit<ExtArgs> | null;
    include?: Prisma.ProcessLotInclude<ExtArgs> | null;
    where: Prisma.ProcessLotWhereUniqueInput;
    create: Prisma.XOR<Prisma.ProcessLotCreateInput, Prisma.ProcessLotUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.ProcessLotUpdateInput, Prisma.ProcessLotUncheckedUpdateInput>;
};
export type ProcessLotDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessLotSelect<ExtArgs> | null;
    omit?: Prisma.ProcessLotOmit<ExtArgs> | null;
    include?: Prisma.ProcessLotInclude<ExtArgs> | null;
    where: Prisma.ProcessLotWhereUniqueInput;
};
export type ProcessLotDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.ProcessLotWhereInput;
    limit?: number;
};
export type ProcessLotDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.ProcessLotSelect<ExtArgs> | null;
    omit?: Prisma.ProcessLotOmit<ExtArgs> | null;
    include?: Prisma.ProcessLotInclude<ExtArgs> | null;
};
