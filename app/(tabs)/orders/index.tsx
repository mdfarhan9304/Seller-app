import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, RefreshControl, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, TextInput, View } from 'react-native';
import OrderCard from '../../../components/OrderCard';
import OrderSummaryCard from '../../../components/OrderSummaryCard';
import { Order, orderAPI } from '../../../services/api';
import { FULLFILMENT_TYPE } from './[status]';

const OrdersScreen = () => {
  const router = useRouter();
  const [orderSummary, setOrderSummary] = useState([
    { label: 'New Orders', count: 0, iconName: 'cart-outline', route: '/orders/new-orders', status: 'new-orders' },
    { label: 'To be dispatched', count: 0, iconName: 'package-variant-closed', route: '/orders/to-be-dispatched', status: 'to-be-dispatched' },
    { label: 'In Transit', count: 0, iconName: 'swap-horizontal', route: '/orders/in-transit', status: 'in-transit' },
    { label: 'Delivered', count: 0, iconName: 'check-circle-outline', route: '/orders/delivered', status: 'delivered' },
  ]);
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [allOrders, setAllOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      // Fetch all order counts in parallel
      const [newOrders, dispatchedOrders, readyToShipOrders, deliveredOrders] = await Promise.all([
        orderAPI.getOrdersByStatus('new').catch(() => ({ orders: [] })),
        orderAPI.getOrdersByStatus('dispatched').catch(() => ({ orders: [] })),
        orderAPI.getOrdersByStatus('ready-to-ship').catch(() => ({ orders: [] })),
        orderAPI.getOrdersByStatus('delivered').catch(() => ({ orders: [] })),
      ]);

      const toBeDispatchedCount = readyToShipOrders.orders.length;

      setOrderSummary([
        { label: 'New Orders', count: newOrders.orders.length, iconName: 'cart-outline', route: '/orders/new-orders', status: 'new-orders' },
        { label: 'To be dispatched', count: toBeDispatchedCount, iconName: 'package-variant-closed', route: '/orders/to-be-dispatched', status: 'to-be-dispatched' },
        { label: 'In Transit', count: dispatchedOrders.orders.length, iconName: 'swap-horizontal', route: '/orders/in-transit', status: 'in-transit' },
        { label: 'Delivered', count: deliveredOrders.orders.length, iconName: 'check-circle-outline', route: '/orders/delivered', status: 'delivered' },
      ]);

      // Get status label for display
      const getStatusLabel = (status: string) => {
        if (status === 'CONFIRMED') return 'New';
        if (status === 'READY_TO_SHIP') return 'To be dispatched';
        if (status === 'IN_TRANSIT' || status === 'dispatched') return 'In Transit';
        if (status === 'DELIVERED') return 'Delivered';
        return status;
      };

      // Combine all orders from different statuses
      const allRecent = [
        ...newOrders.orders.map((o: Order) => ({ ...o, displayStatus: getStatusLabel(o.status) })),
        ...readyToShipOrders.orders.map((o: Order) => ({ ...o, displayStatus: getStatusLabel(o.status) })),
      ]
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      const getCustomerName = (order: any) =>
        order.customer?.fullName ||
        order.customer?.name ||
        order.customerName ||
        order.fullName ||
        order.deliveryAddress?.fullName ||
        order.deliveryAddress?.name ||
        'Customer';

      const transformedRecent = allRecent.map((order: any) => ({
        id: order._id,
        customerName: getCustomerName(order),
        date: new Date(order.createdAt).toLocaleString('en-US', {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        status: order.displayStatus,
        fulfillmentType: FULLFILMENT_TYPE[order.deliveryMode as keyof typeof FULLFILMENT_TYPE],
        orderId: order._id, // For search by order ID
      }));

      setAllOrders(transformedRecent);
      setRecentOrders(transformedRecent);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  };

  const handleOrderPress = (orderId: string) => {
    const selectedOrder = allOrders.find(o => o.id === orderId);
    const status = selectedOrder?.status || 'New';
    const customerName = selectedOrder?.customerName || '';
    router.push({
      pathname: '/(tabs)/orders/order-detail',
      params: { orderId, status, customerName }
    });
  };

  // Filter orders based on search query
  const filteredOrders = React.useMemo(() => {
    if (!searchQuery.trim()) {
      return recentOrders;
    }
    
    const query = searchQuery.toLowerCase().trim();
    return allOrders.filter((order) => {
      const customerName = order.customerName?.toLowerCase() || '';
      const orderId = order.id?.toLowerCase() || '';
      const formattedOrderId = orderId.startsWith('ord-') ? orderId : `ord-${orderId.slice(-6)}`;
      
      return (
        customerName.includes(query) ||
        orderId.includes(query) ||
        formattedOrderId.includes(query)
      );
    });
  }, [searchQuery, allOrders, recentOrders]);

  if (loading && !refreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#8D14CE" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#F8F8F8" />
      </SafeAreaView>
      
      <ScrollView 
        style={styles.scrollView} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={["#8D14CE"]}
            tintColor="#8D14CE"
          />
        }
      >
        {/* Order Summary Card with Linear Gradient */}
        <View style={styles.summaryCardContainer}>
          <LinearGradient 
            colors={['#8D14CE', '#470A68']} 
            style={styles.summaryContainer}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          >
            <Text style={styles.summaryTitle}>Order Summary</Text>
            
            <View style={styles.summaryGrid}>
              {orderSummary.map((item, index) => (
                <OrderSummaryCard
                  key={index}
                  label={item.label}
                  count={item.count}
                  iconName={item.iconName}
                  route={item.route}
                />
              ))}
            </View>
          </LinearGradient>
        </View>
        
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="#999" style={styles.searchIcon} />
          <TextInput 
            style={styles.searchInput}
            placeholder="Search by name, order number"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
        
        {/* Recents Section */}
        <View style={styles.recentsContainer}>
          <Text style={styles.recentsTitle}>
            {searchQuery ? `Search Results (${filteredOrders.length})` : 'Recents'}
          </Text>
          
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <OrderCard
                key={order.id}
                id={order.id}
                customerName={order.customerName}
                date={order.date}
                status={order.status}
                fulfillmentType={order.fulfillmentType}
                onPress={handleOrderPress}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={48} color="rgba(0, 0, 0, 0.3)" />
              <Text style={styles.emptyText}>
                {searchQuery ? 'No orders found' : 'No recent orders'}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  safeArea: {
    paddingTop: StatusBar.currentHeight || 40,
    backgroundColor: '#F5F5F5',
  },
  scrollView: {
    flex: 1,
  },
  summaryCardContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
  },
  summaryContainer: {
    borderRadius: 16,
    padding: 20,
  },
  summaryTitle: {
    color: 'white',
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 20,
    fontFamily: "General-Sans-Semibold",
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  searchContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    backgroundColor: 'white',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    height: 46,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    height: 46,
    fontSize: 15,
    color: '#333',
  },
  recentsContainer: {
    marginTop: 24,
    marginHorizontal: 20,
    paddingBottom: 128, // Add padding for the new tab bar height
  },
  recentsTitle: {
    fontSize: 17,
    fontWeight: '500',
    color: '#666',
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: 'rgba(0, 0, 0, 0.7)',
    marginTop: 20,
  },
  syncButton: {
    position: 'absolute',
    bottom: 120,
    right: 20,
    backgroundColor: '#8D14CE',
    padding: 10,
    borderRadius: 10,
  },
  syncButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default OrdersScreen; 