/**
 * ConversionRegistry — Unit Converter Factors & Computation Logic
 */
export const FACTORS = {
  Length: { mm: 0.001, cm: 0.01, m: 1, km: 1000, inch: 0.0254, foot: 0.3048, yard: 0.9144, mile: 1609.344 },
  'Weight/Mass': { mg: 0.000001, g: 0.001, kg: 1, tonne: 1000, ounce: 0.028349523125, pound: 0.45359237 },
  Area: { 'cm²': 0.0001, 'm²': 1, 'km²': 1_000_000, 'inch²': 0.00064516, 'foot²': 0.09290304, acre: 4046.8564224, hectare: 10000 },
  Volume: { ml: 0.001, litre: 1, 'm³': 1000, 'fl oz': 0.0295735, pint: 0.473176, gallon: 3.78541 },
  Speed: { 'm/s': 1, 'km/h': 5 / 18, mph: 0.44704, knot: 0.514444 }
};

export function convertTemperature(value, from, to) {
  if (from === to) return value;
  let celsius;
  if (from === '°C') celsius = value;
  else if (from === '°F') celsius = (value - 32) * 5 / 9;
  else if (from === 'K') celsius = value - 273.15;
  else return NaN;

  const kelvin = celsius + 273.15;
  if (kelvin < 0) return NaN; // Below Absolute Zero

  if (to === '°C') return celsius;
  if (to === '°F') return celsius * 9 / 5 + 32;
  if (to === 'K') return kelvin;
  return NaN;
}

export const ConversionRegistry = {
  getCategories() { return ['Length', 'Weight/Mass', 'Temperature', 'Area', 'Volume', 'Speed']; },
  getUnits(category) {
    if (category === 'Temperature') return ['°C', '°F', 'K'];
    return Object.keys(FACTORS[category] || {});
  },
  convert(value, fromUnit, toUnit, category) {
    if (fromUnit === toUnit) return value;
    if (category === 'Temperature') return convertTemperature(value, fromUnit, toUnit);
    const factors = FACTORS[category];
    if (!factors || !factors[fromUnit] || !factors[toUnit]) return NaN;
    return (value * factors[fromUnit]) / factors[toUnit];
  }
};
