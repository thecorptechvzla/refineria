export declare class UpdateProcessDto {
    status?: 'open' | 'closed';
    lots?: {
        id: string;
        recovered: number;
    }[];
}
