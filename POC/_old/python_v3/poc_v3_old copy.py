import json
from poc_lib_v3 import rising, end_transaction, rapid_falling, stops, reduce_from, price_check

from poc_lib_v3 import DATE, BETWEEN

stocks = ['WHITF','TAL','CEIX','HKD','APE','MSFT','AFRM','COIN','TWLO','WEGE3.SA']
for stock in stocks:

#### leitura de arquivo
    file = open(f'grabber/stock_data/{stock}.json')
    fluctuation = json.load(file)

#### variaveis externas
    holding = False
    resonable = False
    index = -1
    possitive_counter = 0
    negative_counter = 0
    founds = 1000
    curr_founds = 1000
    number_of_transacitons = 0
    curr_founds_bellow_1000 = []
    buys_and_sells = []
    possitive_fluctuations = []
    negative_fluctuations = []
    close_values = []
    trade_count = 0
    last_sell = 0
    holded = [100000, 1000000]

#### coleta de flutuações
    for date in fluctuation:
        close_values.append(round(date["price"], 4))

#### mais variaveis
    min_fluct = round(close_values[0]) * 0.01
    prev_fluct = close_values[0]
    OPENING_PRICE = close_values[0]
    total = len(close_values)
    break_point = int(total * 0.85)

############ ------------ Action starts here ------------ ############ 
    for curr_fluct in close_values:

#### ignora flutuação sem mudança real de valor
        index += 1
        if round(prev_fluct, 4) == round(curr_fluct, 4):
            continue 

#### variaveis internas
        if holding:
            curr_founds = reduce_from(curr_fluct, holded) + founds
        else:
            curr_founds = founds

        if curr_founds < 1000:
            curr_founds_bellow_1000.append(index)

        if prev_fluct < curr_fluct:
            possitive_fluctuations.append((index, curr_fluct))
            possitive_counter += 1
        else:
            negative_fluctuations.append((index, curr_fluct))
            negative_counter += 1 

#### bloqueios
    #### verifica se o ativo é rasoavel para investimento, subindo
        if not resonable:
            prev_fluct = curr_fluct
            if possitive_counter >= 5 and rising(possitive_fluctuations):
                resonable = True
            continue

    #### 1° stop-less, passou o bloqueio mas verifica se nao esta caindo muito Rapido
        # ativo caindo e algum lucro ja foi feito
        if len(curr_founds_bellow_1000) > 15:
            last_three = [curr_founds_bellow_1000[-3],curr_founds_bellow_1000[-2],curr_founds_bellow_1000[-1]]
            if rapid_falling(curr_founds_bellow_1000) and curr_founds >= 1000:
                buys_and_sells.append(('v_c_m', index))
                print('vendeu e saiu Correndo de medo, segurando na flutação de n° '+ str(index) + BETWEEN + str(total) + DATE)
                founds = curr_founds
                print(buys_and_sells)
                break;

#### breaks 
    #### ganho suficiente 
        # 0.6 de lucro
        if not holding and curr_founds >= 1006:
            buys_and_sells.append(('v_c_s', index))
            print('vendeu e saiu Correndo rapido, sem segurar na flutação de n° '+ str(index) + BETWEEN + str(total) + DATE)
            founds = curr_founds
            number_of_transacitons += 1
            print(buys_and_sells)
            break;

        # 0.6 de lucro
        if not holding and curr_founds >= 1003:
            buys_and_sells.append(('v_c_s_2', index))
            print('vendeu e saiu Correndo rapido (2), sem segurar na flutação de n° '+ str(index) + BETWEEN + str(total) + DATE)
            founds = curr_founds
            number_of_transacitons += 1
            print(buys_and_sells)
            break;

        # 0.5 de lucro
        elif holding and curr_founds >= 1005: #or (index == 29 and stock == 'COIN'):
            buys_and_sells.append(('v_c_c', index))
            print('vendeu e saiu Correndo rapido, segurando na flutação de n° '+ str(index) + BETWEEN + str(total) + DATE)
            founds, holded, number_of_transacitons = end_transaction(holded, founds, curr_fluct, number_of_transacitons, buys_and_sells)
            break;
        
        # 0.5 de lucro
        elif holding and curr_founds >= 1002: #or (index == 29 and stock == 'COIN'):
            buys_and_sells.append(('v_c_c_2', index))
            print('vendeu e saiu Correndo rapido (2), segurando na flutação de n° '+ str(index) + BETWEEN + str(total) + DATE)
            founds, holded, number_of_transacitons = end_transaction(holded, founds, curr_fluct, number_of_transacitons, buys_and_sells)
            break;

    #### quase acabando dia
        # passou 75% do tempo
        elif stops(holding, index, 0.75, break_point, curr_fluct, holded, curr_founds, 1040):
            buys_and_sells.append(('v_m_r', index))
            # venda
            print('vendeu e saiu muito rapido, na flutação de n° '+ str(index) + BETWEEN + str(total) + DATE)
            founds, holded, number_of_transacitons = end_transaction(holded, founds, curr_fluct, number_of_transacitons, buys_and_sells)
            break;

        # passou 85% do tempo
        elif stops(holding, index, 0.85, break_point, curr_fluct, holded, curr_founds, 1030):
            buys_and_sells.append(('v_r', index))
            # venda
            print('vendeu e saiu rapido, na flutação de n° '+ str(index) + BETWEEN + str(total) + DATE)
            founds, holded, number_of_transacitons = end_transaction(holded, founds, curr_fluct, number_of_transacitons, buys_and_sells)
            break;
        
        # passou 95% do tempo
        elif holding and index >= break_point:
            buys_and_sells.append(('v_u_s', index))
            if len(holded) >= 1:
                founds += reduce_from(curr_fluct, holded)
            print('vendeu no ultimo segundo, na flutação de n° ' + str(index) + BETWEEN + str(total) + DATE)
            print(buys_and_sells)
            break;

        # passou 95% do tempo com bolso vazio
        elif ~holding and index >= break_point:
            buys_and_sells.append(('v_s_v', index))
            print('fechou sem precisar vender')
            print(buys_and_sells)
            break;

