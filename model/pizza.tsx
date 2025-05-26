export interface Pizza {
    id: number;
    nome: string;
    preco: string; // vem como string por ser DecimalField
    ingredientes: string;
    imagem: string; // caminho da imagem, ex: /media/pizzas/portuguesa.jpg
    tipo: 'pizza'; // Tipo do item, sempre 'pizza'
    // Novos opcionais para pizza
    bordaRecheada?: 'Catupiry' | 'Doce de Leite' | null; // null se não houver borda
}