import { ItemPedidoBase } from './itemPedidoBase';
import { Pizza } from '../pizza';

export interface ItemPedidoPizza extends ItemPedidoBase {
    tipo: 'pizza';
    item: Pizza;
}