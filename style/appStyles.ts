import { StyleSheet, Dimensions } from 'react-native';

const { width } = Dimensions.get('window');
const cardWidth = width * 0.45; // Aproximadamente metade da largura da tela (com espaço para margem)
const cardWidthHorizontal = width * 0.35; // Um pouco menor para a lista horizontal

const appStyles = StyleSheet.create({
  // Containers
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f3f4f6",
  },
  formaContainer: {
    width: cardWidth,
    height: 240,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    margin: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  formaContainerHorizontal: {
    width: cardWidthHorizontal,
    height: 220,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    margin: 6,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  gridContainer1: {
    paddingHorizontal: 4,
    paddingBottom: 16,
  },
  gridContainer2: {
    paddingLeft: 10,
    paddingRight: 10,
    paddingBottom: 16,
  },
  sectionContainer: {
    marginBottom: 16,
  },
 

  // Elementos visuais
  forma: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 8,
    backgroundColor: "#eee",
  },
  touchableContainer: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },

  // Textos
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 12,
    marginLeft:28,
    marginTop:13,
    color: '#333',
    paddingHorizontal: 10,
  },
  subTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
    paddingHorizontal: 10,
    marginTop: 16,
  },
  textoCard: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
    fontWeight: 'bold',
    marginBottom: 6,
    paddingHorizontal: 5,
    width: '100%',
  },
  ingredientesText: {
    fontSize: 12,
    textAlign: "center",
    color: "#666",
    marginBottom: 6,
    height: 40,
    overflow: 'visible',
    paddingHorizontal: 5,
    flexWrap: 'wrap',
  },
  precoText: {
    fontSize: 16,
    textAlign: "center",
    color: "#8C030E",
    fontWeight: 'bold',
    marginTop: 4,
  },
  emojiText: {
    fontSize: 16,
    color: "#fff",
  },

  // Cards
  card: {
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    alignItems: 'center',
  },
  cardHorizontal: {
    width: cardWidthHorizontal,
    marginVertical: 8,
  },

  // Botões
  buttonGroup: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  selectedButton: {
    backgroundColor: '#8C030E',
  },
  unselectedButton: {
    backgroundColor: '#f3f4f6',
  },
  botao: {
    alignSelf: "center",
    height: 50,
    width: 200,
    backgroundColor: "#8C030E", 
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },
  textoBotao: {
    color: "white",
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default appStyles; 