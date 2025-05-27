import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useCarrinho } from '../../context/CarrinhoContext';
import DetalhesPedidoModal from '../../comp/detalhesPedidoModal';

export default function HistoricoConcluidoPage() {
    const { pedidosPendentes, carregarPedidosPendentes } = useCarrinho();
    const [pedidosConcluidos, setPedidosConcluidos] = useState<any[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [pedidoSelecionado, setPedidoSelecionado] = useState<any>(null);

    useEffect(() => {
        const carregarPedidos = async () => {
            await carregarPedidosPendentes();
        };
        carregarPedidos();
    }, []);

    useEffect(() => {
        // Filtra apenas os pedidos com status 'entregue'
        const concluidos = pedidosPendentes.filter(pedido => pedido.status === 'entregue');
        // Ordena por data de finalização, mais recente primeiro
        const ordenados = concluidos.sort((a, b) => 
            new Date(b.dataHoraFinalizacao).getTime() - new Date(a.dataHoraFinalizacao).getTime()
        );
        setPedidosConcluidos(ordenados);
    }, [pedidosPendentes]);

    const handlePedidoPress = (pedido: any) => {
        setPedidoSelecionado(pedido);
        setModalVisible(true);
    };

    const renderPedido = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handlePedidoPress(item)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.mesaText}>Mesa {item.mesa}</Text>
                <Text style={styles.horaText}>
                    {new Date(item.dataHora).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.infoText}>
                    {item.itens.length} {item.itens.length === 1 ? 'item' : 'itens'}
                </Text>
                <Text style={styles.valorText}>
                    R$ {item.valorTotal.toFixed(2).replace('.', ',')}
                </Text>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.atendenteText}>
                    Atendente: {item.nome_atendente}
                </Text>
                <Text style={styles.statusText}>
                    Finalizado em: {new Date(item.dataHoraFinalizacao).toLocaleString('pt-BR')}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Text style={styles.title}>Histórico de Pedidos Concluídos</Text>
            
            {pedidosConcluidos.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Nenhum pedido concluído encontrado
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={pedidosConcluidos}
                    renderItem={renderPedido}
                    keyExtractor={(item) => item.id.toString()}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            <DetalhesPedidoModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                pedido={pedidoSelecionado}
                modo="concluido"
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
        padding: 16,
        textAlign: 'center',
    },
    listContainer: {
        padding: 16,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    mesaText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    horaText: {
        fontSize: 16,
        color: '#666',
    },
    cardContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        color: '#333',
    },
    valorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#28a745',
    },
    cardFooter: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 8,
    },
    atendenteText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    statusText: {
        fontSize: 14,
        color: '#28a745',
        fontWeight: '500',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
}); 