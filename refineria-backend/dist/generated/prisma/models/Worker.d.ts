import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type WorkerModel = runtime.Types.Result.DefaultSelection<Prisma.$WorkerPayload>;
export type AggregateWorker = {
    _count: WorkerCountAggregateOutputType | null;
    _min: WorkerMinAggregateOutputType | null;
    _max: WorkerMaxAggregateOutputType | null;
};
export type WorkerMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    position: string | null;
    status: $Enums.WorkerStatus | null;
    startDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type WorkerMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    position: string | null;
    status: $Enums.WorkerStatus | null;
    startDate: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type WorkerCountAggregateOutputType = {
    id: number;
    name: number;
    position: number;
    status: number;
    startDate: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type WorkerMinAggregateInputType = {
    id?: true;
    name?: true;
    position?: true;
    status?: true;
    startDate?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type WorkerMaxAggregateInputType = {
    id?: true;
    name?: true;
    position?: true;
    status?: true;
    startDate?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type WorkerCountAggregateInputType = {
    id?: true;
    name?: true;
    position?: true;
    status?: true;
    startDate?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type WorkerAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkerWhereInput;
    orderBy?: Prisma.WorkerOrderByWithRelationInput | Prisma.WorkerOrderByWithRelationInput[];
    cursor?: Prisma.WorkerWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | WorkerCountAggregateInputType;
    _min?: WorkerMinAggregateInputType;
    _max?: WorkerMaxAggregateInputType;
};
export type GetWorkerAggregateType<T extends WorkerAggregateArgs> = {
    [P in keyof T & keyof AggregateWorker]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateWorker[P]> : Prisma.GetScalarType<T[P], AggregateWorker[P]>;
};
export type WorkerGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkerWhereInput;
    orderBy?: Prisma.WorkerOrderByWithAggregationInput | Prisma.WorkerOrderByWithAggregationInput[];
    by: Prisma.WorkerScalarFieldEnum[] | Prisma.WorkerScalarFieldEnum;
    having?: Prisma.WorkerScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WorkerCountAggregateInputType | true;
    _min?: WorkerMinAggregateInputType;
    _max?: WorkerMaxAggregateInputType;
};
export type WorkerGroupByOutputType = {
    id: string;
    name: string;
    position: string;
    status: $Enums.WorkerStatus;
    startDate: Date;
    createdAt: Date;
    updatedAt: Date;
    _count: WorkerCountAggregateOutputType | null;
    _min: WorkerMinAggregateOutputType | null;
    _max: WorkerMaxAggregateOutputType | null;
};
export type GetWorkerGroupByPayload<T extends WorkerGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<WorkerGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof WorkerGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], WorkerGroupByOutputType[P]> : Prisma.GetScalarType<T[P], WorkerGroupByOutputType[P]>;
}>>;
export type WorkerWhereInput = {
    AND?: Prisma.WorkerWhereInput | Prisma.WorkerWhereInput[];
    OR?: Prisma.WorkerWhereInput[];
    NOT?: Prisma.WorkerWhereInput | Prisma.WorkerWhereInput[];
    id?: Prisma.StringFilter<"Worker"> | string;
    name?: Prisma.StringFilter<"Worker"> | string;
    position?: Prisma.StringFilter<"Worker"> | string;
    status?: Prisma.EnumWorkerStatusFilter<"Worker"> | $Enums.WorkerStatus;
    startDate?: Prisma.DateTimeFilter<"Worker"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"Worker"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Worker"> | Date | string;
};
export type WorkerOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    startDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WorkerWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.WorkerWhereInput | Prisma.WorkerWhereInput[];
    OR?: Prisma.WorkerWhereInput[];
    NOT?: Prisma.WorkerWhereInput | Prisma.WorkerWhereInput[];
    name?: Prisma.StringFilter<"Worker"> | string;
    position?: Prisma.StringFilter<"Worker"> | string;
    status?: Prisma.EnumWorkerStatusFilter<"Worker"> | $Enums.WorkerStatus;
    startDate?: Prisma.DateTimeFilter<"Worker"> | Date | string;
    createdAt?: Prisma.DateTimeFilter<"Worker"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Worker"> | Date | string;
}, "id">;
export type WorkerOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    startDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.WorkerCountOrderByAggregateInput;
    _max?: Prisma.WorkerMaxOrderByAggregateInput;
    _min?: Prisma.WorkerMinOrderByAggregateInput;
};
export type WorkerScalarWhereWithAggregatesInput = {
    AND?: Prisma.WorkerScalarWhereWithAggregatesInput | Prisma.WorkerScalarWhereWithAggregatesInput[];
    OR?: Prisma.WorkerScalarWhereWithAggregatesInput[];
    NOT?: Prisma.WorkerScalarWhereWithAggregatesInput | Prisma.WorkerScalarWhereWithAggregatesInput[];
    id?: Prisma.StringWithAggregatesFilter<"Worker"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Worker"> | string;
    position?: Prisma.StringWithAggregatesFilter<"Worker"> | string;
    status?: Prisma.EnumWorkerStatusWithAggregatesFilter<"Worker"> | $Enums.WorkerStatus;
    startDate?: Prisma.DateTimeWithAggregatesFilter<"Worker"> | Date | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Worker"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Worker"> | Date | string;
};
export type WorkerCreateInput = {
    id?: string;
    name: string;
    position: string;
    status?: $Enums.WorkerStatus;
    startDate: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WorkerUncheckedCreateInput = {
    id?: string;
    name: string;
    position: string;
    status?: $Enums.WorkerStatus;
    startDate: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WorkerUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumWorkerStatusFieldUpdateOperationsInput | $Enums.WorkerStatus;
    startDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkerUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumWorkerStatusFieldUpdateOperationsInput | $Enums.WorkerStatus;
    startDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkerCreateManyInput = {
    id?: string;
    name: string;
    position: string;
    status?: $Enums.WorkerStatus;
    startDate: Date | string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WorkerUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumWorkerStatusFieldUpdateOperationsInput | $Enums.WorkerStatus;
    startDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkerUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    position?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumWorkerStatusFieldUpdateOperationsInput | $Enums.WorkerStatus;
    startDate?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkerCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    startDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WorkerMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    startDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WorkerMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    position?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    startDate?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type EnumWorkerStatusFieldUpdateOperationsInput = {
    set?: $Enums.WorkerStatus;
};
export type WorkerSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    position?: boolean;
    status?: boolean;
    startDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["worker"]>;
export type WorkerSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    position?: boolean;
    status?: boolean;
    startDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["worker"]>;
export type WorkerSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    position?: boolean;
    status?: boolean;
    startDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["worker"]>;
export type WorkerSelectScalar = {
    id?: boolean;
    name?: boolean;
    position?: boolean;
    status?: boolean;
    startDate?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type WorkerOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "position" | "status" | "startDate" | "createdAt" | "updatedAt", ExtArgs["result"]["worker"]>;
export type $WorkerPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Worker";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        position: string;
        status: $Enums.WorkerStatus;
        startDate: Date;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["worker"]>;
    composites: {};
};
export type WorkerGetPayload<S extends boolean | null | undefined | WorkerDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$WorkerPayload, S>;
export type WorkerCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<WorkerFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: WorkerCountAggregateInputType | true;
};
export interface WorkerDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Worker'];
        meta: {
            name: 'Worker';
        };
    };
    findUnique<T extends WorkerFindUniqueArgs>(args: Prisma.SelectSubset<T, WorkerFindUniqueArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends WorkerFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, WorkerFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends WorkerFindFirstArgs>(args?: Prisma.SelectSubset<T, WorkerFindFirstArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends WorkerFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, WorkerFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends WorkerFindManyArgs>(args?: Prisma.SelectSubset<T, WorkerFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends WorkerCreateArgs>(args: Prisma.SelectSubset<T, WorkerCreateArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends WorkerCreateManyArgs>(args?: Prisma.SelectSubset<T, WorkerCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends WorkerCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, WorkerCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends WorkerDeleteArgs>(args: Prisma.SelectSubset<T, WorkerDeleteArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends WorkerUpdateArgs>(args: Prisma.SelectSubset<T, WorkerUpdateArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends WorkerDeleteManyArgs>(args?: Prisma.SelectSubset<T, WorkerDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends WorkerUpdateManyArgs>(args: Prisma.SelectSubset<T, WorkerUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends WorkerUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, WorkerUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends WorkerUpsertArgs>(args: Prisma.SelectSubset<T, WorkerUpsertArgs<ExtArgs>>): Prisma.Prisma__WorkerClient<runtime.Types.Result.GetResult<Prisma.$WorkerPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends WorkerCountArgs>(args?: Prisma.Subset<T, WorkerCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], WorkerCountAggregateOutputType> : number>;
    aggregate<T extends WorkerAggregateArgs>(args: Prisma.Subset<T, WorkerAggregateArgs>): Prisma.PrismaPromise<GetWorkerAggregateType<T>>;
    groupBy<T extends WorkerGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: WorkerGroupByArgs['orderBy'];
    } : {
        orderBy?: WorkerGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, WorkerGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkerGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: WorkerFieldRefs;
}
export interface Prisma__WorkerClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface WorkerFieldRefs {
    readonly id: Prisma.FieldRef<"Worker", 'String'>;
    readonly name: Prisma.FieldRef<"Worker", 'String'>;
    readonly position: Prisma.FieldRef<"Worker", 'String'>;
    readonly status: Prisma.FieldRef<"Worker", 'WorkerStatus'>;
    readonly startDate: Prisma.FieldRef<"Worker", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"Worker", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Worker", 'DateTime'>;
}
export type WorkerFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    where: Prisma.WorkerWhereUniqueInput;
};
export type WorkerFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    where: Prisma.WorkerWhereUniqueInput;
};
export type WorkerFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    where?: Prisma.WorkerWhereInput;
    orderBy?: Prisma.WorkerOrderByWithRelationInput | Prisma.WorkerOrderByWithRelationInput[];
    cursor?: Prisma.WorkerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WorkerScalarFieldEnum | Prisma.WorkerScalarFieldEnum[];
};
export type WorkerFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    where?: Prisma.WorkerWhereInput;
    orderBy?: Prisma.WorkerOrderByWithRelationInput | Prisma.WorkerOrderByWithRelationInput[];
    cursor?: Prisma.WorkerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WorkerScalarFieldEnum | Prisma.WorkerScalarFieldEnum[];
};
export type WorkerFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    where?: Prisma.WorkerWhereInput;
    orderBy?: Prisma.WorkerOrderByWithRelationInput | Prisma.WorkerOrderByWithRelationInput[];
    cursor?: Prisma.WorkerWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WorkerScalarFieldEnum | Prisma.WorkerScalarFieldEnum[];
};
export type WorkerCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkerCreateInput, Prisma.WorkerUncheckedCreateInput>;
};
export type WorkerCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.WorkerCreateManyInput | Prisma.WorkerCreateManyInput[];
    skipDuplicates?: boolean;
};
export type WorkerCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    data: Prisma.WorkerCreateManyInput | Prisma.WorkerCreateManyInput[];
    skipDuplicates?: boolean;
};
export type WorkerUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkerUpdateInput, Prisma.WorkerUncheckedUpdateInput>;
    where: Prisma.WorkerWhereUniqueInput;
};
export type WorkerUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.WorkerUpdateManyMutationInput, Prisma.WorkerUncheckedUpdateManyInput>;
    where?: Prisma.WorkerWhereInput;
    limit?: number;
};
export type WorkerUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkerUpdateManyMutationInput, Prisma.WorkerUncheckedUpdateManyInput>;
    where?: Prisma.WorkerWhereInput;
    limit?: number;
};
export type WorkerUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    where: Prisma.WorkerWhereUniqueInput;
    create: Prisma.XOR<Prisma.WorkerCreateInput, Prisma.WorkerUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.WorkerUpdateInput, Prisma.WorkerUncheckedUpdateInput>;
};
export type WorkerDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
    where: Prisma.WorkerWhereUniqueInput;
};
export type WorkerDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkerWhereInput;
    limit?: number;
};
export type WorkerDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkerSelect<ExtArgs> | null;
    omit?: Prisma.WorkerOmit<ExtArgs> | null;
};
