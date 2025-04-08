const API_BASE_URL = 'https://api.coingecko.com/api/v3';

export const convertCurrency = async (fromCurrency, toCurrency, amount) => {
  try {
    if (!fromCurrency || !toCurrency || amount === undefined) {
      throw new Error('Invalid parameters for currency conversion');
    }

    const response = await fetch(
      `${API_BASE_URL}/simple/price?ids=${fromCurrency}&vs_currencies=${toCurrency}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch conversion rate');
    }
    
    const data = await response.json();
    
    if (!data[fromCurrency] || !data[fromCurrency][toCurrency]) {
      throw new Error(`Unable to get conversion rate from ${fromCurrency} to ${toCurrency}`);
    }
    
    const rate = data[fromCurrency][toCurrency];
    
    if (typeof rate !== 'number' || isNaN(rate) || rate <= 0) {
      throw new Error('Invalid conversion rate received');
    }
    
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
    throw new Error(`Failed to convert currency: ${error.message}`);
  }
};

export const getCryptoPrice = async (cryptoId, vsCurrency) => {
  try {
    if (!cryptoId || !vsCurrency) {
      throw new Error('Both cryptoId and vsCurrency are required');
    }

    const response = await fetch(
      `${API_BASE_URL}/simple/price?ids=${cryptoId}&vs_currencies=${vsCurrency}`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch crypto price');
    }
    
    const data = await response.json();

    if (!data[cryptoId] || !data[cryptoId][vsCurrency]) {
      throw new Error(`Unable to get price for ${cryptoId} in ${vsCurrency}`);
    }

    const price = data[cryptoId][vsCurrency];

    if (typeof price !== 'number' || isNaN(price) || price <= 0) {
      throw new Error('Invalid price received');
    }

    return price;
  } catch (error) {
    console.error('Error getting crypto price:', error);
    throw new Error(`Failed to get crypto price: ${error.message}`);
  }
}; 