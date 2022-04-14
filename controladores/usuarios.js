const conexao = require('../conexao');
const securePassword = require('secure-password');

const pwd = securePassword();

const jwt = require('jsonwebtoken');
const segredo = require('../segredo');

const validarUsuario = async (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: 'O nome é obrigatório' });
    }

    if (!email) {
        return res.status(400).json({ mensagem: 'O email é obrigatório' });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: 'A senha é obrigatória' });
    }

    try {
        const query = 'select email from usuarios where email ilike $1'
        const existeEmail = await conexao.query(query, [email]);

        if (existeEmail.rowCount > 0) {
            return res.status(400).json({ mensagem: "Já existe usuário cadastrado com o e-mail informado" })
        }
    } catch (error) {
        return res.status(400).json(error)
    }

    return false;
}

const cadastrarUsuario = async (req, res) => {
    const validacao = await validarUsuario(req, res);

    if (!validacao) {
        const { nome, email, senha } = req.body;
        const senhaBuffer = Buffer.from(senha);
        try {
            const hash = (await pwd.hash(senhaBuffer)).toString("hex");
            const query = 'insert into usuarios (nome, email, senha) values ($1, $2, $3)'
            const usuario = await conexao.query(query, [nome, email, hash]);

            if (usuario.rowCount === 0) {
                return res.status(400).json({ mensagem: "O usuário não foi cadastrado" })
            }

            try {

                const query = 'select * from usuarios where email ilike $1'
                const usuarios = await conexao.query(query, [email]);
                const { id, nome, email: emailCadastrado } = usuarios.rows[0];
                const usuarioCadastrado = { id, nome, email: emailCadastrado };

                return res.status(201).json(usuarioCadastrado);
            } catch (error) {
                console.log(error);
                return res.status(400).json();
            }
        } catch (error) {
            return res.status(400).json(error.message)
        }

    }


}

const login = async (req, res) => {
    const { email, senha } = req.body;

    if (!email) {
        return res.status(400).json({ mensagem: 'O email é obrigatório' });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: 'A senha é obrigatória' });
    }

    try {
        const query = 'select * from usuarios where email ilike $1'
        const usuarios = await conexao.query(query, [email]);
        const usuario = usuarios.rows[0];

        if (usuarios.rowCount === 0) {
            return res.status(400).json({ mensagem: "Usuário e/ou senha inválidos" })
        }

        const senhaBuffer = Buffer.from(senha);

        // Save hash somewhere
        const result = await pwd.verify(senhaBuffer, Buffer.from(usuario.senha, "hex"));

        switch (result) {
            case securePassword.INVALID_UNRECOGNIZED_HASH:
            case securePassword.INVALID:
                return res.status(400).json({ mensagem: "Usuário e/ou senha inválidos" });
            case securePassword.VALID:
                break;
            case securePassword.VALID_NEEDS_REHASH:
                try {
                    const hash = (await pwd.hash(senhaBuffer)).toString("hex");
                    const query2 = 'update usuarios set senha = $1 where email ilike $2'
                    await conexao.query(query2, [email, hash]);
                } catch (error) {
                }
                break;
        }

        const token = jwt.sign({
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email
        }, segredo, { expiresIn: '8h' });

        const usuarioLogado = {
            usuario: {
                id: usuario.id,
                nome: usuario.nome,
                email
            }, token
        }


        return res.status(200).json(usuarioLogado);

    } catch (error) {
        return res.status(400).json(error.message)
    }


}

const informacoesUsuario = async (req, res) => {
    const { id, nome, email } = req.usuario;
    const retorno = { id, nome, email };

    return res.status(200).json(retorno);
}

const atualizarUsuario = async (req, res) => {
    const { usuario } = req;

    const { nome, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: "O nome é obrigatório" });
    }

    if (!email) {
        return res.status(400).json({ mensagem: "O email é obrigatório" });
    }

    if (!senha) {
        return res.status(400).json({ mensagem: "A senha é obrigatória" });
    }

    try {
        const queryEmail = 'select email from usuarios where email ilike $1 and id != $2'
        const existeEmail = await conexao.query(queryEmail, [email, usuario.id]);

        if (existeEmail.rowCount > 0) {
            return res.status(400).json({ mensagem: "Já existe usuário cadastrado com o e-mail informado" })
        }
    } catch (error) {
        return res.status(400).json(error)
    }

    const senhaBuffer = Buffer.from(senha);

    try {
        const hash = (await pwd.hash(senhaBuffer)).toString("hex");
        const query = 'update usuarios set nome = $1, email = $2, senha = $3 where id = $4'
        await conexao.query(query, [nome, email, hash, usuario.id]);

        return res.status(204).json();
    } catch (e) {
        return res.status(400).json(e.message);
    }

}



module.exports = {
    cadastrarUsuario,
    login,
    informacoesUsuario,
    atualizarUsuario
}