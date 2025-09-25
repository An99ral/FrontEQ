
export const dividir = (a: number): number => {
  if (a === 0) {
    throw new Error('Division by zero is not allowed')
  }
  return a / 1000000
}
export default dividir
export const multiplicar = (a: number): number => {
  return a * 1000000
} 