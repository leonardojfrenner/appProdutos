import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useCarrinho } from '../../context/CarrinhoContext';
import { usePedidoInfo } from '../../context/pedidoInfoContext';
import appStyles from '../../style/appStyles';
import DetalhesPedidoModal from '../../comp/detalhesPedidoModal';

interface PedidosPorMesa {
    mesa: string;
    atendente: string;
    pedidos: any[];
    totalItens: number;
    valorTotal: number;
    quantidadePessoas: number;
}

const HistoricoPendentePage = () => {
    const router = useRouter();
    const { pedidosPendentes, carregarPedidosPendentes, marcarPedidoComoEntregue } = useCarrinho();
    const { atendenteLogado } = usePedidoInfo();
    const [pedidosPorMesa, setPedidosPorMesa] = useState<PedidosPorMesa[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMesa, setSelectedMesa] = useState<PedidosPorMesa | null>(null);

    useEffect(() => {
        carregarPedidosPendentes();
    }, []);

    useEffect(() => {
        // Agrupa os pedidos por mesa
        const mesasAgrupadas = pedidosPendentes.reduce((acc: { [key: string]: PedidosPorMesa }, pedido) => {
            if (pedido.status === 'pendente' || pedido.status === 'em preparo') {
                if (!acc[pedido.mesa]) {
                    acc[pedido.mesa] = {
                        mesa: pedido.mesa,
                        atendente: pedido.nome_atendente,
                        pedidos: [],
                        totalItens: 0,
                        valorTotal: 0,
                        quantidadePessoas: pedido.quantidadePessoas
                    };
                }
                acc[pedido.mesa].pedidos.push(pedido);
                acc[pedido.mesa].totalItens += pedido.itens.reduce((sum: number, item: any) => sum + item.quantidade, 0);
                acc[pedido.mesa].valorTotal += pedido.valorTotal;
            }
            return acc;
        }, {});

        // Converte o objeto em array e ordena por número da mesa
        const mesasOrdenadas = Object.values(mesasAgrupadas).sort((a, b) => 
            parseInt(a.mesa) - parseInt(b.mesa)
        );
        
        setPedidosPorMesa(mesasOrdenadas);
    }, [pedidosPendentes]);

    const handleMesaPress = (mesa: PedidosPorMesa) => {
        setSelectedMesa(mesa);
        setModalVisible(true);
    };

    const handleFinalizarMesa = async () => {
        if (!selectedMesa) return;

        Alert.alert(
            "Finalizar Mesa",
            `Deseja finalizar todos os pedidos da Mesa ${selectedMesa.mesa}?`,
            [
                {
                    text: "Cancelar",
                    style: "cancel"
                },
                {
                    text: "Confirmar",
                    onPress: async () => {
                        // Marca todos os pedidos da mesa como entregues
                        for (const pedido of selectedMesa.pedidos) {
                            await marcarPedidoComoEntregue(pedido.id);
                        }
                        await carregarPedidosPendentes();
                        setModalVisible(false);
                    }
                }
            ]
        );
    };

    const renderMesa = ({ item }: { item: PedidosPorMesa }) => (
        <TouchableOpacity 
            style={styles.mesaCard}
            onPress={() => handleMesaPress(item)}
        >
            <View style={styles.mesaHeader}>
                <Text style={styles.mesaText}>Mesa {item.mesa}</Text>
                <Text style={styles.atendenteText}>
                    Atendente: {item.atendente}
                </Text>
            </View>

            <View style={styles.mesaInfo}>
                <Text style={styles.infoText}>
                    {item.totalItens} {item.totalItens === 1 ? 'item' : 'itens'}
                </Text>
                <Text style={styles.infoText}>
                    {item.pedidos.length} {item.pedidos.length === 1 ? 'pedido' : 'pedidos'}
                </Text>
                <Text style={styles.infoText}>
                    {item.quantidadePessoas} {item.quantidadePessoas === 1 ? 'pessoa' : 'pessoas'}
                </Text>
            </View>

            <View style={styles.mesaFooter}>
                <Text style={styles.valorText}>
                    Total: R$ {item.valorTotal.toFixed(2).replace('.', ',')}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={appStyles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Mesas Ativas</Text>
            </View>

            {pedidosPorMesa.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Nenhuma mesa ativa no momento.
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={pedidosPorMesa}
                    renderItem={renderMesa}
                    keyExtractor={(item) => item.mesa}
                    contentContainerStyle={styles.listContent}
                />
            )}

            <DetalhesPedidoModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                pedido={selectedMesa ? {
                    mesa: selectedMesa.mesa,
                    nome_atendente: selectedMesa.atendente,
                    quantidadePessoas: selectedMesa.quantidadePessoas,
                    itens: selectedMesa.pedidos.flatMap((p: any) => p.itens),
                    valorTotal: selectedMesa.valorTotal,
                    dataHora: selectedMesa.pedidos[0].dataHora
                } : null}
                onFinalizar={handleFinalizarMesa}
                modo="pendente"
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
    mesaCard: {
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
    mesaHeader: {
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
    atendenteText: {
        fontSize: 14,
        color: '#666',
    },
    mesaInfo: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginVertical: 8,
        paddingVertical: 8,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoText: {
        fontSize: 14,
        color: '#666',
    },
    mesaFooter: {
        marginTop: 8,
    },
    valorText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#28a745',
        textAlign: 'right',
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

export default HistoricoPendentePage;