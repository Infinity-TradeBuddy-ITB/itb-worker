instrument {
    name = "RICK TRADER ACADEMY",
    icon = 'https://lh3.googleusercontent.com/ogw/ADea4I65OapvF7ZOUMZc_3J4Yx__qVmvJD_jgzr4p8MZNks=s32-c-mo',
    overlay = true
}

local function set_high() -- high
    local do_series = make_series()
    local second_high = high[2]

    if not get_value(c) then
        return do_series
    end

    local d = ( 
        (high <= second_high) and 
        (high[1] <= second_high) and 
        (high[3] <= second_high) and 
        (high[4] <= second_high)
    );
    
    do_series:set(
        iff(d, second_high, do_series[1])
    )

    return do_series
end

local function set_low() -- low
    local do_series = make_series()
    local second_low = low[2]

    if not get_value(second_low) then
        return do_series
    end

    local d = ( 
        (low >= second_low) and 
        (low[1] >= second_low) and 
        (low[3] >= second_low) and 
        (low[4] >= second_low)
    );

    do_series:set(
        iff(d, second_low, do_series[1])
    )
    
    return do_series
end

input_group {
    "Color",
    color = input {
        default = "white",
        type = input.color
    },
    width = input {
        default = 1,
        type = input.line_width
    }
}
h = set_high()
l = set_low()
hline(h, "High", color, high_width)
hline(l, "Low", color, width)
hline(highest(10)[1], "HH10", color, 1)
hline(lowest(10)[1], "LL10", color, 1)
hline(highest(30)[1], "HH30", color, 1)
hline(lowest(30)[1], "LL30", color, 1)
hline(highest(60)[1], "HH60", color, 1)
hline(lowest(60)[1], "LL60", color, 1)
hline(highest(100)[1], "HH100", color, 1)
hline(lowest(100)[1], "LL100", color, 1)
hline(highest(150)[1], "HH150", color, 1)
hline(lowest(150)[1], "LL150", color, 1)
hline(highest(200)[1], "HH200", color, 1)
hline(lowest(200)[1], "LL200", color, 1)

instrument {
    name = "RICK TRADER ACADEMY",
    icon = "indicators:ADX",
    overlay = true
}
method_id = input(1, "Type", input.string_selection, {"@RICK TRADER ACADEMY"})

instrument {
    name = 'RICK TRADER ACADEMY',
    short_name = 'super',
    icon = 'indicators:BB',
    overlay = true
}

MaFast_period = input(1, "Ma Fast period", input.integer, 1, 1000, 1)
MaValue = input(5, "Ma Value", input.string_selection, inputs.titles)

MaSlow_period = input(34, "Ma Slow period", input.integer, 1, 1000, 1)

Signal_period = input(5, "Signal period", input.integer, 1, 1000, 1)

input_group {
    "Compra",
    colorBuy = input {
        default = "green",
        type = input.color
    },
    visibleBuy = input {
        default = true,
        type = input.plot_visibility
    }
}

input_group {
    "Venda",
    colorSell = input {
        default = "red",
        type = input.color
    },
    visibleSell = input {
        default = true,
        type = input.plot_visibility
    }
}

local titleValue = inputs[MaValue]

smaFast = sma(titleValue, MaFast_period)

smaSlow = sma(titleValue, MaSlow_period)

buffer1 = smaFast - smaSlow

buffer2 = wma(buffer1, Signal_period)

buyCondition = conditional (
    (buffer1 > buffer2) and 
    (buffer1[1] < buffer2[1]) and not 
    (
        (buffer1 < buffer2) and 
        (buffer1[1] > buffer2[1])
    )
)
buyCondition = conditional (
    (buffer1 > buffer2) and 
    (buffer1[1] < buffer2[1])
)

sellCondition = conditional (
    (buffer1 < buffer2) and 
    (buffer1[1] > buffer2[1]) and not 
    (
        (buffer1 > buffer2) and 
        (buffer1[1] < buffer2[1])
    )
)
sellCondition = conditional (
    (buffer1 < buffer2) and 
    (buffer1[1] > buffer2[1])
)

plot_shape (
    (buyCondition), 
    "COMPRA AGORA!", 
    shape_style.triangleup, 
    shape_size.huge, 
    colorBuy, 
    shape_location.belowbar,
    -1, 
    "COMPRA AGORA!", 
    "white"
)

plot_shape (
    (sellCondition), 
    "VENDA AGORA!", 
    shape_style.triangledown, 
    shape_size.huge, 
    colorSell,
    shape_location.abovebar, 
    -1, 
    "VENDA AGORA!", 
    "white"
)

input_group {
    "Maxima",
    level_1_color = input {
        default = "red",
        type = input.color
    },
    level_1_width = input {
        default = 2,
        type = input.line_width
    }
}
input_group {
    "Minima",
    level_2_color = input {
        default = "green",
        type = input.color
    },
    level_2_width = input {
        default = 2,
        type = input.line_width
    }
}
local function m15(candle)
    c1 = candle.high
    c2 = candle.low
end

local methods = {m15}
local resolution = "15m"

sec = security(current_ticker_id, resolution)

if sec then
    local method = methods[method_id]
    method(sec)
    plot(c1, "C1", level_1_color, level_1_width, 0, style.levels, na_mode.continue)
end
