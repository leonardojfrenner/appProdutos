import { View, Text, Alert } from "react-native";
import { useState } from "react";
import { Atendente } from "../model/atendente";
import { Input } from "../comp/input";
import Botao from "../comp/botao";
import { router } from "expo-router";
import { styles } from "../style/styles";
import * as db from "../database/crud";

export default function Cadastrar() {
    const [nome, setNome] = useState("");
    const [n_cracha, setN_cracha ] = useState("");
    const [senha, setSenha] = useState("");

    const cadastrar = () => {
        if (!nome || !n_cracha || !senha) {
            Alert.alert("Erro", "Todos os campos são obrigatórios.");
            return;
        }
        const atendente = new Atendente(nome, n_cracha, senha);
        db.insertAtendente(atendente)
        setNome("");
        setN_cracha("");
        setSenha("");
        Alert.alert("Sucesso", "Atendente cadastrado com sucesso!");
        router.push("/(tabs)");
    };

    return (
        <View style={styles.container}>
            <Text style={styles.headerText}>Cadastrar</Text>
            <Input
                placeholder="Digite seu nome"
                value={nome}
                onChangeText={setNome}
            />
                <Input
                    placeholder="Digite seu cracha"
                    value={n_cracha}
                    onChangeText={setN_cracha}
                />
                <Input
                placeholder="Digite sua senha"
                secureTextEntry={true}
                value={senha}
                onChangeText={setSenha}
            />
            <Botao texto="Cadastrar" onPress={cadastrar} />
        </View>
    );
}