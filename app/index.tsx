import {View, Text, TouchableOpacity, Alert} from 'react-native';
import Botao from '../comp/botao';
import { Input } from '../comp/input';
import { router } from 'expo-router';
import { useState } from 'react';
import { usePedidoInfo } from '../context/pedidoInfoContext'; 
import * as db from "../database/crud";
import AsyncStorage from '@react-native-async-storage/async-storage';


export default function App() {

  const [n_cracha, setN_cracha] = useState('');
  const [senha, setSenha] = useState('');
  const { salvarAtendenteLogado } = usePedidoInfo(); // Use a função do contexto


  async function login() {
        if (n_cracha === '' || senha === '') {
            Alert.alert('Erro', 'Por favor, preencha todos os campos!');
            return;
        }

        try {
            const atendenteEncontrado = await db.selectAtendente(n_cracha, senha);

            if (atendenteEncontrado) {
                const atendenteParaArmazenar = {
                    id: atendenteEncontrado.id,
                    nome: atendenteEncontrado.nome,
                    n_cracha: atendenteEncontrado.n_cracha,
                };

                // Use a função do contexto para salvar o atendente
                await salvarAtendenteLogado(atendenteParaArmazenar);
                console.log('Atendente logado (dados não sensíveis):', atendenteParaArmazenar);

                setN_cracha('');
                setSenha('');
                router.push('/novoAtendimento'); // Redireciona para onde o novo atendimento é iniciado
            } else {
                Alert.alert('Erro de Login', 'Crachá ou senha incorretos.');
                setN_cracha('');
                setSenha('');
            }
        } catch (error: any) {
            console.error('Erro no processo de login:', error);
            Alert.alert('Erro', `Ocorreu um erro ao tentar fazer login: ${error.message || 'Verifique sua conexão ou tente novamente.'}`);
            setN_cracha('');
            setSenha('');
        }
    }

    return (
        <View style={{flex: 1, backgroundColor: '#fff'}}>
            <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
                <Text>Welcome to the app!</Text>
                <Input placeholder="Digite seu cracha" value={n_cracha} onChangeText={setN_cracha} />
                <Input placeholder="Digite sua senha" secureTextEntry={true} value={senha} onChangeText={setSenha}/>
                <Botao onPress={login} texto="Começar" />
                <TouchableOpacity onPress={() => router.push('/cadastrar')}>
                <Text>Cadastra-se </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}