#### comportamento padrão
        # venda
        if holding and 0 < len(holded):
            if round(curr_fluct, 4) >= round(holded[0], 4):
                trade_count += 1
                last_sell = holded[0]
                possitive_fluctuations.append((index, curr_fluct))
                buys_and_sells.append(('v', index))
                founds += reduce_from(curr_fluct, holded)
                holded.clear()
                curr_founds = founds
                holding = False
                number_of_transacitons += 1

        # compra
        elif not holding and prev_fluct < curr_fluct:
            trade_count += 1

        #### TODO: treicho de codigo abaixo pode ser nescessario, porem precisamos de maior validação 
          # 
            # if trade_count >= 3 and curr_fluct - prev_fluct < min_fluct:
            #     continue;
            
            possitive_fluctuations.append((index, curr_fluct))
            buys_and_sells.append(('c', index))
            holded.clear()
            while (founds >= curr_fluct):
                holded.append(curr_fluct)
                founds -= curr_fluct
            holding = True
            number_of_transacitons += 1
            curr_founds = reduce_from(curr_fluct, holded) + founds

#### 2° stop-less
    ### change de stop-less
        # caso tenha algo comprado
        elif holding:
            curr_possivle_win = curr_founds - 1000
            last_win = curr_founds - 1000 
            # compara se o lucro atual com anterior
            if curr_founds > 1000 and curr_possivle_win <= last_win * 0.9:
                founds = curr_founds
                curr_founds = founds
                holding = False
                buys_and_sells.append(('v_s_1', index))
                holded.clear()
                print(buys_and_sells)

            # verifica se esta negativado
            elif curr_founds <= curr_founds * 0.95 or curr_founds <= 998.5:
                founds = curr_founds
                curr_founds = founds
                holding = False
                buys_and_sells.append(('v_s_2', index))
                holded.clear()
                print(buys_and_sells)

        # vendido e negativado
        elif not holding and founds <= 998.5:
            buys_and_sells.append('PANIC!', str(index))
            print(buys_and_sells)
            break;

#### atualiza flutuação anterior
        prev_fluct = curr_fluct

############ ------------ Action ends here ------------ ############ 

#### imprime resultados
    founds = round(founds, 4)

    buy = 0
    sell = 0
    for buy_or_sell in buys_and_sells:
        if(buy_or_sell[0].split(' ')[0] == 'c' or buy_or_sell[0].split('_')[0] == 'c'):
            buy = buy_or_sell[1]
        if(buy_or_sell[0].split(' ')[0] == 'v'):
            sell = buy_or_sell[1]
        if sell - buy >= total/10:
            print('melhorar')
            print(buy, sell)

    print(f'resultados para referente a ações da {stock} no dia 28/12/2022')
    print(f'total tivemos {total} flutuações deste ativo no dia')
    if founds > 1000:
        print(f'{founds} lucro, {round(founds - 1000, 4)}')
    if founds == 1000:
        print('deu na mesma')
    if founds < 1000 and founds > 0:
        print(f'{founds} prejuizo, perdemos {round(founds - 1000, 4)}')
    if founds <= 0:
        print('ta tudo errado')
    print(f'numero de transações feitas para estes dados {number_of_transacitons}\n\n\n')

    