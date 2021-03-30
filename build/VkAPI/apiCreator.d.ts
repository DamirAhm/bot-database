export declare const createVkApi: (token: string) => <T>(method: string, pars: {
    [par: string]: string | number;
}) => Promise<T>;
