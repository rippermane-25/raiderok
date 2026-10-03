import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  AsyncStorage,
  FlatList,
  Modal,
  Dimensions,
} from 'react-native';
import axios from 'axios';

// ⚠️ ИЗМЕНИ ЭТО НА IP ТВОЕГО КОМПЬЮТЕРА если запускаешь локально
// Если backend на этом же ПК: используй http://10.0.2.2:3000 для Android эмулятора
// Или получи IP: ipconfig (Windows) / ifconfig (Linux/Mac)
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  safeArea: {
    flex: 1,
  },
  header: {
    backgroundColor: '#FF6B00',
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 15,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#ffb366',
    marginTop: 5,
  },
  card: {
    backgroundColor: '#fff',
    margin: 10,
    borderRadius: 8,
    padding: 15,
    elevation: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 12,
    marginVertical: 8,
    fontSize: 14,
    backgroundColor: '#fafafa',
  },
  button: {
    backgroundColor: '#FF6B00',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 6,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    backgroundColor: '#e8e8e8',
  },
  buttonSecondaryText: {
    color: '#333',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: 5,
  },
  tabBarItem: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBarItemActive: {
    borderTopWidth: 3,
    borderTopColor: '#FF6B00',
  },
  tabBarLabel: {
    fontSize: 11,
    marginTop: 2,
  },
  orderItem: {
    backgroundColor: '#fff',
    margin: 8,
    padding: 12,
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#FF6B00',
  },
  badge: {
    backgroundColor: '#FF6B00',
    color: '#fff',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 3,
    fontSize: 10,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  error: {
    backgroundColor: '#fee',
    borderLeftColor: '#f55',
    borderLeftWidth: 4,
    padding: 10,
    borderRadius: 4,
    marginVertical: 5,
  },
  errorText: {
    color: '#c00',
    fontSize: 13,
  },
  success: {
    backgroundColor: '#efe',
    borderLeftColor: '#5f5',
    borderLeftWidth: 4,
    padding: 10,
    borderRadius: 4,
    marginVertical: 5,
  },
  successText: {
    color: '#050',
    fontSize: 13,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 5,
  },
  label: {
    fontSize: 12,
    color: '#666',
    fontWeight: '600',
  },
  value: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  price: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B00',
  },
});

