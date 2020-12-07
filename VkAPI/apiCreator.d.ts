export declare const createVkApi: (token: string) => (method: string, pars: {
    [par: string]: string | number;
}) => Promise<unknown>;
