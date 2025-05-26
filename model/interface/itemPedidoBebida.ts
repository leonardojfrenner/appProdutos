import { ItemPedidoBase } from './itemPedidoBase';
import { Bebida } from '../bebida';

export interface ItemPedidoBebida extends ItemPedidoBase {
    tipo: 'bebida';
    item: Bebida;
}