const LoginScreen = ({ onLoginSuccess }) => {
  const [phone, setPhone] = useState('+380938926388');
  const [otpCode, setOtpCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('phone');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!phone || phone.length < 10) {
      setError('Введите правильный номер телефона');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register', { phone: phone.startsWith('+') ? phone : '+' + phone });
      setStep('otp');
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка регистрации. Проверь API_URL в App.js');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otpCode || otpCode.length !== 6) {
      setError('Введите правильный код из 6 цифр');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/verify-otp', {
        phone: phone.startsWith('+') ? phone : '+' + phone,
        code: otpCode,
      });
      await AsyncStorage.setItem('access_token', response.data.access_token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Неверный код. Смотри консоль backend');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚀 RaiderOk</Text>
        <Text style={styles.headerSubtitle}>Доставка по Одессе и Киеву</Text>
      </View>

      <ScrollView style={{ flex: 1, padding: 20 }}>
        {error ? (
          <View style={styles.error}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {step === 'phone' ? (
          <View style={styles.card}>
            <Text style={{ fontSize: 16, marginBottom: 15, fontWeight: '600' }}>Вход по номеру</Text>
            <TextInput
              style={styles.input}
              placeholder="+380938926388"
              keyboardType="phone-pad"
              value={phone}
              onChangeText={setPhone}
              editable={!loading}
            />
            <Text style={{ fontSize: 12, color: '#999', marginVertical: 5 }}>
              Код будет выведен в консоль backend
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Получить код</Text>}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={{ fontSize: 16, marginBottom: 15, fontWeight: '600' }}>Введите код из консоли</Text>
            <TextInput
              style={styles.input}
              placeholder="000000"
              keyboardType="number-pad"
              maxLength={6}
              value={otpCode}
              onChangeText={setOtpCode}
              editable={!loading}
            />
            <Text style={{ fontSize: 12, color: '#999', marginVertical: 10 }}>
              Номер: {phone}
            </Text>
            <TouchableOpacity style={styles.button} onPress={handleVerifyOtp} disabled={loading}>
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Войти</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setStep('phone')}>
              <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Назад</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const OrderListScreen = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const endpoint = user.roles?.some((r) => r.name === 'customer') ? '/orders/customer/my-orders' : '/orders';
      const response = await api.get(endpoint);
      setOrders(response.data || []);
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось загрузить заказы: ' + err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📋 Заказы</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.orderItem}>
            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.label]}>От: {item.pickupAddress}</Text>
                <Text style={[styles.label, { marginTop: 5 }]}>До: {item.deliveryAddress}</Text>
              </View>
              <Text style={[styles.badge, { height: 24 }]}>{item.status}</Text>
            </View>
            <View style={[styles.row, { marginTop: 10 }]}>
              <Text style={styles.price}>{item.customerPrice} ₴</Text>
              <Text style={{ color: '#666', fontSize: 12 }}>#{item.id.substr(0, 8)}</Text>
            </View>
          </View>
        )}
        onRefresh={loadOrders}
        refreshing={refreshing}
        ListEmptyComponent={
          <View style={[styles.container, styles.loadingContainer]}>
            <Text style={{ color: '#999', fontSize: 14 }}>Нет заказов</Text>
          </View>
        }
      />
    </View>
  );
};

