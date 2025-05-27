import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { useCarrinho } from '../../context/CarrinhoContext';
import DetalhesPedidoModal from '../../comp/detalhesPedidoModal';

interface PedidosAgrupados {
    mesa: string;
    atendente: string;
    pedidos: any[];
    totalItens: number;
    valorTotal: number;
    quantidadePessoas: number;
    dataHoraFinalizacao: string;
}

export default function HistoricoConcluidoPage() {
    const { pedidosPendentes, carregarPedidosPendentes } = useCarrinho();
    const [pedidosAgrupados, setPedidosAgrupados] = useState<PedidosAgrupados[]>([]);
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

        // Primeiro, ordena os pedidos por mesa e data de finalização
        const pedidosOrdenados = [...concluidos].sort((a, b) => {
            if (a.mesa !== b.mesa) {
                return a.mesa.localeCompare(b.mesa);
            }
            return new Date(a.dataHoraFinalizacao).getTime() - new Date(b.dataHoraFinalizacao).getTime();
        });

        // Agrupa os pedidos
        const grupos: PedidosAgrupados[] = [];
        let grupoAtual: PedidosAgrupados | null = null;

        pedidosOrdenados.forEach(pedido => {
            const dataPedido = new Date(pedido.dataHoraFinalizacao).getTime();

            // Se não há grupo atual ou se é uma mesa diferente, cria um novo grupo
            if (!grupoAtual || grupoAtual.mesa !== pedido.mesa) {
                if (grupoAtual) {
                    grupos.push(grupoAtual);
                }
                grupoAtual = {
                    mesa: pedido.mesa,
                    atendente: pedido.nome_atendente,
                    pedidos: [pedido],
                    totalItens: pedido.itens.reduce((sum: number, item: any) => sum + item.quantidade, 0),
                    valorTotal: pedido.valorTotal,
                    quantidadePessoas: pedido.quantidadePessoas,
                    dataHoraFinalizacao: pedido.dataHoraFinalizacao
                };
            } else {
                // Verifica se o pedido atual está dentro da tolerância de tempo (1 minuto)
                const dataGrupoAtual = new Date(grupoAtual.dataHoraFinalizacao).getTime();
                const diferencaTempo = Math.abs(dataPedido - dataGrupoAtual);
                const umMinutoEmMs = 60 * 1000;

                if (diferencaTempo <= umMinutoEmMs) {
                    // Adiciona ao grupo atual
                    grupoAtual.pedidos.push(pedido);
                    grupoAtual.totalItens += pedido.itens.reduce((sum: number, item: any) => sum + item.quantidade, 0);
                    grupoAtual.valorTotal += pedido.valorTotal;
                    // Mantém a data de finalização mais recente
                    if (dataPedido > dataGrupoAtual) {
                        grupoAtual.dataHoraFinalizacao = pedido.dataHoraFinalizacao;
                    }
                } else {
                    // Finaliza o grupo atual e cria um novo
                    grupos.push(grupoAtual);
                    grupoAtual = {
                        mesa: pedido.mesa,
                        atendente: pedido.nome_atendente,
                        pedidos: [pedido],
                        totalItens: pedido.itens.reduce((sum: number, item: any) => sum + item.quantidade, 0),
                        valorTotal: pedido.valorTotal,
                        quantidadePessoas: pedido.quantidadePessoas,
                        dataHoraFinalizacao: pedido.dataHoraFinalizacao
                    };
                }
            }
        });

        // Adiciona o último grupo se existir
        if (grupoAtual) {
            grupos.push(grupoAtual);
        }

        // Ordena os grupos por data de finalização (mais recente primeiro)
        const ordenados = grupos.sort((a, b) => 
            new Date(b.dataHoraFinalizacao).getTime() - new Date(a.dataHoraFinalizacao).getTime()
        );

        setPedidosAgrupados(ordenados);
    }, [pedidosPendentes]);

    const handlePedidoPress = (pedido: PedidosAgrupados) => {
        setPedidoSelecionado(pedido);
        setModalVisible(true);
    };

    const renderPedido = ({ item }: { item: PedidosAgrupados }) => (
        <TouchableOpacity
            style={styles.card}
            onPress={() => handlePedidoPress(item)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.mesaText}>Mesa {item.mesa}</Text>
                <Text style={styles.horaText}>
                    {new Date(item.dataHoraFinalizacao).toLocaleTimeString('pt-BR', {
                        hour: '2-digit',
                        minute: '2-digit'
                    })}
                </Text>
            </View>

            <View style={styles.cardContent}>
                <Text style={styles.infoText}>
                    {item.totalItens} {item.totalItens === 1 ? 'item' : 'itens'}
                </Text>
                <Text style={styles.valorText}>
                    R$ {item.valorTotal.toFixed(2).replace('.', ',')}
                </Text>
            </View>

            <View style={styles.cardFooter}>
                <Text style={styles.atendenteText}>
                    Atendente: {item.atendente}
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
            
            {pedidosAgrupados.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>
                        Nenhum pedido concluído encontrado
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={pedidosAgrupados}
                    renderItem={renderPedido}
                    keyExtractor={(item) => `${item.mesa}-${item.dataHoraFinalizacao}`}
                    contentContainerStyle={styles.listContainer}
                />
            )}

            <DetalhesPedidoModal
                visible={modalVisible}
                onClose={() => setModalVisible(false)}
                pedido={pedidoSelecionado ? {
                    mesa: pedidoSelecionado.mesa,
                    nome_atendente: pedidoSelecionado.atendente,
                    quantidadePessoas: pedidoSelecionado.quantidadePessoas,
                    itens: pedidoSelecionado.pedidos.flatMap((p: any) => p.itens),
                    valorTotal: pedidoSelecionado.valorTotal,
                    dataHora: pedidoSelecionado.dataHoraFinalizacao
                } : null}
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