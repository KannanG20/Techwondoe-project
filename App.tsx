import 'react-native-gesture-handler';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, FlatList, TextInput, TouchableOpacity, Dimensions, StatusBar, Image, Linking } from 'react-native';
import axios from 'axios';
import { useQuery, QueryClient, QueryClientProvider } from 'react-query';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';


const API_URL = 'https://run.mocky.io/v3/0bff210c-7fc8-4964-a555-8d93de3d5f17';

type Connection = {
  picture: any;
  index: any;
  firstname: any;
  surname: any;
  id: number;
  phone: number;
  gender: string;
  company: string;
  age: number;
  email: string;
};

type RootStackParamList = {
  ConnectionList: undefined;
  Profile: { connection: Connection };
};

type ConnectionListScreenNavigationProp = StackNavigationProp<RootStackParamList, 'ConnectionList'>;
type ProfileScreenRouteProp = RouteProp<RootStackParamList, 'Profile'>;

type ConnectionListScreenProps = {
  navigation: ConnectionListScreenNavigationProp;
};

type ProfileScreenProps = {
  route: ProfileScreenRouteProp;
};

const ConnectionListScreen: React.FC<ConnectionListScreenProps> = ({ navigation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState<'a-z' | 'z-a'>('a-z');
  const [hasInternet, setHasInternet] = useState<boolean | null>(null);

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState | undefined) => {
      if (state) {
        setHasInternet(state.isConnected ?? null);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const { data, isLoading } = useQuery('connections', async () => {
    const response = await axios.get(API_URL);
    return response.data as Connection[];
  });

  const filteredConnections = data
    ? data.filter(
        (connection) =>
          connection.firstname.toLowerCase().includes(searchQuery.toLowerCase()) ||
          connection.surname.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const sortedConnections = [...filteredConnections].sort((a, b) => {
    const compareResult =
      a.firstname.localeCompare(b.firstname) || a.surname.localeCompare(b.surname);
    return sortOrder === 'a-z' ? compareResult : -compareResult;
  });

  const handleSortToggle = () => {
    setSortOrder((prevSortOrder) => (prevSortOrder === 'a-z' ? 'z-a' : 'a-z'));
  };

  const renderItem = ({ item }: { item: Connection }) => (
    <TouchableOpacity
      onPress={() =>
        navigation.navigate('Profile', { connection: item })
      }
      style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: 'gray' }}
    >
      <Image
        style={styles.image}
        source={{
          uri: item.picture,
        }}
      />
      <View style={styles.item}>
        <Text>{item.firstname} {item.surname}</Text>
        <Text>{item.email}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {hasInternet ? (
        isLoading ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Loading...</Text>
        </View>
      ) : (
      <><View style={styles.searchBar}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search connections"
              value={searchQuery}
              onChangeText={setSearchQuery} />
            <TouchableOpacity style={styles.sortButton} onPress={handleSortToggle}>
              <Text>Sort: {sortOrder}</Text>
            </TouchableOpacity>
          </View><>
              <FlatList
                data={sortedConnections}
                renderItem={renderItem}
                keyExtractor={(item) => item.index.toString()}
                contentContainerStyle={styles.listContainer} />
            </></>
      )
      ) : (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>Please check your internet connection</Text>
        </View>
      )}
    </View>
  );
};

const Stack = createStackNavigator<RootStackParamList>();

const ProfileScreen: React.FC<ProfileScreenProps> = ({ route }) => {
  const { connection } = route.params;

  const handleEmailPress = () => {
    const emailUrl = `mailto:${connection.email}`;
    Linking.openURL(emailUrl);
  };

  return (
    <View style={styles.container}>
      <View style={{ backgroundColor: 'white', gap: 10, width: Dimensions.get('window').width - 30, height: '50%', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <Image
          style={styles.image2}
          source={{
            uri: connection.picture,
          }}
        />
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>{connection.firstname} {connection.surname}</Text>
        <TouchableOpacity onPress={handleEmailPress}>
          <Text style={{ color: 'blue' }}>{connection.email}</Text>
        </TouchableOpacity>

        <Text>Phone - {connection.phone}</Text>
        <Text>Age - {connection.age}</Text>
        <Text>Company - {connection.company}</Text>
      </View>
    </View>
  );
};

export default function App() {
  const queryClient = new QueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      <NavigationContainer>
        <StatusBar />
        <Stack.Navigator>
          <Stack.Screen name="ConnectionList" component={ConnectionListScreen} options={{ title: 'Your Connections' }}/>
          <Stack.Screen name="Profile" component={ProfileScreen} 
              options={({ route }) => ({ title: `${route.params.connection.firstname} ${route.params.connection.surname}` })}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: Dimensions.get('window').width,
    padding: 3,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative'
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  image: {
    width: 51,
    height: 51,
    resizeMode: 'cover',
    borderRadius: 50
  },
  image2: {
    width: 81,
    height: 81,
    resizeMode: 'cover',
    borderRadius: 50,
    position: 'absolute',
    top: -35
  },
  searchInput: {
    flex: 1,
    height: 40,
    borderWidth: 1,
    borderRadius: 4,
    marginRight: 8,
    paddingHorizontal: 8,
  },
  sortButton: {
    paddingHorizontal: 8,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 4,
    backgroundColor: '#DDDDDD',
  },
  listContainer: {
    flexGrow: 1,
  },
  item: {
    marginBottom: 8,
    padding: 8,
    width: Dimensions.get('window').width,
  },
  profileText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});
