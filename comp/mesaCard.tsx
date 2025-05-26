// comp/MesaCard.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { PedidoCompleto } from '../context/CarrinhoContext'; // Importe a interface PedidoCompleto

interface MesaCardProps {
    mesa: string;
    totalPedidosMesa: number;
    valorTotalMesa: number;
    onPress: () => void; // Ação ao clicar no card da mesa
}

const MesaCard: React.FC<MesaCardProps> = ({ mesa, totalPedidosMesa, valorTotalMesa, onPress }) => {
    return (
        <TouchableOpacity style={styles.card} onPress={onPress}>
            <View style={styles.infoContainer}>
                <Text style={styles.mesaText}>Mesa {mesa}</Text>
                <Text style={styles.detailsText}>Pedidos Pendentes: {totalPedidosMesa}</Text>
            </View>
            <Text style={styles.valorTotalText}>
                Total: R$ {valorTotalMesa.toFixed(2).replace('.', ',')}
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
        marginVertical: 8,
        marginHorizontal: 15,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 3,
    },
    infoContainer: {
        flex: 1,
    },
    mesaText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    detailsText: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    valorTotalText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007bff',
    },
});

export default MesaCard;