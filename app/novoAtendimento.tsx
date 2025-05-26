// app/PedidoScreen.tsx
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Image } from 'react-native';
import { router } from 'expo-router';
import { useState } from 'react';
import { styles } from '../style/pedidoStyles';
import { usePedidoInfo } from '../context/pedidoInfoContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Chave para armazenar as informações do pedido atual no AsyncStorage
const PEDIDO_ATUAL_INFO_KEY = '@appPedido:pedidoAtualInfo';

export default function PedidoScreen() {
    const [mesa, setMesa] = useState('');
    const [quantidadePessoas, setQuantidadePessoas] = useState('');

    async function montarPedido() {
        if (mesa === '' || quantidadePessoas === '') {
            Alert.alert('Erro', 'Por favor, preencha todos os campos!');
            return;
        }

        try {
            const atendenteData = await AsyncStorage.getItem('atendente');

            let n_cracha_atendente = '';
            let nome_atendente = '';

            if (atendenteData) {
                const atendente = JSON.parse(atendenteData);
                n_cracha_atendente = atendente.n_cracha;
                nome_atendente = atendente.nome;
            } else {
                Alert.alert('Erro', 'Nenhum atendente logado. Por favor, faça login novamente.');
                router.replace('/index');
                return;
            }

            const pedidoInfo = {
                mesa: mesa,
                quantidadePessoas: parseInt(quantidadePessoas, 10),
                n_cracha_atendente: n_cracha_atendente,
                nome_atendente: nome_atendente,
            };

            // NOVO: Salvar as informações do pedido atual no AsyncStorage
            await AsyncStorage.setItem(PEDIDO_ATUAL_INFO_KEY, JSON.stringify(pedidoInfo));
            console.log('Informações do Pedido para iniciar (salvo no Storage):', pedidoInfo);

            Alert.alert('Sucesso', 'Atendimento iniciado para a Mesa ' + mesa);

            // Redireciona para a página principal das abas
            router.push('/(tabs)');

            setMesa('');
            setQuantidadePessoas('');

        } catch (error) {
            console.error('Erro ao montar o pedido:', error);
            Alert.alert('Erro', 'Não foi possível iniciar o atendimento.');
        }
    }

    return (
        <KeyboardAvoidingView style={styles.background}>
            <View style={styles.container}>
                <View style={styles.card}>
                    <TextInput
                        style={styles.input}
                        placeholder="Número da Mesa"
                        value={mesa}
                        onChangeText={setMesa}
                        keyboardType="numeric"
                    />

                    <TextInput
                        style={styles.input}
                        placeholder="Quantidade de Pessoas"
                        value={quantidadePessoas}
                        onChangeText={setQuantidadePessoas}
                        keyboardType="numeric"
                    />

                    <TouchableOpacity style={styles.button} onPress={montarPedido}>
                        <Text style={styles.buttonText}>Iniciar Atendimento</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}