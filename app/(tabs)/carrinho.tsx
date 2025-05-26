// app/carrinho.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCarrinho, PedidoCompleto } from '../../context/CarrinhoContext'; // Importe PedidoCompleto também
import { usePedidoInfo } from '../../context/pedidoInfoContext';
import CarrinhoItemCard from '../../comp/item'; // Certifique-se que o nome do componente é CarrinhoItemCard
import appStyles from '../../style/appStyles';

const CarrinhoPage = () => {
    const router = useRouter();
    // REMOVIDO: const { n_cracha_atendente, nome_atendente, mesa, quantidadePessoas } = useLocalSearchParams();

    // NOVO: Use o hook do PedidoInfoContext
    const { pedidoAtualInfo, limparPedidoInfo } = usePedidoInfo();
    const { carrinho, getTotalItens, getPrecoTotal, limparCarrinho, finalizarPedido } = useCarrinho();

    const [pedidoInfoDisplay, setPedidoInfoDisplay] = useState('');

    useEffect(() => {
        // Agora, pegue as informações do pedido do PedidoInfoContext
        if (pedidoAtualInfo) {
            setPedidoInfoDisplay(
                `Mesa: ${pedidoAtualInfo.mesa} | Atendente: ${pedidoAtualInfo.nome_atendente} (Crachá: ${pedidoAtualInfo.n_cracha_atendente})\n` +
                `Pessoas na mesa: ${pedidoAtualInfo.quantidadePessoas}`
            );
        } else {
            setPedidoInfoDisplay('Informações do pedido não disponíveis. Inicie um novo atendimento.');
            // Opcional: redirecionar para a tela de iniciar pedido se não houver info
            // router.replace('/PedidoScreen');
        }
    }, [pedidoAtualInfo]); // Depende do pedidoAtualInfo

    const handleFinalizarPedido = async () => {
        if (carrinho.length === 0) {
            Alert.alert("Carrinho Vazio", "Adicione itens ao pedido antes de finalizar.");
            return;
        }

        if (!pedidoAtualInfo) {
            Alert.alert("Erro", "Informações da mesa não encontradas. Inicie um novo atendimento.");
            return;
        }

        const dadosIniciaisPedido = {
            mesa: pedidoAtualInfo.mesa,
            n_cracha_atendente: pedidoAtualInfo.n_cracha_atendente,
            nome_atendente: pedidoAtualInfo.nome_atendente,
            quantidadePessoas: pedidoAtualInfo.quantidadePessoas,
        };

        // Chama a função do contexto para persistir no AsyncStorage de pedidos pendentes
        const sucesso = await finalizarPedido(dadosIniciaisPedido);

        if (sucesso) {
            // Se persistido com sucesso no AsyncStorage, agora salva no SQLite
            // ATENÇÃO: O `finalizarEPersistirPedido` cria o PedidoCompleto completo e o salva no estado `pedidosPendentes`.
            // Para salvá-lo no SQLite, você precisaria ter acesso a esse `novoPedido` que foi criado.
            // Uma opção é fazer o `insertPedido` DENTRO do `finalizarEPersistirPedido` no `CarrinhoContext`.
            // Ou, para simplicidade, você pode chamar `insertPedido` aqui, mas recriando o objeto para o SQLite
            // baseado nos dados do `pedidoAtualInfo` e no carrinho que acabou de ser limpo.
            // A melhor prática é fazer o salvamento no DB no `CarrinhoContext` ao persistir o pedido.

            // Vamos ajustar o `CarrinhoContext.tsx` para chamar `insertPedido` lá,
            // para que o pedido seja salvo no DB no mesmo momento em que é adicionado ao histórico pendente.
            // Por enquanto, apenas um alerta e redirecionamento, pois a lógica de DB será no contexto.
            Alert.alert(
                "Pedido Concluído!",
                `Pedido para Mesa ${pedidoAtualInfo.mesa} adicionado ao histórico de pendentes.\n\nValor: R$ ${getPrecoTotal().toFixed(2).replace('.', ',')}`
            );

            // Limpar as informações do pedido atual do AsyncStorage, pois o atendimento dessa mesa foi "finalizado"
            // e movido para o histórico de pendentes.
            await limparPedidoInfo();

            // Redireciona para o histórico de pendentes
            router.replace('/historicoPendente');
        }
    };

    return (
        <SafeAreaView style={appStyles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Seu Pedido</Text>
                {pedidoInfoDisplay ? (
                    <Text style={styles.pedidoInfoText}>{pedidoInfoDisplay}</Text>
                ) : (
                    <Text style={styles.pedidoInfoText}>Carregando informações do pedido...</Text>
                )}
            </View>

            {carrinho.length === 0 ? (
                <View style={styles.emptyCartContainer}>
                    <Text style={styles.emptyCartText}>Seu carrinho está vazio. Adicione alguns itens!</Text>
                </View>
            ) : (
                <FlatList
                    data={carrinho}
                    keyExtractor={(item, index) => `${item.id}-${item.tipo}-${item.observacao || 'no-obs'}-${item.bordaRecheada || 'no-borda'}-${JSON.stringify(item.adicionaisSelecionados) || 'no-add'}-${index}`}
                    renderItem={({ item }) => (
                        <CarrinhoItemCard
                            item={item}
                        />
                    )}
                    contentContainerStyle={styles.listContent}
                />
            )}

            {carrinho.length > 0 && (
                <View style={styles.footerContainer}>
                    <Text style={styles.totalText}>Total de Itens: {getTotalItens()}</Text>
                    <Text style={styles.totalText}>Valor Total: R$ {getPrecoTotal().toFixed(2).replace('.', ',')}</Text>

                    <TouchableOpacity style={styles.checkoutButton} onPress={handleFinalizarPedido}>
                        <Text style={styles.checkoutButtonText}>Finalizar Pedido</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.clearCartButton} onPress={() => Alert.alert('Limpar Carrinho', 'Tem certeza que deseja limpar todo o carrinho?', [{ text: 'Não' }, { text: 'Sim', onPress: limparCarrinho }])}>
                        <Text style={styles.clearCartButtonText}>Limpar Carrinho</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderBottomWidth: 1,
        borderBottomColor: '#ddd',
        alignItems: 'center',
    },
    pageTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 10,
        color: '#333',
    },
    pedidoInfoText: {
        fontSize: 16,
        color: '#555',
        textAlign: 'center',
        marginBottom: 5,
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyCartText: {
        fontSize: 18,
        color: '#777',
        textAlign: 'center',
    },
    listContent: {
        paddingVertical: 10,
        paddingHorizontal: 5,
    },
    footerContainer: {
        padding: 15,
        backgroundColor: '#f0f0f0',
        borderTopWidth: 1,
        borderTopColor: '#ddd',
        alignItems: 'center',
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007bff',
        marginBottom: 10,
    },
    checkoutButton: {
        backgroundColor: '#28a745',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 25,
        marginTop: 15,
    },
    checkoutButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    clearCartButton: {
        backgroundColor: '#dc3545',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 20,
        marginTop: 10,
    },
    clearCartButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CarrinhoPage;