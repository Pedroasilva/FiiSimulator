let balance = 0;
let earningsPerSecond = 0;
let investimentos = [];
let investimentosList = [];
let dia = localStorage.getItem('dia') || 0;

const balanceElement = document.getElementById('balance');
const earningsPerSecondElement = document.getElementById('earningsPerSecond');

const Toast = Swal.mixin({
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
      toast.onmouseenter = Swal.stopTimer;
      toast.onmouseleave = Swal.resumeTimer;
    }
  });

function loadGame() {
    const savedBalance = localStorage.getItem('balance');
    const savedEarningsPerSecond = localStorage.getItem('earningsPerSecond');
    const savedInvestments = localStorage.getItem('investments');
    const allInvestments = localStorage.getItem('allInvestments');

    if (allInvestments === null) {
        localStorage.setItem('allInvestments', fundos);
    }

    investimentosList = JSON.parse(allInvestments);

    if (savedBalance !== null) {
        balance = parseFloat(savedBalance);
    }

    if (savedEarningsPerSecond !== null) {
        earningsPerSecond = parseFloat(savedEarningsPerSecond);
    }

    if (savedInvestments !== null) {
        investimentos = JSON.parse(savedInvestments);
    }

    let fundosReais = JSON.stringify(investimentosList.filter((fundo) => fundo.rendimento !== 'N/A' && fundo.cota !== 'N/A'));
    investimentosList = JSON.parse(fundosReais);
    localStorage.setItem('allInvestments', fundosReais);

    document.getElementById('progressBar').innerHTML = "Dia "+dia;
}

function saveGame() {
    localStorage.setItem('balance', balance.toFixed(2));
    localStorage.setItem('earningsPerSecond', earningsPerSecond.toFixed(2));
    localStorage.setItem('investments', JSON.stringify(investimentos));
}

function hardReset() {
    localStorage.clear();
    balance = 0;
    dia = 0;
    earningsPerSecond = 0;
    investimentos = [];
    updateDisplay();
}

function closeAllModals() {
    document.getElementById('confirmModal').style.display = 'none';
    document.getElementById('settingsModal').style.display = 'none';
    document.getElementById('investmentConfigModal').style.display = 'none';
}

function searchFundoImobiliario(tickerBusca) {
    const fundo = investimentosList.find((fundo) => fundo.ticker === tickerBusca);

    if (fundo) {
        return fundo;
    } else {
        Toast.fire({
            icon: "error",
            title: "Fundo imobiliário não encontrado."
        });
        return false;
    }
}

function addCustomInvestment(ticker) {
    try {
        const fundo = searchFundoImobiliario(ticker);

        if (!fundo) {
            return;
        }

        const existingInvestment = investimentos.find((investment) => investment.ticker === ticker);
        if (existingInvestment) {
            Toast.fire({
                icon: "error",
                title: "Investimento já adicionado."
            });
            return;
        }

        const customInvestment = {
            ticker: ticker,
            name: `${ticker}`,
            description: `Rendimento: R$ ${fundo.rendimento} Cota: R$ ${fundo.cota}`,
            rendimento: parseFloat(fundo.rendimento.replace(',', '.')),
            value: parseFloat(fundo.cota.replace(',', '.')),
            quantity: 0,
        };

         investimentos.push(customInvestment);

         updateDisplay(); 
         saveGame();
 
         document.getElementById('tickerInput').value = '';

    } catch (error) {
        console.error(error.message);
    }
}

document.getElementById('addCustomInvestment').addEventListener('click', function() {
    const ticker = document.getElementById('tickerInput').value.toUpperCase();
    addCustomInvestment(ticker);
});

document.getElementById('settingsButton').addEventListener('click', () => {
    document.getElementById('settingsModal').style.display = 'block';
});
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('settingsModal').style.display = 'none';
});
document.getElementById('hardResetButton').addEventListener('click', () => {
    document.getElementById('confirmModal').style.display = 'block';
});
document.getElementById('closeConfirmModal').addEventListener('click', () => {
    closeAllModals();
});
document.getElementById('confirmReset').addEventListener('click', () => {
    hardReset();
    closeAllModals();
});

