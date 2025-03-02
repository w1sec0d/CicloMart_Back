const calculateFee = (category, price) => {
  let fee = 0

  if (category === 'bicicleta') {
    if (price <= 299999) {
      fee = price * 0.04
    } else if (price >= 300000 && price <= 1999999) {
      fee = price * 0.03
    } else if (price >= 2000000 && price <= 9999999) {
      fee = price * 0.02
      if (fee > 250000) {
        fee = 250000
      }
    } else if (price >= 10000000) {
      fee = 250000 + (price - 10000000) * 0.01
    }
  } else if (category === 'componente') {
    if (price <= 49999) {
      fee = 2000
    } else if (price >= 50000 && price <= 99999) {
      fee = 3000
    } else if (price >= 100000 && price <= 999999) {
      fee = price * 0.03
    } else if (price >= 1000000 && price <= 2000000) {
      fee = price * 0.03
      if (fee > 50000) {
        fee = 50000
      }
    }
  } else {
    fee = 0
    console.error('Error: Categoria no válida')
  }

  return fee
}

module.exports = calculateFee
