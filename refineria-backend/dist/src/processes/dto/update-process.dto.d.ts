export declare class UpdateProcessDto {
    status?: 'open' | 'in_progress' | 'closed';
    lots?: {
        id: string;
        recovered: number;
    }[];
}
