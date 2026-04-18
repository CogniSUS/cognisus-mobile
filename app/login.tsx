import { Dimensions, Image, StyleSheet, Text, TextInput, View } from "react-native";
import Logo from '../assets/images/file.jpg';

export default function Login(){
    return(
        <View style={style.container}>
            <View style={style.boxTop}>
                <Image
                    source = {Logo}
                    style={style.image}
                />
            </View>
            <View style={style.boxMid}>
                <Text style = {style.texto}>E-mail ou usuário</Text>
                <TextInput/>
                <Text style = {style.texto}>sua senha</Text>
                <TextInput/>
            </View>
        </View>
    )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#c1b6ff",
    justifyContent: "center",
    padding: 24,
  },
  boxTop: {
    height:Dimensions.get('window').height/3,
    width:'100%',
    marginTop: -100,
    alignItems:"center"
  },
  boxMid: {
    height:Dimensions.get('window').height/3,
    width:'100%',
    marginTop: -100,
    backgroundColor:"#e3deff",

  },

  image: {
    width: 150,
    height: 150,
    borderRadius: 75, // metade de 150
  },
  texto: {
    fontSize: 16,
    color: "#64748B",
    textAlign: "center",
    marginTop: 12,
    marginBottom: 32,
  }
});