document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
        closeAllModals();
    }
});

document.getElementById('workButton').addEventListener('keypress', function (e) {
    console.log(e.key);
    if (e.key === 'Enter') {
        return;
    }
});

document.getElementById('workButton').addEventListener('click', work);

document.getElementById('tickerInput').addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
        document.getElementById('addCustomInvestment').click();
    }
});

function saveInvestments() {
    localStorage.setItem('investimentosList', JSON.stringify(investimentosList));
}

document.getElementById('configInvestmentList').addEventListener('click', () => {

    document.getElementById('settingsModal').style.display = 'none';
    
     let investmentListHTML = `
     <h3>Adicionar Novo Investimento</h3>
     <div class="investment-form">
         <input type="text" id="newTicker" placeholder="Ticker">
         <input type="text" id="newRendimento" placeholder="Rendimento">
         <input type="text" id="newCota" placeholder="Cota">
         <button class="add-button" onclick="addInvestment()">Adicionar</button>
     </div>`;

    investmentListHTML += '<h3>Lista de Investimentos</h3>';
    investimentosList.forEach((investment, index) => {
        investmentListHTML += `
            <div class="investment-item">
                <span class="investment-text"><a target="_blank" href="https://investidor10.com.br/fiis/${investment.ticker}/">${investment.ticker}</a> - Rendimento: ${investment.rendimento} - Cota: ${investment.cota}</span>
                <div class="investment-buttons">
                    <button class="delete-button" onclick="deleteInvestment(${index})">Deletar</button>
                    <button class="edit-button" onclick="editInvestment(${index})">Alterar</button>
                </div>
            </div>`;
    });

    document.getElementById('investmentConfigContainer').innerHTML = investmentListHTML;
    document.getElementById('investmentConfigModal').style.display = 'block';
});

window.deleteInvestment = function(index) {
    investimentosList.splice(index, 1);
    saveAndUpdate();
};

window.editInvestment = function(index) {
    const newTicker = prompt('Novo Ticker:', investimentosList[index].ticker);
    const newRendimento = prompt('Novo Rendimento:', investimentosList[index].rendimento);
    const newCota = prompt('Nova Cota:', investimentosList[index].cota);
    if (newTicker && newRendimento && newCota) {
        investimentosList[index].ticker = newTicker;
        investimentosList[index].rendimento = newRendimento;
        investimentosList[index].cota = newCota;
        saveAndUpdate();
    }
};

window.addInvestment = function() {
    const newTicker = document.getElementById('newTicker').value.toUpperCase();
    const newRendimento = document.getElementById('newRendimento').value;
    const newCota = document.getElementById('newCota').value;
    if (newTicker && newRendimento && newCota) {
        investimentosList.push({
            ticker: newTicker,
            rendimento: newRendimento,
            cota: newCota
        });
        saveAndUpdate();
    }
};

function saveAndUpdate() {
    saveInvestments();
    document.getElementById('configInvestmentList').click();
}

document.getElementById('closeInvestmentConfigModal').addEventListener('click', () => {
    document.getElementById('investmentConfigModal').style.display = 'none';
});


window.addEventListener('click', (event) => {
    const modal = document.getElementById('settingsModal');
    const confirmModal = document.getElementById('confirmModal');
    if (event.target === modal) {
        closeAllModals();
    }
    if (event.target === confirmModal) {
        closeAllModals();
    }
});

function buy(investment) {
    try {
        if (balance >= investment.value) {
            balance -= investment.value;
            investment.quantity++;

            $("#logs").prepend(`<p>Dia ${dia}: comprou 1 cota de ${investment.ticker} por R$ ${investment.value}</p>`);

            Toast.fire({
                icon: "success",
                title: "Ativo comprado com sucesso."
            });
            
            updateDisplay();
            saveGame();
        } else {
            Toast.fire({
                icon: "error",
                title: "Saldo insuficiente para realizar este ativo."
            });
            return;
        }
    } catch (error) {
        console.error(error.message);
    }
}

