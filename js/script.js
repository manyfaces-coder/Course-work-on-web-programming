

const form = document.getElementById('form');
form.addEventListener('submit', get_solution);

let max_a = form.querySelector('[name="max_a"]')
let max_b = form.querySelector('[name="max_b"]')
let max_c = form.querySelector('[name="max_c"]')

let goal_a = form.querySelector('[name="goal_a"]')
let goal_b = form.querySelector('[name="goal_b"]')
let goal_c = form.querySelector('[name="goal_c"]')


let answer = document.createElement('p')
answer.style.cssText = "font-size: 20px; font-family: 'Press Start 2P', cursive; \
display: flex;justify-content: center; line-height: 35px;"
form.append(answer)

function get_solution(event) {
    event.preventDefault()
    let volumeOfPitchers = [max_a.value, max_b.value, max_c.value]
    let status_goals = [goal_a.value, goal_b.value, goal_c.value]
    let result = main(volumeOfPitchers, status_goals)
    if (result != null) {
        answer.innerHTML = result
    }
}


function main(all_volumes, goal_volumes) {

    let dict = new Object()
    let unique_combinations = new Set()     // множество уникальных комбинаций для проверки
    let combinations_to_calculate = []      // комбинации на проверку и для расчета новых
    let all_results = new Array();          //Список для вывода всех комбинаций 
    let initial_comb = 0                    //Переменная для хранения изначального состояния кувшинов
    let arr_transfusions = []               //Список для хранения переливаний
    let combination_key = 0

    //Создание изначального наполнения кувшинов
    initial_comb = create_initial_filling(all_volumes, dict, unique_combinations, combinations_to_calculate)
    //Расчет всех комбинаций 
    do {
        combination_key = calc_new_combs(all_volumes, combinations_to_calculate, dict, combination_key, unique_combinations, arr_transfusions)
        //ДОСТАЕМ НОВЫЕ КОМБИНАЦИИ ИЗ СЛОВАРЯ ДЛЯ ДАЛЬНЕЙШИХ РАСЧЕТОВ 
        get_comb(dict, combination_key, combinations_to_calculate)

    } while (combinations_to_calculate.length != 0)

    display_all_combinations(arr_transfusions, all_results, initial_comb)
    res = search_results(all_results, goal_volumes)
    return res

}

//функция для вывода всех возможны комбинаций в консоль
function display_all_combinations(arr_transfusions, all_results, comb) {  
    let counter = arr_transfusions.length //счетчик для обратного прохода
    do {
        let dispaly = []
        let combination = arr_transfusions[counter - 1][0]
        for (let i = arr_transfusions.length - 1; i > 0; i--) {
            for (let j = 0; j < arr_transfusions[i].length; j++) {
                if (arr_transfusions[i][j].includes(combination)) {
                    combination = arr_transfusions[i][0]
                    dispaly.unshift(combination)
                }
            }
        }
        dispaly.unshift(comb.join(' '))
        all_results.unshift(dispaly)
        counter -= 1
    } while (counter != 0)
    for (let i = 0; i < all_results.length; i++) {
        console.log(all_results[i].join(' --> '))
    }
}

function search_results(all_results, goal_volumes) {
    let goal = goal_volumes.join(' ')
    let res = 0
    let cons = ''
    let full_comb = ''
    for (let i = 0; i < all_results.length; i++) {
        for (let j = 0; j < all_results[i].length; j++) {
            if (all_results[i][j] == goal) {
                res = 1
                cons = all_results[i].length - 1
                if (cons != 0) {
                    full_comb = all_results[i].join(' --> ')
                    return "Минимальное количество операций: " + cons + "<br>" + "Комбинация: " + full_comb
                }
                return "Нет решения"
            }
        }
    }
    if (res == 0) {
        return "Нет решения"
    }
}

function get_comb(dict, counter, combinations_to_calculate) {
    for (let i = 0; i < dict[counter].length; i++) {
        comb = (dict[counter][i])
        combinations_to_calculate.unshift(comb)
    }
}

function create_initial_filling(volumes, dict, unique_combinations, combinations_to_calculate) {
    let arr = []
    for (let i = 0; i < volumes.length - 1; i++) {
        arr.push(0)
    }
    arr.push(volumes[volumes.length - 1])

    dict['0'] = arr.join(' ')
    unique_combinations.add(arr.join(' '))
    combinations_to_calculate.push(arr)

    return arr
}

function calc_new_combs(all_volumes, combinations_to_calculate, dict, combination_key, unique_combinations, arr_transfusions) {
    let calc = combinations_to_calculate.pop() //литраж кувшинов перед переливанием
    let new_combs_arr = [] //новая комбинация
    let arr = [] //массив для добавления комбинаций в словарь
    let transfusion = [] //массив для хранения возможных комбинаций переливаний
    let show_transition = 0 //переменная для показа переливания
    transfusion.push(calc.join(' ')) //
    combination_key += 1
    dict[combination_key] = arr

    for (let i = 0; i < all_volumes.length; i++) {

        for (let j = 0; j < all_volumes.length; j++) {

            if (i != j) {
                possible = possible_pour(Number(calc[i]), Number(calc[j]), all_volumes[j])

                if (possible == true) {

                    res_pour = pour_water(Number(calc[i]), Number(calc[j]), all_volumes[j])
                    //если при переливании получилась новая комбинация добавляем ее в список
                    new_comb = add_new_comb(calc, dict, new_combs_arr, res_pour, i, j, combination_key, unique_combinations)
                    if (new_comb != false) {
                        show_transition = '--> ' + new_comb
                    }
                    new_comb = false
                }
                if (show_transition != 0) {
                    transfusion.push(show_transition.replace(/,/g , " "))
                    show_transition = 0
                }
            }

        }
    }

    arr_transfusions.push(transfusion)
    return combination_key
}

function possible_pour(from_, in_, max_vol) {
    if (from_ != 0 && in_ != max_vol) {//если кувшин ИЗ которого переливаем не пустой и кувшин В который переливаем не заполнен до конца
        return true
    }
}

function pour_water(from_, in_, max_vol) {
    //согласно условииям
    let liters_transfusion = Math.min(max_vol - in_, from_)//если колич. литров до максимального наполнения кувшина №1 меньше чем колич.
    //литров в кувшине №2, выбираем колич. литров до макс. наполнения и наоборот
    from_ -= liters_transfusion
    in_ += liters_transfusion
    return [from_, in_]
}

function add_new_comb(comb, dict, new_combs_arr, res_pour, i, j, combination_key, unique_combinations) {
    let new_comb = "";
    //ПОСЛЕ РАССЧЕТА
    for (let k = 0; k < comb.length; k++) {
        if (k == i) {
            new_comb += " " + res_pour[0];
        } else if (k == j) {
            new_comb += " " + res_pour[1];
        } else {
            new_comb += " " + comb[k];
        }
    }
    
    new_comb = (new_comb.trimStart()).split(' ')
    if (checking_new_combination(new_comb.join(' '), unique_combinations) == true) {
        new_combs_arr.push(new_comb)
        dict[combination_key] = new_combs_arr
        return new_comb
    }
    return false
}

function checking_new_combination(new_combination, unique_combinations) {
    if (unique_combinations.has(new_combination) != true) {
        unique_combinations.add(new_combination)
        return true
    }
    return false
}

