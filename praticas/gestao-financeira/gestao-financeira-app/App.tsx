import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';

import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen           from './src/screens/LoginScreen';
import TransactionListScreen from './src/screens/TransactionListScreen';
import AddTransactionScreen  from './src/screens/AddTransactionScreen';
import SummaryScreen         from './src/screens/SummaryScreen';
import { RootStackParamList, TabParamList } from './src/types';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab   = createBottomTabNavigator<TabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor:   '#5B5FEF',
        tabBarInactiveTintColor: '#b2bec3',
        tabBarStyle: {
          borderTopWidth: 0,
          backgroundColor: '#fff',
          elevation: 12,
          shadowColor: '#5B5FEF',
          shadowOpacity: 0.1,
          shadowRadius: 12,
          shadowOffset: { width: 0, height: -3 },
          height: 64,
          paddingBottom: 10,
          paddingTop: 8,
        },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '700' },
        tabBarIcon: ({ color, size, focused }) => {
          const icons: Record<keyof TabParamList, React.ComponentProps<typeof MaterialIcons>['name']> = {
            'Transações': 'account-balance-wallet',
            'Adicionar':  'add-circle',
            'Resumo':     'pie-chart',
          };
          return (
            <MaterialIcons
              name={icons[route.name]}
              size={focused ? 26 : 22}
              color={color}
            />
          );
        },
      })}
    >
      <Tab.Screen name="Transações" component={TransactionListScreen} />
      <Tab.Screen name="Adicionar"  component={AddTransactionScreen} />
      <Tab.Screen name="Resumo"     component={SummaryScreen} />
    </Tab.Navigator>
  );
}

function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#5B5FEF' }}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {user ? (
          <>
            <Stack.Screen name="MainTabs" component={MainTabs} />
            <Stack.Screen
              name="EditTransaction"
              component={AddTransactionScreen}
              options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
            />
          </>
        ) : (
          <Stack.Screen name="Login" component={LoginScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <RootNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
