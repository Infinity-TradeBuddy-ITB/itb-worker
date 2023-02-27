# Descricao do Script Lua

## O código Lua fornecido inclui vários indicadores e regras para determinar sinais de compra e venda:

- Ele usa médias móveis para suavizar os dados de preços e identificar tendências.
  - simples, (**SMA** - `simple moving avarege`)
    - rápida e lenta
  - e ponderada (**WMA** - `weighted moving average`)
- O código calcula duas médias móveis:
  - uma com um período mais rápido,
  - e outra com um período mais lento,
    - em seguida, subtrai para obter a diferença entre elas.
- A diferença é usada para calcular uma WMA, conhecida como linha de sinal, que é usada para confirmar ou negar sinais de negociação.
- O código gera sinais de compra e venda com base na relação entre as médias móveis e a linha de sinal.
- As regras são:
  - para sinal de compra:
    - quando a média móvel rápida cruzar acima da média móvel lenta e a diferença entre elas for **maior** que o valor da linha de sinal
  - para sinal de venda:
    - quando a média móvel rápida cruzar abaixo da média móvel lenta e a diferença entre elas for **menor** que o valor da linha de sinal.
- Por fim, a função `plot_shape()` é usada para plotar os sinais de compra e venda no gráfico.
