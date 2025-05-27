import {View, Text, TouchableOpacity, Alert} from 'react-native';
import Botao from '../comp/botao';
import { Input } from '../comp/input';
import { router } from 'expo-router';
import { useState } from 'react';
import { usePedidoInfo } from '../context/pedidoInfoContext'; 
import * as db from "../database/crud";

export default function App() {
  const [n_cracha, setN_cracha] = useState('');
  const [senha, setSenha] = useState('');
  const { salvarAtendenteLogado } = usePedidoInfo();

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

        await salvarAtendenteLogado(atendenteParaArmazenar);
        console.log('Atendente logado com sucesso:', atendenteParaArmazenar);

        setN_cracha('');
        setSenha('');
        router.push('/novoAtendimento');
      } else {
        Alert.alert('Erro de Login', 'Crachá ou senha incorretos.');
        setSenha(''); // Limpa apenas a senha em caso de erro
      }
    } catch (error: any) {
      console.error('Erro no processo de login:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao tentar fazer login. Por favor, tente novamente.');
      setSenha(''); // Limpa apenas a senha em caso de erro
    }
  }

  return (
    <View style={{flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center'}}>
      <Text style={{fontSize: 24, marginBottom: 20}}>Bem-vindo ao Sistema</Text>
      <Input 
        placeholder="Digite seu crachá" 
        value={n_cracha} 
        onChangeText={setN_cracha}
        keyboardType="numeric"
      />
      <Input 
        placeholder="Digite sua senha" 
        secureTextEntry={true} 
        value={senha} 
        onChangeText={setSenha}
      />
      <Botao onPress={login} texto="Entrar" />
      <TouchableOpacity 
        onPress={() => router.push('/cadastrar')}
        style={{marginTop: 15}}
      >
        <Text style={{color: '#007AFF'}}>Cadastrar-se</Text>
      </TouchableOpacity>
    </View>
  );
}