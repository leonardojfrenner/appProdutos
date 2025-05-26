// database/crud.ts
import * as SQLite from 'expo-sqlite'; // Pode remover esta linha se não usar SQLite.openDatabaseAsync aqui
import { Alert } from 'react-native';
import { AtendenteData } from '../model/atendenteData';
import { Atendente } from '../model/atendente';
import { PedidoCompleto } from '../context/CarrinhoContext';
import { getDb } from './db'; // Importe o getDb do novo arquivo

// Remova a função Crud() daqui, pois ela foi movida para db.ts (initializeDatabase)
// export async function Crud() { /* ... */ }

export async function insertAtendente(atendente: Atendente) {
  const { nome, n_cracha, senha } = atendente;
  try {
    const db = getDb(); // Use a instância já aberta do DB

    if (!nome || !n_cracha || !senha) { // Verifique a senha também
      Alert.alert('Erro', 'Por favor, preencha todos os campos!');
      return;
    }

    await db.runAsync(`INSERT INTO atendentes (nome, n_cracha, senha) VALUES (?, ?, ?)`, [nome, n_cracha, senha]);
    Alert.alert('Sucesso', 'Usuário cadastrado com sucesso!');
  }
  catch (error: any) { // Capture o erro como 'any' para acessar .message
    console.error('Erro ao salvar o usuário:', error);
    if (error.message && error.message.includes("UNIQUE constraint failed")) {
      Alert.alert('Erro', 'Crachá já cadastrado. Por favor, use outro.');
    } else {
      Alert.alert('Erro', 'Falha ao salvar o usuário. ' + (error.message || 'Tente novamente.'));
    }
  }
}

export async function selectAtendente(n_cracha: string, senha: string): Promise<AtendenteData | null> {
  try {
    const db = getDb(); // Use a instância já aberta do DB
    const resultado: AtendenteData | null = await db.getFirstSync(
      `SELECT * FROM atendentes WHERE n_cracha = ? AND senha = ?`,
      [n_cracha, senha]
    );
    return resultado;
  } catch (error: any) {
    console.error('Erro ao buscar Atendente no DB:', error);
    Alert.alert('Erro na Consulta', `Falha ao verificar credenciais: ${error.message || 'Tente novamente.'}`);
    return null;
  }
}

export async function insertPedido(pedido: PedidoCompleto) {
  try {
    const db = getDb(); // Use a instância já aberta do DB
    await db.runAsync(
      `INSERT INTO pedidos (id, mesa, n_cracha_atendente, nome_atendente, quantidadePessoas, status, valorTotal, dataHoraInicio, dataHoraFim, itens)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        pedido.id,
        pedido.mesa,
        pedido.n_cracha_atendente,
        pedido.nome_atendente,
        pedido.quantidadePessoas,
        pedido.status,
        pedido.valorTotal,
        pedido.dataHora, // dataHora é a dataHoraInicio
        null, // dataHoraFim começa como NULL
        JSON.stringify(pedido.itens), // Armazenar itens como JSON string
      ]
    );
    console.log(`Pedido ${pedido.id} salvo no banco de dados.`);
  } catch (error) {
    console.error('Erro ao salvar pedido no DB:', error);
    Alert.alert('Erro', 'Falha ao salvar o pedido no banco de dados.');
    throw error; // Lançar o erro para o contexto poder capturá-lo
  }
}

export async function updatePedidoStatusAndEndTime(pedidoId: string, newStatus: PedidoCompleto['status'], endTime: string) {
  try {
    const db = getDb(); // Use a instância já aberta do DB
    await db.runAsync(
      `UPDATE pedidos SET status = ?, dataHoraFim = ? WHERE id = ?`,
      [newStatus, endTime, pedidoId]
    );
    console.log(`Pedido ${pedidoId} atualizado para status ${newStatus} e finalizado em ${endTime}.`);
  } catch (error) {
    console.error('Erro ao atualizar status do pedido no DB:', error);
    Alert.alert('Erro', 'Falha ao atualizar o status do pedido.');
    throw error; // Lançar o erro para o contexto poder capturá-lo
  }
}

export async function getPedidosPendentesFromDB(): Promise<PedidoCompleto[]> {
  try {
    const db = getDb(); // Use a instância já aberta do DB
    const resultados = await db.getAllAsync(`SELECT * FROM pedidos WHERE status = 'pendente'`);

    return resultados.map((row: any) => ({
      id: row.id,
      mesa: row.mesa,
      n_cracha_atendente: row.n_cracha_atendente,
      nome_atendente: row.nome_atendente,
      quantidadePessoas: row.quantidadePessoas,
      status: row.status,
      valorTotal: row.valorTotal,
      dataHora: row.dataHoraInicio, // Mapeia dataHoraInicio para dataHora
      dataHoraFim: row.dataHoraFim,
      itens: JSON.parse(row.itens), // Parse o JSON de volta para array de itens
    })) as PedidoCompleto[];
  } catch (error) {
    console.error('Erro ao buscar pedidos pendentes do DB:', error);
    Alert.alert('Erro', 'Falha ao carregar pedidos pendentes.');
    return [];
  }
}