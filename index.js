import express from 'express';
import historicoInflacao from './dados/dados.js';

const app = express();

app.get('/historicoIPCA', (req, res) => {
    const ano = Number(req.query.ano);
    
    if (!isNaN(ano)) {
        //filter retorna mútiplos elementos do array

        if(ano < 2015 || ano > 2023) {
            return res.status(400).json({erro:"Nenhum histórico encontrado para o ano especificado"});
       
        } else {
            const resultados = historicoInflacao.filter(historico => historico.ano === ano);
            res.json(resultados);
        }

        } else {
        res.json(historicoInflacao);
    }
});

app.get('/historicoIPCA/calculo', (req, res) => {
    // Pegando os parâmetros da query string
    const valor = Number(req.query.valor);
    const mesInicial = Number(req.query.mesInicial);
    const anoInicial = Number(req.query.anoInicial);
    const mesFinal = Number(req.query.mesFinal);
    const anoFinal = Number(req.query.anoFinal);

    // Verificação básica para garantir que todos os dados são válidos
    if (isNaN(valor) || isNaN(mesInicial) || isNaN(anoInicial) || isNaN(mesFinal) || isNaN(anoFinal)) {
        
        return res.status(400).json({erro: "Parâmetros invalidos"});
    }


    // Converter o ano e mês inicial e final para um número do tipo AAAAMM (ex: 201501 para jan/2015)
    const dataInicial = anoInicial * 100 + mesInicial;
    const dataFinal = anoFinal * 100 + mesFinal;

    if(dataInicial > dataFinal || dataInicial < 201501 || dataInicial > 202312 || dataFinal < 201501 || dataFinal > 202312) {
        return res.status(400).json({erro: "Parâmetros invalidos"});
    }

    // Filtra os dados do IPCA para pegar somente os meses dentro do intervalo solicitado
    const periodo = historicoInflacao.filter(item => {
        const dataItem = item.ano * 100 + item.mes;
        return dataItem >= dataInicial && dataItem <= dataFinal;
    });

    // Aplica o cálculo do reajuste com base no IPCA mês a mês
    // Fórmula: valor * (1 + ipca1/100) * (1 + ipca2/100) * ... * (1 + ipcaN/100)
    let resultado = valor;
    periodo.forEach(item => {
        resultado *= (1 + item.ipca / 100);
    });

    // Retorna o valor reajustado e os dados usados para o cálculo
    res.json({
        valorOriginal: valor, 
        valorReajustado: resultado.toFixed(2), 
        mesesConsiderados: periodo
    });

});

app.get('/historicoIPCA/:id', (req, res) => {
    const id = Number(req.params.id);
    // find retorna apenas um unico objeto/elemento do array           
    const resultado = historicoInflacao.find(historico => historico.id === id);
    
    if(resultado) {
        res.json(resultado);
    } else {
        res.status(404).json({mensagem: "id não encontrado"})
    }
});

app.listen(8080, () => {
    console.log("Servidor iniciado na porta 8080");
});

