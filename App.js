import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import FontAwesome from 'react-native-vector-icons/FontAwesome'


const Stack = createNativeStackNavigator();
//const safeArea = useSafeAreaInsets();

const DATA = [
  {
    id: '1',
    title: 'First Todo',
  },
  {
    id: '2',
    title: 'Second Todo',
  },
  {
    id: '3',
    title: 'Third Todo',
  },
];

// React.memo... less jumpy/flickering when scrolling?
const TodoItem = React.memo(({title, descriptionText, navigation, isDone, toggleDone, id}) => {

  const dynamicItemStyle = {
    backgroundColor: isDone ? "green" : "black",
  }

  return (
  <View style={[styles.item, {backgroundColor: isDone ? "green" : "black"}]}>
    <View>
      <Text style={{fontSize: 24, color: "white"}}>{title}</Text>
      {/* <Text style={{fontSize: 20}}>{descriptionText}</Text> */}
    </View>
    
    <TouchableOpacity onPress={() => {
      navigation.navigate("Details", { title: title, descriptionText: descriptionText, isDone: isDone, id: id})
      }}><FontAwesome name="chevron-right" size={30} color="white" /></TouchableOpacity>
  </View>)}
);

function HomeScreen({ navigation, route }) {

  const [todos, setTodos] = useState([{id: 1, title: "First Todo", descriptionText: "Order flight to Zimbabwe", isDone: false}, {id: 2, title: "Second Todo", descriptionText: "Shop groceries", isDone: true}, {id: 3, title: "Third Todo", descriptionText: "Clean the bathroom", isDone: false}]);

  //const [todos, setTodos] = useState([]);

  useEffect(() => {
    if (route.params?.newTodoTitle && route.params?.newTodoDescriptionText) {
        const newId = todos.length + 1; // simple ID generationaa
        setTodos([...todos, {id: newId, title: route.params.newTodoTitle, descriptionText: route.params.newTodoDescriptionText 

        }])
      }

  }, [route.params?.newTodoTitle]); // Re-run when newTodo changes

  // better to use Context for these type of updates:
  /* function toggleDone(id) {
  const newTodos = todos.map(todo => {
    if (todo.id === id) {
      return {...todo, isDone: !todo.isDone}; // toggle the done status
    }
    return todo;
  });
  setTodos(newTodos);
  }  */

  useEffect(() => {

    if (route.params?.updatedTodo) {

      const { id, isDone } = route.params.updatedTodo;

      const newTodos = todos.map(todo => {
        if (todo.id === id) {
          return {...todo, isDone: isDone}; // toggle the done status
        }
        return todo;
      });
      setTodos(newTodos);
    }


  }, [route.params?.updatedTodo])

  return (
    <SafeAreaView style={styles.container}>
      {/* <FlatList data={DATA} renderItem={({item}) => <Item title={item.title}/>} keyExtractor={item => item.id}/> */}
      <FlatList style={{}} data={todos} renderItem={({item}) => <TodoItem title={item.title} descriptionText={item.descriptionText} navigation={navigation} isDone={item.isDone} id={item.id}/>} keyExtractor={item => item.id.toString()} />
    </SafeAreaView>
  );
}

function DetailsScreen({route, navigation}) {

  const { title, descriptionText, isDone, id} = route.params; //toggleDone

  const [newDoneStatus, setNewDoneStatus] = useState(isDone)

  // doesnt work well, need Context for this type of updates apparently:
  /* useEffect(() => {
    navigation.setParams({ newDoneStatus: { isDone: newDoneStatus, id: id}}); // will be sent when clicking the 'Done' button defined in AddToDoModal's Stack.Screen 
  }, [newDoneStatus]); */

  function toggleDone() {
    // Navigate back and pass the updated status
    navigation.navigate('Home', { updatedTodo: { id, isDone: !isDone }});
  }


  return (
    <SafeAreaView style={[styles.container, {paddingTop: 60, alignItems: "center", gap: 60}]}>
    {/* <Text style={{fontSize: 24, fontWeight: "bold", textAlign: "center"}}>{title} description</Text> */}
    
    <Text style={{fontSize: 20}}>{descriptionText}</Text>
    <TouchableOpacity style={{borderStyle: "solid", borderColor: "black", borderWidth: 2, paddingHorizontal: 30, paddingVertical: 15}}><Text  style={{fontSize: 30, fontWeight: "bold"}} onPress={() => {
      //setNewDoneStatus(!newDoneStatus)
      toggleDone();
    }} 
    // toggleDone will automatically find item.id, see the function
    >DONE</Text></TouchableOpacity>
  </SafeAreaView>
  );
}

function AddTodoModalScreen({navigation, onDone}) {
  const [descriptionText, setDescriptionText] = useState("");
  const [title, setTitle] = useState("");

  useEffect(() => {
    navigation.setParams({ newTodoDescriptionText: descriptionText, newTodoTitle: title }); // will be sent when clicking the 'Done' button defined in AddToDoModal's Stack.Screen 
  }, [title, descriptionText, navigation]);

  return (
    <SafeAreaView style={[styles.container, {gap: 16}]}>
      
      <TextInput style={{borderStyle: "solid", borderWidth: 2, padding: 10, fontSize: 20}} placeholder="Todo Title..."  value={title}
        onChangeText={setTitle} />


      <TextInput
        multiline
        placeholder="Description"
        style={{ fontSize: 20, height: 200, padding: 10, backgroundColor: 'white', borderStyle: "solid", borderWidth: 2, textAlign:"left", textAlignVertical: "top"}}
        value={descriptionText}
        onChangeText={setDescriptionText} 
      />

    
  </SafeAreaView>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Group>
          <Stack.Screen
            options={({navigation}) => ({
              headerRight: () => ( 
                <Button
                title="Add"
                onPress={() => navigation.navigate("AddTodoModal")}
              />
              ),
              title: 'Todos',
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 30,
              },
            })}
            name="Home"
            component={HomeScreen}
          />
          <Stack.Screen name="Details" component={DetailsScreen} options={({route}) => ({
            title: route.params.title,
            headerTitleAlign: "center",
            headerTitleStyle: {
              fontWeight: 'bold',
              fontSize: 30,
            }
          })}/>
        </Stack.Group>
        <Stack.Group screenOptions={{presentation: "modal"}}>
          <Stack.Screen name="AddTodoModal" component={AddTodoModalScreen} options={({navigation, route}) => ({
              headerRight: () => ( 
                <Button
                title="Done"
                onPress={() => {
                  if (route.params?.newTodoTitle && route.params?.newTodoDescriptionText) {
                    navigation.navigate('Home', { newTodoDescriptionText: route.params.newTodoDescriptionText, newTodoTitle: route.params.newTodoTitle });
                  }
                  //navigation.goBack();
                }}
              />
              ),
              title: 'New Todo',
              headerTitleAlign: "center",
              headerTitleStyle: {
                fontWeight: 'bold',
                fontSize: 30,
              },
            })}/>
        </Stack.Group>
      </Stack.Navigator>
    </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "start",
    justifyContent: "start",
    padding: 16,
    fontSize: 20,
  },
  item: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: '#f9c2ff',
    padding: 20,
   // marginVertical: 8,
    marginBottom: 16, // TODO: change to flex gap somehow?
  },
});
