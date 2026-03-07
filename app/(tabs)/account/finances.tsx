import { useAuth } from "@/contexts/AuthContext";
import { financeAPI, Transaction } from "@/services/api";
import { Ionicons } from "@expo/vector-icons";
import React, { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function FinancesScreen() {
  const [balance, setBalance] = useState({balance: 0, pendingAmount:0});
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  //   const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { authState } = useAuth();

  const fetchBalance = async () => {
    try {
      const res = await financeAPI.getWalletBalance(authState.subdomain!);
      if(res) {
        setBalance({balance: res.balance, pendingAmount: res.pendingAmount});
      }
      
    } catch (error) {
      console.error("Error fetching balance:", error);
    }
  };

  const fetchTransactions = async (
    page: number = 1,
    isRefresh: boolean = false
  ) => {
    try {
      if (page === 1) {
        setLoading(true);
      } else {
        setLoadingMore(true);
      }

      const res = await financeAPI.getPaymentHistory(page, 20, authState.subdomain!);

      if (isRefresh || page === 1) {
        setTransactions(res.transactions || []);
      } else {
        setTransactions((prev) => [...prev, ...(res.transactions || [])]);
      }

      setHasMore(page < res.totalPages);
      setCurrentPage(page);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      //   setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    fetchTransactions(1);
  }, []);

  const onRefresh = useCallback(() => {
    // setRefreshing(true);
    fetchBalance();
    fetchTransactions(1, true);
  }, []);

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchTransactions(currentPage + 1);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return `Today, ${date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else if (date.toDateString() === yesterday.toDateString()) {
      return `Yesterday, ${date.toLocaleTimeString("en-IN", {
        hour: "2-digit",
        minute: "2-digit",
      })}`;
    } else {
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  const renderTransaction = ({ item }: { item: Transaction }) => {
    const isCredit = item.type === "credit";
    const statusColor =
      item.status === "COMPLETED"
        ? "#10B981"
        : item.status === "PENDING"
        ? "#F59E0B"
        : "#EF4444";

    return (
      <View style={styles.transactionCard}>
        <View
          style={[
            styles.transactionIconContainer,
            {
              backgroundColor: isCredit
                ? "rgba(16, 185, 129, 0.1)"
                : "rgba(239, 68, 68, 0.1)",
            },
          ]}
        >
          <Ionicons
            name={isCredit ? "arrow-down" : "arrow-up"}
            size={20}
            color={isCredit ? "#10B981" : "#EF4444"}
          />
        </View>

        <View style={styles.transactionDetails}>
          <Text style={styles.transactionDescription} numberOfLines={1}>
            {item.description}
          </Text>
          <View style={styles.transactionMetaRow}>
            <Text style={styles.transactionDate}>{formatDate(item.date)}</Text>
            {/* {item.status !== "COMPLETED" && (
              <>
                <View style={styles.statusDot} />
                <Text
                  style={[styles.transactionStatus, { color: statusColor }]}
                >
                  {item.status}
                </Text>
              </>
            )} */}
          </View>
        </View>

        <Text
          style={[
            styles.transactionAmount,
            { color: isCredit ? "#10B981" : "#EF4444" },
          ]}
        >
          {isCredit ? "+" : "-"}₹{Math.abs(item.amount)}
        </Text>
      </View>
    );
  };

  const ListHeader = () => (
    <>
      {/* Balance Card */}
      <View style={styles.balanceCardContainer}>
        <Image
          source={{
            uri: "https://res.cloudinary.com/unicapp/image/upload/v1763224673/Coins_Wallet_1_1_dnmfo2.png",
          }}
          style={styles.balanceCardImage}
        />
        <View style={styles.balanceCard}>
          <View style={styles.balanceHeader}>
            {/* <View style={styles.walletIconContainer}>
              <Ionicons name="wallet" size={24} color="white" />
            </View> */}
            <View>
              <Text style={styles.balanceLabelSubtitle}>
                Pending Amount: ₹{balance?.pendingAmount}
              </Text>
              <Text style={styles.balanceLabel}>Available Balance</Text>
            </View>

            <Text style={styles.balanceAmount}>₹{balance?.balance}</Text>
          </View>

          <View style={styles.balanceActions}>
            {/* <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text style={styles.actionButtonText}>Add Money</Text>
          </TouchableOpacity> */}

            <TouchableOpacity
              onPress={async () => {
                const result = await Linking.openURL(
                  `https://wa.me/917834899932/?text=Hello, I want to withdraw my balance of ₹${balance.toFixed(
                    2
                  )}`
                );
                Alert.alert("We will reply to your whatsapp message soon.");
              }}
              style={styles.actionButton}
            >
              <Ionicons
                name="swap-horizontal-outline"
                size={20}
                color="white"
              />
              <Text style={styles.actionButtonText}>Withdraw</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Transaction History Header */}
      <View style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Transaction History</Text>
        {/* <TouchableOpacity>
          <Ionicons name="filter-outline" size={22} color="#8D14CE" />
        </TouchableOpacity> */}
      </View>
    </>
  );

  const ListEmpty = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="receipt-outline" size={48} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No Transactions Yet</Text>
      <Text style={styles.emptySubtitle}>
        Your payment history will appear here once you start receiving payments
      </Text>
    </View>
  );

  const ListFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#8D14CE" />
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
        <Text style={styles.headerTitle}>My Wallet</Text>
        <View style={styles.loaderContainer}>
          <ActivityIndicator size="large" color="#8D14CE" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F5F5" />
      <Text style={styles.headerTitle}>My Wallet</Text>

      <FlatList
        data={transactions}
        renderItem={renderTransaction}
        keyExtractor={(item) => item._id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={ListEmpty}
        ListFooterComponent={ListFooter}
        contentContainerStyle={styles.listContent}
        // refreshControl={
        //   <RefreshControl
        //     refreshing={refreshing}
        //     onRefresh={onRefresh}
        //     colors={["#8D14CE"]}
        //     tintColor="#8D14CE"
        //   />
        // }
        // onEndReached={loadMore}
        // onEndReachedThreshold={0.5}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
    padding: 16,
  },
  safeArea: {
    paddingTop: StatusBar.currentHeight || 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
    backgroundColor: "#F5F5F5",
  },
  headerTitle: {
    fontFamily: "General-Sans-Medium",
    fontSize: 36,
    color: "#000",
    fontWeight: "700",
    marginTop: 60,
    marginBottom: 20,
  },
  loaderContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  listContent: {
    paddingBottom: 148,
  },
  balanceCardContainer: {
    backgroundColor: "#470A68",
    borderRadius: 16,
    paddingTop: 48,
    marginBottom: 48,
    shadowColor: "#555",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
    marginHorizontal: 2,
    top: 16,
  },
  balanceCard: {
    padding: 16,
    backgroundColor: "white",
    borderRadius: 16,
  },
  balanceCardImage: {
    width: 100,
    aspectRatio: 1,
    position: "absolute",
    top: -24,
    left: 24,
    objectFit: "contain",
    // zIndex: 1
  },
  balanceHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 12,
    marginTop: 12,
  },
  walletIconContainer: {
    marginRight: 8,
  },
  balanceLabel: {
    fontFamily: "General-Sans-Bold",
    fontSize: 20,
    color: "rgba(0, 0, 0, 0.75)",
    marginTop: 4,
    fontWeight: "700",
  },
  balanceLabelSubtitle: {
    fontFamily: "General-Sans-Regular",
    fontSize: 12,
    color: "rgba(0, 0, 0, 0.5)",
    fontWeight: "400",
  },
  balanceAmount: {
    fontFamily: "General-Sans-Bold",
    fontSize: 28,
    fontWeight: "700",
    // marginBottom: 20,
  },
  balanceActions: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(71, 10, 104, 0.8)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginTop: 16,
    gap: 8,
  },
  actionButtonText: {
    fontFamily: "General-Sans-Medium",
    fontSize: 14,
    color: "white",
    fontWeight: "600",
  },
  historyHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  historyTitle: {
    fontFamily: "General-Sans-Medium",
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
  },
  transactionCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  transactionIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontFamily: "General-Sans-Medium",
    fontSize: 15,
    color: "#000",
    marginBottom: 4,
  },
  transactionMetaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionDate: {
    fontFamily: "General-Sans-Regular",
    fontSize: 13,
    color: "rgba(0, 0, 0, 0.5)",
  },
  statusDot: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    marginHorizontal: 6,
  },
  transactionStatus: {
    fontFamily: "General-Sans-Medium",
    fontSize: 12,
    textTransform: "capitalize",
  },
  transactionAmount: {
    fontFamily: "General-Sans-Bold",
    fontSize: 16,
    fontWeight: "700",
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: {
    fontFamily: "General-Sans-Medium",
    fontSize: 18,
    color: "#000",
    fontWeight: "600",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontFamily: "General-Sans-Regular",
    fontSize: 14,
    color: "rgba(0, 0, 0, 0.5)",
    textAlign: "center",
    paddingHorizontal: 40,
    lineHeight: 20,
  },
  footerLoader: {
    paddingVertical: 20,
    alignItems: "center",
  },
});
