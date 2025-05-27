import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useCarrinho } from '../../context/CarrinhoContext';
import { usePedidoInfo } from '../../context/pedidoInfoContext';
import appStyles from '../../style/appStyles';
import DetalhesPedidoModal from '../../comp/detalhesPedidoModal';

const HistoricoConcluidoPage = () => {
    const router = useRouter();
    const { pedidosPendentes, carregarPedidosPendentes } = useCarrinho();
    const { atendenteLogado } = usePedidoInfo();
    const [pedidosConcluidos, setPedidosConcluidos] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedPedido, setSelectedPedido] = useState<any>(null);

    useEffect(() => {
        carregarPedidosPendentes();
    }, []);

    useEffect(() => {
        // Filtra apenas os pedidos concluídos
        const concluidos = pedidosPendentes.filter(pedido => pedido.status === 'entregue');
        setPedidosConcluidos(concluidos);
    }, [pedidosPendentes]);

    const handlePedidoPress = (pedido: any) => {
        setSelectedPedido(pedido);
        setModalVisible(true);
    };

    const renderPedido = ({ item }: { item: any }) => (
        <TouchableOpacity 
            style={styles.pedidoCard}
            onPress={() => handlePedidoPress(item)}
        >
            <View style={styles.pedidoHeader}>
                <Text style={styles.mesaText}>Mesa {item.mesa}</Text>
                <Text style={styles.dataText}>
                    {new Date(item.dataHora).toLocaleString('pt-BR')}
                </Text>
            </View>

            <View style={styles.itensContainer}>
                <Text style={styles.itensCount}>
                    {item.itens.length} {item.itens.length === 1 ? 'item' : 'itens'}
                </Text>
            </View>

            <View style={styles.pedidoFooter}>
                <Text style={styles.valorText}>
                    Total: R$ {item.valorTotal.toFixed(2).replace('.', ',')}
                </Text>
                <Text style={styles.atendenteText}>
                    Atendente: {item.nome_atendente}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={appStyles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Histórico de Pedidos Concluídos</Text>
            </View>

            {pedidosConcluidos.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Nenhum pedido concluído encontrado.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={pedidosConcluidos}
                    renderItem={renderPedido}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <DetalhesPedidoModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                pedido={selectedPedido}
                modo="concluido"
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
    },
    listContent: {
        padding: 12,
    },
    pedidoCard: {
        backgroundColor: '#fff',
        borderRadius: 8,
        padding: 16,
        marginBottom: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    pedidoHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    mesaText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    dataText: {
        fontSize: 14,
        color: '#666',
    },
    itensContainer: {
        marginVertical: 8,
    },
    itensCount: {
        fontSize: 14,
        color: '#666',
    },
    pedidoFooter: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    valorText: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#28a745',
        marginBottom: 4,
    },
    atendenteText: {
        fontSize: 14,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
});

export default HistoricoConcluidoPage; 