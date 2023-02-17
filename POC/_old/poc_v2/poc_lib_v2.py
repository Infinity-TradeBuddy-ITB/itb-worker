from functools import reduce

DATE = ' disponiveis no dia'
BETWEEN = ' entre '

def rising(founds):
    return (
		founds[0][1] < founds[1][1] 
			or founds[1][1] < founds[2][1] 
			or founds[2][1] < founds[3][1] 
			or founds[3][1] < founds[4][1]
		and founds[0][1] < founds[2][1] 
			or founds[1][1] < founds[3][1]
		and founds[0][1] < founds[3][1] 
		and founds[0][1] < founds[4][1]
    )

def rapid_falling(curr_founds_bellow_1000):
 	return (
		curr_founds_bellow_1000[-3] == curr_founds_bellow_1000[-2] -1 
		and curr_founds_bellow_1000[-2] == curr_founds_bellow_1000[-1] -1
 	)

def end_transaction(holded, founds, curr_fluct, number_of_transacitons, buys_and_sells):
	founds += reduce_from(curr_fluct, holded)
	number_of_transacitons += 1
	print(buys_and_sells)

	return founds, holded, number_of_transacitons

def stops(holding, index, percentage, break_point, curr_fluct, holded, curr_founds, goal):
	return (
		holding and (curr_founds >= goal or (index >= int(break_point * percentage) and index <= break_point and curr_fluct > holded[0])) 
	)

def reduce_from(curr_fluct, holded):
	return reduce(lambda x, y : x + curr_fluct, holded)

def price_check(prev_fluct, curr_fluct, opening_price):
	# price = round(opening_price, 4)
	fluct = curr_fluct - prev_fluct
	# print(fluct, price* 0.01)
	return opening_price * 0.999 < opening_price - fluct
	