export interface Bebida {
    id: number;
    nome: string;
    descricao: string;
    preco: string;
    imagem: string;
    tipo: 'bebida';

    // Novos opcionais para bebida
    adicionais?: string[]; // Ex: ['Gelo', 'Limão Cortado', 'Limão Espremido']
}