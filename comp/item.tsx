// comp/CarrinhoItemCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { CarrinhoItem } from '../comp/itemModel'; // Importe a interface CarrinhoItem

// Adicione uma interface para as props do CarrinhoItemCard
interface CarrinhoItemCardProps {
    item: CarrinhoItem;
    // Opcional: Adicione funções para interações futuras, como editar quantidade ou remover
    onPress?: () => void;
    // onRemove?: (id: number, type: 'pizza' | 'esfiha' | 'bebida') => void;
    // onUpdateQuantity?: (id: number, type: 'pizza' | 'esfiha' | 'bebida', newQuantity: number) => void;
}

const Item: React.FC<CarrinhoItemCardProps> = ({ item, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.infoContainer}>
                {/* Nome do Item e Quantidade */}
                <Text style={styles.itemName}>
                    {item.nome} ({item.quantidade}x)
                </Text>

                {/* Complementos Adicionais / Observações */}
                {item.tipo === 'pizza' && item.bordaRecheada && (
                    <Text style={styles.itemDetails}>Borda: {item.bordaRecheada}</Text>
                )}
                {item.tipo === 'bebida' && item.adicionaisSelecionados && item.adicionaisSelecionados.length > 0 && (
                    <Text style={styles.itemDetails}>Adicionais: {item.adicionaisSelecionados.join(', ')}</Text>
                )}
                {item.observacao && (
                    <Text style={styles.itemDetails}>Obs: {item.observacao}</Text>
                )}
            </View>

            {/* Preço Total do Item */}
            <Text style={styles.itemPrice}>
                R$ {(item.precoUnitario * item.quantidade).toFixed(2).replace('.', ',')}
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginVertical: 5,
        marginHorizontal: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    infoContainer: {
        flex: 1,
        marginRight: 10,
    },
    itemName: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
    },
    itemDetails: {
        fontSize: 14,
        color: '#666',
        marginTop: 2,
    },
    itemPrice: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#28a745', // Verde para o preço
    },
});

export default Item;