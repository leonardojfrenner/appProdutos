import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useCarrinho } from '../context/CarrinhoContext';
import { usePedidoInfo } from '../context/pedidoInfoContext';

interface DetalhesPedidoModalProps {
    visible: boolean;
    onClose: () => void;
    pedido: any;
    onAdicionarItens?: () => void;
    onFinalizar?: () => void;
    modo: 'pendente' | 'concluido';
}

const DetalhesPedidoModal: React.FC<DetalhesPedidoModalProps> = ({
    visible,
    onClose,
    pedido,
    onAdicionarItens,
    onFinalizar,
    modo
}) => {
    const router = useRouter();
    const { limparCarrinho } = useCarrinho();
    const { salvarPedidoInfo, atendenteLogado } = usePedidoInfo();

    const handleAdicionarItens = async () => {
        if (!pedido || !atendenteLogado) return;

        // Salva as informações do pedido atual no contexto
        await salvarPedidoInfo({
            mesa: pedido.mesa,
            n_cracha_atendente: atendenteLogado.n_cracha,
            nome_atendente: atendenteLogado.nome,
            quantidadePessoas: pedido.quantidadePessoas
        });

        onClose();
        router.push('/(tabs)');
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Detalhes do Pedido</Text>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Text style={styles.closeButtonText}>×</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.scrollContent}>
                        <View style={styles.infoSection}>
                            <Text style={styles.mesaText}>Mesa {pedido?.mesa}</Text>
                            <Text style={styles.infoText}>
                                Atendente: {pedido?.nome_atendente}
                            </Text>
                            <Text style={styles.infoText}>
                                Pessoas: {pedido?.quantidadePessoas}
                            </Text>
                            <Text style={styles.infoText}>
                                Data: {new Date(pedido?.dataHora).toLocaleString('pt-BR')}
                            </Text>
                        </View>

                        <View style={styles.itensSection}>
                            <Text style={styles.sectionTitle}>Itens do Pedido</Text>
                            {pedido?.itens.map((item: any, index: number) => (
                                <View key={index} style={styles.itemRow}>
                                    <Text style={styles.itemText}>
                                        {item.quantidade}x {item.nome}
                                        {item.bordaRecheada && ` (Borda: ${item.bordaRecheada})`}
                                        {item.adicionaisSelecionados && 
                                            ` (Adicionais: ${item.adicionaisSelecionados.join(', ')})`}
                                    </Text>
                                    <Text style={styles.itemPrice}>
                                        R$ {(item.precoUnitario * item.quantidade).toFixed(2).replace('.', ',')}
                                    </Text>
                                </View>
                            ))}
                        </View>

                        <View style={styles.totalSection}>
                            <Text style={styles.totalText}>
                                Total: R$ {pedido?.valorTotal.toFixed(2).replace('.', ',')}
                            </Text>
                        </View>
                    </ScrollView>

                    <View style={styles.footer}>
                        {modo === 'pendente' && (
                            <>
                                <TouchableOpacity
                                    style={[styles.button, styles.addButton]}
                                    onPress={handleAdicionarItens}
                                >
                                    <Text style={styles.buttonText}>Adicionar Itens</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.button, styles.finishButton]}
                                    onPress={onFinalizar}
                                >
                                    <Text style={styles.buttonText}>Finalizar Pedido</Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: 12,
        width: '90%',
        maxHeight: '80%',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
    },
    closeButton: {
        padding: 4,
    },
    closeButtonText: {
        fontSize: 24,
        color: '#666',
    },
    scrollContent: {
        padding: 16,
    },
    infoSection: {
        marginBottom: 16,
    },
    mesaText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 8,
    },
    infoText: {
        fontSize: 16,
        color: '#666',
        marginBottom: 4,
    },
    itensSection: {
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    itemText: {
        flex: 1,
        fontSize: 16,
        color: '#333',
    },
    itemPrice: {
        fontSize: 16,
        color: '#666',
        marginLeft: 8,
    },
    totalSection: {
        borderTopWidth: 1,
        borderTopColor: '#eee',
        paddingTop: 16,
        marginTop: 8,
    },
    totalText: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#28a745',
        textAlign: 'right',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 16,
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    button: {
        flex: 1,
        padding: 12,
        borderRadius: 6,
        marginHorizontal: 4,
    },
    addButton: {
        backgroundColor: '#007AFF',
    },
    finishButton: {
        backgroundColor: '#28a745',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
});

export default DetalhesPedidoModal; 