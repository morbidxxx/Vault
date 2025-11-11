import React, { useState } from 'react';
import { Eye, EyeOff, Trash2, Edit2, Plus, Save, X, ArrowLeft, CreditCard } from 'lucide-react';

const FallingDollar = ({ delay, left }) => {
  return (
    <div
      className="fixed pointer-events-none text-4xl font-bold opacity-20"
      style={{
        left: `${left}%`,
        animation: `fall ${8 + Math.random() * 4}s linear ${delay}s infinite`,
        top: '-50px'
      }}
    >
      💰
    </div>
  );
};

const BankVaultApp = () => {
  const useStoredState = (key, initialValue) => {
  const [state, setState] = React.useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value) => {
    try {
      setState(value);
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(error);
    }
  };

  return [state, setValue];
};


  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [pinInput, setPinInput] = useState('');
  const [isCreatingPin, setIsCreatingPin] = useState(false);
  const [pinConfirm, setPinConfirm] = useState('');
  
  const [selectedBank, setSelectedBank] = useState(null);
  const [showBankForm, setShowBankForm] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [showBankNotes, setShowBankNotes] = useState(false);
  const [editingCardId, setEditingCardId] = useState(null);
  const [visibleFields, setVisibleFields] = useState({});
  
  const [bankFormData, setBankFormData] = useState({
    bankName: '',
    color: '#3B82F6'
  });

  const [bankNotesData, setBankNotesData] = useState('');

  const [cardFormData, setCardFormData] = useState({
    cardNumber: '',
    pinCode: '',
    accountHolder: '',
    notes: ''
  });

  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E2', '#F8B195', '#D4AF37'
  ];

  const resetBankForm = () => {
    setBankFormData({ bankName: '', color: '#3B82F6' });
    setShowBankForm(false);
  };

  const resetCardForm = () => {
    setCardFormData({
      cardNumber: '',
      pinCode: '',
      accountHolder: '',
      notes: ''
    });
    setEditingCardId(null);
    setShowCardForm(false);
  };

  const handleAddBank = () => {
    if (!bankFormData.bankName) {
      alert('Введите название банка');
      return;
    }
    const newBank = {
      id: Date.now(),
      bankName: bankFormData.bankName,
      color: bankFormData.color,
      notes: '',
      cards: []
    };
    setBanks([...banks, newBank]);
    resetBankForm();
  };

  const handleDeleteBank = (bankId) => {
    if (confirm('Удалить этот банк и все его карты?')) {
      setBanks(banks.filter(b => b.id !== bankId));
      if (selectedBank?.id === bankId) {
        setSelectedBank(null);
      }
    }
  };

  const handleAddCard = () => {
    if (!cardFormData.cardNumber || !cardFormData.pinCode) {
      alert('Заполните номер карты и PIN-код');
      return;
    }

    const updatedBanks = banks.map(bank => {
      if (bank.id === selectedBank.id) {
        if (editingCardId) {
          return {
            ...bank,
            cards: bank.cards.map(card =>
              card.id === editingCardId ? { ...cardFormData, id: editingCardId } : card
            )
          };
        } else {
          return {
            ...bank,
            cards: [...bank.cards, { ...cardFormData, id: Date.now() }]
          };
        }
      }
      return bank;
    });

    setBanks(updatedBanks);
    setSelectedBank(updatedBanks.find(b => b.id === selectedBank.id));
    resetCardForm();
  };

  const handleEditCard = (card) => {
    setCardFormData(card);
    setEditingCardId(card.id);
    setShowCardForm(true);
  };

  const handleDeleteCard = (cardId) => {
    if (confirm('Удалить эту карту?')) {
      const updatedBanks = banks.map(bank => {
        if (bank.id === selectedBank.id) {
          return {
            ...bank,
            cards: bank.cards.filter(c => c.id !== cardId)
          };
        }
        return bank;
      });
      setBanks(updatedBanks);
      setSelectedBank(updatedBanks.find(b => b.id === selectedBank.id));
    }
  };

  const toggleVisibility = (id, field) => {
    const key = `${id}-${field}`;
    setVisibleFields(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const maskCardNumber = (number) => {
    if (!number) return '';
    const last4 = number.slice(-4);
    return `•••• •••• •••• ${last4}`;
  };

  const handleOpenBankNotes = () => {
    setBankNotesData(selectedBank.notes || '');
    setShowBankNotes(true);
  };

  const handleSaveBankNotes = () => {
    const updatedBanks = banks.map(bank =>
      bank.id === selectedBank.id ? { ...bank, notes: bankNotesData } : bank
    );
    setBanks(updatedBanks);
    setSelectedBank({ ...selectedBank, notes: bankNotesData });
    setShowBankNotes(false);
  };

  // PIN код функции
  const handleCreatePin = () => {
    if (!pinInput || pinInput.length !== 4) {
      alert('PIN-код должен содержать ровно 4 цифры');
      return;
    }
    if (pinInput !== pinConfirm) {
      alert('PIN-коды не совпадают');
      return;
    }
    setSavedPin(pinInput);
    setPinInput('');
    setPinConfirm('');
    setIsCreatingPin(false);
    setIsAuthenticated(true);
  };

  const handleCheckPin = () => {
    if (!pinInput) {
      alert('Введите PIN-код');
      return;
    }
    if (pinInput === savedPin) {
      setIsAuthenticated(true);
      setPinInput('');
    } else {
      alert('Неверный PIN-код');
      setPinInput('');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setPinInput('');
    setSelectedBank(null);
    setShowBankForm(false);
    setShowCardForm(false);
    setShowBankNotes(false);
  };

  // Экран входа с PIN-кодом
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 p-6 overflow-hidden flex items-center justify-center">
        <style>{`
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(360deg);
            }
          }
          @keyframes slideIn {
            from {
              opacity: 0;
              transform: translateY(-20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
        
        {/* Falling Dollars */}
        {[...Array(15)].map((_, i) => (
          <FallingDollar key={i} delay={i * 0.5} left={Math.random() * 100} />
        ))}

        <div className="relative z-10 w-full max-w-md" style={{ animation: 'slideIn 0.6s ease-out' }}>
          <div className="bg-slate-800 rounded-3xl p-8 border-2 border-purple-500 shadow-2xl backdrop-blur-sm">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="text-6xl mb-4">🔐</div>
              <h1 className="text-3xl font-bold text-white mb-2">Банковое хранилище</h1>
              <p className="text-slate-300">
                {isCreatingPin ? 'Создайте PIN-код' : 'Введите PIN-код'}
              </p>
            </div>

            {isCreatingPin ? (
              // Создание PIN-кода
              <>
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Создайте PIN-код (4 цифры) *
                    </label>
                    <input
                      type="password"
                      placeholder="••••"
                      value={pinInput}
                      onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength="4"
                      className="w-full bg-slate-700 border-2 border-slate-600 rounded-2xl px-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition text-center text-3xl font-bold tracking-widest"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-300 mb-2">
                      Подтвердите PIN-код *
                    </label>
                    <input
                      type="password"
                      placeholder="••••"
                      value={pinConfirm}
                      onChange={(e) => setPinConfirm(e.target.value.replace(/\D/g, '').slice(0, 4))}
                      maxLength="4"
                      className="w-full bg-slate-700 border-2 border-slate-600 rounded-2xl px-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition text-center text-3xl font-bold tracking-widest"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mb-4">
                  <button
                    onClick={handleCreatePin}
                    className="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105"
                  >
                    Создать
                  </button>
                  <button
                    onClick={() => {
                      setIsCreatingPin(false);
                      setPinInput('');
                      setPinConfirm('');
                    }}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300"
                  >
                    Отмена
                  </button>
                </div>
              </>
            ) : (
              // Вход по PIN-коду
              <>
                <div className="mb-6">
                  <input
                    type="password"
                    placeholder="••••"
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    onKeyPress={(e) => e.key === 'Enter' && handleCheckPin()}
                    maxLength="4"
                    autoFocus
                    className="w-full bg-slate-700 border-2 border-slate-600 rounded-2xl px-4 py-4 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition text-center text-3xl font-bold tracking-widest"
                  />
                </div>

                <button
                  onClick={handleCheckPin}
                  className="w-full mb-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white font-bold py-3 px-4 rounded-2xl transition-all duration-300 transform hover:scale-105"
                >
                  Войти
                </button>

                {!savedPin && (
                  <button
                    onClick={() => setIsCreatingPin(true)}
                    className="w-full bg-slate-700 hover:bg-slate-600 text-slate-300 font-semibold py-3 px-4 rounded-2xl transition-all duration-300"
                  >
                    Впервые? Создайте PIN-код
                  </button>
                )}
              </>
            )}

            {/* Security Notice */}
            <div className="mt-6 p-4 bg-amber-900 bg-opacity-20 border border-amber-700 rounded-xl text-amber-200 text-xs text-center">
              <p>🔒 Ваши данные защищены PIN-кодом</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Главное меню - список банков
  if (!selectedBank) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 p-6 overflow-hidden">
        <style>{`
          @keyframes fall {
            to {
              transform: translateY(100vh) rotate(360deg);
            }
          }
        `}</style>
        
        {/* Falling Dollars */}
        {[...Array(15)].map((_, i) => (
          <FallingDollar key={i} delay={i * 0.5} left={Math.random() * 100} />
        ))}
        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="mb-12 flex items-center justify-between">
            <div>
              <h1 className="text-5xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
                🏦 Мои Банки
              </h1>
              <p className="text-slate-300 text-lg">Управляйте всеми вашими банковскими картами в одном месте</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105 whitespace-nowrap"
            >
              🔒 Выход
            </button>
          </div>

          {/* Add Bank Button */}
          {!showBankForm && (
            <button
              onClick={() => setShowBankForm(true)}
              className="w-full mb-8 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-3xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Plus size={24} />
              <span className="text-lg">Добавить новый банк</span>
            </button>
          )}

          {/* Add Bank Form */}
          {showBankForm && (
            <div className="mb-8 bg-slate-800 rounded-3xl p-8 border-2 border-purple-500 shadow-2xl animate-fade-in">
              <h2 className="text-2xl font-bold text-white mb-6">Создать банк</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Название банка *
                  </label>
                  <input
                    type="text"
                    placeholder="Сбербанк, Альфа-Банк, ТинькофФ..."
                    value={bankFormData.bankName}
                    onChange={(e) => setBankFormData({ ...bankFormData, bankName: e.target.value })}
                    className="w-full bg-slate-700 border-2 border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-purple-400 transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-3">
                    Выберите цвет карточки
                  </label>
                  <div className="flex gap-3 flex-wrap">
                    {colors.map(color => (
                      <button
                        key={color}
                        onClick={() => setBankFormData({ ...bankFormData, color })}
                        className={`w-12 h-12 rounded-full transition-all duration-300 transform hover:scale-110 ${
                          bankFormData.color === color ? 'ring-4 ring-white scale-110' : ''
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleAddBank}
                  className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
                >
                  <Save size={20} />
                  Создать
                </button>
                <button
                  onClick={resetBankForm}
                  className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300"
                >
                  <X size={20} />
                  Отмена
                </button>
              </div>
            </div>
          )}

          {/* Banks Grid */}
          {banks.length === 0 ? (
            <div className="bg-slate-800 rounded-3xl p-12 text-center border-2 border-slate-700">
              <CreditCard size={48} className="mx-auto mb-4 text-slate-400" />
              <p className="text-slate-300 text-lg">Нет банков. Создайте первый!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {banks.map((bank) => (
                <div
                  key={bank.id}
                  onClick={() => setSelectedBank(bank)}
                  className="group cursor-pointer transform transition-all duration-300 hover:scale-105"
                >
                  <div
                    className="rounded-3xl p-8 text-white shadow-2xl border-2 border-opacity-20 backdrop-blur-sm hover:shadow-3xl transition-all duration-300 relative overflow-hidden"
                    style={{
                      backgroundColor: bank.color + '20',
                      borderColor: bank.color,
                      boxShadow: `0 20px 40px ${bank.color}40`
                    }}
                  >
                    <div className="absolute top-0 right-0 w-40 h-40 opacity-10 rounded-full" style={{ backgroundColor: bank.color }}></div>
                    
                    <div className="relative z-10">
                      <h3 className="text-2xl font-bold mb-2">{bank.bankName}</h3>
                      <p className="text-white text-opacity-80 mb-4">{bank.cards.length} карт(ы)</p>
                      
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteBank(bank.id);
                        }}
                        className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 opacity-0 group-hover:opacity-100"
                      >
                        <Trash2 size={18} />
                        Удалить
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Экран карт банка
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-slate-900 to-purple-900 p-6 overflow-hidden">
      <style>{`
        @keyframes fall {
          to {
            transform: translateY(100vh) rotate(360deg);
          }
        }
      `}</style>
      
      {/* Falling Dollars */}
      {[...Array(15)].map((_, i) => (
        <FallingDollar key={i} delay={i * 0.5} left={Math.random() * 100} />
      ))}
      
      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header с кнопками */}
        <div className="mb-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 flex-1">
            <button
              onClick={() => setSelectedBank(null)}
              className="bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-2xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
            >
              <ArrowLeft size={20} />
              Назад
            </button>
            <div>
              <h1 className="text-4xl font-bold text-white">{selectedBank.bankName}</h1>
              <p className="text-slate-300">Управление картами и PIN-кодами</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-2xl flex items-center gap-2 transition-all duration-300 transform hover:scale-105"
          >
            🔒 Выход
          </button>
        </div>

        {/* Add Card Button */}
        {!showCardForm && (
          <div className="flex gap-4 mb-8">
            <button
              onClick={() => setShowCardForm(true)}
              className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-4 px-6 rounded-3xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            <Plus size={24} />
            <span className="text-lg">Добавить карту</span>
          </button>
            <button
              onClick={handleOpenBankNotes}
              className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-3xl flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <Edit2 size={24} />
              <span className="text-lg">Примечания</span>
            </button>
          </div>
        )}

        {/* Bank Notes Modal */}
        {showBankNotes && (
          <div className="mb-8 bg-slate-800 rounded-3xl p-8 border-2 border-violet-500 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">Примечания банка</h2>
            
            <div className="space-y-4 mb-6">
              <textarea
                placeholder="Добавьте примечания к этому банку..."
                value={bankNotesData}
                onChange={(e) => setBankNotesData(e.target.value)}
                className="w-full bg-slate-700 border-2 border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-violet-400 transition h-32 resize-none"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleSaveBankNotes}
                className="flex-1 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
              >
                <Save size={20} />
                Сохранить
              </button>
              <button
                onClick={() => setShowBankNotes(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300"
              >
                <X size={20} />
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Add Card Form */}
        {showCardForm && (
          <div className="mb-8 bg-slate-800 rounded-3xl p-8 border-2 border-emerald-500 shadow-2xl animate-fade-in">
            <h2 className="text-2xl font-bold text-white mb-6">
              {editingCardId ? 'Редактировать карту' : 'Новая карта'}
            </h2>
            
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Номер карты *
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardFormData.cardNumber}
                  onChange={(e) => setCardFormData({ ...cardFormData, cardNumber: e.target.value.replace(/\s/g, '').slice(0, 16) })}
                  maxLength="16"
                  className="w-full bg-slate-700 border-2 border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    PIN-код *
                  </label>
                  <input
                    type="password"
                    placeholder="••••"
                    value={cardFormData.pinCode}
                    onChange={(e) => setCardFormData({ ...cardFormData, pinCode: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                    maxLength="4"
                    className="w-full bg-slate-700 border-2 border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition text-center text-2xl"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-300 mb-2">
                    Владелец
                  </label>
                  <input
                    type="text"
                    placeholder="Ваше имя"
                    value={cardFormData.accountHolder}
                    onChange={(e) => setCardFormData({ ...cardFormData, accountHolder: e.target.value })}
                    className="w-full bg-slate-700 border-2 border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-300 mb-2">
                  Примечание/Заметка
                </label>
                <textarea
                  placeholder="Дополнительная информация..."
                  value={cardFormData.notes}
                  onChange={(e) => setCardFormData({ ...cardFormData, notes: e.target.value })}
                  className="w-full bg-slate-700 border-2 border-slate-600 rounded-2xl px-4 py-3 text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400 transition h-20 resize-none"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleAddCard}
                className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300 transform hover:scale-105"
              >
                <Save size={20} />
                {editingCardId ? 'Обновить' : 'Добавить'}
              </button>
              <button
                onClick={resetCardForm}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition-all duration-300"
              >
                <X size={20} />
                Отмена
              </button>
            </div>
          </div>
        )}

        {/* Cards List */}
        {selectedBank.cards.length === 0 ? (
          <div className="bg-slate-800 rounded-3xl p-12 text-center border-2 border-slate-700">
            <CreditCard size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-300 text-lg">Нет карт. Добавьте первую!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {selectedBank.cards.map((card) => (
              <div
                key={card.id}
                className="group rounded-3xl p-6 text-white shadow-2xl transition-all duration-300 transform hover:scale-105 border-2 relative overflow-hidden"
                style={{
                  backgroundColor: selectedBank.color + '30',
                  borderColor: selectedBank.color,
                  boxShadow: `0 20px 40px ${selectedBank.color}40`
                }}
              >
                <div className="absolute top-0 right-0 w-32 h-32 opacity-10 rounded-full" style={{ backgroundColor: selectedBank.color }}></div>
                
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: selectedBank.color }}>
                      <CreditCard size={24} className="text-white" />
                    </div>
                    <span className="text-xs font-semibold text-white text-opacity-70 bg-white bg-opacity-10 px-3 py-1 rounded-full">
                      {card.accountHolder || 'Карта'}
                    </span>
                  </div>

                  <div className="mb-4 font-mono text-lg tracking-widest">
                    {visibleFields[`${card.id}-card`]
                      ? card.cardNumber.replace(/(\d{4})(?=\d)/g, '$1 ')
                      : maskCardNumber(card.cardNumber)
                    }
                  </div>

                  <div className="flex items-center justify-between mb-4 pb-4 border-t border-white border-opacity-20">
                    <div>
                      <p className="text-xs text-white text-opacity-70">PIN-код</p>
                      <p className="text-lg font-bold">
                        {visibleFields[`${card.id}-pin`] ? card.pinCode : '••••'}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleVisibility(card.id, 'card')}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-300"
                      >
                        {visibleFields[`${card.id}-card`] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                      <button
                        onClick={() => toggleVisibility(card.id, 'pin')}
                        className="p-2 hover:bg-white hover:bg-opacity-20 rounded-xl transition-all duration-300"
                      >
                        {visibleFields[`${card.id}-pin`] ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {card.notes && (
                    <div className="mb-4 p-3 bg-white bg-opacity-10 rounded-xl">
                      <p className="text-xs text-white text-opacity-70 mb-1">Примечание:</p>
                      <p className="text-sm">{card.notes}</p>
                    </div>
                  )}

                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <button
                      onClick={() => handleEditCard(card)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <Edit2 size={16} />
                      Редакт.
                    </button>
                    <button
                      onClick={() => handleDeleteCard(card.id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-300"
                    >
                      <Trash2 size={16} />
                      Удалить
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default BankVaultApp;
