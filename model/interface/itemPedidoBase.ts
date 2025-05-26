export interface ItemPedidoBase {
    tipo: 'bebida' | 'pizza' | 'esfiha';
    quantidade: number; // Quantidade de cada item
    precoUnitario: number; // Preço unitário do item (já convertido de string se necessário)
}