import { useState } from 'react'
import './App.css'
import { cryptocurrencies, fiatCurrencies } from './currencies'
import { convertCurrency } from './services/coinGeckoService'

function App() {
  const [fromCurrency, setFromCurrency] = useState('bitcoin')
  const [toCurrency, setToCurrency] = useState('usd')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isCryptoToFiat, setIsCryptoToFiat] = useState(true)

  const handleConvert = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      if (isCryptoToFiat) {
        const conversion = await convertCurrency(fromCurrency, toCurrency, parseFloat(amount))
        setResult(conversion)
      } else {
        // For fiat to crypto, we need to calculate the inverse
        const conversion = await convertCurrency(fromCurrency, toCurrency, parseFloat(amount))
        const inverseResult = {
          ...conversion,
          result: parseFloat(amount) / conversion.rate,
          rate: 1 / conversion.rate
        }
        setResult(inverseResult)
      }
    } catch (err) {
      setError('Error converting currencies. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleSwapDirection = () => {
    setIsCryptoToFiat(!isCryptoToFiat)
    setResult(null)
  }

  const formatCurrency = (value, currency) => {
    if (currency.toLowerCase() === toCurrency && !isCryptoToFiat) {
      // For crypto results, show more decimal places
      return value.toFixed(8) + ` ${selectedCrypto?.symbol || fromCurrency.toUpperCase()}`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(value)
  }

  // Find the selected cryptocurrency details
  const selectedCrypto = cryptocurrencies.find(crypto => crypto.id === fromCurrency)

  return (
    <div className="container">
      <h1>Crypto Converter</h1>
      <div className="converter-card">
        <div className="direction-toggle">
          <button 
            className={`toggle-button ${isCryptoToFiat ? 'active' : ''}`}
            onClick={() => setIsCryptoToFiat(true)}
          >
            Crypto → Fiat
          </button>
          <button 
            className={`toggle-button ${!isCryptoToFiat ? 'active' : ''}`}
            onClick={() => setIsCryptoToFiat(false)}
          >
            Fiat → Crypto
          </button>
        </div>

        <form onSubmit={handleConvert}>
          <div className="input-group">
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`Enter amount in ${isCryptoToFiat ? 'crypto' : 'fiat'}`}
              required
              step="any"
              min="0"
            />
            <select
              value={isCryptoToFiat ? fromCurrency : toCurrency}
              onChange={(e) => isCryptoToFiat 
                ? setFromCurrency(e.target.value)
                : setToCurrency(e.target.value.toLowerCase())
              }
            >
              {isCryptoToFiat ? (
                cryptocurrencies.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name} ({crypto.symbol})
                  </option>
                ))
              ) : (
                fiatCurrencies.map((currency) => (
                  <option key={currency.code} value={currency.code.toLowerCase()}>
                    {currency.name} ({currency.code})
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="swap-icon">
            <span>↓</span>
          </div>

          <div className="input-group">
            <select
              value={isCryptoToFiat ? toCurrency : fromCurrency}
              onChange={(e) => isCryptoToFiat
                ? setToCurrency(e.target.value.toLowerCase())
                : setFromCurrency(e.target.value)
              }
            >
              {isCryptoToFiat ? (
                fiatCurrencies.map((currency) => (
                  <option key={currency.code} value={currency.code.toLowerCase()}>
                    {currency.name} ({currency.code})
                  </option>
                ))
              ) : (
                cryptocurrencies.map((crypto) => (
                  <option key={crypto.id} value={crypto.id}>
                    {crypto.name} ({crypto.symbol})
                  </option>
                ))
              )}
            </select>
          </div>

          <button 
            type="submit" 
            className="convert-button"
            disabled={loading}
          >
            {loading ? 'Converting...' : 'Convert'}
          </button>
        </form>

        {error && (
          <div className="error">
            {error}
          </div>
        )}

        {result && !error && (
          <div className="result">
            <h2>Conversion Result:</h2>
            <div className="result-details">
              <p>
                {amount} {isCryptoToFiat 
                  ? `${selectedCrypto?.symbol || fromCurrency.toUpperCase()}`
                  : toCurrency.toUpperCase()
                } = {' '}
                {isCryptoToFiat
                  ? formatCurrency(result.result, toCurrency)
                  : `${result.result.toFixed(8)} ${selectedCrypto?.symbol || fromCurrency.toUpperCase()}`
                }
              </p>
              <p className="rate">
                1 {isCryptoToFiat 
                  ? `${selectedCrypto?.symbol || fromCurrency.toUpperCase()} = ${formatCurrency(result.rate, toCurrency)}`
                  : `${toCurrency.toUpperCase()} = ${result.rate.toFixed(8)} ${selectedCrypto?.symbol || fromCurrency.toUpperCase()}`
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