function work() {
    balance += 54.6;
    updateDisplay();
    saveGame();
}

function updateDisplay() {
    const customInvestmentsElement = document.getElementById('customInvestments');
    customInvestmentsElement.innerHTML = '';

    investimentos.forEach((investment) => {
        const investmentContainer = document.createElement('div');
        investmentContainer.className = 'investment-container';

        const investmentInfo = document.createElement('div');
        investmentInfo.innerHTML = `<a target="_blank" href="https://investidor10.com.br/fiis/${investment.name}/">${investment.name}</a> - ${investment.description}`;
        investmentInfo.className = 'investment-info';
        investmentContainer.appendChild(investmentInfo);

        const sellButton = document.createElement('button');
        sellButton.textContent = '-';
        sellButton.className = 'sell-button';
        sellButton.dataset.ticker = investment.ticker;
        if (investment.quantity === 0) {
            sellButton.textContent = 'X';
            sellButton.className = 'delete-button';
            sellButton.addEventListener('click', () => deleteInvestmentBuyed(investment));
        }else{
            sellButton.addEventListener('click', () => sell(investment));
        }

        const buyButton = document.createElement('button');
        buyButton.textContent = '+';
        buyButton.className = 'buy-button';
        buyButton.dataset.ticker = investment.ticker;
        if (balance < investment.value) {
            buyButton.classList.add('insufficient-balance');
        }
        buyButton.addEventListener('click', () => buy(investment));

        const quantityDiv = document.createElement('div');
        quantityDiv.textContent = `Quantidade: ${investment.quantity || 0}`;
        quantityDiv.className = 'quantity-div';

        quantityDiv.appendChild(buyButton);
        quantityDiv.prepend(sellButton);

        investmentContainer.appendChild(quantityDiv);

        customInvestmentsElement.appendChild(investmentContainer);
    });

    balanceElement.textContent = balance.toFixed(2);
    earningsPerSecondElement.textContent = earningsPerSecond.toFixed(2);
}

function sell(investment) {
    try {
        if (investment.quantity > 0) {
            balance += investment.value;
            investment.quantity--;

            $("#logs").prepend(`<p>Dia ${dia}: vendeu 1 cota de ${investment.ticker} por R$ ${investment.value}</p>`);
            
            updateDisplay();
            saveGame();
        } else {
            Toast.fire({
                icon: "error",
                title: "Você não possui este ativo para vender."
            });
            return;
        }
    } catch (error) {
        console.error(error.message);
    }
}

function deleteInvestmentBuyed(investment) {
    try {
        const index = investimentos.findIndex((item) => item.ticker === investment.ticker);
        investimentos.splice(index, 1);

        updateDisplay();
        saveGame();
    } catch (error) {
        console.error(error.message);
    }
}

function calculateEarnings() {
    let totalEarnings = 0;
    investimentos.forEach((investment) => {
        totalEarnings += investment.rendimento * (investment.quantity || 0);

        let total = investment.rendimento * (investment.quantity || 0);
        total = total.toFixed(2);

        if(total>0){
            $("#logs").prepend(`<p>Mês ${dia/30}: recebeu R$ ${total} de ${investment.quantity} cotas de ${investment.ticker}</p>`);
        }
    });

    $("#logs").prepend(`<p class="color-green">Mês ${dia/30}: recebeu total de R$ ${totalEarnings.toFixed(2)}</p>`);

    return totalEarnings;
}

function updateEarningsPerSecond() {
    earningsPerSecond = calculateEarnings();
    balance += earningsPerSecond;
    saveGame();
    updateDisplay();
}

function run() {
    setInterval(() => {
        dia++;
        localStorage.setItem('dia', dia);

        if(dia % 30 === 0){
            Toast.fire({
                icon: "success",
                title: "Mês "+(dia/30)
            });
        }

        document.getElementById('progressBar').innerHTML = "Dia "+dia;
        if(dia % 30 === 0){
            updateEarningsPerSecond();
        }
    }, 500);
}

loadGame();
updateDisplay();
run();
