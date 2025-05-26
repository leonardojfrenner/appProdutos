import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert, Modal } from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { useCarrinho, PedidoCompleto } from '../../context/CarrinhoContext';
import { usePedidoInfo } from '../../context/pedidoInfoContext'; // Corrigido para PedidoInfoContext
import MesaCard from '../../comp/mesaCard';
import appStyles from '../../style/appStyles';
import FinalizarAtendimentoModal from '../../comp/finalizarAtendimentoModal';


interface PedidosPorMesa {
    [mesa: string]: {
        pedidos: PedidoCompleto[];
        totalPedidos: number;
        valorTotal: number;
    };
}

const HistoricoPendentePage = () => {
    const router = useRouter();
    const { pedidosPendentes, limparCarrinho, marcarPedidoComoEntregue, carregarPedidosPendentes } = useCarrinho();
    // CORREÇÃO: Usando 'salvarPedidoInfo' em vez de 'setPedidoAtualInfo'
    const { limparPedidoInfo, salvarPedidoInfo, atendenteLogado } = usePedidoInfo();

    const [modalVisible, setModalVisible] = useState(false);
    const [selectedMesaParaFinalizar, setSelectedMesaParaFinalizar] = useState<string | null>(null);

    useFocusEffect(
        useCallback(() => {
            carregarPedidosPendentes();
            console.log("Tela HistoricoPendente focada. Recarregando pedidos pendentes do DB.");
        }, [carregarPedidosPendentes])
    );

    const pedidosAgrupadosPorMesa: PedidosPorMesa = useMemo(() => {
        const agrupados: PedidosPorMesa = {};
        pedidosPendentes.forEach(pedido => {
            if (!agrupados[pedido.mesa]) {
                agrupados[pedido.mesa] = {
                    pedidos: [],
                    totalPedidos: 0,
                    valorTotal: 0,
                };
            }
            agrupados[pedido.mesa].pedidos.push(pedido);
            agrupados[pedido.mesa].totalPedidos += pedido.itens.reduce((sum, item) => sum + item.quantidade, 0);
            agrupados[pedido.mesa].valorTotal += pedido.valorTotal;
        });
        return agrupados;
    }, [pedidosPendentes]);

    const mesasOrdenadas = Object.keys(pedidosAgrupadosPorMesa).sort((a, b) => parseInt(a) - parseInt(b));

    const handleAdicionarMaisItens = async (mesa: string, atendenteCracha: string, atendenteNome: string, quantidadePessoas: number) => {
        limparCarrinho();
        await limparPedidoInfo();

        // CORREÇÃO: Validar se o atendente está logado antes de usar seus dados
        if (!atendenteLogado) {
            Alert.alert("Erro", "Atendente não logado. Por favor, faça login novamente.");
            router.replace('/'); // Redireciona para o login se não houver atendente
            return;
        }

        const novaPedidoInfo = {
            mesa: mesa,
            quantidadePessoas: quantidadePessoas,
            // CORREÇÃO: Usando os dados do 'atendenteLogado' do contexto, que são mais confiáveis
            n_cracha_atendente: atendenteLogado.n_cracha,
            nome_atendente: atendenteLogado.nome,
        };
        // CORREÇÃO: Chamar 'salvarPedidoInfo' em vez de 'setPedidoAtualInfo'
        await salvarPedidoInfo(novaPedidoInfo);
        console.log("Nova info de pedido atual salva via contexto para adicionar itens:", novaPedidoInfo);

        router.push('/(tabs)');
        Alert.alert("Continuando Pedido", `Retornando para adicionar itens à Mesa ${mesa}.`);
    };

    const handleOpenFinalizarModal = (mesa: string) => {
        setSelectedMesaParaFinalizar(mesa);
        setModalVisible(true);
    };

    const handleCloseFinalizarModal = () => {
        setModalVisible(false);
        setSelectedMesaParaFinalizar(null);
    };

    const handleConfirmarFinalizarAtendimento = async () => {
        if (!selectedMesaParaFinalizar) return;

        const pedidosDaMesa = pedidosAgrupadosPorMesa[selectedMesaParaFinalizar].pedidos;

        try {
            for (const pedido of pedidosDaMesa) {
                await marcarPedidoComoEntregue(pedido.id);
            }

            Alert.alert("Atendimento Finalizado", `Atendimento da Mesa ${selectedMesaParaFinalizar} foi finalizado e os pedidos marcados como entregues.`);
            handleCloseFinalizarModal();
        } catch (error) {
            console.error("Erro ao finalizar atendimento:", error);
            Alert.alert("Erro", "Não foi possível finalizar o atendimento da mesa.");
        }
    };

    return (
        <SafeAreaView style={appStyles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Atendimentos Pendentes</Text>
            </View>

            {mesasOrdenadas.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Não há atendimentos pendentes no momento.</Text>
                </View>
            ) : (
                <FlatList
                    data={mesasOrdenadas}
                    keyExtractor={(mesa) => mesa}
                    renderItem={({ item: mesa }) => {
                        const dadosDaMesa = pedidosAgrupadosPorMesa[mesa];
                        // Certifique-se de que 'primeiroPedidoDaMesa' existe antes de acessá-lo
                        const primeiroPedidoDaMesa = dadosDaMesa.pedidos[0]; 
                        
                        // Validação para garantir que 'primeiroPedidoDaMesa' existe
                        if (!primeiroPedidoDaMesa) {
                            return null; // Ou um placeholder, dependendo do que for apropriado
                        }

                        return (
                            <MesaCard
                                mesa={mesa}
                                totalPedidosMesa={dadosDaMesa.totalPedidos}
                                valorTotalMesa={dadosDaMesa.valorTotal}
                                onPress={() => { /* Poderia abrir um detalhe da mesa aqui */ }}
                            />
                        );
                    }}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {mesasOrdenadas.length > 0 && (
                <View style={styles.actionButtonsContainer}>
                    {mesasOrdenadas.map(mesa => {
                        const dadosDaMesa = pedidosAgrupadosPorMesa[mesa];
                        // CORREÇÃO: Garante que 'primeiroPedidoDaMesa' é obtido para as ações
                        const primeiroPedidoDaMesa = dadosDaMesa.pedidos[0]; 

                        // Validação adicional para o loop de ações, caso um pedido não tenha dados
                        if (!primeiroPedidoDaMesa) {
                            console.warn(`Mesa ${mesa} sem dados de pedido inicial para ações.`);
                            return null; 
                        }

                        return (
                            <View key={`actions-${mesa}`} style={styles.mesaActions}>
                                <Text style={styles.mesaActionTitle}>Mesa {mesa}</Text>
                                <View style={styles.buttonGroup}>
                                    <TouchableOpacity
                                        style={styles.actionButton}
                                        onPress={() => handleAdicionarMaisItens(
                                            mesa,
                                            primeiroPedidoDaMesa.n_cracha_atendente,
                                            primeiroPedidoDaMesa.nome_atendente,
                                            primeiroPedidoDaMesa.quantidadePessoas
                                        )}
                                    >
                                        <Text style={styles.actionButtonText}>+ Itens</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={styles.finalizarButton}
                                        onPress={() => handleOpenFinalizarModal(mesa)}
                                    >
                                        <Text style={styles.actionButtonText}>Finalizar</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        );
                    })}
                </View>
            )}

            <FinalizarAtendimentoModal
                visible={modalVisible}
                mesa={selectedMesaParaFinalizar}
                onClose={handleCloseFinalizarModal}
                onConfirm={handleConfirmarFinalizarAtendimento}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        padding: 20,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#333',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 18,
        color: '#777',
        textAlign: 'center',
    },
    listContent: {
        paddingBottom: 20,
    },
    actionButtonsContainer: {
        padding: 15,
        backgroundColor: '#f8f8f8',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    mesaActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        paddingVertical: 8,
        paddingHorizontal: 5,
        backgroundColor: '#fff',
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    mesaActionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#444',
        flex: 1,
    },
    buttonGroup: {
        flexDirection: 'row',
    },
    actionButton: {
        backgroundColor: '#007bff',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginLeft: 10,
    },
    finalizarButton: {
        backgroundColor: '#28a745',
        paddingVertical: 8,
        paddingHorizontal: 15,
        borderRadius: 20,
        marginLeft: 10,
    },
    actionButtonText: {
        color: '#fff',
        fontSize: 15,
        fontWeight: 'bold',
    },
});

export default HistoricoPendentePage;