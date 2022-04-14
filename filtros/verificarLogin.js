const conexao = require('../conexao');
const jwt = require('jsonwebtoken');
const segredo = require('../segredo');

const verificarLogin = async (req, res, next) => {
    const { authorization } = req.headers;

    if (!authorization) {
        res.status(400).json({ mensagem: "Para acessar este recurso um token de autenticação válido deve ser enviado." })
    }


    try {
        const token = authorization.replace("Bearer", "").trim();

        const { id } = jwt.verify(token, segredo);
        const query = 'select * from usuarios where id = $1';
        const { rows, rowCount } = await conexao.query(query, [id]);

        if (rowCount === 0) {
            return res.status(404).json({ mensagem: "Usuário não encontrado" })
        }

        const usuario = rows[0];

        req.usuario = usuario;

        next();
    } catch (error) {
        res.status(400).json({ mensagem: "Para acessar este recurso um token de autenticação válido deve ser enviado." })
    }
}

module.exports = verificarLogin;