import json
from functools import reduce

file = open('poc_v1.json')

fluctuation = json.load(file)

founds = 1000
holding = False
holded = [100000, 1000000]

number_of_transacitons = 0

close_values = []
for date, data in fluctuation["time_series_freq_1min"].items():
    close_values.append(float(data["4. close"]))
start_fluct = close_values[0]

index = 0
resonable = False
resonable_counter = 0

fluct_len = len(close_values)
breakpoint = fluct_len * 0.85

for fluct in close_values:
    index += 1

    # ignora flutuação sem mudança real de valor
    if start_fluct == fluct:
        continue 
    curr_fluct = fluct

    # verifica se o ativo é rasoavel para investimento
    if ~resonable:
        if start_fluct < curr_fluct:
            resonable_counter += 1        
        if resonable_counter >= 5:
            resonable = ~resonable
        start_fluct = curr_fluct
        continue

    if index == int(breakpoint * 0.85) and holding and curr_fluct >= holded[0]:
        # venda
        founds += reduce(lambda x, y: x + curr_fluct, holded)
        print('vendeu \n'+ str(index))
        holded.clear()

        holding = ~holding
        number_of_transacitons += 1
        break;
    elif index == breakpoint:
        if len(holded) > 1:
            founds += reduce(lambda x, y: x + curr_fluct, holded)
        print('vendeu' + str(index))
        break;

    if curr_fluct == start_fluct:
        continue

    # venda
    if holding and curr_fluct >= holded[0]:
        founds += reduce(lambda x, y: x + curr_fluct, holded)
        print('vendeu \n'+ str(index))
        holded.clear()

        holding = ~holding
        number_of_transacitons += 1

    # compra
    elif ~holding and start_fluct < curr_fluct:
        holded.clear()
        print('comprou \n'+ str(index))
        while (founds >= curr_fluct):
            holded.append(curr_fluct)
            founds -= curr_fluct

        holding = ~holding
        number_of_transacitons += 1

    start_fluct = curr_fluct

# founds += reduce(lambda x, y: x + y, holded)

print('resultados para referente a ações da AAPL(Apple) no dia 23/12/2022')

if founds > 1000:
    print(f'{founds} lucro, {founds - 1000}')
if founds == 1000:
    print('deu na mesma')
if founds < 1000 and founds > 0:
    print(f'{founds} prejuizo, perdemos {1000 - founds}')
if founds <= 0:
    print('ta tudo errado')

print(f'numero de transações feitas para estes dados {number_of_transacitons}')
