import { ItemPedidoBase } from './itemPedidoBase';
import { Esfiha } from '../esfiha';

export interface ItemPedidoEsfiha extends ItemPedidoBase {
    tipo: 'esfiha';
    item: Esfiha;
}