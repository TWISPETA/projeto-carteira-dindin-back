const express = require('express');
const { listarCategorias } = require('./controladores/categorias');
const { listarTransacoes, cadastrarTransacao, detalharTransacao, atualizarTransacao, deletarTransacao, extrato } = require('./controladores/transacoes');
const { cadastrarUsuario, login, informacoesUsuario, atualizarUsuario } = require('./controladores/usuarios');
const verificarLogin = require('./filtros/verificarLogin')
// const { cadastrarCategoria } = require('./controladores/transacoes');

const rotas = express();

//usuarios
rotas.post('/usuario', cadastrarUsuario);
rotas.post('/login', login);
rotas.get('/usuario', verificarLogin, informacoesUsuario);
rotas.put('/usuario', verificarLogin, atualizarUsuario);

// categorias
rotas.get('/categoria', listarCategorias);

// transacoes
rotas.get('/transacao', verificarLogin, listarTransacoes);
rotas.get('/transacao/extrato', verificarLogin, extrato)
rotas.get('/transacao/:id', verificarLogin, detalharTransacao);
rotas.post('/transacao', verificarLogin, cadastrarTransacao);
rotas.put('/transacao/:id', verificarLogin, atualizarTransacao);
rotas.delete('/transacao/:id', verificarLogin, deletarTransacao);

module.exports = rotas;