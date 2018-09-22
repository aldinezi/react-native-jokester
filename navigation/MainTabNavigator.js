import React from 'react';
import { Platform } from 'react-native';
import { createStackNavigator, createBottomTabNavigator } from 'react-navigation';

import TabBarIcon from '../components/TabBarIcon';
import HomeScreen from '../screens/HomeScreen';
import JokesScreen from '../screens/JokesScreen';

const HomeStack = createStackNavigator({
  Home: HomeScreen,
});

HomeStack.navigationOptions = {
  tabBarLabel: 'Home',
  tabBarIcon: ({ focused }) => (
    <TabBarIcon
      focused={focused}
      name={
        Platform.OS === 'ios'
          ? `ios-information-circle${focused ? '' : '-outline'}`
          : 'md-information-circle'
      }
    />
  ),
};

const JokesStack = createStackNavigator({
  Jokes : JokesScreen,
});

JokesStack.navigationOptions = {
  tabBarLabel: 'Jokes',
  tabBarIcon: ({ focused}) => (
    <TabBarIcon
      focused={focused}
      name={Platform.OS === 'ios' ? `ios-happy${focused ? '' : '-outline'}` : 'md-happy'}
    />
  )
}

export default createBottomTabNavigator({
  HomeStack,
  JokesStack,
});
