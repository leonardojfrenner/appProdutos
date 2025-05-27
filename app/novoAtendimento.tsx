// app/PedidoScreen.tsx
import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { styles } from '../style/pedidoStyles';
import { usePedidoInfo } from '../context/pedidoInfoContext';
import { useCarrinho } from '../context/CarrinhoContext';
import appStyles from '../style/appStyles';

export default function PedidoScreen() {
    const router = useRouter();
    const { salvarPedidoInfo, atendenteLogado } = usePedidoInfo();
    const { pedidosPendentes, carregarPedidosPendentes } = useCarrinho();
    const [mesa, setMesa] = useState('');
    const [quantidadePessoas, setQuantidadePessoas] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        carregarPedidosPendentes();
    }, []);

    const handleIniciarAtendimento = async () => {
        if (!mesa || !quantidadePessoas) {
            Alert.alert('Erro', 'Por favor, preencha todos os campos.');
            return;
        }

        if (!atendenteLogado) {
            Alert.alert('Erro', 'Nenhum atendente logado. Por favor, faça login novamente.');
            router.replace('/');
            return;
        }

        // Verifica se a mesa já está ocupada
        const mesaOcupada = pedidosPendentes.some(
            pedido => pedido.mesa === mesa && 
            (pedido.status === 'pendente' || pedido.status === 'em preparo')
        );

        if (mesaOcupada) {
            Alert.alert(
                'Mesa Ocupada',
                'Esta mesa já está em atendimento. Deseja adicionar itens ao pedido existente?',
                [
                    {
                        text: 'Cancelar',
                        style: 'cancel'
                    },
                    {
                        text: 'Adicionar Itens',
                        onPress: async () => {
                            setIsLoading(true);
                            try {
                                // Encontra o pedido existente
                                const pedidoExistente = pedidosPendentes.find(
                                    p => p.mesa === mesa && 
                                    (p.status === 'pendente' || p.status === 'em preparo')
                                );

                                if (pedidoExistente) {
                                    // Salva as informações do pedido existente
                                    await salvarPedidoInfo({
                                        mesa: pedidoExistente.mesa,
                                        n_cracha_atendente: atendenteLogado.n_cracha,
                                        nome_atendente: atendenteLogado.nome,
                                        quantidadePessoas: pedidoExistente.quantidadePessoas
                                    });
                                    router.push('/(tabs)');
                                }
                            } catch (error) {
                                console.error('Erro ao adicionar itens:', error);
                                Alert.alert('Erro', 'Não foi possível adicionar itens ao pedido.');
                            } finally {
                                setIsLoading(false);
                            }
                        }
                    }
                ]
            );
            return;
        }

        setIsLoading(true);
        try {
            await salvarPedidoInfo({
                mesa,
                n_cracha_atendente: atendenteLogado.n_cracha,
                nome_atendente: atendenteLogado.nome,
                quantidadePessoas: parseInt(quantidadePessoas)
            });
            router.push('/(tabs)');
        } catch (error) {
            console.error('Erro ao iniciar atendimento:', error);
            Alert.alert('Erro', 'Não foi possível iniciar o atendimento.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.background}
        >
            <View style={appStyles.container}>
                <View style={styles.formContainer}>
                    <Text style={styles.title}>Novo Atendimento</Text>
                    
                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Número da Mesa</Text>
                        <TextInput
                            style={styles.input}
                            value={mesa}
                            onChangeText={setMesa}
                            keyboardType="number-pad"
                            placeholder="Digite o número da mesa"
                        />
                    </View>

                    <View style={styles.inputContainer}>
                        <Text style={styles.label}>Quantidade de Pessoas</Text>
                        <TextInput
                            style={styles.input}
                            value={quantidadePessoas}
                            onChangeText={setQuantidadePessoas}
                            keyboardType="number-pad"
                            placeholder="Digite a quantidade de pessoas"
                        />
                    </View>

                    <TouchableOpacity
                        style={[styles.button, isLoading && styles.buttonDisabled]}
                        onPress={handleIniciarAtendimento}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color="#fff" />
                        ) : (
                            <Text style={styles.buttonText}>Iniciar Atendimento</Text>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}