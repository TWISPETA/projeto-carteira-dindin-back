const conexao = require('../conexao');

const listarTransacoes = async (req, res) => {
    const { usuario } = req;

    try {
        const query = 'select *, transacoes.descricao as descricao, categorias.descricao as categoria_nome from transacoes join categorias on categorias.id = transacoes.categoria_id where usuario_id=$1';
        const transacao = await conexao.query(query, [usuario.id]);

        return res.status(200).json(transacao.rows);

    } catch (e) {
        return res.status(400).json(e.message);
    }
}

const detalharTransacao = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const query = 'select *, transacoes.descricao as descricao, categorias.descricao as categoria_nome from transacoes join categorias on categorias.id = transacoes.categoria_id where usuario_id=$1 and id=$2';
        const { rows: transacao, rowCount } = await conexao.query(query, [usuario.id, id]);

        if (rowCount > 0) {
            return res.status(200).json(transacao[0]);
        } else {
            return res.status(404).json({ mensagem: "Transação não encontrada" });
        }

    } catch (e) {
        return res.status(400).json({ mensagem: "Transação não encontrada" });
    }
}

const cadastrarTransacao = async (req, res) => {
    const { usuario } = req;

    if (validarCampos(req)) {
        const { descricao, valor, data, categoria_id, tipo } = req.body;

        try {
            const queryInsert = 'insert into transacoes(descricao, valor, data, categoria_id, tipo, usuario_id) values ($1, $2, $3, $4, $5, $6)';
            await conexao.query(queryInsert, [descricao, valor, data, categoria_id, tipo, usuario.id]);

            const querySelect = 'select * , transacoes.descricao as descricao, categorias.descricao as categoria_nome from transacoes join categorias on categorias.id = transacoes.categoria_id  where usuario_id = $1 order by id desc limit 1';
            const { rows: ultimaTransacao } = await conexao.query(querySelect, [usuario.id]);

            res.status(201).json(ultimaTransacao[0]);

        } catch (e) {
            res.status(400).json(e.message);
        }
    }

    return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser informados." });

}

const validarCampos = (req) => {
    const { descricao, valor, data, categoria_id, tipo } = req.body;

    if (!descricao || !valor || !data || !categoria_id || !tipo) {
        return false;
    }

    if (tipo.toLowerCase() === 'entrada' || tipo.toLowerCase() === 'saida') {
        return true;
    }

    return false;
}

const atualizarTransacao = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    if (validarCampos(req)) {
        const { descricao, valor, data, categoria_id, tipo } = req.body;

        try {
            const querySelect = 'select * , transacoes.descricao as descricao, categorias.descricao as categoria_nome from transacoes join categorias on categorias.id = transacoes.categoria_id where id=$1 and usuario_id=$2';
            const { rowCount } = await conexao.query(querySelect, [id, usuario.id]);

            if (rowCount === 0) {
                return res.status(400).json({ mensagem: "Transação não localizada" })
            }

            const queryUpdate = 'update transacoes set descricao=$1, valor=$2, data=$3, categoria_id=$4, tipo=$5 where usuario_id=$6 and id=$7';
            await conexao.query(queryUpdate, [descricao, valor, data, categoria_id, tipo, usuario.id, id]);


        } catch (e) {
            res.status(400).json({ mensagem: "Transação não localizada" });
        }
    }

    return res.status(400).json({ mensagem: "Todos os campos obrigatórios devem ser informados." });
}

const deletarTransacao = async (req, res) => {
    const { usuario } = req;
    const { id } = req.params;

    try {
        const querySelect = 'select * from transacoes where id=$1 and usuario_id=$2';
        const { rowCount } = await conexao.query(querySelect, [id, usuario.id]);

        if (rowCount === 0) {
            return res.status(400).json({ mensagem: "Transação não localizada" })
        }

        const query = 'delete from transacoes where usuario_id=$1 and id=$2';
        await conexao.query(query, [usuario.id, id]);

        res.status(200).json();
    } catch (e) {
        res.status(400).json({ mensagem: "Transação não localizada" });
    }
}

const extrato = async (req, res) => {
    const { usuario } = req;

    try {
        const query = 'select tipo, sum(valor) from transacoes where usuario_id = $1 group by tipo order by tipo asc';
        const { rows: extrato, rowCount } = await conexao.query(query, [usuario.id]);

        if (rowCount === 2) {
            const entrada = parseInt(extrato[0].sum);
            const saida = parseInt(extrato[1].sum);

            const retorno = {
                entrada,
                saida
            }

            return res.status(400).json(retorno);
        } else if (rowCount === 1) {
            if (extrato[0].tipo === "entrada") {
                const entrada = parseInt(extrato[0].sum);
                const saida = 0;
                const retorno = {
                    entrada,
                    saida
                }
                return res.status(200).json(retorno);
            } else {
                const saida = parseInt(extrato[0].sum);
                const entrada = 0;
                const retorno = {
                    entrada,
                    saida
                }
                return res.status(200).json(retorno);

            }
        } else {
            const zerado = { entrada: 0, saida: 0 }
            return res.status(200).json(zerado)
        }
    } catch (e) {
        return res.status(400).json(e.message);
    }

}

module.exports = {
    listarTransacoes,
    detalharTransacao,
    cadastrarTransacao,
    atualizarTransacao,
    deletarTransacao,
    extrato
}