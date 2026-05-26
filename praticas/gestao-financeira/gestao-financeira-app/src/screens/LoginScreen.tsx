import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  KeyboardAvoidingView, Platform, ActivityIndicator,
  ScrollView,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldError {
  email?: string;
  password?: string;
}

export default function LoginScreen() {
  const { signIn } = useAuth();

  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [errors, setErrors]     = useState<FieldError>({});
  const [serverError, setServerError] = useState('');
  const [loading, setLoading]   = useState(false);

  const validate = (): boolean => {
    const next: FieldError = {};
    if (!email.trim())                  next.email    = 'Informe o e-mail.';
    else if (!EMAIL_REGEX.test(email))  next.email    = 'E-mail inválido.';
    if (!password)                      next.password = 'Informe a senha.';
    else if (password.length < 4)      next.password = 'Mínimo 4 caracteres.';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleLogin = async () => {
    setServerError('');
    if (!validate()) return;

    setLoading(true);
    try {
      await signIn(email.trim().toLowerCase(), password);
    } catch (e: any) {
      const msg = e?.response?.data?.error;
      setServerError(msg ?? 'Não foi possível conectar. Verifique se a API está rodando.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Blob decorativo */}
        <View style={styles.blob1} />
        <View style={styles.blob2} />

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <MaterialIcons name="account-balance-wallet" size={36} color="#fff" />
          </View>

          <Text style={styles.title}>Gestão Financeira</Text>
          <Text style={styles.subtitle}>Entre na sua conta para continuar</Text>

          {/* E-mail */}
          <View style={[styles.inputWrap, errors.email ? styles.inputError : null]}>
            <MaterialIcons name="email" size={20} color={errors.email ? '#E17055' : '#b2bec3'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="E-mail"
              placeholderTextColor="#b2bec3"
              value={email}
              onChangeText={(v) => { setEmail(v); setErrors((p) => ({ ...p, email: undefined })); setServerError(''); }}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="next"
            />
          </View>
          {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}

          {/* Senha */}
          <View style={[styles.inputWrap, errors.password ? styles.inputError : null]}>
            <MaterialIcons name="lock" size={20} color={errors.password ? '#E17055' : '#b2bec3'} style={styles.inputIcon} />
            <TextInput
              style={styles.input}
              placeholder="Senha"
              placeholderTextColor="#b2bec3"
              value={password}
              onChangeText={(v) => { setPassword(v); setErrors((p) => ({ ...p, password: undefined })); setServerError(''); }}
              secureTextEntry={!showPass}
              returnKeyType="done"
              onSubmitEditing={handleLogin}
            />
            <TouchableOpacity onPress={() => setShowPass((p) => !p)} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <MaterialIcons name={showPass ? 'visibility-off' : 'visibility'} size={20} color="#b2bec3" />
            </TouchableOpacity>
          </View>
          {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}

          {/* Erro do servidor */}
          {serverError ? (
            <View style={styles.serverErrorWrap}>
              <MaterialIcons name="error-outline" size={16} color="#E17055" />
              <Text style={styles.serverErrorText}>{serverError}</Text>
            </View>
          ) : null}

          {/* Botão */}
          <TouchableOpacity
            style={[styles.btn, loading && { opacity: 0.7 }]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : (
                <View style={styles.btnInner}>
                  <MaterialIcons name="login" size={20} color="#fff" />
                  <Text style={styles.btnText}>Entrar</Text>
                </View>
              )
            }
          </TouchableOpacity>
        </View>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F6FA' },
  scroll:    { flexGrow: 1, justifyContent: 'center', padding: 24 },

  blob1: {
    position: 'absolute', top: -60, left: -60,
    width: 240, height: 240, borderRadius: 120,
    backgroundColor: '#5B5FEF', opacity: 0.1,
  },
  blob2: {
    position: 'absolute', bottom: -40, right: -40,
    width: 180, height: 180, borderRadius: 90,
    backgroundColor: '#00B894', opacity: 0.08,
  },

  card: {
    backgroundColor: '#fff', borderRadius: 24, padding: 28,
    elevation: 6, shadowColor: '#5B5FEF', shadowOpacity: 0.12,
    shadowRadius: 16, shadowOffset: { width: 0, height: 6 },
  },

  logoWrap: {
    width: 68, height: 68, borderRadius: 20,
    backgroundColor: '#5B5FEF', alignItems: 'center',
    justifyContent: 'center', marginBottom: 16, alignSelf: 'center',
    elevation: 4, shadowColor: '#5B5FEF', shadowOpacity: 0.4,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },

  title:    { fontSize: 22, fontWeight: '800', color: '#2D3436', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#636E72', textAlign: 'center', marginBottom: 28, marginTop: 4 },

  inputWrap: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#F5F6FA', borderRadius: 14,
    paddingHorizontal: 14, marginBottom: 4,
    borderWidth: 1.5, borderColor: '#DFE6E9',
  },
  inputError: { borderColor: '#E17055', backgroundColor: '#FFF5F3' },
  inputIcon:  { marginRight: 8 },
  input:      { flex: 1, paddingVertical: 14, fontSize: 15, color: '#2D3436' },

  errorText: { fontSize: 12, color: '#E17055', marginBottom: 10, marginLeft: 4 },

  serverErrorWrap: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#FFF0ED', borderRadius: 10,
    padding: 12, marginBottom: 14, marginTop: 4,
  },
  serverErrorText: { flex: 1, fontSize: 13, color: '#E17055', fontWeight: '500' },

  btn: {
    backgroundColor: '#5B5FEF', borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
    elevation: 3, shadowColor: '#5B5FEF', shadowOpacity: 0.35,
    shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
  },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  btnText:  { color: '#fff', fontSize: 16, fontWeight: '700', letterSpacing: 0.5 },
});
