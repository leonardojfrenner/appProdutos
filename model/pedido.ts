import { ItemPedidoBase } from './interface/itemPedidoBase';
import { ItemPedidoBebida } from './interface/itemPedidoBebida';
import { ItemPedidoEsfiha } from './interface/itemPedidoEsfiha';
import { ItemPedidoPizza } from './interface/itemPedidoPizza';

import { Bebida } from './bebida';
import { Esfiha } from './esfiha'; 
import { Pizza } from './pizza';   


export type ItemDoPedido = ItemPedidoBebida | ItemPedidoEsfiha | ItemPedidoPizza;


export class Pedido {
    // Propriedades do pedido
    mesa: string;
    n_cracha_atendente: string; // n_cracha do atendente que registrou o pedido
    status: 'Pendente' | 'Concluido';
    observacao?: string; // Opcional
    itens: ItemDoPedido[]; // Array de itens no pedido

    // Propriedades calculadas
    total: number; // Será calculado dinamicamente

    constructor(
        mesa: string,
        n_cracha_atendente: string,
        itens: ItemDoPedido[],
        observacao?: string,
        status: 'Pendente' | 'Concluido' = 'Pendente' // Padrão 'Pendente'
    ) {
        this.mesa = mesa;
        this.n_cracha_atendente = n_cracha_atendente;
        this.itens = itens;
        this.observacao = observacao;
        this.status = status;
        this.total = this.calcularTotal(); // Calcula o total na criação
    }

    private calcularTotal(): number {
        let totalPedido = 0;
        for (const itemPedido of this.itens) {
            let precoBaseItem = parseFloat(itemPedido.item.preco.replace(',', '.')); // Garante que é um número

            // Adicionais específicos de cada tipo de item
            if (itemPedido.tipo === 'pizza' && (itemPedido.item as Pizza).bordaRecheada) {
                precoBaseItem += 10.00; // Acréscimo de $10 pela borda
            }
            // Para bebidas, os adicionais não alteram o preço, então não há lógica aqui.

            totalPedido += precoBaseItem * itemPedido.quantidade;
        }
        return parseFloat(totalPedido.toFixed(2)); // Arredonda para 2 casas decimais
    }

    // Métodos para gerenciar o pedido
    adicionarItem(item: ItemDoPedido) {
        this.itens.push(item);
        this.total = this.calcularTotal(); // Recalcula o total
    }

    removerItem(itemId: number, itemTipo: 'bebida' | 'pizza' | 'esfiha') {
        const initialLength = this.itens.length;
        this.itens = this.itens.filter(item => !(item.item.id === itemId && item.tipo === itemTipo));
        if (this.itens.length < initialLength) {
            this.total = this.calcularTotal(); // Recalcula o total se um item foi removido
            return true; // Item removido com sucesso
        }
        return false; // Item não encontrado
    }

    mudarStatus(novoStatus: 'Pendente' | 'Concluido') {
        this.status = novoStatus;
    }

    // Você pode adicionar mais métodos conforme a necessidade, como:
    // getItem(itemId: number, itemType: 'bebida' | 'pizza' | 'esfiha'): ItemDoPedido | undefined
    // atualizarQuantidadeItem(itemId: number, itemType: string, novaQuantidade: number)
}