import React from 'react';
import { NavigationContainer, DefaultTheme, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { useThemeStore } from '../stores/themeStore';
import { useAuthStore } from '../stores/authStore';
import { colors } from '../config/theme';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { DashboardScreen } from '../screens/dashboard/DashboardScreen';
import { UsersScreen } from '../screens/iam/UsersScreen';
import { RolesScreen } from '../screens/iam/RolesScreen';
import { CompaniesScreen } from '../screens/tenant/CompaniesScreen';
import { BusinessUnitsScreen } from '../screens/tenant/BusinessUnitsScreen';
import { OutletsScreen } from '../screens/tenant/OutletsScreen';
import { PlansScreen } from '../screens/billing/PlansScreen';
import { SubscriptionsScreen } from '../screens/billing/SubscriptionsScreen';
import { TicketsScreen } from '../screens/support/TicketsScreen';
import { SettingsScreen } from '../screens/settings/SettingsScreen';
import { Loading } from '../components/ui';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const IAMStack = createNativeStackNavigator();
const TenantStack = createNativeStackNavigator();
const BillingStack = createNativeStackNavigator();

// IAM Stack Navigator
function IAMNavigator() {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <IAMStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <IAMStack.Screen name="UsersList" component={UsersScreen} options={{ headerShown: false }} />
      <IAMStack.Screen name="RolesList" component={RolesScreen} options={{ title: 'Roles' }} />
    </IAMStack.Navigator>
  );
}

// Tenant Stack Navigator
function TenantNavigator() {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <TenantStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <TenantStack.Screen name="CompaniesList" component={CompaniesScreen} options={{ headerShown: false }} />
      <TenantStack.Screen name="BusinessUnitsList" component={BusinessUnitsScreen} options={{ title: 'Business Units' }} />
      <TenantStack.Screen name="OutletsList" component={OutletsScreen} options={{ title: 'Outlets' }} />
    </TenantStack.Navigator>
  );
}

// Billing Stack Navigator
function BillingNavigator() {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <BillingStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: theme.surface },
        headerTintColor: theme.text,
        headerShadowVisible: false,
      }}
    >
      <BillingStack.Screen name="SubscriptionsList" component={SubscriptionsScreen} options={{ headerShown: false }} />
      <BillingStack.Screen name="PlansList" component={PlansScreen} options={{ title: 'Plans' }} />
      <BillingStack.Screen name="TicketsList" component={TicketsScreen} options={{ title: 'Tickets' }} />
    </BillingStack.Navigator>
  );
}

// Bottom Tab Navigator
function MainTabs() {
  const { isDark } = useThemeStore();
  const theme = isDark ? colors.dark : colors.light;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'home';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Users') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Tenants') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Billing') {
            iconName = focused ? 'card' : 'card-outline';
          } else if (route.name === 'More') {
            iconName = focused ? 'menu' : 'menu-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textSecondary,
        tabBarStyle: {
          backgroundColor: theme.surface,
          borderTopColor: theme.divider,
          paddingBottom: 4,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerShown: false,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name="Users" component={IAMNavigator} options={{ tabBarLabel: 'Users' }} />
      <Tab.Screen name="Tenants" component={TenantNavigator} options={{ tabBarLabel: 'Tenants' }} />
      <Tab.Screen name="Billing" component={BillingNavigator} options={{ tabBarLabel: 'Billing' }} />
      <Tab.Screen name="More" component={SettingsScreen} options={{ tabBarLabel: 'More' }} />
    </Tab.Navigator>
  );
}

// Auth Stack
function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}

// Root Navigator
export function RootNavigator() {
  const { isDark } = useThemeStore();
  const { isAuthenticated, isLoading } = useAuthStore();

  const navigationTheme = isDark
    ? {
        ...DarkTheme,
        colors: {
          ...DarkTheme.colors,
          primary: colors.dark.primary,
          background: colors.dark.background,
          card: colors.dark.surface,
          text: colors.dark.text,
          border: colors.dark.border,
        },
      }
    : {
        ...DefaultTheme,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.light.primary,
          background: colors.light.background,
          card: colors.light.surface,
          text: colors.light.text,
          border: colors.light.border,
        },
      };

  if (isLoading) {
    return <Loading fullScreen message="Memuat..." />;
  }

  return (
    <NavigationContainer theme={navigationTheme}>
      {isAuthenticated ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
}
