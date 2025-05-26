export class Atendente {
    private _nome: string;
    private _n_cracha: string;
    private _senha: string;

    constructor(nome: string, n_cracha: string, senha: string) {
        this._nome = nome;
        this._n_cracha = n_cracha;
        this._senha = senha;
    }

    get nome(): string {
        return this._nome;
    }
    set nome(value: string) {
        this._nome = value;
    }

    get n_cracha(): string {
        return this._n_cracha;
    }
    set n_cracha(value: string) {
        this._n_cracha = value;
    }

    get senha(): string {
        return this._senha;
    }
    set senha(value: string) {
        this._senha = value;
    }
}