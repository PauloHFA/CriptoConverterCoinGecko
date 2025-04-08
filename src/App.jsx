import { useState } from 'react'
import './App.css'
import { cryptocurrencies, fiatCurrencies } from './currencies'
import { convertCurrency } from './services/coinGeckoService'

function App() {
  const [conversionType, setConversionType] = useState('fiat-to-fiat') // 'fiat-to-fiat', 'crypto-to-crypto', 'crypto-to-fiat', 'fiat-to-crypto'
  const [fromCurrency, setFromCurrency] = useState('usd')
  const [toCurrency, setToCurrency] = useState('brl')
  const [amount, setAmount] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleConvert = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    
    try {
      if (conversionType === 'fiat-to-fiat') {
        // Para conversão entre moedas fiat, precisamos usar uma criptomoeda como intermediária
        const conversion = await convertCurrency('bitcoin', toCurrency, 1)
        const conversionFrom = await convertCurrency('bitcoin', fromCurrency, 1)
        const rate = conversion.rate / conversionFrom.rate
        const result = amount * rate
        setResult({
          amount,
          fromCurrency,
          toCurrency,
          rate,
          result: parseFloat(result.toFixed(2))
        })
      } else if (conversionType === 'crypto-to-crypto') {
        // Para conversão entre criptomoedas, usamos USD como intermediário
        const conversion = await convertCurrency(fromCurrency, 'usd', 1)
        const conversionTo = await convertCurrency(toCurrency, 'usd', 1)
        const rate = conversion.rate / conversionTo.rate
        const result = amount * rate
        setResult({
          amount,
          fromCurrency,
          toCurrency,
          rate,
          result: parseFloat(result.toFixed(8))
        })
      } else if (conversionType === 'crypto-to-fiat') {
        // Para conversão de crypto para fiat, usamos a API diretamente
        const conversion = await convertCurrency(fromCurrency, toCurrency, 1)
        const result = amount * conversion.rate
        setResult({
          amount,
          fromCurrency,
          toCurrency,
          rate: conversion.rate,
          result: parseFloat(result.toFixed(2))
        })
      } else if (conversionType === 'fiat-to-crypto') {
        // Para conversão de fiat para crypto, precisamos inverter a taxa
        const conversion = await convertCurrency(toCurrency, fromCurrency, 1)
        const rate = 1 / conversion.rate
        const result = amount * rate
        setResult({
          amount,
          fromCurrency,
          toCurrency,
          rate,
          result: parseFloat(result.toFixed(8))
        })
      }
    } catch (err) {
      setError('Error converting currencies. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (value, currency) => {
    if (conversionType === 'crypto-to-crypto' || 
        (conversionType === 'fiat-to-crypto' && currency === toCurrency)) {
      return value.toFixed(8) + ` ${selectedToCrypto?.symbol || toCurrency.toUpperCase()}`
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
      minimumFractionDigits: 2,
      maximumFractionDigits: 8
    }).format(value)
  }

  // Encontrar os detalhes das criptomoedas selecionadas
  const selectedFromCrypto = cryptocurrencies.find(crypto => crypto.id === fromCurrency)
  const selectedToCrypto = cryptocurrencies.find(crypto => crypto.id === toCurrency)

  return (
    <div className="container">
      <h1>Crypto Converter</h1>
      <div className="converter-card">
        <div className="conversion-types">
          <button 
            className={`type-button ${conversionType === 'fiat-to-fiat' ? 'active' : ''}`}
            onClick={() => {
              setConversionType('fiat-to-fiat')
              setFromCurrency('usd')
              setToCurrency('brl')
            }}
          >
            Fiat → Fiat
          </button>
          <button 
            className={`type-button ${conversionType === 'crypto-to-crypto' ? 'active' : ''}`}
            onClick={() => {
              setConversionType('crypto-to-crypto')
              setFromCurrency('bitcoin')
              setToCurrency('ethereum')
            }}
          >
            Crypto → Crypto
          </button>
          <button 
            className={`type-button ${conversionType === 'crypto-to-fiat' ? 'active' : ''}`}
            onClick={() => {
              setConversionType('crypto-to-fiat')
              setFromCurrency('bitcoin')
              setToCurrency('usd')
            }}
          >
            Crypto → Fiat
          </button>
          <button 
            className={`type-button ${conversionType === 'fiat-to-crypto' ? 'active' : ''}`}
            onClick={() => {
              setConversionType('fiat-to-crypto')
              setFromCurrency('usd')
              setToCurrency('bitcoin')
            }}
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
              placeholder={`Enter amount in ${conversionType.includes('fiat') ? 'fiat' : 'crypto'}`}
              required
              step="any"
              min="0"
            />
            <select
              value={fromCurrency}
              onChange={(e) => setFromCurrency(e.target.value)}
            >
              {(conversionType === 'fiat-to-fiat' || conversionType === 'fiat-to-crypto') ? (
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

          <div className="swap-icon">
            <span>↓</span>
          </div>

          <div className="input-group">
            <select
              value={toCurrency}
              onChange={(e) => setToCurrency(e.target.value)}
            >
              {(conversionType === 'fiat-to-fiat' || conversionType === 'crypto-to-fiat') ? (
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
                {amount} {conversionType.includes('fiat') 
                  ? fromCurrency.toUpperCase()
                  : selectedFromCrypto?.symbol || fromCurrency.toUpperCase()
                } = {' '}
                {formatCurrency(result.result, toCurrency)}
              </p>
              <p className="rate">
                1 {conversionType.includes('fiat') 
                  ? fromCurrency.toUpperCase()
                  : selectedFromCrypto?.symbol || fromCurrency.toUpperCase()
                } = {formatCurrency(result.rate, toCurrency)}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
