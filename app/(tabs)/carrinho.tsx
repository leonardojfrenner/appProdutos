// app/carrinho.tsx
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, SafeAreaView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useCarrinho } from '../../context/CarrinhoContext';
import { usePedidoInfo } from '../../context/pedidoInfoContext';
import CarrinhoItemCard from '../../comp/item';
import appStyles from '../../style/appStyles';

const CarrinhoPage = () => {
    const router = useRouter();
    const { pedidoAtualInfo, limparPedidoInfo } = usePedidoInfo();
    const { carrinho, getTotalItens, getPrecoTotal, limparCarrinho, finalizarPedido } = useCarrinho();
    const [isLoading, setIsLoading] = useState(false);

    const handleFinalizarPedido = async () => {
        if (carrinho.length === 0) {
            Alert.alert("Carrinho Vazio", "Adicione itens ao pedido antes de finalizar.");
            return;
        }

        if (!pedidoAtualInfo) {
            Alert.alert("Erro", "Informações da mesa não encontradas. Inicie um novo atendimento.");
            return;
        }

        setIsLoading(true);
        try {
            const dadosIniciaisPedido = {
                mesa: pedidoAtualInfo.mesa,
                n_cracha_atendente: pedidoAtualInfo.n_cracha_atendente,
                nome_atendente: pedidoAtualInfo.nome_atendente,
                quantidadePessoas: pedidoAtualInfo.quantidadePessoas,
            };

            const sucesso = await finalizarPedido(dadosIniciaisPedido);

            if (sucesso) {
                Alert.alert(
                    "Pedido Concluído!",
                    `Pedido para Mesa ${pedidoAtualInfo.mesa} adicionado ao histórico de pendentes.\n\nValor: R$ ${getPrecoTotal().toFixed(2).replace('.', ',')}`
                );

                await limparPedidoInfo();
                router.replace('/historicoPendente');
            }
        } catch (error) {
            console.error("Erro ao finalizar pedido:", error);
            Alert.alert("Erro", "Não foi possível finalizar o pedido.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <SafeAreaView style={appStyles.container}>
            <View style={styles.headerContainer}>
                <Text style={styles.pageTitle}>Seu Pedido</Text>
                {pedidoAtualInfo ? (
                    <View style={styles.pedidoInfoContainer}>
                        <Text style={styles.pedidoInfoText}>
                            Mesa: {pedidoAtualInfo.mesa}
                        </Text>
                        <Text style={styles.pedidoInfoText}>
                            Atendente: {pedidoAtualInfo.nome_atendente}
                        </Text>
                        <Text style={styles.pedidoInfoText}>
                            Pessoas: {pedidoAtualInfo.quantidadePessoas}
                        </Text>
                    </View>
                ) : (
                    <Text style={styles.pedidoInfoText}>
                        Informações do pedido não disponíveis. Inicie um novo atendimento.
                    </Text>
                )}
            </View>

            {carrinho.length === 0 ? (
                <View style={styles.emptyCartContainer}>
                    <Text style={styles.emptyCartText}>
                        Seu carrinho está vazio. Adicione alguns itens!
                    </Text>
                </View>
            ) : (
                <>
                    <FlatList
                        data={carrinho}
                        keyExtractor={(item, index) => `${item.id}-${item.tipo}-${index}`}
                        renderItem={({ item }) => <CarrinhoItemCard item={item} />}
                        contentContainerStyle={styles.listContent}
                    />
                    
                    <View style={styles.footerContainer}>
                        <View style={styles.totalContainer}>
                            <Text style={styles.totalText}>
                                Total: R$ {getPrecoTotal().toFixed(2).replace('.', ',')}
                            </Text>
                            <Text style={styles.itemsCount}>
                                {getTotalItens()} {getTotalItens() === 1 ? 'item' : 'itens'}
                            </Text>
                        </View>
                        
                        <TouchableOpacity 
                            style={[styles.finishButton, isLoading && styles.finishButtonDisabled]}
                            onPress={handleFinalizarPedido}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.finishButtonText}>Finalizar Pedido</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </>
            )}
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
        marginBottom: 8,
    },
    pedidoInfoContainer: {
        backgroundColor: '#f8f9fa',
        padding: 12,
        borderRadius: 8,
    },
    pedidoInfoText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 4,
    },
    emptyCartContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyCartText: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
    },
    listContent: {
        padding: 12,
    },
    footerContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    totalContainer: {
        marginBottom: 16,
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#007AFF',
    },
    itemsCount: {
        fontSize: 14,
        color: '#666',
        marginTop: 4,
    },
    finishButton: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    finishButtonDisabled: {
        opacity: 0.7,
    },
    finishButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default CarrinhoPage;