const CreateOrderScreen = ({ user }) => {
  const [formData, setFormData] = useState({
    pickupAddress: '',
    deliveryAddress: '',
    recipientName: '',
    recipientPhone: '',
    description: '',
    customerPrice: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const handleCreateOrder = async () => {
    if (!formData.pickupAddress || !formData.deliveryAddress || !formData.recipientName || !formData.customerPrice) {
      setError('Заполните все поля');
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await api.post('/orders', {
        ...formData,
        customerPrice: parseFloat(formData.customerPrice),
      });
      setSuccess('Заказ создан успешно!');
      setFormData({ pickupAddress: '', deliveryAddress: '', recipientName: '', recipientPhone: '', description: '', customerPrice: '' });
    } catch (err) {
      setError(err.response?.data?.message || 'Ошибка создания заказа');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>➕ Новый заказ</Text>
      </View>
      <ScrollView style={{ flex: 1, padding: 15 }}>
        {error && <View style={styles.error}><Text style={styles.errorText}>{error}</Text></View>}
        {success && <View style={styles.success}><Text style={styles.successText}>{success}</Text></View>}

        <View style={styles.card}>
          <TextInput style={styles.input} placeholder="Адрес отправки" value={formData.pickupAddress} onChangeText={(v) => setFormData({ ...formData, pickupAddress: v })} />
          <TextInput style={styles.input} placeholder="Адрес доставки" value={formData.deliveryAddress} onChangeText={(v) => setFormData({ ...formData, deliveryAddress: v })} />
          <TextInput style={styles.input} placeholder="Имя получателя" value={formData.recipientName} onChangeText={(v) => setFormData({ ...formData, recipientName: v })} />
          <TextInput style={styles.input} placeholder="Телефон получателя" keyboardType="phone-pad" value={formData.recipientPhone} onChangeText={(v) => setFormData({ ...formData, recipientPhone: v })} />
          <TextInput style={[styles.input, { minHeight: 80 }]} placeholder="Описание товара" multiline numberOfLines={3} value={formData.description} onChangeText={(v) => setFormData({ ...formData, description: v })} />
          <TextInput style={styles.input} placeholder="Цена в ₴" keyboardType="decimal-pad" value={formData.customerPrice} onChangeText={(v) => setFormData({ ...formData, customerPrice: v })} />
          <TouchableOpacity style={styles.button} onPress={handleCreateOrder} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Создать заказ</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const CourierScreen = ({ user }) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [offerPrice, setOfferPrice] = useState('');
  const [makingOffer, setMakingOffer] = useState(false);

  useEffect(() => {
    loadAvailableOrders();
  }, []);

  const loadAvailableOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data?.filter((o) => o.status === 'published') || []);
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось загрузить заказы');
    } finally {
      setLoading(false);
    }
  };

  const handleMakeOffer = async () => {
    if (!selectedOrder || !offerPrice) {
      Alert.alert('Ошибка', 'Выберите заказ и введите цену');
      return;
    }
    setMakingOffer(true);
    try {
      await api.post('/offers', { orderId: selectedOrder.id, offeredPrice: parseFloat(offerPrice) });
      Alert.alert('Успех', 'Предложение отправлено');
      setSelectedOrder(null);
      setOfferPrice('');
      loadAvailableOrders();
    } catch (err) {
      Alert.alert('Ошибка', err.response?.data?.message || 'Не удалось отправить предложение');
    } finally {
      setMakingOffer(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🚚 Заказы</Text>
      </View>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.orderItem} onPress={() => setSelectedOrder(item)}>
            <Text style={styles.label}>От: {item.pickupAddress}</Text>
            <Text style={styles.label}>До: {item.deliveryAddress}</Text>
            <Text style={[styles.price, { marginTop: 8 }]}>Цена: {item.customerPrice} ₴</Text>
          </TouchableOpacity>
        )}
        ListEmptyComponent=<View style={[styles.container, styles.loadingContainer]}><Text style={{ color: '#999' }}>Нет доступных заказов</Text></View>
      />

      <Modal visible={!!selectedOrder} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Предложить цену</Text>
            {selectedOrder && (
              <>
                <Text style={styles.label}>От: {selectedOrder.pickupAddress}</Text>
                <Text style={styles.label}>До: {selectedOrder.deliveryAddress}</Text>
                <Text style={styles.label}>Цена заказчика: {selectedOrder.customerPrice} ₴</Text>
                <TextInput style={styles.input} placeholder="Ваша цена (₴)" keyboardType="decimal-pad" value={offerPrice} onChangeText={setOfferPrice} />
                <TouchableOpacity style={styles.button} onPress={handleMakeOffer} disabled={makingOffer}>
                  {makingOffer ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Отправить</Text>}
                </TouchableOpacity>
                <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setSelectedOrder(null)}>
                  <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Отмена</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const AdminScreen = ({ user }) => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadApplications();
  }, []);

  const loadApplications = async () => {
    try {
      const response = await api.get('/couriers/applications/pending');
      setApplications(response.data || []);
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId) => {
    try {
      await api.post(`/couriers/applications/${appId}/approve`);
      Alert.alert('Успех', 'Заявка одобрена');
      loadApplications();
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось одобрить заявку');
    }
  };

  const handleReject = async () => {
    if (!selectedApp || !rejectReason) {
      Alert.alert('Ошибка', 'Укажите причину отклонения');
      return;
    }
    try {
      await api.post(`/couriers/applications/${selectedApp.id}/reject`, { reason: rejectReason });
      Alert.alert('Успех', 'Заявка отклонена');
      setSelectedApp(null);
      setRejectReason('');
      loadApplications();
    } catch (err) {
      Alert.alert('Ошибка', 'Не удалось отклонить заявку');
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>⚙️ Админ</Text>
        <Text style={styles.headerSubtitle}>{user.phone}</Text>
      </View>

      <FlatList
        data={applications}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={{ fontWeight: 'bold', fontSize: 14, marginBottom: 8 }}>{item.user?.phone}</Text>
            <Text style={styles.label}>Статус: {item.status}</Text>
            <View style={[styles.row, { marginTop: 10 }]}>
              <TouchableOpacity style={[styles.button, { flex: 1, marginRight: 5 }]} onPress={() => handleApprove(item.id)}>
                <Text style={styles.buttonText}>✓ Да</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.button, styles.buttonSecondary, { flex: 1, marginLeft: 5 }]} onPress={() => setSelectedApp(item)}>
                <Text style={[styles.buttonText, styles.buttonSecondaryText]}>✕ Нет</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent=<View style={[styles.container, styles.loadingContainer]}><Text style={{ color: '#999' }}>Нет заявок</Text></View>
      />

      <Modal visible={!!selectedApp} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Причина отклонения</Text>
            <TextInput style={[styles.input, { minHeight: 80 }]} placeholder="Укажите причину..." multiline numberOfLines={4} value={rejectReason} onChangeText={setRejectReason} />
            <TouchableOpacity style={styles.button} onPress={handleReject}>
              <Text style={styles.buttonText}>Отклонить</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.buttonSecondary]} onPress={() => setSelectedApp(null)}>
              <Text style={[styles.buttonText, styles.buttonSecondaryText]}>Отмена</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  useEffect(() => {
    checkToken();
  }, []);

  const checkToken = async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userJson = await AsyncStorage.getItem('user');
      if (token && userJson) {
        setUser(JSON.parse(userJson));
      }
    } catch (err) {
      console.error('Token check error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user');
    setUser(null);
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  if (!user) {
    return <LoginScreen onLoginSuccess={setUser} />;
  }

  const isCustomer = user.roles?.some((r) => r.name === 'customer');
  const isCourier = user.roles?.some((r) => r.name === 'courier');
  const isAdmin = user.roles?.some((r) => r.name === 'admin' || r.name === 'super_admin');

  const renderContent = () => {
    if (isAdmin && activeTab === 'admin') return <AdminScreen user={user} />;
    if (isCustomer && activeTab === 'create') return <CreateOrderScreen user={user} />;
    if (isCourier && activeTab === 'courier') return <CourierScreen user={user} />;
    return <OrderListScreen user={user} />;
  };

  return (
    <View style={styles.container}>
      {renderContent()}

      <View style={styles.tabBar}>
        <TouchableOpacity style={[styles.tabBarItem, activeTab === 'orders' && styles.tabBarItemActive]} onPress={() => setActiveTab('orders')}>
          <Text style={[styles.tabBarLabel, activeTab === 'orders' && { color: '#FF6B00', fontWeight: '700' }]}>📋 Заказы</Text>
        </TouchableOpacity>
        {isCustomer && (
          <TouchableOpacity style={[styles.tabBarItem, activeTab === 'create' && styles.tabBarItemActive]} onPress={() => setActiveTab('create')}>
            <Text style={[styles.tabBarLabel, activeTab === 'create' && { color: '#FF6B00', fontWeight: '700' }]}>➕ Новый</Text>
          </TouchableOpacity>
        )}
        {isCourier && (
          <TouchableOpacity style={[styles.tabBarItem, activeTab === 'courier' && styles.tabBarItemActive]} onPress={() => setActiveTab('courier')}>
            <Text style={[styles.tabBarLabel, activeTab === 'courier' && { color: '#FF6B00', fontWeight: '700' }]}>🚚 Доступно</Text>
          </TouchableOpacity>
        )}
        {isAdmin && (
          <TouchableOpacity style={[styles.tabBarItem, activeTab === 'admin' && styles.tabBarItemActive]} onPress={() => setActiveTab('admin')}>
            <Text style={[styles.tabBarLabel, activeTab === 'admin' && { color: '#FF6B00', fontWeight: '700' }]}>⚙️ Админ</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.tabBarItem} onPress={handleLogout}>
          <Text style={[styles.tabBarLabel, { color: '#999' }]}>🚪 Выход</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
