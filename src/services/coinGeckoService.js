const API_BASE_URL = 'https://api.coingecko.com/api/v3';

export const convertCurrency = async (fromCurrency, toCurrency, amount) => {
  try {
    // Always convert using the crypto ID and fiat currency code
    const response = await fetch(
      `${API_BASE_URL}/simple/price?ids=${fromCurrency}&vs_currencies=${toCurrency}`
    );
    
    const data = await response.json();
    
    if (!data[fromCurrency]) {
      throw new Error('Currency not found');
    }
    
    const rate = data[fromCurrency][toCurrency];
    const result = amount * rate;
    
    return {
      amount,
      fromCurrency,
      toCurrency,
      rate,
      result: parseFloat(result.toFixed(8))
    };
  } catch (error) {
    console.error('Error converting currency:', error);
    throw error;
  }
};

export const getCryptoPrice = async (cryptoId, vsCurrency) => {
  try {
    const response = await fetch(
      `${API_BASE_URL}/simple/price?ids=${cryptoId}&vs_currencies=${vsCurrency}`
    );
    
    const data = await response.json();
    return data[cryptoId][vsCurrency];
  } catch (error) {
    console.error('Error getting crypto price:', error);
    throw error;
  }
}; 